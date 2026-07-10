import Link from "next/link";
import { redirect } from "next/navigation";
import { signOut, auth } from "@/auth";
import { AdminPropertyForm } from "@/components/admin/property-form";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getProperties } from "@/lib/properties";

export default async function AdminPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/admin/login");
  }

  const properties = await getProperties();
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
        {!process.env.DATABASE_URL ? (
          <Badge variant="secondary" className="w-fit rounded-md">
            Configure DATABASE_URL para persistir novos cadastros no PostgreSQL.
          </Badge>
        ) : null}
        <AdminPropertyForm />
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
