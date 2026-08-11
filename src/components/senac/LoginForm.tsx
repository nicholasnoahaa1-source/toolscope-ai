"use client";

import { useActionState } from "react";
import { entrar } from "@/lib/actions";
import SubmitButton from "@/components/senac/SubmitButton";
import FieldError from "@/components/senac/FieldError";

export default function LoginForm() {
  const [state, formAction] = useActionState(entrar, undefined);

  return (
    <form action={formAction} className="space-y-4">
      <FieldError message={state?.error} />
      <div>
        <label htmlFor="email" className="mb-1 block text-sm font-medium text-foreground">
          E-mail
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          className="w-full rounded-lg border border-border px-4 py-2.5 text-sm outline-none focus:border-brand"
          placeholder="voce@aluno.senac.br"
        />
      </div>
      <div>
        <label htmlFor="password" className="mb-1 block text-sm font-medium text-foreground">
          Senha
        </label>
        <input
          id="password"
          name="password"
          type="password"
          required
          className="w-full rounded-lg border border-border px-4 py-2.5 text-sm outline-none focus:border-brand"
          placeholder="••••••••"
        />
      </div>
      <SubmitButton className="w-full">Entrar</SubmitButton>
    </form>
  );
}
