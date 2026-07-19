import Image from "next/image";
import Link from "next/link";
import {
  ArrowRightIcon,
  ArrowUpRightIcon,
  CheckIcon,
  HomeIcon,
  KeyRoundIcon,
  MessageCircleIcon,
  SignpostIcon,
} from "lucide-react";
import { PropertyCarousel } from "@/components/property-carousel";
import { PropertySearch } from "@/components/property-search";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { getProperties } from "@/lib/properties";

export const dynamic = "force-dynamic";

export default async function Home() {
  const properties = await getProperties();
  const featured = properties.filter((property) => property.isFeatured);
  const curated = featured.length ? featured : properties.slice(0, 8);

  return (
    <main className="min-h-screen overflow-x-hidden bg-background text-foreground">
      <SiteHeader />
      <Hero />
      <PropertySearch properties={properties} />
      <PropertyCarousel
        anchorId="imoveis-selecionados"
        title="Imóveis em destaque"
        properties={curated}
        actions={[
          { href: "/imoveis/a-venda", label: "Ver imóveis à venda" },
          { href: "/imoveis/para-alugar", label: "Ver imóveis para alugar" },
        ]}
      />
      <ClientPaths />
      <PersonalService />
      <SiteFooter />
    </main>
  );
}

function Hero() {
  const whatsappHref = "https://wa.me/5519998383234";

  return (
    <section className="relative isolate min-h-[620px] overflow-hidden bg-primary text-primary-foreground sm:min-h-[680px]">
      <Image
        src="https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?auto=format&fit=crop&w=1800&q=82"
        alt="Sala ampla de imóvel de alto padrão"
        fill
        priority
        className="object-cover object-center grayscale brightness-75 contrast-110"
        sizes="100vw"
      />
      <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/65 to-black/25" />
      <div className="absolute inset-x-0 bottom-0 h-2/5 bg-gradient-to-t from-black/75 to-transparent" />
      <div className="relative mx-auto flex min-h-[620px] max-w-7xl flex-col justify-end px-4 pb-24 pt-28 sm:min-h-[680px] sm:px-6 sm:pb-28 lg:px-8">
        <div className="max-w-4xl">
            <h1 className="max-w-4xl text-5xl font-bold leading-[1.02] tracking-tight sm:text-6xl lg:text-7xl">
              Casas e apartamentos em Indaiatuba e região.
            </h1>
            <p className="mt-7 max-w-xl text-base leading-7 text-primary-foreground/80 sm:text-lg sm:leading-8">
              Imóveis para comprar ou alugar, com informações claras e atendimento direto em cada etapa.
            </p>
            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <a className={buttonVariants({ size: "lg", variant: "secondary" })} href="#busca">
                Ver imóveis
                <ArrowRightIcon data-icon="inline-end" />
              </a>
              <a
                className={cn(
                  buttonVariants({ size: "lg", variant: "outline" }),
                  "border-white/35 bg-transparent text-white hover:bg-white/15 hover:text-white"
                )}
                href={whatsappHref}
                rel="noreferrer"
                target="_blank"
              >
                <MessageCircleIcon data-icon="inline-start" />
                Converse comigo
              </a>
            </div>
        </div>
      </div>
    </section>
  );
}

function ClientPaths() {
  const sellMessage = encodeURIComponent(
    "Olá, Carla! Quero conversar sobre a venda do meu imóvel."
  );
  const paths = [
    {
      title: "Comprar",
      description: "Veja casas, apartamentos, terrenos e imóveis comerciais disponíveis para venda.",
      href: "/imoveis/a-venda",
      action: "Ver imóveis à venda",
      icon: HomeIcon,
      external: false,
    },
    {
      title: "Alugar",
      description: "Encontre opções para morar ou instalar seu negócio em Indaiatuba e região.",
      href: "/imoveis/para-alugar",
      action: "Ver imóveis para alugar",
      icon: KeyRoundIcon,
      external: false,
    },
    {
      title: "Quero vender meu imóvel",
      description: "Converse comigo para apresentar seu imóvel e entender os próximos passos.",
      href: `https://wa.me/5519998383234?text=${sellMessage}`,
      action: "Quero vender meu imóvel",
      icon: SignpostIcon,
      external: true,
    },
  ];

  return (
    <section aria-labelledby="client-paths-title" className="bg-secondary/65 py-16 sm:py-20">
      <div className="mx-auto flex max-w-7xl flex-col gap-7 px-4 sm:px-6 lg:px-8">
        <h2 id="client-paths-title" className="text-3xl font-semibold leading-tight tracking-tight sm:text-4xl">
          Comprar, alugar ou anunciar.
        </h2>
        <div className="grid gap-3 md:grid-cols-3">
          {paths.map(({ description, external, href, icon: Icon, title }) => {
            const content = (
              <>
                <span className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-primary text-primary-foreground">
                  <Icon aria-hidden="true" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-lg font-semibold tracking-tight">{title}</span>
                  <span className="mt-1 block text-sm leading-5 text-muted-foreground">{description}</span>
                </span>
                <ArrowUpRightIcon className="shrink-0" aria-hidden="true" />
              </>
            );

            return external ? (
              <a key={title} className="flex items-start gap-4 rounded-3xl border border-border bg-background p-5 transition hover:-translate-y-0.5 hover:shadow-md" href={href} rel="noreferrer" target="_blank">
                {content}
              </a>
            ) : (
              <Link key={title} className="flex items-start gap-4 rounded-3xl border border-border bg-background p-5 transition hover:-translate-y-0.5 hover:shadow-md" href={href}>
                {content}
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function PersonalService() {
  const items = [
    "Seleção e apresentação cuidadosa dos imóveis",
    "Informações organizadas para decisões mais seguras",
    "Contato direto para compradores, proprietários e investidores",
  ];
  const whatsappHref = "https://wa.me/5519998383234";

  return (
    <section className="bg-primary py-20 text-primary-foreground sm:py-28">
      <div className="mx-auto grid max-w-7xl gap-12 px-4 sm:px-6 md:grid-cols-[1.05fr_0.95fr] md:items-start lg:px-8">
        <div className="max-w-xl">
          <h2 className="text-4xl font-semibold leading-tight tracking-tight sm:text-5xl">
            Atendimento direto em cada etapa.
          </h2>
          <p className="mt-6 text-base leading-7 text-primary-foreground/70 sm:text-lg sm:leading-8">
            Eu acompanho a busca, organizo as informações e ajudo você a conduzir a decisão com clareza, sem intermediários desnecessários.
          </p>
          <a className={cn(buttonVariants({ size: "lg", variant: "secondary" }), "mt-8")} href={whatsappHref} rel="noreferrer" target="_blank">
            <MessageCircleIcon data-icon="inline-start" />
            Converse comigo
          </a>
        </div>
        <div className="border-t border-primary-foreground/20">
          {items.map((item) => (
            <div key={item} className="flex items-start gap-4 border-b border-primary-foreground/20 py-6">
              <span className="mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-full border border-primary-foreground/30">
                <CheckIcon aria-hidden="true" />
              </span>
              <p className="max-w-lg text-base leading-7 text-primary-foreground/80 sm:text-lg">{item}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
