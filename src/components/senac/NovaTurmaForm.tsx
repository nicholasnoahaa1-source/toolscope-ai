"use client";

import { useActionState } from "react";
import { criarTurma } from "@/lib/actions";
import SubmitButton from "@/components/senac/SubmitButton";
import FieldError from "@/components/senac/FieldError";

export default function NovaTurmaForm() {
  const [state, formAction] = useActionState(criarTurma, undefined);

  return (
    <form action={formAction} className="space-y-4">
      <FieldError message={state?.error} />
      <div>
        <label htmlFor="nome" className="mb-1 block text-sm font-medium text-foreground">
          Nome da turma
        </label>
        <input
          id="nome"
          name="nome"
          type="text"
          required
          placeholder="Ex: Excel Avançado — Turma A"
          className="w-full rounded-lg border border-border px-4 py-2.5 text-sm outline-none focus:border-brand"
        />
      </div>
      <div>
        <label htmlFor="descricao" className="mb-1 block text-sm font-medium text-foreground">
          Descrição (opcional)
        </label>
        <textarea
          id="descricao"
          name="descricao"
          rows={3}
          className="w-full rounded-lg border border-border px-4 py-2.5 text-sm outline-none focus:border-brand"
        />
      </div>
      <SubmitButton>Criar turma</SubmitButton>
    </form>
  );
}
