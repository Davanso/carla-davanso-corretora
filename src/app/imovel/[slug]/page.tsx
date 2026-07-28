import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  BathIcon,
  BedDoubleIcon,
  Building2Icon,
  CarIcon,
  CameraIcon,
  MapPinIcon,
  MailIcon,
  MessageCircleIcon,
  PhoneIcon,
  SofaIcon,
  RulerIcon,
  type LucideIcon,
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
import { getSiteSettings } from "@/lib/site-settings";

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
  const siteSettings = await getSiteSettings().catch(() => ({ brokerPhotoObjectKey: null, brokerPhotoUrl: null }));

  const priceSuffix = property.purpose === "RENT" ? "/mês" : undefined;
  const builtArea = property.builtAreaM2 ?? property.areaM2;
  const landArea = property.landAreaM2 ?? property.areaM2;
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
              <CardHeader><CardTitle>Cômodos e espaços</CardTitle></CardHeader>
              <CardContent className="flex flex-col gap-10">
                <div className="grid gap-7 sm:grid-cols-2">
                  <DetailFeature icon={BedDoubleIcon} title={`${property.bedrooms ?? 0} Quartos`} description="Total de dormitórios, incluindo as suítes" />
                  <DetailFeature icon={SofaIcon} title={`${property.livingRooms ?? 0} Salas`} description="Considera-se todos os tipos de sala" />
                  <DetailFeature icon={BedDoubleIcon} title={`${property.suites ?? 0} Suítes`} description="Total de suítes" />
                  <DetailFeature icon={BathIcon} title={`${property.bathrooms ?? 0} Banheiros`} description="Inclui banheiros, lavabos, suítes e demi-suítes" />
                  <DetailFeature icon={CarIcon} title={`${property.parkingSpots ?? 0} ${property.parkingSpots === 1 ? "Vaga de garagem" : "Vagas de garagem"}`} description="Deixa o seguro do carro mais barato" />
                </div>
                <Separator />
                <div>
                  <CardTitle className="mb-6">Dimensões e metragens</CardTitle>
                  <div className="grid gap-7 sm:grid-cols-2">
                    <DetailFeature icon={RulerIcon} title={`${builtArea} m² área construída`} description="É a soma da área total de todos os pavimentos" />
                    <DetailFeature icon={RulerIcon} title={`${landArea} m² área total`} description="Área total do terreno onde o imóvel está localizado" />
                  </div>
                </div>
              </CardContent>
            </Card>
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
                <Fact icon={RulerIcon} label="Área construída" value={`${builtArea} m²`} />
                <Fact icon={RulerIcon} label="Área do terreno" value={`${landArea} m²`} />
                <Fact icon={BedDoubleIcon} label="Quartos" value={property.bedrooms ?? 0} />
                <Fact icon={BedDoubleIcon} label="Suítes" value={property.suites ?? 0} />
                <Fact icon={SofaIcon} label="Salas" value={property.livingRooms ?? 0} />
                <Fact icon={BathIcon} label="Banheiros" value={property.bathrooms ?? 0} />
                <Fact icon={CarIcon} label="Vagas" value={property.parkingSpots ?? 0} />
                {property.condoFeeCents ? (
                  <><Separator /><Fact icon={Building2Icon} label="Condomínio" value={formatCurrency(property.condoFeeCents)} /></>
                ) : null}
                {property.iptuFeeCents ? (
                  <Fact icon={Building2Icon} label="IPTU" value={formatCurrency(property.iptuFeeCents)} />
                ) : null}
              </CardContent>
            </Card>
            <Card>
              <CardContent className="flex flex-col items-center gap-4 p-5 text-center">
                <div className="relative size-24 overflow-hidden rounded-full bg-secondary">
                  <Image
                    src={siteSettings.brokerPhotoUrl ?? "/window.svg"}
                    alt="Carla Davanso"
                    fill
                    className={siteSettings.brokerPhotoUrl ? "object-cover" : "object-contain p-5"}
                  />
                </div>
                <div>
                  <p className="text-lg font-semibold">Carla Davanso</p>
                  <p className="text-sm text-muted-foreground">Corretora de imóveis</p>
                </div>
                <div className="flex gap-2">
                  <Button size="icon" variant="outline" nativeButton={false} render={<a href="tel:+5519998383234" aria-label="Ligar para Carla Davanso" />}>
                    <PhoneIcon />
                  </Button>
                  <Button size="icon" variant="outline" nativeButton={false} render={<a href={`https://wa.me/5519998383234?text=${message}`} target="_blank" rel="noreferrer" aria-label="Enviar WhatsApp para Carla Davanso" />}>
                    <MessageCircleIcon />
                  </Button>
                  <Button size="icon" variant="outline" nativeButton={false} render={<a href="mailto:contato@carladavanso.com.br" aria-label="Enviar e-mail para Carla Davanso" />}>
                    <MailIcon />
                  </Button>
                  <Button size="icon" variant="outline" nativeButton={false} render={<a href="https://www.instagram.com/imoveiscomcarladavanso/" target="_blank" rel="noreferrer" aria-label="Abrir Instagram da Carla Davanso" />}>
                    <CameraIcon />
                  </Button>
                </div>
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

function Fact({ icon: Icon, label, value }: { icon: LucideIcon; label: string; value: string | number }) {
  return (
    <div className="flex items-center justify-between gap-4 text-sm">
      <span className="flex items-center gap-2 text-muted-foreground"><Icon aria-hidden="true" />{label}</span>
      <span className="text-right font-medium">{value}</span>
    </div>
  );
}

function DetailFeature({
  icon: Icon,
  title,
  description,
}: {
  icon: LucideIcon;
  title: string;
  description: string;
}) {
  return (
    <div className="flex items-start gap-3">
      <Icon className="mt-1 text-primary" aria-hidden="true" />
      <div>
        <p className="font-semibold">{title}</p>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
    </div>
  );
}
