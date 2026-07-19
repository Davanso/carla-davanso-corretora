import { notFound } from "next/navigation";
import { PropertyListing } from "@/components/property-listing";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { getProperties } from "@/lib/properties";
import type { Property } from "@/types/property";

const categories = {
  "a-venda": {
    title: "Imóveis à venda",
    filter: (property: Property) => property.purpose === "SALE",
  },
  "para-alugar": {
    title: "Imóveis para alugar",
    filter: (property: Property) => property.purpose === "RENT",
  },
  destaques: {
    title: "Imóveis em destaque",
    filter: (property: Property) => property.isFeatured,
  },
  lancamentos: {
    title: "Lançamentos",
    filter: (property: Property) => property.isLaunch,
  },
};

type CategoryKey = keyof typeof categories;

export const dynamic = "force-dynamic";

export function generateStaticParams() {
  return Object.keys(categories).map((categoria) => ({ categoria }));
}

export default async function PropertiesCategoryPage({
  params,
  searchParams,
}: {
  params: Promise<{ categoria: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { categoria } = await params;
  const query = await searchParams;
  const category = categories[categoria as CategoryKey];

  if (!category) {
    notFound();
  }

  const properties = await getProperties();
  const filtered = properties.filter(category.filter);
  const initialFilters = {
    type: validPropertyType(query.tipo),
    district: validDistrict(query.bairro, filtered),
    minPrice: validPrice(query.precoMin),
    maxPrice: validPrice(query.precoMax),
  };
  const listingKey = [
    initialFilters.type,
    initialFilters.district,
    initialFilters.minPrice,
    initialFilters.maxPrice,
  ].join("|");

  return (
    <main className="min-h-screen bg-background text-foreground">
      <SiteHeader />
      <PropertyListing
        key={listingKey}
        properties={filtered}
        title={category.title}
        initialFilters={initialFilters}
      />
      <SiteFooter />
    </main>
  );
}

const propertyTypes: readonly Property["type"][] = [
  "HOUSE",
  "CONDO_HOUSE",
  "APARTMENT",
  "LAND",
  "STUDIO",
  "COMMERCIAL",
];

function validPropertyType(value: string | string[] | undefined) {
  if (typeof value !== "string") return undefined;

  return propertyTypes.includes(value as Property["type"])
    ? (value as Property["type"])
    : undefined;
}

function validDistrict(value: string | string[] | undefined, properties: Property[]) {
  if (typeof value !== "string") return undefined;

  return properties.some((property) => property.district === value) ? value : undefined;
}

function validPrice(value: string | string[] | undefined) {
  if (typeof value !== "string" || value.trim() === "") return undefined;

  const price = Number(value);
  return Number.isFinite(price) && price >= 0 ? String(price) : undefined;
}
