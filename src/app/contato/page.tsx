import Link from "next/link";
import { CameraIcon, ClockIcon, MailIcon, MapPinIcon, PhoneIcon } from "lucide-react";
import { ContactForm } from "@/components/contact-form";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { Card, CardContent } from "@/components/ui/card";

const address = "Rua José Amstalden Filho, 365, Indaiatuba/SP";
const mapQuery = encodeURIComponent("Rua José Amstalden Filho, 365, Indaiatuba, SP");
const googleMapsApiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

const contacts = [
  {
    label: "Telefone e WhatsApp",
    value: "(19) 99838-3234",
    href: "https://wa.me/5519998383234",
    icon: PhoneIcon,
  },
  {
    label: "E-mail",
    value: "carladestro@yahoo.com.br",
    href: "mailto:carladestro@yahoo.com.br",
    icon: MailIcon,
  },
  {
    label: "Instagram",
    value: "@imoveiscomcarladavanso",
    href: "https://www.instagram.com/imoveiscomcarladavanso/",
    icon: CameraIcon,
  },
];

export default function ContactPage() {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <SiteHeader />
      <section className="bg-secondary/35 py-14 sm:py-20">
        <div className="mx-auto grid max-w-7xl gap-10 px-4 sm:px-6 lg:grid-cols-[0.9fr_1.1fr] lg:px-8">
          <div className="flex flex-col justify-between gap-10">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                Contato
              </p>
              <h1 className="mt-3 max-w-xl text-4xl font-semibold tracking-tight sm:text-5xl">
                Vamos conversar sobre o seu próximo imóvel.
              </h1>
              <p className="mt-5 max-w-xl text-muted-foreground">
                Envie uma mensagem para tirar dúvidas, agendar visitas ou conversar sobre
                venda, compra e locação em Indaiatuba e região.
              </p>
            </div>

            <Card className="rounded-lg border-border/70 shadow-sm">
              <CardContent className="flex flex-col gap-5 p-5">
                {contacts.map((item) => (
                  <Link
                    key={item.label}
                    href={item.href}
                    target={item.href.startsWith("http") ? "_blank" : undefined}
                    rel={item.href.startsWith("http") ? "noopener noreferrer" : undefined}
                    className="flex items-start gap-3 rounded-md p-2 transition hover:bg-muted"
                  >
                    <item.icon className="mt-0.5 text-primary" />
                    <span className="flex flex-col">
                      <span className="text-sm text-muted-foreground">{item.label}</span>
                      <span className="font-medium">{item.value}</span>
                    </span>
                  </Link>
                ))}
              </CardContent>
            </Card>
          </div>

          <ContactForm />
        </div>
      </section>

      <section className="bg-background py-14 sm:py-20">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 sm:px-6 lg:grid-cols-2 lg:px-8">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-muted-foreground">
              Onde estamos
            </p>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight">
              Atendimento em Indaiatuba e região.
            </h2>
            <div className="mt-8 flex flex-col gap-5 text-muted-foreground">
              <div className="flex gap-3">
                <MapPinIcon className="mt-0.5 text-primary" />
                <p>{address}</p>
              </div>
              <div className="flex gap-3">
                <ClockIcon className="mt-0.5 text-primary" />
                <p>Segunda a sexta: 9h às 18h. Sábado: 9h às 13h.</p>
              </div>
            </div>
          </div>

          <div className="overflow-hidden rounded-lg border bg-secondary/40">
            {googleMapsApiKey ? (
              <iframe
                title={`Mapa para ${address}`}
                src={`https://www.google.com/maps/embed/v1/place?key=${googleMapsApiKey}&q=${mapQuery}&zoom=18`}
                className="min-h-96 w-full"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            ) : (
              <div className="flex min-h-96 items-center justify-center p-8 text-center text-sm text-muted-foreground">
                Configure NEXT_PUBLIC_GOOGLE_MAPS_API_KEY para exibir o mapa.
              </div>
            )}
          </div>
        </div>
      </section>
      <SiteFooter />
    </main>
  );
}
