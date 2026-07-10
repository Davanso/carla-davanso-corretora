import Link from "next/link";
import { CameraIcon, KeyRoundIcon, PhoneIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-border/70 bg-background/95 backdrop-blur">
      <div className="border-b border-border/60 bg-primary text-primary-foreground">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-2 text-sm sm:px-6 lg:px-8">
          <a className="flex items-center gap-2" href="tel:+5519999999999">
            <PhoneIcon data-icon="inline-start" />
            (19) 99999-9999
          </a>
          <a className="hidden items-center gap-2 sm:flex" href="https://instagram.com">
            <CameraIcon data-icon="inline-start" />
            Instagram
          </a>
        </div>
      </div>
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex flex-col leading-none">
          <span className="text-xl font-semibold tracking-tight">Carla Davanso</span>
          <span className="text-xs uppercase tracking-[0.22em] text-muted-foreground">
            Corretora de imoveis
          </span>
        </Link>
        <nav className="hidden items-center gap-6 text-sm font-medium md:flex">
          <a href="#venda">Venda</a>
          <a href="#aluguel">Aluguel</a>
          <a href="#destaques">Destaques</a>
          <a href="#lancamentos">Lancamentos</a>
          <a href="#contato">Contato</a>
        </nav>
        <Button size="sm" render={<Link href="/admin/login" />}>
          <KeyRoundIcon data-icon="inline-start" />
          Admin
        </Button>
      </div>
    </header>
  );
}
