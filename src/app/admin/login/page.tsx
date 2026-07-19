import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeftIcon } from "lucide-react";
import { LoginForm } from "@/app/admin/login/login-form";
import { getAuthenticatedAdminEmail } from "@/lib/admin-auth";

export default async function AdminLoginPage() {
  if (await getAuthenticatedAdminEmail()) {
    redirect("/admin");
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-4 py-10">
      <section className="flex w-full max-w-md flex-col gap-8">
        <Link href="/" className="flex w-fit items-center gap-2 text-sm font-medium text-muted-foreground transition hover:text-foreground">
          <ArrowLeftIcon data-icon="inline-start" />
          Voltar para o site
        </Link>
        <div className="text-center">
          <p className="text-2xl font-semibold tracking-tight">Carla Davanso</p>
          <p className="mt-2 text-sm text-muted-foreground">Painel administrativo</p>
        </div>
        <LoginForm />
      </section>
    </main>
  );
}
