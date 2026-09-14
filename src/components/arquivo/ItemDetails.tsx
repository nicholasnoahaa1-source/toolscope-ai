"use client";

import { useEffect, useState } from "react";
import { CATEGORIES, getCategory, type CategoryId } from "@/lib/arquivo/categories";
import { getItem, type ArquivoMeta } from "@/lib/arquivo/db";
import { formatBytes, formatDate, parseColors } from "@/lib/arquivo/format";

type Props = {
  item: ArquivoMeta;
  onSave: (id: string, patch: Partial<ArquivoMeta>) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  onDownload: (id: string) => Promise<void>;
  onClose: () => void;
};

function Preview({ item }: { item: ArquivoMeta }) {
  const [url, setUrl] = useState<string | null>(null);
  const [text, setText] = useState<string | null>(null);

  const kind = item.mimeType.startsWith("image/")
    ? "image"
    : item.mimeType.startsWith("audio/")
      ? "audio"
      : item.mimeType.startsWith("video/")
        ? "video"
        : item.mimeType.startsWith("text/") || item.mimeType === "application/json"
          ? "text"
          : "none";

  useEffect(() => {
    if (kind === "none") return;
    let objectUrl: string | null = null;
    let cancelled = false;

    getItem(item.id).then(async (full) => {
      if (!full || cancelled) return;
      if (kind === "text") {
        const content = await full.blob.slice(0, 20_000).text();
        if (!cancelled) setText(content);
        return;
      }
      objectUrl = URL.createObjectURL(full.blob);
      if (cancelled) {
        URL.revokeObjectURL(objectUrl);
        return;
      }
      setUrl(objectUrl);
    });

    return () => {
      cancelled = true;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
      setUrl(null);
      setText(null);
    };
  }, [item.id, kind]);

  if (item.colors.length > 0) {
    return (
      <div className="grid grid-cols-5 overflow-hidden rounded-xl border border-border">
        {item.colors.slice(0, 10).map((color) => (
          <div key={color} className="aspect-square" style={{ background: color }} title={color} />
        ))}
      </div>
    );
  }

  if (kind === "image" && url) {
    /* eslint-disable-next-line @next/next/no-img-element */
    return <img src={url} alt={item.name} className="max-h-72 w-full rounded-xl object-contain" />;
  }
  if (kind === "audio" && url) return <audio src={url} controls className="w-full" />;
  if (kind === "video" && url) return <video src={url} controls className="max-h-72 w-full rounded-xl" />;
  if (kind === "text" && text !== null) {
    return (
      <pre className="max-h-72 overflow-auto rounded-xl border border-border bg-background p-3 font-mono text-xs whitespace-pre-wrap">
        {text}
      </pre>
    );
  }

  return (
    <div className="flex h-32 items-center justify-center rounded-xl border border-dashed border-border text-4xl">
      {getCategory(item.category).icon}
    </div>
  );
}

export default function ItemDetails({ item, onSave, onDelete, onDownload, onClose }: Props) {
  const [name, setName] = useState(item.name);
  const [category, setCategory] = useState<CategoryId>(item.category);
  const [tags, setTags] = useState(item.tags.join(", "));
  const [notes, setNotes] = useState(item.notes);
  const [colors, setColors] = useState(item.colors.join(", "));
  const [saving, setSaving] = useState(false);

  async function handleSave() {
    setSaving(true);
    try {
      await onSave(item.id, {
        name: name.trim() || item.fileName,
        category,
        notes,
        tags: tags
          .split(",")
          .map((t) => t.trim().toLowerCase())
          .filter(Boolean),
        colors: parseColors(colors),
      });
    } finally {
      setSaving(false);
    }
  }

  return (
    <aside className="flex w-full flex-col gap-4 rounded-2xl border border-border bg-surface p-5 lg:w-96">
      <div className="flex items-start justify-between gap-3">
        <h2 className="text-base font-semibold break-all">{item.name}</h2>
        <button
          type="button"
          onClick={onClose}
          className="rounded-full border border-border px-2 py-0.5 text-sm text-muted hover:text-foreground"
          aria-label="Fechar detalhes"
        >
          ✕
        </button>
      </div>

      <Preview item={item} />

      <dl className="grid grid-cols-2 gap-2 text-xs text-muted">
        <div>
          <dt className="font-medium text-foreground">Arquivo</dt>
          <dd className="break-all">{item.fileName}</dd>
        </div>
        <div>
          <dt className="font-medium text-foreground">Tamanho</dt>
          <dd>{formatBytes(item.size)}</dd>
        </div>
        <div>
          <dt className="font-medium text-foreground">Tipo</dt>
          <dd className="break-all">{item.mimeType || "desconhecido"}</dd>
        </div>
        <div>
          <dt className="font-medium text-foreground">Guardado em</dt>
          <dd>{formatDate(item.createdAt)}</dd>
        </div>
      </dl>

      <label className="text-sm font-medium">
        Nome
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm font-normal"
        />
      </label>

      <label className="text-sm font-medium">
        Categoria
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value as CategoryId)}
          className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm font-normal"
        >
          {CATEGORIES.map((c) => (
            <option key={c.id} value={c.id}>
              {c.icon} {c.name}
            </option>
          ))}
        </select>
      </label>

      <label className="text-sm font-medium">
        Tags <span className="font-normal text-muted">(separadas por vírgula)</span>
        <input
          value={tags}
          onChange={(e) => setTags(e.target.value)}
          placeholder="lofi, abertura, cliente-x"
          className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm font-normal"
        />
      </label>

      <label className="text-sm font-medium">
        Cores <span className="font-normal text-muted">(hex, separadas por vírgula)</span>
        <input
          value={colors}
          onChange={(e) => setColors(e.target.value)}
          placeholder="#5b4cff, #14152b"
          className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm font-normal"
        />
      </label>

      <label className="text-sm font-medium">
        Notas
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={3}
          className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm font-normal"
        />
      </label>

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={handleSave}
          disabled={saving}
          className="rounded-full bg-brand px-4 py-2 text-sm font-medium text-white hover:bg-brand-dark disabled:opacity-60"
        >
          {saving ? "Salvando…" : "Salvar"}
        </button>
        <button
          type="button"
          onClick={() => onDownload(item.id)}
          className="rounded-full border border-border px-4 py-2 text-sm font-medium hover:border-brand hover:text-brand"
        >
          Exportar
        </button>
        <button
          type="button"
          onClick={() => {
            if (confirm(`Remover "${item.name}" do arquivo?`)) onDelete(item.id);
          }}
          className="rounded-full border border-border px-4 py-2 text-sm font-medium text-red-600 hover:border-red-300"
        >
          Excluir
        </button>
      </div>
    </aside>
  );
}
