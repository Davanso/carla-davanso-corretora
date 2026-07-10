"use client";

import { useMemo, useState } from "react";
import { SearchIcon } from "lucide-react";
import { PropertyCard } from "@/components/property-card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import type { Property } from "@/types/property";

type PropertySearchProps = {
  properties: Property[];
};

const anyValue = "ANY";

export function PropertySearch({ properties }: PropertySearchProps) {
  const [purpose, setPurpose] = useState(anyValue);
  const [city, setCity] = useState(anyValue);
  const [district, setDistrict] = useState(anyValue);
  const [community, setCommunity] = useState(anyValue);
  const [isCondo, setIsCondo] = useState(anyValue);

  const cities = useMemo(() => unique(properties.map((property) => property.city)), [properties]);
  const districts = useMemo(
    () => unique(properties.map((property) => property.district).filter(Boolean) as string[]),
    [properties]
  );
  const communities = useMemo(
    () => unique(properties.map((property) => property.community).filter(Boolean) as string[]),
    [properties]
  );

  const filtered = properties.filter((property) => {
    return (
      (purpose === anyValue || property.purpose === purpose) &&
      (city === anyValue || property.city === city) &&
      (district === anyValue || property.district === district) &&
      (community === anyValue || property.community === community) &&
      (isCondo === anyValue || String(property.isCondo) === isCondo)
    );
  });

  return (
    <section id="busca" className="bg-secondary/45 py-14">
      <div className="mx-auto flex max-w-7xl flex-col gap-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-muted-foreground">
            Encontre seu novo imovel
          </p>
          <h2 className="mt-2 text-3xl font-semibold tracking-tight">
            Filtre por objetivo, localizacao e condominio.
          </h2>
        </div>

        <div className="rounded-lg border bg-background p-4 shadow-sm">
          <FieldGroup className="grid gap-4 md:grid-cols-5">
            <FilterSelect label="Transacao" value={purpose} onChange={setPurpose}>
              <SelectItem value={anyValue}>Comprar ou alugar</SelectItem>
              <SelectItem value="SALE">Comprar</SelectItem>
              <SelectItem value="RENT">Alugar</SelectItem>
            </FilterSelect>
            <FilterSelect label="Cidade" value={city} onChange={setCity}>
              <SelectItem value={anyValue}>Todas</SelectItem>
              {cities.map((item) => (
                <SelectItem key={item} value={item}>
                  {item}
                </SelectItem>
              ))}
            </FilterSelect>
            <FilterSelect label="Bairro" value={district} onChange={setDistrict}>
              <SelectItem value={anyValue}>Todos</SelectItem>
              {districts.map((item) => (
                <SelectItem key={item} value={item}>
                  {item}
                </SelectItem>
              ))}
            </FilterSelect>
            <FilterSelect label="Condominio" value={community} onChange={setCommunity}>
              <SelectItem value={anyValue}>Todos</SelectItem>
              {communities.map((item) => (
                <SelectItem key={item} value={item}>
                  {item}
                </SelectItem>
              ))}
            </FilterSelect>
            <FilterSelect label="Fechado?" value={isCondo} onChange={setIsCondo}>
              <SelectItem value={anyValue}>Tanto faz</SelectItem>
              <SelectItem value="true">Sim</SelectItem>
              <SelectItem value="false">Nao</SelectItem>
            </FilterSelect>
          </FieldGroup>
          <div className="mt-4 flex items-center justify-between gap-3 text-sm text-muted-foreground">
            <span>{filtered.length} imoveis encontrados</span>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setPurpose(anyValue);
                setCity(anyValue);
                setDistrict(anyValue);
                setCommunity(anyValue);
                setIsCondo(anyValue);
              }}
            >
              <SearchIcon data-icon="inline-start" />
              Limpar busca
            </Button>
          </div>
        </div>

        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {filtered.slice(0, 6).map((property) => (
            <PropertyCard key={property.id} property={property} />
          ))}
        </div>
      </div>
    </section>
  );
}

function FilterSelect({
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
      <Select value={value} onValueChange={(nextValue) => onChange(nextValue ?? anyValue)}>
        <SelectTrigger className="h-11 w-full">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>{children}</SelectGroup>
        </SelectContent>
      </Select>
    </Field>
  );
}

function unique(values: string[]) {
  return Array.from(new Set(values)).sort((a, b) => a.localeCompare(b));
}
