"use client";

import { useActionState } from "react";
import { enviarEntrega } from "@/lib/actions";
import SubmitButton from "@/components/senac/SubmitButton";
import FieldError from "@/components/senac/FieldError";

export default function EntregaForm({ atividadeId }: { atividadeId: string }) {
  const [state, formAction] = useActionState(enviarEntrega, undefined);

  return (
    <form action={formAction} className="space-y-4">
      <input type="hidden" name="atividadeId" value={atividadeId} />
      <FieldError message={state?.error} />
      <div>
        <label htmlFor="comentario" className="mb-1 block text-sm font-medium text-foreground">
          Comentário (opcional)
        </label>
        <textarea
          id="comentario"
          name="comentario"
          rows={3}
          className="w-full rounded-lg border border-border px-4 py-2.5 text-sm outline-none focus:border-brand"
        />
      </div>
      <div>
        <label htmlFor="arquivos" className="mb-1 block text-sm font-medium text-foreground">
          Arquivos
        </label>
        <input
          id="arquivos"
          name="arquivos"
          type="file"
          multiple
          className="w-full rounded-lg border border-border px-4 py-2.5 text-sm outline-none focus:border-brand"
        />
      </div>
      <SubmitButton>Enviar entrega</SubmitButton>
    </form>
  );
}
