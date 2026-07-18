"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { EyeIcon, EyeOffIcon, PencilIcon, Trash2Icon } from "lucide-react";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/lib/format";

export type AdminPropertySummary = {
  id: string;
  code: string;
  title: string;
  purpose: "SALE" | "RENT";
  priceInCents: number;
  isPublished: boolean;
  addressSummary: string;
  imageCount: number;
};

export function PropertyManagementList({ properties }: { properties: AdminPropertySummary[] }) {
  if (properties.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Nenhum imóvel cadastrado</CardTitle>
          <CardDescription>Use o formulário abaixo para criar o primeiro imóvel.</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Imóveis cadastrados</CardTitle>
        <CardDescription>Edite informações, altere a publicação ou remova um imóvel.</CardDescription>
      </CardHeader>
      <CardContent>
        <ul className="flex flex-col gap-3">
          {properties.map((property) => <PropertyRow key={property.id} property={property} />)}
        </ul>
      </CardContent>
    </Card>
  );
}

function PropertyRow({ property }: { property: AdminPropertySummary }) {
  const router = useRouter();
  const [isPending, setIsPending] = useState(false);

  async function setPublished(isPublished: boolean) {
    setIsPending(true);
    try {
      const response = await fetch(`/api/admin/properties/${encodeURIComponent(property.id)}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isPublished }),
      });
      if (handleUnauthorized(response, router)) return;
      const payload = await response.json().catch(() => null);
      if (!response.ok) {
        toast.error(payload?.message ?? "Não foi possível alterar a publicação.");
        return;
      }
      toast.success(isPublished ? "Imóvel publicado." : "Imóvel despublicado.");
      router.refresh();
    } catch {
      toast.error("Falha de rede ao alterar a publicação.");
    } finally {
      setIsPending(false);
    }
  }

  async function removeProperty() {
    setIsPending(true);
    try {
      const response = await fetch(`/api/admin/properties/${encodeURIComponent(property.id)}`, {
        method: "DELETE",
      });
      if (handleUnauthorized(response, router)) return;
      const payload = await response.json().catch(() => null);
      if (!response.ok) {
        toast.error(payload?.message ?? "Não foi possível remover o imóvel.");
        router.refresh();
        return;
      }
      toast.success("Imóvel e metadados removidos.");
      router.refresh();
    } catch {
      toast.error("Falha de rede ao remover o imóvel.");
    } finally {
      setIsPending(false);
    }
  }

  return (
    <li className="flex flex-col gap-4 rounded-lg border p-4 lg:flex-row lg:items-center lg:justify-between">
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-2">
          <p className="truncate font-medium">{property.title}</p>
          <Badge variant={property.isPublished ? "secondary" : "outline"}>
            {property.isPublished ? "Publicado" : "Rascunho"}
          </Badge>
        </div>
        <p className="mt-1 text-sm text-muted-foreground">
          {property.code} · {formatCurrency(property.priceInCents, property.purpose === "RENT" ? "/mês" : undefined)} · {property.imageCount} foto(s)
        </p>
        <p className="text-sm text-muted-foreground">{property.addressSummary}</p>
      </div>
      <div className="flex flex-wrap gap-2">
        <Button variant="outline" nativeButton={false} render={<Link href={`/admin/imoveis/${property.id}`} />}>
          <PencilIcon data-icon="inline-start" />
          Editar
        </Button>
        <Button variant="outline" disabled={isPending} onClick={() => void setPublished(!property.isPublished)}>
          {property.isPublished ? <EyeOffIcon data-icon="inline-start" /> : <EyeIcon data-icon="inline-start" />}
          {property.isPublished ? "Despublicar" : "Publicar"}
        </Button>
        <AlertDialog>
          <AlertDialogTrigger render={<Button variant="destructive" disabled={isPending} />}>
            <Trash2Icon data-icon="inline-start" />
            Remover
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Remover este imóvel?</AlertDialogTitle>
              <AlertDialogDescription>
                O imóvel será despublicado primeiro. A exclusão dos metadados só ocorre se a remoção das imagens no R2 não falhar.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <AlertDialogAction variant="destructive" onClick={() => void removeProperty()}>
                Remover imóvel
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </li>
  );
}

function handleUnauthorized(response: Response, router: ReturnType<typeof useRouter>) {
  if (response.status !== 401) return false;
  toast.error("Sua sessão expirou. Entre novamente.");
  router.push("/admin/login");
  return true;
}
