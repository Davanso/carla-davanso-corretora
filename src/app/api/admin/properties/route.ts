import { NextResponse } from "next/server";
import { getAuthenticatedAdminEmail } from "@/lib/admin-auth";
import { prisma } from "@/lib/prisma";
import { publicUrlForObjectKey, verifyPropertyUploadToken } from "@/lib/s3";
import { slugify } from "@/lib/slug";
import { propertyCreateSchema, type PropertyCreateValues } from "@/lib/validations/property";

const propertyInclude = {
  city: true,
  district: true,
  community: true,
  images: { orderBy: { sortOrder: "asc" as const } },
};

export async function GET() {
  if (!(await getAuthenticatedAdminEmail())) return unauthorized();
  if (!process.env.DATABASE_URL) return databaseUnavailable();

  try {
    const properties = await prisma.property.findMany({
      include: propertyInclude,
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json({ properties });
  } catch {
    return databaseUnavailable();
  }
}

export async function POST(request: Request) {
  const adminEmail = await getAuthenticatedAdminEmail();
  if (!adminEmail) return unauthorized();
  if (!process.env.DATABASE_URL) return databaseUnavailable();

  const body = await readJson(request);
  if (body.error) return body.error;
  const parsed = propertyCreateSchema.safeParse(body.payload);
  if (!parsed.success) {
    return NextResponse.json(
      { message: "Revise os campos do formulário.", errors: parsed.error.flatten() },
      { status: 400 },
    );
  }

  try {
    const uploads = await Promise.all(
      parsed.data.images.map(async (image) => {
        await verifyPropertyUploadToken({
          token: image.uploadToken,
          objectKey: image.objectKey,
          adminEmail,
        });
        return { objectKey: image.objectKey, url: publicUrlForObjectKey(image.objectKey) };
      }),
    );

    const property = await createProperty(parsed.data, uploads);
    return NextResponse.json({ property }, { status: 201 });
  } catch (error) {
    if (isUploadVerificationError(error)) {
      return NextResponse.json(
        { message: "Uma ou mais imagens expiraram ou foram alteradas. Envie-as novamente." },
        { status: 400 },
      );
    }
    return NextResponse.json({ message: "Não foi possível salvar o imóvel." }, { status: 500 });
  }
}

async function createProperty(
  values: PropertyCreateValues,
  uploads: Array<{ objectKey: string; url: string }>,
) {
  return prisma.$transaction(async (transaction) => {
    const city = await transaction.city.upsert({
      where: { name: values.city },
      update: {},
      create: { name: values.city },
    });
    const district = await transaction.district.upsert({
      where: { name_cityId: { name: values.district, cityId: city.id } },
      update: {},
      create: { name: values.district, cityId: city.id },
    });
    const community = values.community
      ? await transaction.community.upsert({
          where: { name_cityId: { name: values.community, cityId: city.id } },
          update: {},
          create: { name: values.community, cityId: city.id },
        })
      : null;
    const code = `CD-${crypto.randomUUID().replaceAll("-", "").slice(0, 8).toUpperCase()}`;

    return transaction.property.create({
      data: {
        code,
        title: values.title,
        slug: `${slugify(values.title)}-${code.toLowerCase()}`,
        description: values.description,
        purpose: values.purpose,
        type: values.type,
        priceInCents: Math.round(values.price * 100),
        condoFeeCents: values.condoFee ? Math.round(values.condoFee * 100) : null,
        areaM2: values.areaM2,
        bedrooms: values.bedrooms,
        bathrooms: values.bathrooms,
        parkingSpots: values.parkingSpots,
        cityId: city.id,
        districtId: district.id,
        communityId: community?.id,
        isCondo: values.isCondo,
        isFeatured: values.isFeatured,
        isLaunch: values.isLaunch,
        isPublished: values.isPublished,
        addressSummary: `${values.district}, ${values.city}-SP`,
        images: {
          create: uploads.map((image, index) => ({
            ...image,
            alt: `${values.title} - foto ${index + 1}`,
            sortOrder: index,
          })),
        },
      },
      include: propertyInclude,
    });
  });
}

export async function readJson(request: Request) {
  if (request.headers.get("content-type")?.split(";", 1)[0] !== "application/json") {
    return { error: NextResponse.json({ message: "Envie os dados como JSON." }, { status: 415 }) };
  }
  try {
    return { payload: await request.json() as unknown };
  } catch {
    return { error: NextResponse.json({ message: "JSON inválido." }, { status: 400 }) };
  }
}

export function unauthorized() {
  return NextResponse.json({ message: "Não autorizado." }, { status: 401 });
}

export function databaseUnavailable() {
  return NextResponse.json({ message: "O banco de dados não está disponível." }, { status: 503 });
}

export function isUploadVerificationError(error: unknown) {
  return error instanceof Error && [
    "invalid-upload-token",
    "uploaded-object-changed",
    "ZodError",
  ].includes(error.message === "invalid-upload-token" ? error.message : error.name === "ZodError" ? "ZodError" : error.message);
}

export { propertyInclude };
