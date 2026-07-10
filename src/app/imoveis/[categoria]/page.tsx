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

export function generateStaticParams() {
  return Object.keys(categories).map((categoria) => ({ categoria }));
}

export default async function PropertiesCategoryPage({
  params,
}: {
  params: Promise<{ categoria: string }>;
}) {
  const { categoria } = await params;
  const category = categories[categoria as CategoryKey];

  if (!category) {
    notFound();
  }

  const properties = await getProperties();
  const filtered = properties.filter(category.filter);

  return (
    <main className="min-h-screen bg-background text-foreground">
      <SiteHeader />
      <PropertyListing properties={filtered} title={category.title} />
      <SiteFooter />
    </main>
  );
}
