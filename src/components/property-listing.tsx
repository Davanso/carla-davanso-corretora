"use client";

import { useMemo, useState } from "react";
import { SlidersHorizontalIcon } from "lucide-react";
import { PropertyCard } from "@/components/property-card";
import { Button } from "@/components/ui/button";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import type { Property } from "@/types/property";

type PropertyListingProps = {
  properties: Property[];
  title: string;
};

const anyValue = "ANY";

export function PropertyListing({ properties, title }: PropertyListingProps) {
  const [type, setType] = useState(anyValue);
  const [city, setCity] = useState(anyValue);
  const [district, setDistrict] = useState(anyValue);
  const [community, setCommunity] = useState(anyValue);
  const [isCondo, setIsCondo] = useState(anyValue);
  const [bedrooms, setBedrooms] = useState(anyValue);
  const [bathrooms, setBathrooms] = useState(anyValue);
  const [parkingSpots, setParkingSpots] = useState(anyValue);
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [sort, setSort] = useState("recentes");

  const options = useMemo(
    () => ({
      cities: unique(properties.map((property) => property.city)),
      districts: unique(properties.map((property) => property.district).filter(Boolean) as string[]),
      communities: unique(properties.map((property) => property.community).filter(Boolean) as string[]),
      types: unique(properties.map((property) => property.type)),
    }),
    [properties]
  );

  const filtered = properties
    .filter((property) => {
      const price = property.priceInCents / 100;

      return (
        (type === anyValue || property.type === type) &&
        (city === anyValue || property.city === city) &&
        (district === anyValue || property.district === district) &&
        (community === anyValue || property.community === community) &&
        (isCondo === anyValue || String(property.isCondo) === isCondo) &&
        (bedrooms === anyValue || (property.bedrooms ?? 0) >= Number(bedrooms)) &&
        (bathrooms === anyValue || (property.bathrooms ?? 0) >= Number(bathrooms)) &&
        (parkingSpots === anyValue || (property.parkingSpots ?? 0) >= Number(parkingSpots)) &&
        (!minPrice || price >= Number(minPrice)) &&
        (!maxPrice || price <= Number(maxPrice))
      );
    })
    .sort((a, b) => {
      if (sort === "menor-preco") {
        return a.priceInCents - b.priceInCents;
      }

      if (sort === "maior-preco") {
        return b.priceInCents - a.priceInCents;
      }

      return 0;
    });

  function clearFilters() {
    setType(anyValue);
    setCity(anyValue);
    setDistrict(anyValue);
    setCommunity(anyValue);
    setIsCondo(anyValue);
    setBedrooms(anyValue);
    setBathrooms(anyValue);
    setParkingSpots(anyValue);
    setMinPrice("");
    setMaxPrice("");
    setSort("recentes");
  }

  return (
    <section className="bg-secondary/35 py-10 sm:py-14">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 sm:px-6 lg:grid-cols-[300px_1fr] lg:px-8">
        <aside className="h-fit rounded-lg border bg-background p-5 shadow-sm lg:sticky lg:top-32">
          <div className="mb-5 flex items-center justify-between gap-3">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                Filtrar
              </p>
              <h2 className="text-xl font-semibold">Encontre seu imóvel</h2>
            </div>
            <SlidersHorizontalIcon className="text-muted-foreground" />
          </div>

          <FieldGroup className="gap-4">
            <SelectField label="Tipo de imóvel" value={type} onChange={setType}>
              <option value={anyValue}>Todos</option>
              {options.types.map((item) => (
                <option key={item} value={item}>
                  {typeLabel(item)}
                </option>
              ))}
            </SelectField>
            <SelectField label="Cidade" value={city} onChange={setCity}>
              <option value={anyValue}>Todas</option>
              {options.cities.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </SelectField>
            <SelectField label="Bairro" value={district} onChange={setDistrict}>
              <option value={anyValue}>Todos</option>
              {options.districts.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </SelectField>
            <SelectField label="Condomínio" value={community} onChange={setCommunity}>
              <option value={anyValue}>Indiferente</option>
              {options.communities.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </SelectField>
            <SelectField label="Condomínio fechado?" value={isCondo} onChange={setIsCondo}>
              <option value={anyValue}>Indiferente</option>
              <option value="true">Sim</option>
              <option value="false">Não</option>
            </SelectField>

            <div className="grid grid-cols-2 gap-3">
              <Field>
                <FieldLabel htmlFor="minPrice">Preço mín.</FieldLabel>
                <Input
                  id="minPrice"
                  type="number"
                  inputMode="numeric"
                  value={minPrice}
                  onChange={(event) => setMinPrice(event.target.value)}
                />
              </Field>
              <Field>
                <FieldLabel htmlFor="maxPrice">Preço máx.</FieldLabel>
                <Input
                  id="maxPrice"
                  type="number"
                  inputMode="numeric"
                  value={maxPrice}
                  onChange={(event) => setMaxPrice(event.target.value)}
                />
              </Field>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <SelectField label="Quartos" value={bedrooms} onChange={setBedrooms}>
                <NumberOptions />
              </SelectField>
              <SelectField label="Banheiros" value={bathrooms} onChange={setBathrooms}>
                <NumberOptions />
              </SelectField>
              <SelectField label="Vagas" value={parkingSpots} onChange={setParkingSpots}>
                <NumberOptions />
              </SelectField>
            </div>

            <Button type="button" className="h-10" onClick={clearFilters}>
              Limpar filtros
            </Button>
          </FieldGroup>
        </aside>

        <div className="flex flex-col gap-5">
          <div className="flex flex-col gap-3 rounded-lg border bg-background p-5 shadow-sm md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-sm text-muted-foreground">{filtered.length} imóveis encontrados</p>
              <h1 className="text-3xl font-semibold tracking-tight">{title}</h1>
            </div>
            <label className="flex flex-col gap-2 text-sm font-medium text-muted-foreground">
              Ordenar por
              <select
                value={sort}
                onChange={(event) => setSort(event.target.value)}
                className="h-10 min-w-56 rounded-lg border border-input bg-background px-3 text-sm text-foreground outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
              >
                <option value="recentes">Mais recentes</option>
                <option value="menor-preco">Preço: menor para maior</option>
                <option value="maior-preco">Preço: maior para menor</option>
              </select>
            </label>
          </div>

          {filtered.length ? (
            <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
              {filtered.map((property) => (
                <PropertyCard key={property.id} property={property} />
              ))}
            </div>
          ) : (
            <Empty className="min-h-72 border bg-background">
              <EmptyHeader>
                <EmptyMedia variant="icon"><SlidersHorizontalIcon /></EmptyMedia>
                <EmptyTitle>Nenhum imóvel encontrado</EmptyTitle>
                <EmptyDescription>
                  Ajuste ou limpe os filtros para ver outras opções disponíveis.
                </EmptyDescription>
              </EmptyHeader>
              <Button type="button" variant="outline" onClick={clearFilters}>Limpar filtros</Button>
            </Empty>
          )}
        </div>
      </div>
    </section>
  );
}

function SelectField({
  label,
  value,
  onChange,
  children,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  children: React.ReactNode;
}) {
  return (
    <Field>
      <FieldLabel>{label}</FieldLabel>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="h-10 w-full rounded-lg border border-input bg-background px-3 text-sm text-foreground outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
      >
        {children}
      </select>
    </Field>
  );
}

function NumberOptions() {
  return (
    <>
      <option value={anyValue}>Todos</option>
      <option value="1">1+</option>
      <option value="2">2+</option>
      <option value="3">3+</option>
      <option value="4">4+</option>
    </>
  );
}

function unique(values: string[]) {
  return Array.from(new Set(values)).sort((a, b) => a.localeCompare(b));
}

function typeLabel(type: string) {
  const labels: Record<string, string> = {
    HOUSE: "Casa",
    CONDO_HOUSE: "Casa de condomínio",
    APARTMENT: "Apartamento",
    LAND: "Terreno",
    STUDIO: "Studio",
    COMMERCIAL: "Comercial",
  };

  return labels[type] ?? type;
}
