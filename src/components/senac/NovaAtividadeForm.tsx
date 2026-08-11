"use client";

import { useActionState } from "react";
import { criarAtividade } from "@/lib/actions";
import SubmitButton from "@/components/senac/SubmitButton";
import FieldError from "@/components/senac/FieldError";

export default function NovaAtividadeForm({ turmaId }: { turmaId: string }) {
  const [state, formAction] = useActionState(criarAtividade, undefined);

  return (
    <form action={formAction} className="space-y-4">
      <input type="hidden" name="turmaId" value={turmaId} />
      <FieldError message={state?.error} />
      <div>
        <label htmlFor="titulo" className="mb-1 block text-sm font-medium text-foreground">
          Título
        </label>
        <input
          id="titulo"
          name="titulo"
          type="text"
          required
          className="w-full rounded-lg border border-border px-4 py-2.5 text-sm outline-none focus:border-brand"
        />
      </div>
      <div>
        <label htmlFor="descricao" className="mb-1 block text-sm font-medium text-foreground">
          Descrição / instruções
        </label>
        <textarea
          id="descricao"
          name="descricao"
          rows={4}
          className="w-full rounded-lg border border-border px-4 py-2.5 text-sm outline-none focus:border-brand"
        />
      </div>
      <div>
        <label htmlFor="prazo" className="mb-1 block text-sm font-medium text-foreground">
          Prazo (opcional)
        </label>
        <input
          id="prazo"
          name="prazo"
          type="datetime-local"
          className="w-full rounded-lg border border-border px-4 py-2.5 text-sm outline-none focus:border-brand"
        />
      </div>
      <div>
        <label htmlFor="anexos" className="mb-1 block text-sm font-medium text-foreground">
          Anexos (opcional)
        </label>
        <input
          id="anexos"
          name="anexos"
          type="file"
          multiple
          className="w-full rounded-lg border border-border px-4 py-2.5 text-sm outline-none focus:border-brand"
        />
      </div>
      <SubmitButton>Publicar atividade</SubmitButton>
    </form>
  );
}
