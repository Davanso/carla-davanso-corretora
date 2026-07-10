import Link from "next/link";
import { Building2Icon } from "lucide-react";
import { LoginForm } from "@/app/admin/login/login-form";

export default function AdminLoginPage() {
  return (
    <main className="grid min-h-screen bg-secondary/40 px-4 py-10 md:grid-cols-[0.9fr_1.1fr]">
      <section className="mx-auto flex w-full max-w-xl flex-col justify-center gap-6">
        <Link href="/" className="flex items-center gap-3 text-sm font-medium text-muted-foreground">
          <Building2Icon data-icon="inline-start" />
          Voltar para o site
        </Link>
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-muted-foreground">
            Carla Davanso
          </p>
          <h1 className="mt-3 text-4xl font-semibold tracking-tight">
            Painel simples para manter a vitrine viva.
          </h1>
          <p className="mt-4 max-w-md text-muted-foreground">
            Cadastre novos imoveis, destaque oportunidades e prepare fotos para
            publicar com armazenamento S3/R2.
          </p>
        </div>
      </section>
      <section className="flex items-center justify-center">
        <LoginForm />
      </section>
    </main>
  );
}
