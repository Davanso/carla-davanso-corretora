import Image from "next/image";
import Link from "next/link";
import {
  ArrowRightIcon,
  CheckCircle2Icon,
  HomeIcon,
  KeyRoundIcon,
  MessageCircleIcon,
  SignpostIcon,
} from "lucide-react";
import { PropertyCarousel } from "@/components/property-carousel";
import { PropertySearch } from "@/components/property-search";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
            próximo, filtros objetivos e informações claras para orientar sua busca.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <a className={buttonVariants({ size: "lg", variant: "secondary" })} href="#busca">
              Buscar imóveis
              <ArrowRightIcon data-icon="inline-end" />
            </a>
            <a
              className={cn(
                buttonVariants({ size: "lg", variant: "outline" }),
                "border-white/35 bg-white/10 text-white hover:bg-white/20 hover:text-white"
              )}
              href={whatsappHref}
              rel="noreferrer"
              target="_blank"
            >
              <MessageCircleIcon data-icon="inline-start" />
              Falar no WhatsApp
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
      description: "Converse diretamente com a Carla para apresentar seu imóvel e entender os próximos passos.",
      href: `https://wa.me/5519998383234?text=${sellMessage}`,
      action: "Quero vender meu imóvel",
      icon: SignpostIcon,
      external: true,
    },
  ];

  return (
    <section aria-labelledby="client-paths-title" className="bg-background py-16 sm:py-20">
      <div className="mx-auto flex max-w-7xl flex-col gap-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-muted-foreground">
            Como posso ajudar?
          </p>
          <h2 id="client-paths-title" className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">
            Escolha o seu próximo passo.
          </h2>
        </div>
        <div className="grid gap-5 md:grid-cols-3">
          {paths.map(({ action, description, external, href, icon: Icon, title }) => (
            <Card key={title}>
              <CardHeader>
                <Icon className="mb-3 text-primary" aria-hidden="true" />
                <CardTitle>{title}</CardTitle>
                <CardDescription>{description}</CardDescription>
              </CardHeader>
              <CardContent className="flex-1" />
              <CardFooter>
                {external ? (
                  <a
                    className={buttonVariants({ variant: "outline" })}
                    href={href}
                    rel="noreferrer"
                    target="_blank"
                  >
                    {action}
                    <ArrowRightIcon data-icon="inline-end" />
                  </a>
                ) : (
                  <Link className={buttonVariants({ variant: "outline" })} href={href}>
                    {action}
                    <ArrowRightIcon data-icon="inline-end" />
                  </Link>
                )}
              </CardFooter>
            </Card>
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
    <section className="bg-secondary/40 py-16 sm:py-20">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 sm:px-6 md:grid-cols-[0.9fr_1.1fr] lg:px-8">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-muted-foreground">
            Atendimento
          </p>
          <h2 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">
            Atendimento consultivo para cada etapa da sua decisão imobiliária.
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
