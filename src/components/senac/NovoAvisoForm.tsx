"use client";

import { useActionState } from "react";
import { criarAviso } from "@/lib/actions";
import SubmitButton from "@/components/senac/SubmitButton";
import FieldError from "@/components/senac/FieldError";

export default function NovoAvisoForm({ turmaId }: { turmaId: string }) {
  const [state, formAction] = useActionState(criarAviso, undefined);

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
        <label htmlFor="conteudo" className="mb-1 block text-sm font-medium text-foreground">
          Mensagem
        </label>
        <textarea
          id="conteudo"
          name="conteudo"
          rows={4}
          required
          className="w-full rounded-lg border border-border px-4 py-2.5 text-sm outline-none focus:border-brand"
        />
      </div>
      <SubmitButton>Publicar aviso</SubmitButton>
    </form>
  );
}
