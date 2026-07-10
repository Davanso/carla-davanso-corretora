import { CameraIcon, MailIcon, MapPinIcon, PhoneIcon } from "lucide-react";
import { Separator } from "@/components/ui/separator";

export function SiteFooter() {
  return (
    <footer id="contato" className="bg-primary text-primary-foreground">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 sm:px-6 md:grid-cols-[1.2fr_0.8fr_0.8fr] lg:px-8">
        <div>
          <p className="text-2xl font-semibold">Carla Davanso</p>
          <p className="mt-3 max-w-md text-sm leading-6 text-primary-foreground/75">
            Atendimento consultivo para comprar, vender ou alugar com clareza,
            cuidado e seguranca em cada etapa.
          </p>
          <p className="mt-6 text-sm text-primary-foreground/70">CRECI: 000000-F</p>
        </div>
        <div className="flex flex-col gap-3 text-sm">
          <p className="font-semibold">Contato</p>
          <a className="flex items-center gap-2" href="tel:+5519999999999">
            <PhoneIcon data-icon="inline-start" />
            (19) 99999-9999
          </a>
          <a className="flex items-center gap-2" href="mailto:contato@carladavanso.com.br">
            <MailIcon data-icon="inline-start" />
            contato@carladavanso.com.br
          </a>
          <a className="flex items-center gap-2" href="https://instagram.com">
            <CameraIcon data-icon="inline-start" />
            @carladavanso
          </a>
        </div>
        <div className="flex flex-col gap-3 text-sm">
          <p className="font-semibold">Atendimento</p>
          <span className="flex items-center gap-2">
            <MapPinIcon data-icon="inline-start" />
            Indaiatuba e regiao
          </span>
          <span>Segunda a sexta: 9h as 18h</span>
          <span>Sabado: 9h as 13h</span>
        </div>
      </div>
      <Separator className="bg-primary-foreground/20" />
      <div className="mx-auto flex max-w-7xl flex-col gap-2 px-4 py-5 text-xs text-primary-foreground/65 sm:px-6 md:flex-row md:items-center md:justify-between lg:px-8">
        <span>Valores, disponibilidade e condicoes podem mudar sem aviso previo.</span>
        <span>© 2026 Carla Davanso Corretora.</span>
      </div>
    </footer>
  );
}
