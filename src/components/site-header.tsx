import Link from "next/link";
import { CameraIcon, KeyRoundIcon, PhoneIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

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
        <nav className="hidden items-center gap-6 text-sm font-medium md:flex">
          <Link href="/imoveis/a-venda">Venda</Link>
          <Link href="/imoveis/para-alugar">Aluguel</Link>
          <Link href="/imoveis/destaques">Destaques</Link>
          <Link href="/imoveis/lancamentos">Lançamentos</Link>
          <Link href="/contato">Contato</Link>
        </nav>
        <Button size="sm" nativeButton={false} render={<Link href="/admin/login" />}>
          <KeyRoundIcon data-icon="inline-start" />
          Painel
        </Button>
      </div>
    </header>
  );
}
