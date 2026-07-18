import Link from "next/link";
import { redirect } from "next/navigation";
import { signOut } from "@/auth";
import { AdminPropertyForm } from "@/components/admin/property-form";
import { PropertyManagementList } from "@/components/admin/property-management-list";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getAuthenticatedAdminEmail } from "@/lib/admin-auth";
import { prisma } from "@/lib/prisma";

export default async function AdminPage() {
  if (!(await getAuthenticatedAdminEmail())) {
    redirect("/admin/login");
  }

  let databaseError = false;
  const properties = process.env.DATABASE_URL
    ? await prisma.property.findMany({ orderBy: { createdAt: "desc" }, include: { _count: { select: { images: true } } } }).catch(() => {
        databaseError = true;
        return [];
      })
    : [];
  if (!process.env.DATABASE_URL) databaseError = true;
  const sale = properties.filter((property) => property.purpose === "SALE").length;
  const rent = properties.filter((property) => property.purpose === "RENT").length;
  const featured = properties.filter((property) => property.isFeatured).length;

  return (
    <main className="min-h-screen bg-secondary/35">
      <header className="border-b bg-background">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
          <div>
            <Link href="/" className="text-sm text-muted-foreground">
              Site público
            </Link>
            <h1 className="text-2xl font-semibold tracking-tight">Painel administrativo</h1>
          </div>
          <form
            action={async () => {
              "use server";
              await signOut({ redirectTo: "/admin/login" });
            }}
          >
            <Button type="submit" variant="outline">
              Sair
            </Button>
          </form>
        </div>
      </header>

      <div className="mx-auto flex max-w-7xl flex-col gap-8 px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid gap-4 md:grid-cols-4">
          <Metric title="Total" value={properties.length} />
          <Metric title="À venda" value={sale} />
          <Metric title="Aluguel" value={rent} />
          <Metric title="Destaques" value={featured} />
        </div>
        {databaseError ? (
          <Card>
            <CardHeader>
              <CardTitle>Banco de dados indisponível</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">Não foi possível carregar ou persistir imóveis. Verifique a configuração e a conexão com o PostgreSQL.</p>
            </CardContent>
          </Card>
        ) : (
          <>
            <PropertyManagementList properties={properties.map((property) => ({
              id: property.id,
              code: property.code,
              title: property.title,
              purpose: property.purpose,
              priceInCents: property.priceInCents,
              isPublished: property.isPublished,
              addressSummary: property.addressSummary,
              imageCount: property._count.images,
            }))} />
            <AdminPropertyForm />
          </>
        )}
      </div>
    </main>
  );
}

function Metric({ title, value }: { title: string; value: number }) {
  return (
    <Card className="rounded-lg">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-3xl font-semibold">{value}</p>
      </CardContent>
    </Card>
  );
}
