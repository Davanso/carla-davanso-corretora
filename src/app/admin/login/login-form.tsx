"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { KeyRoundIcon, Loader2Icon } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";

export function LoginForm() {
  const router = useRouter();
  const [isPending, setIsPending] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsPending(true);

    const formData = new FormData(event.currentTarget);
    const response = await signIn("credentials", {
      email: formData.get("email"),
      password: formData.get("password"),
      redirect: false,
    });

    setIsPending(false);

    if (response?.error) {
      toast.error("E-mail ou senha invalidos.");
      return;
    }

    router.push("/admin");
    router.refresh();
  }

  return (
    <Card className="w-full max-w-md rounded-lg">
      <CardHeader>
        <CardTitle>Acesso administrativo</CardTitle>
        <CardDescription>Entre para cadastrar e organizar os imoveis.</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit}>
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="email">E-mail</FieldLabel>
              <Input id="email" name="email" type="email" autoComplete="email" required />
            </Field>
            <Field>
              <FieldLabel htmlFor="password">Senha</FieldLabel>
              <Input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
              />
            </Field>
            <Button type="submit" className="h-10" disabled={isPending}>
              {isPending ? <Loader2Icon className="animate-spin" data-icon="inline-start" /> : null}
              <KeyRoundIcon data-icon="inline-start" />
              Entrar
            </Button>
          </FieldGroup>
        </form>
      </CardContent>
    </Card>
  );
}
