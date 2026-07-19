import Image from "next/image";
import Link from "next/link";
import {
  ArrowRightIcon,
  ArrowUpRightIcon,
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
      <ClientPaths />
      <PropertySearch properties={properties} />
      <PropertyCarousel
        anchorId="imoveis-selecionados"
        title="Imóveis selecionados"
        description="Uma seleção da carteira para você conhecer as opções disponíveis em Indaiatuba e região."
        properties={curated}
        actions={[
          { href: "/imoveis/a-venda", label: "Ver imóveis à venda" },
          { href: "/imoveis/para-alugar", label: "Ver imóveis para alugar" },
        ]}
      />
      <Services />
      <SiteFooter />
    </main>
  );
}

function Hero() {
  const whatsappHref = "https://wa.me/5519998383234";

  return (
    <section className="relative isolate min-h-[720px] overflow-hidden bg-primary text-primary-foreground sm:min-h-[760px]">
      <Image
        src="https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?auto=format&fit=crop&w=1800&q=82"
        alt="Sala ampla de imóvel de alto padrão"
        fill
        priority
        className="object-cover object-center grayscale brightness-75 contrast-110"
        sizes="100vw"
      />
      <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/65 to-black/20" />
      <div className="absolute inset-x-0 bottom-0 h-2/5 bg-gradient-to-t from-black/70 to-transparent" />
      <div className="relative mx-auto flex min-h-[720px] max-w-7xl flex-col justify-end px-4 pb-16 pt-28 sm:min-h-[760px] sm:px-6 sm:pb-20 lg:px-8">
        <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_260px] lg:items-end">
          <div className="max-w-4xl">
            <h1 className="max-w-3xl text-5xl font-bold leading-[1.02] tracking-tight sm:text-6xl lg:text-7xl">
              Carla Davanso <span className="whitespace-nowrap">Corretora.</span>
            </h1>
            <p className="mt-7 max-w-xl text-base leading-7 text-primary-foreground/80 sm:text-lg sm:leading-8">
              Uma seleção cuidadosa de casas, apartamentos e oportunidades para
              comprar, alugar ou anunciar o seu imóvel.
            </p>
            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <a className={buttonVariants({ size: "lg", variant: "secondary" })} href="#busca">
                Encontrar um imóvel
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
                Conversar com a Carla
              </a>
            </div>
          </div>
          <div className="max-w-xs border-l border-white/35 pl-5 text-sm leading-6 text-primary-foreground/75 lg:mb-2">
            <p className="font-medium text-white">Atendimento próximo, do primeiro filtro à chave na mão.</p>
            <p className="mt-2">Compra · Venda · Locação</p>
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
      description: "Converse diretamente com a Carla para apresentar seu imóvel e entender os próximos passos.",
      href: `https://wa.me/5519998383234?text=${sellMessage}`,
      action: "Quero vender meu imóvel",
      icon: SignpostIcon,
      external: true,
    },
  ];

  return (
    <section aria-labelledby="client-paths-title" className="bg-background py-20 sm:py-28">
      <div className="mx-auto flex max-w-7xl flex-col gap-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl">
          <h2 id="client-paths-title" className="max-w-3xl text-3xl font-semibold leading-snug tracking-tight sm:text-4xl">
            A busca começa com uma conversa clara sobre o que você procura.
          </h2>
        </div>
        <div className="grid border-y border-border md:grid-cols-3">
          {paths.map(({ action, description, external, href, icon: Icon, title }) => (
            <article key={title} className="flex min-h-72 flex-col border-border px-0 py-8 md:border-r md:px-8 md:first:pl-0 md:last:border-r-0 lg:py-10">
              <Icon className="text-primary" aria-hidden="true" />
              <h3 className="mt-10 text-2xl font-semibold tracking-tight">{title}</h3>
              <p className="mt-3 max-w-xs text-sm leading-6 text-muted-foreground">{description}</p>
              <div className="mt-auto pt-8">
                {external ? (
                  <a className="inline-flex items-center gap-2 text-sm font-semibold transition-opacity hover:opacity-70" href={href} rel="noreferrer" target="_blank">
                    {action}
                    <ArrowUpRightIcon data-icon="inline-end" />
                  </a>
                ) : (
                  <Link className="inline-flex items-center gap-2 text-sm font-semibold transition-opacity hover:opacity-70" href={href}>
                    {action}
                    <ArrowUpRightIcon data-icon="inline-end" />
                  </Link>
                )}
              </div>
            </article>
          ))}
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
    <section className="bg-secondary/65 py-20 sm:py-28">
      <div className="mx-auto grid max-w-7xl gap-12 px-4 sm:px-6 md:grid-cols-[0.9fr_1.1fr] lg:px-8">
        <div>
          <h2 className="text-3xl font-semibold leading-snug tracking-tight sm:text-4xl">
            Decisões importantes pedem informação, repertório e presença.
          </h2>
        </div>
        <div className="border-t border-border">
          {items.map((item, index) => (
            <div key={item} className="grid grid-cols-[auto_1fr] gap-5 border-b border-border py-6 sm:gap-8">
              <span className="text-2xl font-medium text-muted-foreground">0{index + 1}</span>
              <p className="max-w-lg text-lg leading-7 text-foreground/80">{item}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
