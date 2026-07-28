"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { ImagePlusIcon, SaveIcon } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Field, FieldDescription, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { uploadSigningRequestSchema, type SignedPropertyUpload } from "@/lib/validations/upload";

type PendingPhoto = {
  objectKey: string;
  uploadToken: string;
  publicUrl: string;
};

export function BrokerPhotoSettings({ brokerPhotoUrl }: { brokerPhotoUrl: string | null }) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [previewUrl, setPreviewUrl] = useState(brokerPhotoUrl);
  const [pendingPhoto, setPendingPhoto] = useState<PendingPhoto | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  async function handleFileChange(files: FileList | null) {
    const file = files?.[0];
    if (!file) return;

    const parsed = uploadSigningRequestSchema.safeParse({
      scope: "broker",
      files: [{ fileName: file.name, contentType: file.type, size: file.size }],
    });

    if (!parsed.success) {
      toast.error(parsed.error.issues[0]?.message ?? "Selecione uma imagem JPEG, PNG ou WebP.");
      clearInput();
      return;
    }

    setIsUploading(true);
    try {
      const signedUpload = await requestSignedUpload(file);
      await uploadFile(file, signedUpload);
      const uploadToken = await requestUploadVerification(file, signedUpload);

      setPreviewUrl(signedUpload.publicUrl);
      setPendingPhoto({
        objectKey: signedUpload.objectKey,
        uploadToken,
        publicUrl: signedUpload.publicUrl,
      });
      toast.success("Foto enviada. Clique em salvar para publicar.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Não foi possível enviar a foto.");
      clearInput();
    } finally {
      setIsUploading(false);
    }
  }

  async function savePhoto() {
    if (!pendingPhoto) return;
    setIsSaving(true);

    try {
      const response = await fetch("/api/admin/settings/broker-photo", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image: { objectKey: pendingPhoto.objectKey, uploadToken: pendingPhoto.uploadToken } }),
      });

      if (response.status === 401) {
        toast.error("Sua sessão expirou. Entre novamente.");
        router.push("/admin/login");
        return;
      }

      const payload = await response.json().catch(() => null);
      if (!response.ok) {
        toast.error(payload?.message ?? "Não foi possível salvar a foto.");
        return;
      }

      setPendingPhoto(null);
      setPreviewUrl(payload?.brokerPhotoUrl ?? pendingPhoto.publicUrl);
      toast.success("Foto da corretora atualizada.");
      router.refresh();
    } catch {
      toast.error("Falha de rede ao salvar a foto.");
    } finally {
      setIsSaving(false);
    }
  }

  function clearInput() {
    if (inputRef.current) inputRef.current.value = "";
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Foto da corretora</CardTitle>
        <CardDescription>Essa imagem aparece no card de contato da página de detalhe dos imóveis.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
          <div className="relative size-28 shrink-0 overflow-hidden rounded-full bg-secondary">
            {previewUrl ? (
              <Image src={previewUrl} alt="Foto da Carla Davanso" fill className="object-cover" />
            ) : (
              <Image src="/window.svg" alt="Foto da Carla Davanso" fill className="object-contain p-6" />
            )}
          </div>
          <FieldGroup className="flex-1">
            <Field>
              <FieldLabel htmlFor="broker-photo">Enviar foto</FieldLabel>
              <Input
                ref={inputRef}
                id="broker-photo"
                type="file"
                accept="image/jpeg,image/png,image/webp"
                disabled={isUploading || isSaving}
                onChange={(event) => void handleFileChange(event.target.files)}
              />
              <FieldDescription>Use uma foto quadrada ou vertical, em JPEG, PNG ou WebP, até 10 MiB.</FieldDescription>
            </Field>
            <div className="flex flex-wrap gap-2">
              <Button type="button" variant="outline" disabled={isUploading || isSaving} onClick={() => inputRef.current?.click()}>
                <ImagePlusIcon data-icon="inline-start" />
                {isUploading ? "Enviando..." : "Escolher foto"}
              </Button>
              <Button type="button" disabled={!pendingPhoto || isUploading || isSaving} onClick={() => void savePhoto()}>
                <SaveIcon data-icon="inline-start" />
                {isSaving ? "Salvando..." : "Salvar foto"}
              </Button>
            </div>
          </FieldGroup>
        </div>
      </CardContent>
    </Card>
  );
}

async function requestSignedUpload(file: File): Promise<SignedPropertyUpload> {
  const response = await fetch("/api/admin/uploads", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      scope: "broker",
      files: [{ fileName: file.name, contentType: file.type, size: file.size }],
    }),
  });
  const payload = await response.json().catch(() => null);
  if (!response.ok || !payload?.uploads?.[0]) throw new Error(payload?.message ?? "Não foi possível autorizar o envio.");
  return payload.uploads[0];
}

async function uploadFile(file: File, signedUpload: SignedPropertyUpload) {
  const response = await fetch(signedUpload.uploadUrl, {
    method: "PUT",
    headers: { "Content-Type": signedUpload.contentType },
    body: file,
  });

  if (!response.ok) throw new Error("Não foi possível enviar a foto para o armazenamento.");
}

async function requestUploadVerification(file: File, upload: SignedPropertyUpload) {
  const response = await fetch("/api/admin/uploads", {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ objectKey: upload.objectKey, contentType: upload.contentType, size: file.size }),
  });
  const payload = await response.json().catch(() => null);
  if (!response.ok || !payload?.uploadToken) throw new Error(payload?.message ?? "Não foi possível validar a foto enviada.");
  return String(payload.uploadToken);
}
