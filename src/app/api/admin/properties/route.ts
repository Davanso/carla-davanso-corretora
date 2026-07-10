import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { slugify } from "@/lib/slug";
import { propertyFormSchema } from "@/lib/validations/property";

export async function POST(request: Request) {
  const session = await auth();

  if (!session?.user) {
    return NextResponse.json({ message: "Nao autorizado." }, { status: 401 });
  }

  if (!process.env.DATABASE_URL) {
    return NextResponse.json(
      { message: "Configure DATABASE_URL para salvar imoveis no PostgreSQL." },
      { status: 503 }
    );
  }

  const payload = await request.json();
  const parsed = propertyFormSchema.safeParse(payload);

  if (!parsed.success) {
    return NextResponse.json(
      { message: "Revise os campos do formulario.", errors: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const values = parsed.data;
  const city = await prisma.city.upsert({
    where: { name: values.city },
    update: {},
    create: { name: values.city },
  });

  const district = await prisma.district.upsert({
    where: { name_cityId: { name: values.district, cityId: city.id } },
    update: {},
    create: { name: values.district, cityId: city.id },
  });

  const community = values.community
    ? await prisma.community.upsert({
        where: { name_cityId: { name: values.community, cityId: city.id } },
        update: {},
        create: { name: values.community, cityId: city.id },
      })
    : null;

  const code = `CD-${Date.now().toString().slice(-6)}`;
  const slug = `${slugify(values.title)}-${code.toLowerCase()}`;

  const property = await prisma.property.create({
    data: {
      code,
      title: values.title,
      slug,
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
        create: values.images.map((url, index) => ({
          url,
          alt: `${values.title} - foto ${index + 1}`,
          sortOrder: index,
        })),
      },
    },
  });

  return NextResponse.json({ property });
}
