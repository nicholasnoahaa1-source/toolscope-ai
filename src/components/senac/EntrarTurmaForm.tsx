"use client";

import { useActionState } from "react";
import { entrarNaTurma } from "@/lib/actions";
import SubmitButton from "@/components/senac/SubmitButton";
import FieldError from "@/components/senac/FieldError";

export default function EntrarTurmaForm() {
  const [state, formAction] = useActionState(entrarNaTurma, undefined);

  return (
    <form action={formAction} className="space-y-4">
      <FieldError message={state?.error} />
      <div>
        <label htmlFor="codigo" className="mb-1 block text-sm font-medium text-foreground">
          Código da turma
        </label>
        <input
          id="codigo"
          name="codigo"
          type="text"
          required
          maxLength={6}
          placeholder="Ex: A1B2C3"
          className="w-full rounded-lg border border-border px-4 py-2.5 text-sm uppercase tracking-widest outline-none focus:border-brand"
        />
        <p className="mt-1 text-xs text-muted">Peça o código ao seu professor.</p>
      </div>
      <SubmitButton>Entrar na turma</SubmitButton>
    </form>
  );
}
