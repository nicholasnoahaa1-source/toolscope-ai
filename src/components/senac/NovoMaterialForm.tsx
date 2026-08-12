"use client";

import { useActionState, useState } from "react";
import { criarMaterial } from "@/lib/actions";
import SubmitButton from "@/components/senac/SubmitButton";
import FieldError from "@/components/senac/FieldError";

export default function NovoMaterialForm({ turmaId }: { turmaId: string }) {
  const [state, formAction] = useActionState(criarMaterial, undefined);
  const [tipo, setTipo] = useState<"ARQUIVO" | "LINK">("ARQUIVO");

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
      <fieldset>
        <legend className="mb-1 block text-sm font-medium text-foreground">Tipo</legend>
        <div className="flex gap-4 text-sm">
          <label className="flex items-center gap-2">
            <input
              type="radio"
              name="tipo"
              value="ARQUIVO"
              checked={tipo === "ARQUIVO"}
              onChange={() => setTipo("ARQUIVO")}
            />
            Arquivo
          </label>
          <label className="flex items-center gap-2">
            <input
              type="radio"
              name="tipo"
              value="LINK"
              checked={tipo === "LINK"}
              onChange={() => setTipo("LINK")}
            />
            Link
          </label>
        </div>
      </fieldset>
      {tipo === "ARQUIVO" ? (
        <div>
          <label htmlFor="arquivo" className="mb-1 block text-sm font-medium text-foreground">
            Arquivo
          </label>
          <input
            id="arquivo"
            name="arquivo"
            type="file"
            className="w-full rounded-lg border border-border px-4 py-2.5 text-sm outline-none focus:border-brand"
          />
        </div>
      ) : (
        <div>
          <label htmlFor="url" className="mb-1 block text-sm font-medium text-foreground">
            URL
          </label>
          <input
            id="url"
            name="url"
            type="url"
            placeholder="https://..."
            className="w-full rounded-lg border border-border px-4 py-2.5 text-sm outline-none focus:border-brand"
          />
        </div>
      )}
      <SubmitButton>Publicar material</SubmitButton>
    </form>
  );
}
