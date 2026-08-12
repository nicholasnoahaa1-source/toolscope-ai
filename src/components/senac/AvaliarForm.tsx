"use client";

import { useActionState, useState } from "react";
import { avaliarEntrega } from "@/lib/actions";
import SubmitButton from "@/components/senac/SubmitButton";
import FieldError from "@/components/senac/FieldError";

export default function AvaliarForm({
  entregaId,
  notaAtual,
  feedbackAtual,
}: {
  entregaId: string;
  notaAtual: number | null;
  feedbackAtual: string | null;
}) {
  const [state, formAction] = useActionState(avaliarEntrega, undefined);
  const [open, setOpen] = useState(false);

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="rounded-full border border-border px-4 py-1.5 text-xs font-medium text-foreground hover:border-brand hover:text-brand"
      >
        {notaAtual !== null ? "Editar avaliação" : "Avaliar"}
      </button>
    );
  }

  return (
    <form action={formAction} className="mt-3 space-y-3 rounded-xl border border-border bg-surface-muted p-4">
      <input type="hidden" name="entregaId" value={entregaId} />
      <FieldError message={state?.error} />
      <div className="flex items-center gap-3">
        <label htmlFor={`nota-${entregaId}`} className="text-sm font-medium text-foreground">
          Nota (0–10)
        </label>
        <input
          id={`nota-${entregaId}`}
          name="nota"
          type="number"
          min={0}
          max={10}
          step={0.1}
          defaultValue={notaAtual ?? ""}
          className="w-24 rounded-lg border border-border px-3 py-1.5 text-sm outline-none focus:border-brand"
        />
      </div>
      <div>
        <label htmlFor={`feedback-${entregaId}`} className="mb-1 block text-sm font-medium text-foreground">
          Feedback
        </label>
        <textarea
          id={`feedback-${entregaId}`}
          name="feedback"
          rows={2}
          defaultValue={feedbackAtual ?? ""}
          className="w-full rounded-lg border border-border px-3 py-2 text-sm outline-none focus:border-brand"
        />
      </div>
      <div className="flex gap-2">
        <SubmitButton className="px-4 py-2 text-xs">Salvar avaliação</SubmitButton>
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="rounded-full border border-border px-4 py-2 text-xs font-medium text-foreground"
        >
          Cancelar
        </button>
      </div>
    </form>
  );
}
