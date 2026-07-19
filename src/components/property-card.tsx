import Image from "next/image";
import Link from "next/link";
import { BathIcon, BedDoubleIcon, CarIcon, MapPinIcon, RulerIcon, type LucideIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { formatCurrency, purposeLabel } from "@/lib/format";
import type { Property } from "@/types/property";

type PropertyCardProps = {
  property: Property;
};

export function PropertyCard({ property }: PropertyCardProps) {
  const image = property.images[0];
  const priceSuffix = property.purpose === "RENT" ? "/mês" : undefined;

  return (
    <article className="group overflow-hidden rounded-[2rem] border border-border/80 bg-card p-2 shadow-[0_12px_32px_rgba(0,0,0,0.07)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_18px_42px_rgba(0,0,0,0.12)]">
      <Link href={`/imovel/${property.slug}`} aria-label={`Ver ${property.title}`}>
        <div className="relative aspect-[4/3] overflow-hidden rounded-[1.5rem] bg-muted">
          {image ? (
            <Image
              src={image.url}
              alt={image.alt}
              fill
              className="object-cover transition duration-700 group-hover:scale-105"
              sizes="(max-width: 768px) 90vw, 33vw"
            />
          ) : (
            <div className="flex size-full items-center justify-center px-6 text-center text-sm text-muted-foreground">
              Foto não disponível
            </div>
          )}
          <div className="absolute left-3 top-3 flex flex-wrap gap-2">
            <Badge className="rounded-full border border-white/50 bg-white/95 px-3 text-foreground shadow-sm backdrop-blur-sm">
              {purposeLabel(property.purpose)}
            </Badge>
            {property.isLaunch ? <Badge className="rounded-full bg-primary px-3 text-primary-foreground">Lançamento</Badge> : null}
          </div>
        </div>
      </Link>
      <div className="flex flex-col gap-3 px-3 pb-3 pt-4">
        <div className="flex items-start justify-between gap-3">
          <Link href={`/imovel/${property.slug}`} className="min-w-0">
            <h3 className="line-clamp-2 text-xl font-semibold leading-tight tracking-[-0.035em] transition-colors group-hover:text-muted-foreground">
              {property.title}
            </h3>
          </Link>
          <p className="shrink-0 whitespace-nowrap pt-0.5 text-base font-semibold tracking-[-0.03em]">
            {formatCurrency(property.priceInCents, priceSuffix)}
          </p>
        </div>
        <div className="flex items-center gap-1.5 text-sm leading-5 text-muted-foreground">
          <MapPinIcon data-icon="inline-start" />
          <span className="truncate">{property.addressSummary}</span>
        </div>
        <p className="line-clamp-2 text-sm leading-5 text-muted-foreground">
          {property.description}
        </p>
        <div className="grid grid-cols-4 gap-1.5 text-sm">
          <Spec icon={BedDoubleIcon} value={property.bedrooms ?? 0} label="Quartos" />
          <Spec icon={BathIcon} value={property.bathrooms ?? 0} label="Banheiros" />
          <Spec icon={CarIcon} value={property.parkingSpots ?? 0} label="Vagas" />
          <Spec icon={RulerIcon} value={property.areaM2} label="m²" />
        </div>
      </div>
    </article>
  );
}

function Spec({
  icon: Icon,
  value,
  label,
}: {
  icon: LucideIcon;
  value: number;
  label: string;
}) {
  return (
    <div className="flex min-h-15 flex-col items-center justify-center gap-1 rounded-2xl bg-muted px-1.5 py-2 text-center">
      <Icon data-icon="inline-start" />
      <span className="font-semibold leading-none">{value}</span>
      <span className="text-[0.6875rem] leading-none text-muted-foreground">{label}</span>
    </div>
  );
}
