"use client";

import { useMemo, useState, type FormEvent, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { SearchIcon } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Property } from "@/types/property";

type PropertySearchProps = {
  properties: Property[];
};

const anyValue = "ANY";

const purposeOptions = [
  { label: "Comprar", value: "SALE" },
  { label: "Alugar", value: "RENT" },
];

const typeLabels: Record<Property["type"], string> = {
  HOUSE: "Casa",
  CONDO_HOUSE: "Casa em condomínio",
  APARTMENT: "Apartamento",
  LAND: "Terreno",
  STUDIO: "Studio",
  COMMERCIAL: "Comercial",
};

export function PropertySearch({ properties }: PropertySearchProps) {
  const router = useRouter();
  const [purpose, setPurpose] = useState("SALE");
  const [type, setType] = useState(anyValue);
  const [district, setDistrict] = useState(anyValue);
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");

  const typeOptions = useMemo(
    () => [
      { label: "Todos os tipos", value: anyValue },
      ...unique(properties.map((property) => property.type)).map((value) => ({
        label: typeLabels[value],
        value,
      })),
    ],
    [properties]
  );
  const districtOptions = useMemo(
    () => [
      { label: "Todos os bairros", value: anyValue },
      ...unique(
        properties
          .map((property) => property.district)
          .filter(Boolean) as string[]
      ).map((value) => ({ label: value, value })),
    ],
    [properties]
  );

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const params = new URLSearchParams();

    if (type !== anyValue) params.set("tipo", type);
    if (district !== anyValue) params.set("bairro", district);
    if (minPrice) params.set("precoMin", minPrice);
    if (maxPrice) params.set("precoMax", maxPrice);

    const pathname = purpose === "RENT" ? "/imoveis/para-alugar" : "/imoveis/a-venda";
    const query = params.toString();
    router.push(query ? `${pathname}?${query}` : pathname);
  }

  return (
    <section id="busca" className="relative -mt-10 scroll-mt-24 pb-12 sm:-mt-14 sm:pb-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <form
          action={purpose === "RENT" ? "/imoveis/para-alugar" : "/imoveis/a-venda"}
          aria-label="Busca de imóveis"
          className="rounded-[2rem] border border-border bg-background p-5 shadow-[0_20px_50px_rgba(0,0,0,0.12)] sm:p-7"
          method="get"
          onSubmit={handleSubmit}
        >
          <h2 className="mb-5 text-2xl font-semibold tracking-tight sm:text-3xl">
            Buscar imóveis
          </h2>
          <FieldGroup className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <FilterSelect
              id="home-purpose"
              label="Transação"
              items={purposeOptions}
              value={purpose}
              onChange={setPurpose}
            >
              {purposeOptions.map((item) => (
                <SelectItem key={item.value} value={item.value}>
                  {item.label}
                </SelectItem>
              ))}
            </FilterSelect>
            <FilterSelect
              id="home-type"
              label="Tipo de imóvel"
              items={typeOptions}
              value={type}
              onChange={setType}
            >
              {typeOptions.map((item) => (
                <SelectItem key={item.value} value={item.value}>
                  {item.label}
                </SelectItem>
              ))}
            </FilterSelect>
            <FilterSelect
              id="home-district"
              label="Bairro"
              items={districtOptions}
              value={district}
              onChange={setDistrict}
            >
              {districtOptions.map((item) => (
                <SelectItem key={item.value} value={item.value}>
                  {item.label}
                </SelectItem>
              ))}
            </FilterSelect>
            <Field>
              <FieldLabel>Faixa de preço</FieldLabel>
              <div className="grid grid-cols-2 gap-2">
                <Input
                  aria-label="Preço mínimo"
                  inputMode="numeric"
                  min="0"
                  placeholder="Mínimo"
                  type="number"
                  value={minPrice}
                  onChange={(event) => setMinPrice(event.target.value)}
                />
                <Input
                  aria-label="Preço máximo"
                  inputMode="numeric"
                  min="0"
                  placeholder="Máximo"
                  type="number"
                  value={maxPrice}
                  onChange={(event) => setMaxPrice(event.target.value)}
                />
              </div>
            </Field>
          </FieldGroup>

          <div className="mt-5 flex justify-end">
            <button className={buttonVariants({ size: "lg", className: "w-full px-6 sm:w-auto" })} type="submit">
              <SearchIcon data-icon="inline-start" />
              Ver imóveis
            </button>
          </div>
        </form>
      </div>
    </section>
  );
}

function FilterSelect({
  id,
  label,
  items,
  value,
  onChange,
  children,
}: {
  id: string;
  label: string;
  items: { label: string; value: string }[];
  value: string;
  onChange: (value: string) => void;
  children: ReactNode;
}) {
  return (
    <Field>
      <FieldLabel htmlFor={id}>{label}</FieldLabel>
      <Select
        items={items}
        value={value}
        onValueChange={(nextValue) => onChange(nextValue ?? anyValue)}
      >
        <SelectTrigger id={id} className="h-11 w-full">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>{children}</SelectGroup>
        </SelectContent>
      </Select>
    </Field>
  );
}

function unique<T extends string>(values: T[]) {
  return Array.from(new Set(values)).sort((a, b) => a.localeCompare(b));
}
