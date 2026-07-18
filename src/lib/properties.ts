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
      sortOrder: image.sortOrder,
    })),
  };
}

function canUseDevelopmentSamples() {
  return process.env.NODE_ENV === "development" && !process.env.DATABASE_URL;
}

export class CatalogueUnavailableError extends Error {
  constructor(cause?: unknown) {
    super("O catálogo está temporariamente indisponível.", { cause });
    this.name = "CatalogueUnavailableError";
  }
}

export async function getProperties(): Promise<Property[]> {
  if (!process.env.DATABASE_URL) {
    if (canUseDevelopmentSamples()) return sampleProperties;
    throw new CatalogueUnavailableError(new Error("DATABASE_URL não configurada."));
  }

  try {
    const properties = await prisma.property.findMany({
      where: { isPublished: true },
      include: propertyInclude,
      orderBy: [{ isFeatured: "desc" }, { createdAt: "desc" }],
    });

    return properties.map(mapProperty);
  } catch (error) {
    throw new CatalogueUnavailableError(error);
  }
}

export async function getPropertyBySlug(slug: string): Promise<Property | null> {
  if (!process.env.DATABASE_URL) {
    if (canUseDevelopmentSamples()) {
      return sampleProperties.find((property) => property.slug === slug) ?? null;
    }
    throw new CatalogueUnavailableError(new Error("DATABASE_URL não configurada."));
  }

  try {
    const property = await prisma.property.findFirst({
      where: { slug, isPublished: true },
      include: propertyInclude,
    });

    return property ? mapProperty(property) : null;
  } catch (error) {
    throw new CatalogueUnavailableError(error);
  }
}
