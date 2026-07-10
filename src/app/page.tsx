import Image from "next/image";
import { ArrowRightIcon, CheckCircle2Icon, HomeIcon, MessageCircleIcon } from "lucide-react";
import { PropertyCarousel } from "@/components/property-carousel";
import { PropertySearch } from "@/components/property-search";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getProperties } from "@/lib/properties";

export const dynamic = "force-dynamic";

export default async function Home() {
  const properties = await getProperties();
  const sale = properties.filter((property) => property.purpose === "SALE");
  const rent = properties.filter((property) => property.purpose === "RENT");
  const featured = properties.filter((property) => property.isFeatured);
  const launches = properties.filter((property) => property.isLaunch);

  return (
    <main className="min-h-screen overflow-x-hidden bg-background text-foreground">
      <SiteHeader />
      <Hero />
      <PropertySearch properties={properties} />
      <PropertyCarousel
        anchorId="venda"
        title="Imóveis à venda"
        description="Casas, apartamentos e oportunidades selecionadas para comprar com segurança."
        properties={sale}
        href="/imoveis/a-venda"
      />
      <PropertyCarousel
        anchorId="aluguel"
        title="Imóveis para alugar"
        description="Opções prontas para morar ou operar, com informações objetivas para decidir rápido."
        properties={rent}
        href="/imoveis/para-alugar"
      />
      <PropertyCarousel
        anchorId="destaques"
        title="Imóveis em Destaque"
        description="Imóveis que merecem atenção especial por localização, acabamento ou potencial."
        properties={featured}
        href="/imoveis/destaques"
      />
      <PropertyCarousel
        anchorId="lancamentos"
        title="Lançamentos"
        description="Novos empreendimentos e unidades com excelente potencial de valorização."
        properties={launches}
        href="/imoveis/lancamentos"
      />
      <Services />
      <SiteFooter />
    </main>
  );
}

function Hero() {
  return (
    <section className="relative min-h-[680px] overflow-hidden bg-primary text-primary-foreground">
      <Image
        src="https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?auto=format&fit=crop&w=1800&q=82"
        alt="Sala ampla de imóvel de alto padrão"
        fill
        priority
        className="object-cover opacity-55"
        sizes="100vw"
      />
      <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/45 to-black/20" />
      <div className="relative mx-auto flex min-h-[680px] max-w-7xl flex-col justify-center px-4 pb-20 pt-24 sm:px-6 lg:px-8">
        <div className="max-w-3xl">
          <Badge className="rounded-md bg-white/15 text-white backdrop-blur">
            Curadoria imobiliária em Indaiatuba e região
          </Badge>
          <h1 className="mt-6 max-w-3xl text-5xl font-semibold tracking-tight sm:text-6xl lg:text-7xl">
            Carla Davanso Corretora
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-white/82">
            Encontre o imóvel certo para comprar ou alugar com atendimento
            próximo, filtros objetivos e uma vitrine fácil de atualizar.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Button size="lg" variant="secondary" nativeButton={false} render={<a href="#busca" />}>
              Buscar imóveis
              <ArrowRightIcon data-icon="inline-end" />
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="border-white/35 bg-white/10 text-white hover:bg-white/20 hover:text-white"
              nativeButton={false}
              render={<a href="https://wa.me/5519998383234" />}
            >
              <MessageCircleIcon data-icon="inline-start" />
              Falar no WhatsApp
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}

function Services() {
  const items = [
    "Venda com apresentação profissional do imóvel",
    "Locação com triagem e organização das informações",
    "Atendimento para compradores, proprietários e investidores",
  ];

  return (
    <section className="bg-secondary/40 py-16 sm:py-20">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 sm:px-6 md:grid-cols-[0.9fr_1.1fr] lg:px-8">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-muted-foreground">
            Atendimento
          </p>
          <h2 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">
            Uma operacao simples para manter a carteira sempre atualizada.
          </h2>
        </div>
        <div className="grid gap-4 sm:grid-cols-3">
          {items.map((item) => (
            <div key={item} className="rounded-lg border bg-background p-5 shadow-sm">
              <HomeIcon className="mb-5 text-primary" />
              <div className="flex items-start gap-2">
                <CheckCircle2Icon data-icon="inline-start" />
                <p className="text-sm leading-6 text-muted-foreground">{item}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
