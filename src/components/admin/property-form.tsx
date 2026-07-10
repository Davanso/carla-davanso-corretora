"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2Icon, PlusIcon } from "lucide-react";
import { Controller, type UseFormRegisterReturn, useForm } from "react-hook-form";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Field, FieldContent, FieldError, FieldGroup, FieldLabel, FieldTitle } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { propertyFormSchema, type PropertyFormInput } from "@/lib/validations/property";

const defaultValues: PropertyFormInput = {
  title: "",
  description: "",
  purpose: "SALE",
  type: "HOUSE",
  price: 0,
  condoFee: 0,
  areaM2: 0,
  bedrooms: 0,
  bathrooms: 0,
  parkingSpots: 0,
  city: "Indaiatuba",
  district: "",
  community: "",
  isCondo: false,
  isFeatured: false,
  isLaunch: false,
  isPublished: true,
  images: [],
};

export function AdminPropertyForm() {
  const form = useForm<PropertyFormInput>({
    resolver: zodResolver(propertyFormSchema),
    defaultValues,
  });

  const {
    register,
    handleSubmit,
    setValue,
    control,
    formState: { errors, isSubmitting },
  } = form;

  async function onSubmit(values: PropertyFormInput) {
    const response = await fetch("/api/admin/properties", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values),
    });

    if (!response.ok) {
      const payload = await response.json().catch(() => null);
      toast.error(payload?.message ?? "Nao foi possivel salvar o imovel.");
      return;
    }

    toast.success("Imovel cadastrado com sucesso.");
    form.reset(defaultValues);
  }

  return (
    <Card className="rounded-lg">
      <CardHeader>
        <CardTitle>Novo imovel</CardTitle>
        <CardDescription>
          Preencha as informacoes principais e cole as URLs das fotos, uma por linha.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)}>
          <FieldGroup>
            <div className="grid gap-5 md:grid-cols-2">
              <Field data-invalid={Boolean(errors.title)}>
                <FieldLabel htmlFor="title">Titulo</FieldLabel>
                <Input id="title" aria-invalid={Boolean(errors.title)} {...register("title")} />
                <FieldError errors={[errors.title]} />
              </Field>
              <Field data-invalid={Boolean(errors.price)}>
                <FieldLabel htmlFor="price">Valor</FieldLabel>
                <Input id="price" type="number" aria-invalid={Boolean(errors.price)} {...register("price")} />
                <FieldError errors={[errors.price]} />
              </Field>
            </div>

            <Field data-invalid={Boolean(errors.description)}>
              <FieldLabel htmlFor="description">Descricao</FieldLabel>
              <Textarea
                id="description"
                rows={4}
                aria-invalid={Boolean(errors.description)}
                {...register("description")}
              />
              <FieldError errors={[errors.description]} />
            </Field>

            <div className="grid gap-5 md:grid-cols-3">
              <Field>
                <FieldLabel>Transacao</FieldLabel>
                <Controller
                  control={control}
                  name="purpose"
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={(value) => value && field.onChange(value)}>
                      <SelectTrigger className="h-10 w-full">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup>
                          <SelectItem value="SALE">Venda</SelectItem>
                          <SelectItem value="RENT">Aluguel</SelectItem>
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                  )}
                />
              </Field>
              <Field>
                <FieldLabel>Tipo</FieldLabel>
                <Controller
                  control={control}
                  name="type"
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={(value) => value && field.onChange(value)}>
                      <SelectTrigger className="h-10 w-full">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup>
                          <SelectItem value="HOUSE">Casa</SelectItem>
                          <SelectItem value="CONDO_HOUSE">Casa de condominio</SelectItem>
                          <SelectItem value="APARTMENT">Apartamento</SelectItem>
                          <SelectItem value="LAND">Terreno</SelectItem>
                          <SelectItem value="STUDIO">Studio</SelectItem>
                          <SelectItem value="COMMERCIAL">Comercial</SelectItem>
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                  )}
                />
              </Field>
              <Field>
                <FieldLabel htmlFor="condoFee">Condominio</FieldLabel>
                <Input id="condoFee" type="number" {...register("condoFee")} />
              </Field>
            </div>

            <div className="grid gap-5 md:grid-cols-4">
              <NumberField id="areaM2" label="m2" register={register("areaM2")} error={errors.areaM2} />
              <NumberField id="bedrooms" label="Quartos" register={register("bedrooms")} error={errors.bedrooms} />
              <NumberField id="bathrooms" label="Banheiros" register={register("bathrooms")} error={errors.bathrooms} />
              <NumberField id="parkingSpots" label="Vagas" register={register("parkingSpots")} error={errors.parkingSpots} />
            </div>

            <div className="grid gap-5 md:grid-cols-3">
              <Field data-invalid={Boolean(errors.city)}>
                <FieldLabel htmlFor="city">Cidade</FieldLabel>
                <Input id="city" aria-invalid={Boolean(errors.city)} {...register("city")} />
                <FieldError errors={[errors.city]} />
              </Field>
              <Field data-invalid={Boolean(errors.district)}>
                <FieldLabel htmlFor="district">Bairro</FieldLabel>
                <Input id="district" aria-invalid={Boolean(errors.district)} {...register("district")} />
                <FieldError errors={[errors.district]} />
              </Field>
              <Field>
                <FieldLabel htmlFor="community">Condominio / empreendimento</FieldLabel>
                <Input id="community" {...register("community")} />
              </Field>
            </div>

            <Field data-invalid={Boolean(errors.images)}>
              <FieldLabel htmlFor="images">Fotos</FieldLabel>
              <Textarea
                id="images"
                rows={4}
                placeholder="https://..."
                aria-invalid={Boolean(errors.images)}
                onChange={(event) => {
                  const images = event.target.value
                    .split("\n")
                    .map((item) => item.trim())
                    .filter(Boolean);
                  setValue("images", images, { shouldValidate: true });
                }}
              />
              <FieldError errors={[errors.images as { message?: string }]} />
            </Field>

            <div className="grid gap-4 md:grid-cols-4">
              <Controller
                control={control}
                name="isCondo"
                render={({ field }) => (
                  <BooleanField label="Condominio fechado" checked={Boolean(field.value)} onChange={field.onChange} />
                )}
              />
              <Controller
                control={control}
                name="isFeatured"
                render={({ field }) => (
                  <BooleanField label="Destaque" checked={Boolean(field.value)} onChange={field.onChange} />
                )}
              />
              <Controller
                control={control}
                name="isLaunch"
                render={({ field }) => (
                  <BooleanField label="Lancamento" checked={Boolean(field.value)} onChange={field.onChange} />
                )}
              />
              <Controller
                control={control}
                name="isPublished"
                render={({ field }) => (
                  <BooleanField label="Publicado" checked={Boolean(field.value)} onChange={field.onChange} />
                )}
              />
            </div>

            <Button type="submit" className="h-10 w-full md:w-fit" disabled={isSubmitting}>
              {isSubmitting ? <Loader2Icon className="animate-spin" data-icon="inline-start" /> : <PlusIcon data-icon="inline-start" />}
              Cadastrar imovel
            </Button>
          </FieldGroup>
        </form>
      </CardContent>
    </Card>
  );
}

function NumberField({
  id,
  label,
  register,
  error,
}: {
  id: string;
  label: string;
  register: UseFormRegisterReturn;
  error?: { message?: string };
}) {
  return (
    <Field data-invalid={Boolean(error)}>
      <FieldLabel htmlFor={id}>{label}</FieldLabel>
      <Input id={id} type="number" aria-invalid={Boolean(error)} {...register} />
      <FieldError errors={[error]} />
    </Field>
  );
}

function BooleanField({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}) {
  return (
    <Field orientation="horizontal">
      <Checkbox checked={checked} onCheckedChange={(value) => onChange(Boolean(value))} />
      <FieldContent>
        <FieldTitle>{label}</FieldTitle>
      </FieldContent>
    </Field>
  );
}
