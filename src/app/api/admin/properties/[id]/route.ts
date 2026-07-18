import { NextResponse } from "next/server";
import { getAuthenticatedAdminEmail } from "@/lib/admin-auth";
import { prisma } from "@/lib/prisma";
import {
  deletePropertyObjects,
  publicUrlForObjectKey,
  verifyPropertyUploadToken,
} from "@/lib/s3";
import { slugify } from "@/lib/slug";
import { propertyPatchSchema } from "@/lib/validations/property";
import { propertyImageObjectKeySchema } from "@/lib/validations/upload";
import {
  databaseUnavailable,
  isUploadVerificationError,
  readJson,
  unauthorized,
} from "../route";

const propertyInclude = {
  city: true,
  district: true,
  community: true,
  images: { orderBy: { sortOrder: "asc" as const } },
};

type Context = { params: Promise<{ id: string }> };

export async function GET(_request: Request, context: Context) {
  if (!(await getAuthenticatedAdminEmail())) return unauthorized();
  if (!process.env.DATABASE_URL) return databaseUnavailable();
  const id = await readPropertyId(context);
  if (!id) return invalidId();

  try {
    const property = await prisma.property.findUnique({ where: { id }, include: propertyInclude });
    return property
      ? NextResponse.json({ property })
      : NextResponse.json({ message: "Imóvel não encontrado." }, { status: 404 });
  } catch {
    return databaseUnavailable();
  }
}

