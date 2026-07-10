import Image from "next/image";
import Link from "next/link";
import { BathIcon, BedDoubleIcon, CarIcon, MapPinIcon, RulerIcon, type LucideIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { formatCurrency, purposeLabel } from "@/lib/format";
import type { Property } from "@/types/property";

type PropertyCardProps = {
  property: Property;
};

export function PropertyCard({ property }: PropertyCardProps) {
  const image = property.images[0];
  const priceSuffix = property.purpose === "RENT" ? "/mês" : undefined;

  return (
    <Card className="overflow-hidden rounded-lg border-border/70 bg-card shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl">
      <Link href={`/imoveis/${property.slug}`} aria-label={`Ver ${property.title}`}>
        <div className="relative aspect-[4/3] overflow-hidden bg-muted">
          {image ? (
            <Image
              src={image.url}
              alt={image.alt}
              fill
              className="object-cover transition duration-500 hover:scale-105"
              sizes="(max-width: 768px) 90vw, 33vw"
            />
          ) : null}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
          <div className="absolute left-4 top-4 flex flex-wrap gap-2">
            <Badge className="rounded-md bg-primary text-primary-foreground">
              {purposeLabel(property.purpose)}
            </Badge>
            {property.isLaunch ? <Badge variant="secondary">Lançamento</Badge> : null}
          </div>
          <div className="absolute inset-x-4 bottom-4 text-white">
            <p className="text-sm font-medium opacity-90">
              {formatCurrency(property.priceInCents, priceSuffix)}
            </p>
            <h3 className="mt-1 line-clamp-2 text-lg font-semibold leading-tight">
              {property.title}
            </h3>
          </div>
        </div>
      </Link>
      <CardContent className="flex flex-col gap-4 p-4">
        <p className="line-clamp-2 min-h-10 text-sm text-muted-foreground">
          {property.description}
        </p>
        <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
          <MapPinIcon data-icon="inline-start" />
          <span className="truncate">{property.addressSummary}</span>
        </div>
        <div className="grid grid-cols-4 gap-2 text-sm">
          <Spec icon={BedDoubleIcon} value={property.bedrooms ?? 0} label="Quartos" />
          <Spec icon={BathIcon} value={property.bathrooms ?? 0} label="Banheiros" />
          <Spec icon={CarIcon} value={property.parkingSpots ?? 0} label="Vagas" />
          <Spec icon={RulerIcon} value={property.areaM2} label="m²" />
        </div>
      </CardContent>
    </Card>
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
    <div className="flex min-h-16 flex-col items-center justify-center gap-1 rounded-md bg-muted/60 px-2 text-center">
      <Icon data-icon="inline-start" />
      <span className="font-semibold leading-none">{value}</span>
      <span className="text-xs text-muted-foreground">{label}</span>
    </div>
  );
}
