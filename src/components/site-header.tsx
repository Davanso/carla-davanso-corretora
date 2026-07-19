import Link from "next/link";
import { MenuIcon, MessageCircleIcon, XIcon } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";

const publicNavigation = [
  { href: "/imoveis/a-venda", label: "Venda" },
  { href: "/imoveis/para-alugar", label: "Aluguel" },
  { href: "/imoveis/destaques", label: "Destaques" },
  { href: "/imoveis/lancamentos", label: "Lançamentos" },
  { href: "/contato", label: "Contato" },
] as const;

export function SiteHeader() {
  const whatsappHref = "https://wa.me/5519998383234";

  return (
    <header className="sticky top-0 z-40 border-b border-border/70 bg-background/95 backdrop-blur">
      <div className="mx-auto flex min-h-20 max-w-7xl items-center justify-between gap-5 px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex flex-col leading-none">
          <span className="text-xl font-semibold tracking-tight">Carla Davanso</span>
          <span className="text-xs uppercase tracking-[0.22em] text-muted-foreground">
            Corretora de imóveis
          </span>
        </Link>
        <nav aria-label="Navegação principal" className="hidden items-center gap-6 text-sm font-medium lg:flex">
          {publicNavigation.slice(0, 4).map((item) => (
            <Link key={item.href} href={item.href}>
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="hidden items-center gap-2 lg:flex">
          <a
            aria-label="Abrir Instagram @imoveiscomcarladavanso"
            className={buttonVariants({ variant: "ghost", size: "lg" })}
            href="https://www.instagram.com/imoveiscomcarladavanso/"
            rel="noopener noreferrer"
            target="_blank"
          >
            <svg aria-hidden="true" className="size-6" fill="none" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <rect height="18" rx="5" stroke="currentColor" strokeWidth="2" width="18" x="3" y="3" />
              <circle cx="12" cy="12" r="4" stroke="currentColor" strokeWidth="2" />
              <circle cx="17.5" cy="6.5" fill="currentColor" r="1.25" />
            </svg>
            @imoveiscomcarladavanso
          </a>
          <a className={buttonVariants({ size: "lg" })} href={whatsappHref} rel="noreferrer" target="_blank">
            <MessageCircleIcon data-icon="inline-start" />
            Falar comigo
          </a>
        </div>
        <details className="group relative lg:hidden">
          <summary className={buttonVariants({ variant: "outline", size: "lg", className: "list-none [&::-webkit-details-marker]:hidden" })}>
            <MenuIcon className="group-open:hidden" data-icon="inline-start" />
            <XIcon className="hidden group-open:block" data-icon="inline-start" />
            Menu
          </summary>
          <nav
            id="mobile-navigation"
            aria-label="Navegação principal"
            className="absolute right-0 top-[calc(100%+0.75rem)] w-64 rounded-2xl border border-border bg-background p-2 shadow-lg"
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
              <a className="rounded-xl px-3 py-3 text-sm font-medium transition-colors hover:bg-muted" href={whatsappHref} rel="noreferrer" target="_blank">
                Falar comigo no WhatsApp
              </a>
              <a className="rounded-xl px-3 py-3 text-sm font-medium transition-colors hover:bg-muted" href="https://www.instagram.com/imoveiscomcarladavanso/" rel="noopener noreferrer" target="_blank">
                Instagram
              </a>
            </div>
          </nav>
        </details>
      </div>
    </header>
  );
}
