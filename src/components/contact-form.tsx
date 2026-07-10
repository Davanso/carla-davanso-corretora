"use client";

import { useState } from "react";
import { SendIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

export function ContactForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState("");

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const text = [
      "Olá, Carla! Vim pelo site e gostaria de mais informações.",
      name ? `Nome: ${name}` : null,
      email ? `E-mail: ${email}` : null,
      phone ? `Telefone: ${phone}` : null,
      message ? `Mensagem: ${message}` : null,
    ]
      .filter(Boolean)
      .join("\n");

    window.open(`https://wa.me/5519998383234?text=${encodeURIComponent(text)}`, "_blank");
  }

  return (
    <Card className="rounded-lg border-border/70 shadow-sm">
      <CardHeader>
        <CardTitle>Precisa de mais informações?</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit}>
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="name">Nome</FieldLabel>
              <Input
                id="name"
                value={name}
                onChange={(event) => setName(event.target.value)}
                autoComplete="name"
                required
              />
            </Field>
            <div className="grid gap-5 sm:grid-cols-2">
              <Field>
                <FieldLabel htmlFor="email">E-mail</FieldLabel>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  autoComplete="email"
                />
              </Field>
              <Field>
                <FieldLabel htmlFor="phone">Telefone</FieldLabel>
                <Input
                  id="phone"
                  type="tel"
                  value={phone}
                  onChange={(event) => setPhone(event.target.value)}
                  autoComplete="tel"
                  placeholder="(19) 99999-9999"
                />
              </Field>
            </div>
            <Field>
              <FieldLabel htmlFor="message">Sua mensagem</FieldLabel>
              <Textarea
                id="message"
                rows={6}
                value={message}
                onChange={(event) => setMessage(event.target.value)}
                placeholder="Conte como posso ajudar."
                required
              />
            </Field>
            <Button type="submit" className="h-11 w-full sm:w-fit">
              <SendIcon data-icon="inline-start" />
              Enviar mensagem
            </Button>
          </FieldGroup>
        </form>
      </CardContent>
    </Card>
  );
}
