import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ArrowLeftIcon } from "lucide-react";
import { AdminPropertyForm, type EditableAdminProperty } from "@/components/admin/property-form";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getAuthenticatedAdminEmail } from "@/lib/admin-auth";
import { prisma } from "@/lib/prisma";

export default async function EditPropertyPage({ params }: { params: Promise<{ id: string }> }) {
  if (!(await getAuthenticatedAdminEmail())) redirect("/admin/login");
  const { id } = await params;
  if (!process.env.DATABASE_URL) return <DatabaseError />;

  const property = await prisma.property.findUnique({
    where: { id },
    include: {
      city: true,
      district: true,
      community: true,
      images: { orderBy: { sortOrder: "asc" } },
    },
  }).catch(() => undefined);

  if (property === null) notFound();
  if (!property) return <DatabaseError />;

  return (
    <main className="min-h-screen bg-secondary/35">
      <div className="mx-auto flex max-w-5xl flex-col gap-6 px-4 py-8 sm:px-6 lg:px-8">
        <Button variant="outline" nativeButton={false} render={<Link href="/admin" />} className="w-fit">
          <ArrowLeftIcon data-icon="inline-start" />
          Voltar ao painel
        </Button>
        <AdminPropertyForm initialProperty={property satisfies EditableAdminProperty} />
      </div>
    </main>
  );
}

function DatabaseError() {
  return (
    <main className="min-h-screen bg-secondary/35 p-6">
      <Card className="mx-auto max-w-xl">
        <CardHeader><CardTitle>Banco de dados indisponível</CardTitle></CardHeader>
        <CardContent><p className="text-sm text-muted-foreground">Não foi possível carregar este imóvel. Tente novamente quando a conexão estiver restabelecida.</p></CardContent>
      </Card>
    </main>
  );
}