export async function PATCH(request: Request, context: Context) {
  const adminEmail = await getAuthenticatedAdminEmail();
  if (!adminEmail) return unauthorized();
  if (!process.env.DATABASE_URL) return databaseUnavailable();
  const id = await readPropertyId(context);
  if (!id) return invalidId();

  const body = await readJson(request);
  if (body.error) return body.error;
  const parsed = propertyPatchSchema.safeParse(body.payload);
  if (!parsed.success) {
    return NextResponse.json(
      { message: "Revise os campos do formulário.", errors: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const existing = await prisma.property
    .findUnique({ where: { id }, include: propertyInclude })
    .catch(() => undefined);
  if (existing === undefined) return databaseUnavailable();
  if (!existing) return NextResponse.json({ message: "Imóvel não encontrado." }, { status: 404 });

  const requestedImages = parsed.data.images;
  const retainedIds = new Set(
    requestedImages?.flatMap((image) => ("id" in image ? [image.id] : [])) ?? [],
  );
  if (requestedImages && [...retainedIds].some((imageId) => !existing.images.some((image) => image.id === imageId))) {
    return NextResponse.json({ message: "Uma imagem existente não pertence a este imóvel." }, { status: 400 });
  }

  const newImages = requestedImages?.flatMap((image) => ("objectKey" in image ? [image] : [])) ?? [];
  let verifiedNewImages: Array<{ objectKey: string; url: string }> = [];
  try {
    verifiedNewImages = await Promise.all(
      newImages.map(async (image) => {
        await verifyPropertyUploadToken({
          token: image.uploadToken,
          objectKey: image.objectKey,
          adminEmail,
        });
        return { objectKey: image.objectKey, url: publicUrlForObjectKey(image.objectKey) };
      }),
    );
  } catch (error) {
    if (isUploadVerificationError(error)) {
      return NextResponse.json(
        { message: "Uma ou mais imagens expiraram ou foram alteradas. Envie-as novamente." },
        { status: 400 },
      );
    }
    return NextResponse.json({ message: "Não foi possível validar as novas imagens." }, { status: 503 });
  }

  const removedImages = requestedImages
    ? existing.images.filter((image) => !retainedIds.has(image.id))
    : [];
  const legacyRemovedImages = removedImages.filter(
    (image) => !propertyImageObjectKeySchema.safeParse(image.objectKey).success,
  );
  if (legacyRemovedImages.length > 0) {
    return NextResponse.json(
      {
        message: "Uma ou mais imagens legadas não possuem uma chave R2 verificável. Reconcilie-as manualmente antes de removê-las.",
        legacyImages: legacyRemovedImages.map((image) => ({ id: image.id, objectKey: image.objectKey })),
      },
      { status: 409 },
    );
  }

  const values = parsed.data;
  const merged = {
    title: values.title ?? existing.title,
    description: values.description ?? existing.description,
    purpose: values.purpose ?? existing.purpose,
    type: values.type ?? existing.type,
    price: values.price ?? existing.priceInCents / 100,
    condoFee: values.condoFee ?? (existing.condoFeeCents ?? 0) / 100,
    areaM2: values.areaM2 ?? existing.areaM2,
    bedrooms: values.bedrooms ?? existing.bedrooms ?? 0,
    bathrooms: values.bathrooms ?? existing.bathrooms ?? 0,
    parkingSpots: values.parkingSpots ?? existing.parkingSpots ?? 0,
    city: values.city ?? existing.city.name,
    district: values.district ?? existing.district?.name ?? "Centro",
    community: values.community ?? existing.community?.name ?? "",
    isCondo: values.isCondo ?? existing.isCondo,
    isFeatured: values.isFeatured ?? existing.isFeatured,
    isLaunch: values.isLaunch ?? existing.isLaunch,
    isPublished: values.isPublished ?? existing.isPublished,
  };

  try {
    const property = await prisma.$transaction(async (transaction) => {
      const city = await transaction.city.upsert({
        where: { name: merged.city },
        update: {},
        create: { name: merged.city },
      });
      const district = await transaction.district.upsert({
        where: { name_cityId: { name: merged.district, cityId: city.id } },
        update: {},
        create: { name: merged.district, cityId: city.id },
      });
      const community = merged.community
        ? await transaction.community.upsert({
            where: { name_cityId: { name: merged.community, cityId: city.id } },
            update: {},
            create: { name: merged.community, cityId: city.id },
          })
        : null;

      if (requestedImages) {
        await transaction.propertyImage.deleteMany({
          where: { propertyId: id, id: { in: removedImages.map((image) => image.id) } },
        });
        for (const [sortOrder, imageReference] of requestedImages.entries()) {
          if ("id" in imageReference) {
            await transaction.propertyImage.update({
              where: { id: imageReference.id },
              data: { sortOrder, alt: `${merged.title} - foto ${sortOrder + 1}` },
            });
          } else {
            const verified = verifiedNewImages.find((image) => image.objectKey === imageReference.objectKey)!;
            await transaction.propertyImage.create({
              data: {
                propertyId: id,
                ...verified,
                alt: `${merged.title} - foto ${sortOrder + 1}`,
                sortOrder,
              },
            });
          }
        }
      }

      return transaction.property.update({
        where: { id },
        data: {
          title: merged.title,
          slug: `${slugify(merged.title)}-${existing.code.toLowerCase()}`,
          description: merged.description,
          purpose: merged.purpose,
          type: merged.type,
          priceInCents: Math.round(merged.price * 100),
          condoFeeCents: merged.condoFee ? Math.round(merged.condoFee * 100) : null,
          areaM2: merged.areaM2,
          bedrooms: merged.bedrooms,
          bathrooms: merged.bathrooms,
          parkingSpots: merged.parkingSpots,
          cityId: city.id,
          districtId: district.id,
          communityId: community?.id ?? null,
          isCondo: merged.isCondo,
          isFeatured: merged.isFeatured,
          isLaunch: merged.isLaunch,
          isPublished: merged.isPublished,
          addressSummary: `${merged.district}, ${merged.city}-SP`,
        },
        include: propertyInclude,
      });
    });

    const deletionResults = await deletePropertyObjects(
      removedImages.map((image) => image.objectKey),
    );
    const partialFailure = deletionResults.some((result) => result.status === "failed");

    return NextResponse.json(
      {
        property,
        deletionResults,
        partialFailure,
        ...(partialFailure
          ? { message: "O imóvel foi atualizado, mas algumas imagens antigas permaneceram no armazenamento." }
          : {}),
      },
      { status: partialFailure ? 207 : 200 },
    );
  } catch {
    return NextResponse.json(
      { message: "O imóvel não pôde ser atualizado; nenhuma imagem foi removida do armazenamento." },
      { status: 500 },
    );
  }
}

export async function DELETE(_request: Request, context: Context) {
  if (!(await getAuthenticatedAdminEmail())) return unauthorized();
  if (!process.env.DATABASE_URL) return databaseUnavailable();
  const id = await readPropertyId(context);
  if (!id) return invalidId();

  const property = await prisma.property
    .findUnique({ where: { id }, include: { images: true } })
    .catch(() => undefined);
  if (property === undefined) return databaseUnavailable();
  if (!property) return NextResponse.json({ message: "Imóvel não encontrado." }, { status: 404 });

  try {
    await prisma.property.update({ where: { id }, data: { isPublished: false } });
  } catch {
    return databaseUnavailable();
  }
  const deletionResults = await deletePropertyObjects(property.images.map((image) => image.objectKey));
  if (deletionResults.some((result) => result.status !== "deleted")) {
    return NextResponse.json(
      {
        message: "O imóvel foi despublicado, mas nem todas as imagens puderam ser removidas.",
        propertyUnpublished: true,
        metadataDeleted: false,
        deletionResults,
      },
      { status: 502 },
    );
  }

  try {
    await prisma.property.delete({ where: { id } });
    return NextResponse.json({ propertyUnpublished: true, metadataDeleted: true, deletionResults });
  } catch {
    return NextResponse.json(
      {
        message: "As imagens foram removidas, mas os dados do imóvel permaneceram despublicados.",
        propertyUnpublished: true,
        metadataDeleted: false,
        deletionResults,
      },
      { status: 500 },
    );
  }
}

async function readPropertyId(context: Context) {
  const { id } = await context.params;
  return /^[a-z0-9_-]{1,64}$/i.test(id) ? id : null;
}

function invalidId() {
  return NextResponse.json({ message: "Identificador de imóvel inválido." }, { status: 400 });
}
