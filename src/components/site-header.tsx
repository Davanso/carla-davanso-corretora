"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { CameraIcon, MenuIcon, PhoneIcon, XIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

const publicNavigation = [
  { href: "/imoveis/a-venda", label: "Venda" },
  { href: "/imoveis/para-alugar", label: "Aluguel" },
  { href: "/imoveis/destaques", label: "Destaques" },
  { href: "/imoveis/lancamentos", label: "Lançamentos" },
  { href: "/contato", label: "Contato" },
] as const;

export function SiteHeader() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!isMenuOpen) return;

    function closeOnEscape(event: KeyboardEvent) {
      if (event.key !== "Escape") return;

      setIsMenuOpen(false);
      menuButtonRef.current?.focus();
    }

    document.addEventListener("keydown", closeOnEscape);
    return () => document.removeEventListener("keydown", closeOnEscape);
  }, [isMenuOpen]);

  function closeMenu() {
    setIsMenuOpen(false);
  }

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
        <Link href="/" className="flex flex-col leading-none" onClick={closeMenu}>
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
        <Button
          ref={menuButtonRef}
          type="button"
          variant="outline"
          size="lg"
          className="md:hidden"
          aria-controls="mobile-navigation"
          aria-expanded={isMenuOpen}
          onClick={() => setIsMenuOpen((isOpen) => !isOpen)}
        >
          {isMenuOpen ? (
            <XIcon data-icon="inline-start" />
          ) : (
            <MenuIcon data-icon="inline-start" />
          )}
          Menu
        </Button>
      </div>
      {isMenuOpen ? (
        <nav
          id="mobile-navigation"
          aria-label="Navegação principal"
          className="border-t border-border/70 px-4 py-3 md:hidden"
        >
          <div className="mx-auto flex max-w-7xl flex-col gap-1">
            {publicNavigation.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={closeMenu}
                className="rounded-md px-3 py-3 text-sm font-medium transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
              >
                {item.label}
              </Link>
            ))}
          </div>
        </nav>
      ) : null}
    </header>
  );
}
