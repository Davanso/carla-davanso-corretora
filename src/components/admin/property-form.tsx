"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import {
  ArrowDownIcon,
  ArrowUpIcon,
  ImagePlusIcon,
  Loader2Icon,
  PlusIcon,
  RotateCcwIcon,
  SaveIcon,
  Trash2Icon,
} from "lucide-react";
import Image from "next/image";
import { useEffect, useId, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Controller, type UseFormRegisterReturn, useForm } from "react-hook-form";
import { z } from "zod";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
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
import {
  existingPropertyImageReferenceSchema,
  propertyMetadataSchema,
} from "@/lib/validations/property";
import {
  approvedPropertyImageSchema,
  MAX_PROPERTY_IMAGES,
  uploadSigningRequestSchema,
  type SignedPropertyUpload,
} from "@/lib/validations/upload";

const adminPropertyFormSchema = propertyMetadataSchema.extend({
  images: z
    .array(z.union([existingPropertyImageReferenceSchema, approvedPropertyImageSchema]))
    .min(1, "Inclua pelo menos uma foto.")
    .max(MAX_PROPERTY_IMAGES, `Inclua no máximo ${MAX_PROPERTY_IMAGES} fotos.`),
});

type AdminPropertyFormValues = z.infer<typeof adminPropertyFormSchema>;

export type EditableAdminProperty = {
  id: string;
  title: string;
  description: string;
  purpose: "SALE" | "RENT";
  type: "HOUSE" | "CONDO_HOUSE" | "APARTMENT" | "LAND" | "STUDIO" | "COMMERCIAL";
  priceInCents: number;
  condoFeeCents: number | null;
  areaM2: number;
  bedrooms: number | null;
  bathrooms: number | null;
  parkingSpots: number | null;
  isCondo: boolean;
  isFeatured: boolean;
  isLaunch: boolean;
  isPublished: boolean;
  city: { name: string };
  district: { name: string } | null;
  community: { name: string } | null;
  images: Array<{ id: string; objectKey: string; url: string; alt: string }>;
};

type PersistedImageItem = {
  kind: "persisted";
  id: string;
  objectKey: string;
  publicUrl: string;
  fileName: string;
};

type UploadItem = {
  kind: "upload";
  id: string;
  fileName: string;
  file: File;
  progress: number;
  status: "signing" | "uploading" | "uploaded" | "error";
  objectKey?: string;
  uploadToken?: string;
  publicUrl?: string;
  error?: string;
};

type ImageItem = PersistedImageItem | UploadItem;

