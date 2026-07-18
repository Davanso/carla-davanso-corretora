import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  BathIcon,
  BedDoubleIcon,
  Building2Icon,
  CarIcon,
  MapPinIcon,
  MessageCircleIcon,
  RulerIcon,
} from "lucide-react";
import { PropertyGallery } from "@/components/property-gallery";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { formatCurrency, purposeLabel, typeLabel } from "@/lib/format";
import { getPropertyBySlug } from "@/lib/properties";

export const dynamic = "force-dynamic";

type PageProps = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const property = await getPropertyBySlug(slug);

  if (!property) return { title: "Imóvel não encontrado" };

  return {
    title: `${property.title} | Carla Davanso Corretora`,
    description: property.description,
    openGraph: {
      title: property.title,
      description: property.description,
      images: property.images[0]?.url ? [{ url: property.images[0].url, alt: property.images[0].alt }] : [],
    },
  };
}

export default async function PropertyDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const property = await getPropertyBySlug(slug);
  if (!property) notFound();

  const priceSuffix = property.purpose === "RENT" ? "/mês" : undefined;
  const message = encodeURIComponent(
    `Olá, Carla! Gostaria de saber mais sobre o imóvel ${property.title} (código ${property.code}).`,
  );

  return (
    <main className="min-h-screen bg-background text-foreground">
      <SiteHeader />
      <div className="mx-auto flex max-w-7xl flex-col gap-8 px-4 py-10 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-4">
          <div className="flex flex-wrap gap-2">
            <Badge>{purposeLabel(property.purpose)}</Badge>
            <Badge variant="outline">Código {property.code}</Badge>
            {property.isLaunch ? <Badge variant="secondary">Lançamento</Badge> : null}
          </div>
          <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">{property.title}</h1>
              <p className="mt-2 flex items-center gap-2 text-muted-foreground">
                <MapPinIcon aria-hidden="true" />
                {property.addressSummary}
              </p>
            </div>
            <p className="text-3xl font-semibold">{formatCurrency(property.priceInCents, priceSuffix)}</p>
          </div>
        </div>

        <div className="grid gap-8 lg:grid-cols-[minmax(0,2fr)_minmax(300px,1fr)]">
          <div className="flex min-w-0 flex-col gap-8">
            <PropertyGallery images={property.images} title={property.title} />
            <Card>
              <CardHeader><CardTitle>Sobre o imóvel</CardTitle></CardHeader>
              <CardContent>
                <p className="whitespace-pre-line leading-7 text-muted-foreground">{property.description}</p>
              </CardContent>
            </Card>
          </div>

          <aside className="flex flex-col gap-5">
            <Card>
              <CardHeader><CardTitle>Características</CardTitle></CardHeader>
              <CardContent className="flex flex-col gap-4">
                <Fact icon={Building2Icon} label="Tipo" value={typeLabel(property.type)} />
                <Separator />
                <Fact icon={RulerIcon} label="Área" value={`${property.areaM2} m²`} />
                <Fact icon={BedDoubleIcon} label="Quartos" value={property.bedrooms ?? 0} />
                <Fact icon={BathIcon} label="Banheiros" value={property.bathrooms ?? 0} />
                <Fact icon={CarIcon} label="Vagas" value={property.parkingSpots ?? 0} />
                {property.condoFeeCents ? (
                  <><Separator /><Fact icon={Building2Icon} label="Condomínio" value={formatCurrency(property.condoFeeCents)} /></>
                ) : null}
              </CardContent>
            </Card>
            <Button size="lg" nativeButton={false} render={<a href={`https://wa.me/5519998383234?text=${message}`} target="_blank" rel="noreferrer" />}>
              <MessageCircleIcon data-icon="inline-start" />
              Consultar pelo WhatsApp
            </Button>
            <Button variant="outline" nativeButton={false} render={<Link href="/imoveis/a-venda" />}>
              Ver outros imóveis
            </Button>
          </aside>
        </div>
      </div>
      <SiteFooter />
    </main>
  );
}

function Fact({ icon: Icon, label, value }: { icon: typeof Building2Icon; label: string; value: string | number }) {
  return (
    <div className="flex items-center justify-between gap-4 text-sm">
      <span className="flex items-center gap-2 text-muted-foreground"><Icon aria-hidden="true" />{label}</span>
      <span className="text-right font-medium">{value}</span>
    </div>
  );
}
