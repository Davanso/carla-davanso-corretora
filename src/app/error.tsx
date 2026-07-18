"use client";

import Link from "next/link";
import { AlertTriangleIcon, RotateCcwIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty";

export default function PublicError({ unstable_retry }: { unstable_retry: () => void }) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-4 py-16">
      <Empty className="min-h-96 max-w-2xl border">
        <EmptyHeader>
          <EmptyMedia variant="icon"><AlertTriangleIcon /></EmptyMedia>
          <EmptyTitle>Catálogo temporariamente indisponível</EmptyTitle>
          <EmptyDescription>
            Não foi possível carregar os imóveis agora. Tente novamente em instantes.
          </EmptyDescription>
        </EmptyHeader>
        <EmptyContent>
          <Button type="button" onClick={() => unstable_retry()}><RotateCcwIcon data-icon="inline-start" />Tentar novamente</Button>
          <Button variant="outline" nativeButton={false} render={<Link href="/contato" />}>Falar com a corretora</Button>
        </EmptyContent>
      </Empty>
    </main>
  );
}
