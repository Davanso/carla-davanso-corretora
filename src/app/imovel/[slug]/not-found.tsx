import Link from "next/link";
import { HomeIcon } from "lucide-react";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { Button } from "@/components/ui/button";
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty";

export default function PropertyNotFound() {
  return (
    <main className="min-h-screen bg-background">
      <SiteHeader />
      <div className="mx-auto max-w-4xl px-4 py-20 sm:px-6">
        <Empty className="min-h-96 border">
          <EmptyHeader>
            <EmptyMedia variant="icon"><HomeIcon /></EmptyMedia>
            <EmptyTitle>Imóvel não encontrado</EmptyTitle>
            <EmptyDescription>Este imóvel não existe ou não está publicado no catálogo.</EmptyDescription>
          </EmptyHeader>
          <EmptyContent>
            <Button nativeButton={false} render={<Link href="/imoveis/a-venda" />}>Ver imóveis disponíveis</Button>
          </EmptyContent>
        </Empty>
      </div>
      <SiteFooter />
    </main>
  );
}
