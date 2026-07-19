import { PropertyCard } from "@/components/property-card";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { Button } from "@/components/ui/button";
import type { Property } from "@/types/property";

type PropertyCarouselProps = {
  title: string;
  description?: string;
  properties: Property[];
  anchorId: string;
  actions: Array<{
    href: string;
    label: string;
  }>;
};

export function PropertyCarousel({
  title,
  description,
  properties,
  anchorId,
  actions,
}: PropertyCarouselProps) {
  if (!properties.length) {
    return null;
  }

  return (
    <section id={anchorId} className="bg-background py-16 sm:py-20">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-8 px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="max-w-2xl">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-muted-foreground">
              Carla Davanso
            </p>
            <h2 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">
              {title}
            </h2>
            {description ? (
              <p className="mt-3 text-muted-foreground">{description}</p>
            ) : null}
          </div>
          <div className="flex flex-wrap gap-2">
            {actions.map((action) => (
              <Button
                key={action.href}
                variant="outline"
                nativeButton={false}
                render={<a href={action.href} />}
              >
                {action.label}
              </Button>
            ))}
          </div>
        </div>

        <Carousel opts={{ align: "start" }} className="px-0 sm:px-12">
          <CarouselContent>
            {properties.map((property) => (
              <CarouselItem
                key={property.id}
                className="basis-[88%] sm:basis-1/2 lg:basis-1/3"
              >
                <PropertyCard property={property} />
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious className="hidden bg-background/90 sm:inline-flex" />
          <CarouselNext className="hidden bg-background/90 sm:inline-flex" />
        </Carousel>
      </div>
    </section>
  );
}
