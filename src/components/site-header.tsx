import Link from "next/link";
import { CameraIcon, MenuIcon, PhoneIcon, XIcon } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";

const publicNavigation = [
  { href: "/imoveis/a-venda", label: "Venda" },
  { href: "/imoveis/para-alugar", label: "Aluguel" },
  { href: "/imoveis/destaques", label: "Destaques" },
  { href: "/imoveis/lancamentos", label: "Lançamentos" },
  { href: "/contato", label: "Contato" },
] as const;

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-border/70 bg-background/95 backdrop-blur">
      <div className="border-b border-border/60 bg-primary text-primary-foreground">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-2 text-sm sm:px-6 lg:px-8">
          <a className="flex items-center gap-2" href="tel:+5519998383234">
            <PhoneIcon data-icon="inline-start" />
            (19) 99838-3234
          </a>
          <a
            className="hidden items-center gap-2 sm:flex"
            href="https://www.instagram.com/imoveiscomcarladavanso/"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Abrir Instagram @imoveiscomcarladavanso"
          >
            <CameraIcon data-icon="inline-start" />
            @imoveiscomcarladavanso
          </a>
        </div>
      </div>
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex flex-col leading-none">
          <span className="text-xl font-semibold tracking-tight">Carla Davanso</span>
          <span className="text-xs uppercase tracking-[0.22em] text-muted-foreground">
            Corretora de imóveis
          </span>
        </Link>
        <nav aria-label="Navegação principal" className="hidden items-center gap-6 text-sm font-medium md:flex">
          {publicNavigation.map((item) => (
            <Link key={item.href} href={item.href}>
              {item.label}
            </Link>
          ))}
        </nav>
        <details className="group relative md:hidden">
          <summary className={buttonVariants({ variant: "outline", size: "lg", className: "list-none [&::-webkit-details-marker]:hidden" })}>
            <MenuIcon className="group-open:hidden" data-icon="inline-start" />
            <XIcon className="hidden group-open:block" data-icon="inline-start" />
            Menu
          </summary>
          <nav
            id="mobile-navigation"
            aria-label="Navegação principal"
            className="absolute right-0 top-[calc(100%+0.75rem)] w-64 border border-border bg-background p-2 shadow-lg"
          >
            <div className="flex flex-col gap-1">
              {publicNavigation.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="rounded-md px-3 py-3 text-sm font-medium transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </nav>
        </details>
      </div>
    </header>
  );
}