const createDefaults: AdminPropertyFormValues = {
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

export function AdminPropertyForm({ initialProperty }: { initialProperty?: EditableAdminProperty }) {
  const router = useRouter();
  const initialValues = useMemo(
    () => initialProperty ? propertyToFormValues(initialProperty) : createDefaults,
    [initialProperty],
  );
  const [imageItems, setImageItems] = useState<ImageItem[]>(() =>
    initialProperty ? propertyToImageItems(initialProperty) : [],
  );
  const form = useForm<AdminPropertyFormValues>({
    resolver: zodResolver(adminPropertyFormSchema),
    defaultValues: initialValues,
  });
  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
  } = form;

  const hasPendingUploads = imageItems.some(
    (item) => item.kind === "upload" && (item.status === "signing" || item.status === "uploading"),
  );
  const hasFailedUploads = imageItems.some(
    (item) => item.kind === "upload" && item.status === "error",
  );

  useEffect(() => {
    const images = imageItems.reduce<AdminPropertyFormValues["images"]>((references, item) => {
      if (item.kind === "persisted") {
        references.push({ id: item.id });
      } else if (item.status === "uploaded" && item.objectKey && item.uploadToken) {
        references.push({ objectKey: item.objectKey, uploadToken: item.uploadToken });
      }
      return references;
    }, []);

    form.setValue(
      "images",
      images,
      { shouldValidate: form.formState.isSubmitted },
    );
  }, [form, imageItems]);

  async function onSubmit(values: AdminPropertyFormValues) {
    if (hasPendingUploads || hasFailedUploads) {
      toast.error("Conclua ou remova os envios com erro antes de salvar o imóvel.");
      return;
    }

    const endpoint = initialProperty
      ? `/api/admin/properties/${encodeURIComponent(initialProperty.id)}`
      : "/api/admin/properties";
    try {
      const response = await fetch(endpoint, {
        method: initialProperty ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      if (redirectIfUnauthorized(response, router)) return;
      const payload = await response.json().catch(() => null);
      if (!response.ok) {
        toast.error(payload?.message ?? "Não foi possível salvar o imóvel.");
        return;
      }

      if (payload?.partialFailure) {
        toast.warning(payload.message ?? "O imóvel foi salvo, mas a limpeza de algumas imagens falhou.");
      } else {
        toast.success(initialProperty ? "Imóvel atualizado com sucesso." : "Imóvel cadastrado com sucesso.");
      }
      if (initialProperty && payload?.property) {
        const saved = payload.property as EditableAdminProperty;
        form.reset(propertyToFormValues(saved));
        setImageItems(propertyToImageItems(saved));
      } else {
        form.reset(createDefaults);
        setImageItems([]);
      }
      router.refresh();
    } catch {
      toast.error("Falha de rede ao salvar o imóvel. Tente novamente.");
    }
  }

  async function handleFiles(files: FileList | null) {
    if (!files?.length) return;
    const availableSlots = MAX_PROPERTY_IMAGES - imageItems.length;
    const selectedFiles = Array.from(files);
    if (selectedFiles.length > availableSlots) {
      toast.error(`Você pode adicionar mais ${Math.max(availableSlots, 0)} foto(s).`);
    }

    const validFiles = selectedFiles.slice(0, Math.max(availableSlots, 0)).filter((file) => {
      const parsed = uploadSigningRequestSchema.safeParse({
        files: [{ fileName: file.name, contentType: file.type, size: file.size }],
      });
      if (!parsed.success) {
        toast.error(`${file.name}: ${parsed.error.issues[0]?.message ?? "arquivo inválido"}`);
        return false;
      }
      return true;
    });
    const pendingItems: UploadItem[] = validFiles.map((file) => ({
      kind: "upload",
      id: crypto.randomUUID(),
      fileName: file.name,
      file,
      progress: 0,
      status: "signing",
    }));
    setImageItems((current) => [...current, ...pendingItems]);
    await Promise.all(pendingItems.map(uploadFile));
  }

  async function uploadFile(item: UploadItem) {
    try {
      updateUploadItem(item.id, { status: "signing", progress: 0, error: undefined, objectKey: undefined, uploadToken: undefined });
      const signedUpload = await requestSignedUpload(item.file);
      updateUploadItem(item.id, { status: "uploading", objectKey: signedUpload.objectKey, publicUrl: signedUpload.publicUrl });
      await putFileWithProgress(item.file, signedUpload, (progress) => updateUploadItem(item.id, { progress }));
      const uploadToken = await requestUploadVerification(item.file, signedUpload);
      updateUploadItem(item.id, { status: "uploaded", progress: 100, uploadToken, error: undefined });
    } catch (error) {
      if (error instanceof UnauthorizedError) {
        router.push("/admin/login");
        return;
      }
      updateUploadItem(item.id, {
        status: "error",
        error: error instanceof Error ? error.message : "Falha ao enviar a imagem.",
      });
    }
  }

  function updateUploadItem(id: string, changes: Partial<UploadItem>) {
    setImageItems((current) => current.map((item) =>
      item.kind === "upload" && item.id === id ? { ...item, ...changes } : item,
    ));
  }

  async function removeImageItem(item: ImageItem) {
    try {
      // Persisted images are only deleted by the property PATCH policy.
      if (item.kind === "upload" && item.objectKey) {
        const deleted = await requestUploadDeletion(item.objectKey);
        if (!deleted) {
          toast.error("Não foi possível remover a imagem do armazenamento.");
          return;
        }
      }
      setImageItems((current) => current.filter((candidate) => candidate.id !== item.id));
    } catch (error) {
      if (error instanceof UnauthorizedError) router.push("/admin/login");
      else toast.error("Falha de rede ao remover a imagem.");
    }
  }

  async function retryUpload(item: UploadItem) {
    try {
      if (item.objectKey && !(await requestUploadDeletion(item.objectKey))) {
        toast.error("Não foi possível limpar o envio anterior antes de tentar novamente.");
        return;
      }
      await uploadFile(item);
    } catch (error) {
      if (error instanceof UnauthorizedError) router.push("/admin/login");
      else toast.error("Falha de rede ao preparar a nova tentativa.");
    }
  }

  function moveImage(index: number, direction: -1 | 1) {
    setImageItems((current) => {
      const nextIndex = index + direction;
      if (nextIndex < 0 || nextIndex >= current.length) return current;
      const reordered = [...current];
      [reordered[index], reordered[nextIndex]] = [reordered[nextIndex], reordered[index]];
      return reordered;
    });
  }

  return (
    <Card className="rounded-lg">
      <CardHeader>
        <CardTitle>{initialProperty ? "Editar imóvel" : "Novo imóvel"}</CardTitle>
        <CardDescription>
          {initialProperty
            ? "Atualize os dados, a publicação e a ordem das fotos. As remoções só acontecem ao salvar."
            : "Preencha as informações e envie as fotos diretamente para o catálogo."}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)}>
          <FieldGroup>
            <FormSectionTitle title="Informações principais" description="Como o imóvel será apresentado no catálogo." />
            <div className="grid gap-5 md:grid-cols-2">
              <TextField id="title" label="Título" register={register("title")} error={errors.title} />
              <NumberField id="price" label="Preço de venda ou aluguel (R$)" register={register("price", { valueAsNumber: true })} error={errors.price} />
            </div>
            <Field data-invalid={Boolean(errors.description)}>
              <FieldLabel htmlFor="description">Descrição</FieldLabel>
              <Textarea id="description" rows={5} aria-invalid={Boolean(errors.description)} {...register("description")} />
              <FieldError errors={[errors.description]} />
            </Field>
            <div className="grid gap-5 md:grid-cols-3">
              <SelectField control={control} name="purpose" label="Objetivo do anúncio" options={[{ value: "SALE", label: "Venda" }, { value: "RENT", label: "Aluguel" }]} />
              <SelectField control={control} name="type" label="Tipo" options={[
                { value: "HOUSE", label: "Casa" }, { value: "CONDO_HOUSE", label: "Casa de condomínio" },
                { value: "APARTMENT", label: "Apartamento" }, { value: "LAND", label: "Terreno" },
                { value: "STUDIO", label: "Studio" }, { value: "COMMERCIAL", label: "Comercial" },
              ]} />
              <NumberField id="condoFee" label="Taxa de condomínio (mensal, R$)" description="Informe o valor mensal ou deixe 0 se não houver." register={register("condoFee", { valueAsNumber: true })} error={errors.condoFee} />
            </div>
            <FormSectionTitle title="Características" description="Detalhes que ajudam o cliente a comparar os imóveis." />
            <div className="grid gap-5 md:grid-cols-4">
              <NumberField id="areaM2" label="m²" register={register("areaM2", { valueAsNumber: true })} error={errors.areaM2} />
              <NumberField id="bedrooms" label="Quartos" register={register("bedrooms", { valueAsNumber: true })} error={errors.bedrooms} />
              <NumberField id="bathrooms" label="Banheiros" register={register("bathrooms", { valueAsNumber: true })} error={errors.bathrooms} />
              <NumberField id="parkingSpots" label="Vagas" register={register("parkingSpots", { valueAsNumber: true })} error={errors.parkingSpots} />
            </div>
            <div className="grid gap-5 md:grid-cols-3">
              <TextField id="city" label="Cidade" register={register("city")} error={errors.city} />
              <TextField id="district" label="Bairro" register={register("district")} error={errors.district} />
              <TextField id="community" label="Nome do condomínio / empreendimento (opcional)" register={register("community")} error={errors.community} />
            </div>
            <FormSectionTitle title="Fotos" description="Ajude o cliente a encontrar o imóvel; a primeira foto será a capa." />
            <Field data-invalid={Boolean(errors.images)}>
              <FieldLabel htmlFor="images">Adicionar fotos</FieldLabel>
              <Input
                id="images"
                type="file"
                accept="image/jpeg,image/png,image/webp"
                multiple
                disabled={hasPendingUploads || imageItems.length >= MAX_PROPERTY_IMAGES}
                aria-invalid={Boolean(errors.images)}
                onChange={(event) => { void handleFiles(event.target.files); event.target.value = ""; }}
              />
              <FieldDescription>
                JPEG, PNG ou WebP; até 10 MiB por foto e {MAX_PROPERTY_IMAGES} fotos. A primeira será a capa.
              </FieldDescription>
              <FieldError errors={[errors.images as { message?: string }]} />
              {imageItems.length === 0 ? (
                <div className="flex min-h-28 flex-col items-center justify-center gap-2 rounded-lg border border-dashed p-5 text-center text-muted-foreground">
                  <ImagePlusIcon aria-hidden="true" />
                  <p className="text-sm">As fotos selecionadas aparecerão aqui.</p>
                </div>
              ) : (
                <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3" aria-live="polite">
                  {imageItems.map((item, index) => (
                    <li key={`${item.kind}-${item.id}`} className="overflow-hidden rounded-lg border bg-card">
                      <div className="relative aspect-[4/3] bg-muted">
                        {item.kind === "persisted" ? (
                          <Image src={item.publicUrl} alt={item.fileName} fill className="object-cover" />
                        ) : <UploadPreview file={item.file} fileName={item.fileName} />}
                      </div>
                      <div className="flex flex-col gap-2 p-3">
                        <div className="flex items-center justify-between gap-2">
                          <p className="truncate text-sm font-medium" title={item.fileName}>{item.fileName}</p>
                          <ImageStatus item={item} />
                        </div>
                        {item.kind === "upload" && item.status === "uploading" ? (
                          <div className="h-1.5 overflow-hidden rounded-full bg-muted" role="progressbar" aria-label={`Enviando ${item.fileName}`} aria-valuemin={0} aria-valuemax={100} aria-valuenow={item.progress}>
                            <div className="h-full bg-primary transition-[width]" style={{ width: `${item.progress}%` }} />
                          </div>
                        ) : null}
                        {item.kind === "upload" && item.error ? <p className="text-sm text-destructive">{item.error}</p> : null}
                        <div className="flex items-center gap-1">
                          {item.kind === "upload" && item.status === "error" ? (
                            <Button type="button" variant="outline" size="icon-sm" aria-label={`Tentar enviar ${item.fileName} novamente`} onClick={() => void retryUpload(item)}><RotateCcwIcon aria-hidden="true" /></Button>
                          ) : null}
                          <Button type="button" variant="outline" size="icon-sm" aria-label={`Mover ${item.fileName} para cima`} disabled={index === 0 || hasPendingUploads} onClick={() => moveImage(index, -1)}><ArrowUpIcon aria-hidden="true" /></Button>
                          <Button type="button" variant="outline" size="icon-sm" aria-label={`Mover ${item.fileName} para baixo`} disabled={index === imageItems.length - 1 || hasPendingUploads} onClick={() => moveImage(index, 1)}><ArrowDownIcon aria-hidden="true" /></Button>
                          <Button type="button" variant="destructive" size="icon-sm" aria-label={`Remover ${item.fileName}`} disabled={item.kind === "upload" && (item.status === "signing" || item.status === "uploading")} onClick={() => void removeImageItem(item)}><Trash2Icon aria-hidden="true" /></Button>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </Field>

            <div className="rounded-lg border bg-muted/20 p-4">
              <div className="mb-3">
                <p className="text-sm font-medium">Organização e publicação</p>
                <p className="text-sm text-muted-foreground">Use estas opções para classificar o imóvel no catálogo.</p>
              </div>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Controller control={control} name="isCondo" render={({ field }) => <BooleanField label="Fica em condomínio fechado" checked={field.value} onChange={field.onChange} />} />
                <Controller control={control} name="isFeatured" render={({ field }) => <BooleanField label="Mostrar como destaque" checked={field.value} onChange={field.onChange} />} />
                <Controller control={control} name="isLaunch" render={({ field }) => <BooleanField label="Marcar como lançamento" checked={field.value} onChange={field.onChange} />} />
                <Controller control={control} name="isPublished" render={({ field }) => <BooleanField label="Publicar no site" checked={field.value} onChange={field.onChange} />} />
              </div>
            </div>
            <Button type="submit" className="h-10 w-full md:w-fit" disabled={isSubmitting || hasPendingUploads || hasFailedUploads}>
              {isSubmitting ? <Loader2Icon className="animate-spin" data-icon="inline-start" /> : initialProperty ? <SaveIcon data-icon="inline-start" /> : <PlusIcon data-icon="inline-start" />}
              {initialProperty ? "Salvar alterações" : "Cadastrar imóvel"}
            </Button>
          </FieldGroup>
        </form>
      </CardContent>
    </Card>
  );
}

function propertyToFormValues(property: EditableAdminProperty): AdminPropertyFormValues {
  return {
    title: property.title,
    description: property.description,
    purpose: property.purpose,
    type: property.type,
    price: property.priceInCents / 100,
    condoFee: (property.condoFeeCents ?? 0) / 100,
    areaM2: property.areaM2,
    bedrooms: property.bedrooms ?? 0,
    bathrooms: property.bathrooms ?? 0,
    parkingSpots: property.parkingSpots ?? 0,
    city: property.city.name,
    district: property.district?.name ?? "",
    community: property.community?.name ?? "",
    isCondo: property.isCondo,
    isFeatured: property.isFeatured,
    isLaunch: property.isLaunch,
    isPublished: property.isPublished,
    images: property.images.map((image) => ({ id: image.id })),
  };
}

function propertyToImageItems(property: EditableAdminProperty): PersistedImageItem[] {
  return property.images.map((image, index) => ({
    kind: "persisted",
    id: image.id,
    objectKey: image.objectKey,
    publicUrl: image.url,
    fileName: image.alt || `${property.title} - foto ${index + 1}`,
  }));
}

function ImageStatus({ item }: { item: ImageItem }) {
  if (item.kind === "persisted") return <Badge variant="secondary">Salva</Badge>;
  if (item.status === "uploaded") return <Badge variant="secondary">Enviada</Badge>;
  if (item.status === "error") return <Badge variant="destructive">Erro</Badge>;
  if (item.status === "signing") return <Badge variant="outline">Preparando</Badge>;
  return <Badge variant="outline">{item.progress}%</Badge>;
}

function UploadPreview({ file, fileName }: { file: File; fileName: string }) {
  const [previewUrl] = useState(() => URL.createObjectURL(file));
  const revokeTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  useEffect(() => {
    if (revokeTimer.current) clearTimeout(revokeTimer.current);

    return () => {
      // React Strict Mode re-runs effects in development. Delay cleanup so the
      // following setup can retain this URL instead of revoking an active preview.
      revokeTimer.current = setTimeout(() => URL.revokeObjectURL(previewUrl), 0);
    };
  }, [previewUrl]);

  return <Image src={previewUrl} alt={`Prévia de ${fileName}`} fill unoptimized className="object-cover" />;
}

function TextField({ id, label, register, error }: { id: string; label: string; register: UseFormRegisterReturn; error?: { message?: string } }) {
  return (
    <Field data-invalid={Boolean(error)}>
      <FieldLabel htmlFor={id}>{label}</FieldLabel>
      <Input id={id} aria-invalid={Boolean(error)} {...register} />
      <FieldError errors={[error]} />
    </Field>
  );
}

function FormSectionTitle({ title, description }: { title: string; description: string }) {
  return (
    <div className="border-b pb-2 pt-2">
      <h3 className="text-sm font-semibold">{title}</h3>
      <p className="text-sm text-muted-foreground">{description}</p>
    </div>
  );
}

function NumberField({ id, label, description, register, error }: { id: string; label: string; description?: string; register: UseFormRegisterReturn; error?: { message?: string } }) {
  return (
    <Field data-invalid={Boolean(error)}>
      <FieldLabel htmlFor={id}>{label}</FieldLabel>
      <Input id={id} type="number" step={id === "price" || id === "condoFee" ? "0.01" : "1"} aria-invalid={Boolean(error)} {...register} />
      {description ? <FieldDescription>{description}</FieldDescription> : null}
      <FieldError errors={[error]} />
    </Field>
  );
}

function SelectField({ control, name, label, options }: { control: ReturnType<typeof useForm<AdminPropertyFormValues>>["control"]; name: "purpose" | "type"; label: string; options: Array<{ value: string; label: string }> }) {
  return (
    <Field>
      <FieldLabel>{label}</FieldLabel>
      <Controller control={control} name={name} render={({ field }) => (
        <Select value={field.value} onValueChange={(value) => value && field.onChange(value)}>
          <SelectTrigger className="h-10 w-full"><SelectValue>{options.find((option) => option.value === field.value)?.label}</SelectValue></SelectTrigger>
          <SelectContent><SelectGroup>{options.map((option) => <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>)}</SelectGroup></SelectContent>
        </Select>
      )} />
    </Field>
  );
}

function BooleanField({ label, checked, onChange }: { label: string; checked: boolean; onChange: (checked: boolean) => void }) {
  const id = useId();
  return (
    <Field orientation="horizontal">
      <Checkbox id={id} checked={checked} onCheckedChange={(value) => onChange(Boolean(value))} />
      <FieldContent><FieldLabel htmlFor={id}>{label}</FieldLabel></FieldContent>
    </Field>
  );
}

function putFileWithProgress(file: File, signedUpload: SignedPropertyUpload, onProgress: (progress: number) => void) {
  return new Promise<void>((resolve, reject) => {
    const request = new XMLHttpRequest();
    request.open("PUT", signedUpload.uploadUrl);
    request.setRequestHeader("Content-Type", signedUpload.contentType);
    request.upload.addEventListener("progress", (event) => event.lengthComputable && onProgress(Math.round((event.loaded / event.total) * 100)));
    request.addEventListener("load", () => request.status >= 200 && request.status < 300 ? resolve() : reject(new Error(`O armazenamento recusou o envio (${request.status}).`)));
    request.addEventListener("error", () => reject(new Error("Falha de rede durante o envio.")));
    request.addEventListener("abort", () => reject(new Error("Envio cancelado.")));
    request.send(file);
  });
}

async function requestSignedUpload(file: File): Promise<SignedPropertyUpload> {
  const response = await fetch("/api/admin/uploads", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ files: [{ fileName: file.name, contentType: file.type, size: file.size }] }),
  });
  if (response.status === 401) throw new UnauthorizedError();
  const payload = await response.json().catch(() => null);
  if (!response.ok || !payload?.uploads?.[0]) throw new Error(payload?.message ?? "Não foi possível autorizar o envio.");
  return payload.uploads[0];
}

async function requestUploadVerification(file: File, upload: SignedPropertyUpload) {
  const response = await fetch("/api/admin/uploads", {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ objectKey: upload.objectKey, contentType: upload.contentType, size: file.size }),
  });
  if (response.status === 401) throw new UnauthorizedError();
  const payload = await response.json().catch(() => null);
  if (!response.ok || !payload?.uploadToken) throw new Error(payload?.message ?? "Não foi possível validar a imagem enviada.");
  return String(payload.uploadToken);
}

async function requestUploadDeletion(objectKey: string) {
  const response = await fetch("/api/admin/uploads", {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ objectKeys: [objectKey] }),
  });
  if (response.status === 401) throw new UnauthorizedError();
  const payload = await response.json().catch(() => null);
  return response.ok && payload?.results?.[0]?.status === "deleted";
}

class UnauthorizedError extends Error {}

function redirectIfUnauthorized(response: Response, router: ReturnType<typeof useRouter>) {
  if (response.status !== 401) return false;
  toast.error("Sua sessão expirou. Entre novamente.");
  router.push("/admin/login");
  return true;
}
