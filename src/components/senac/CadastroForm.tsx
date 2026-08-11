"use client";

import { useActionState } from "react";
import { cadastrar } from "@/lib/actions";
import SubmitButton from "@/components/senac/SubmitButton";
import FieldError from "@/components/senac/FieldError";

export default function CadastroForm() {
  const [state, formAction] = useActionState(cadastrar, undefined);

  return (
    <form action={formAction} className="space-y-4">
      <FieldError message={state?.error} />
      <div>
        <label htmlFor="name" className="mb-1 block text-sm font-medium text-foreground">
          Nome completo
        </label>
        <input
          id="name"
          name="name"
          type="text"
          required
          className="w-full rounded-lg border border-border px-4 py-2.5 text-sm outline-none focus:border-brand"
        />
      </div>
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
          minLength={6}
          className="w-full rounded-lg border border-border px-4 py-2.5 text-sm outline-none focus:border-brand"
        />
      </div>
      <fieldset>
        <legend className="mb-1 block text-sm font-medium text-foreground">Eu sou</legend>
        <div className="flex gap-4 text-sm">
          <label className="flex items-center gap-2">
            <input type="radio" name="role" value="ALUNO" defaultChecked />
            Aluno
          </label>
          <label className="flex items-center gap-2">
            <input type="radio" name="role" value="PROFESSOR" />
            Professor
          </label>
        </div>
      </fieldset>
      <SubmitButton className="w-full">Criar conta</SubmitButton>
    </form>
  );
}
