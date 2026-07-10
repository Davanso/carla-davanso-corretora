import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { sampleProperties } from "@/lib/sample-properties";
import type { Property } from "@/types/property";

const propertyInclude = {
  city: true,
  district: true,
  community: true,
  images: {
    orderBy: {
      sortOrder: "asc" as const,
    },
  },
} satisfies Prisma.PropertyInclude;

type PropertyWithRelations = Prisma.PropertyGetPayload<{
  include: typeof propertyInclude;
}>;

function mapProperty(property: PropertyWithRelations): Property {
  return {
    id: property.id,
    code: property.code,
    title: property.title,
    slug: property.slug,
    description: property.description,
    purpose: property.purpose,
    type: property.type,
    priceInCents: property.priceInCents,
    condoFeeCents: property.condoFeeCents,
    areaM2: property.areaM2,
    bedrooms: property.bedrooms,
    bathrooms: property.bathrooms,
    parkingSpots: property.parkingSpots,
    isCondo: property.isCondo,
    isFeatured: property.isFeatured,
    isLaunch: property.isLaunch,
    addressSummary: property.addressSummary,
    city: property.city.name,
    district: property.district?.name,
    community: property.community?.name,
    images: property.images.map((image) => ({
      id: image.id,
      url: image.url,
      alt: image.alt,
    })),
  };
}

export async function getProperties() {
  if (!process.env.DATABASE_URL) {
    return sampleProperties;
  }

  try {
    const properties = await prisma.property.findMany({
      where: { isPublished: true },
      include: propertyInclude,
      orderBy: [{ isFeatured: "desc" }, { createdAt: "desc" }],
    });

    return properties.map(mapProperty);
  } catch {
    return sampleProperties;
  }
}
