"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  CATEGORIES,
  detectCategory,
  getCategory,
  type CategoryId,
} from "@/lib/arquivo/categories";
import {
  deleteItem,
  getItem,
  listItems,
  newId,
  putItem,
  updateItem,
  type ArquivoMeta,
} from "@/lib/arquivo/db";
import { formatBytes, formatDate, parseColors } from "@/lib/arquivo/format";
import { createZip, readZip, safePath, type ZipEntry } from "@/lib/arquivo/zip";
import ItemDetails from "./ItemDetails";

type Filter = "todos" | CategoryId;

type ManifestItem = {
  path: string;
  name: string;
  fileName: string;
  category: CategoryId;
  mimeType: string;
  tags: string[];
  notes: string;
  colors: string[];
  createdAt: number;
};

function download(blob: Blob, fileName: string) {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = fileName;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}

export default function ArquivoApp() {
  const [items, setItems] = useState<ArquivoMeta[]>([]);
  const [filter, setFilter] = useState<Filter>("todos");
  const [query, setQuery] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [status, setStatus] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [dragging, setDragging] = useState(false);
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [paletteName, setPaletteName] = useState("");
  const [paletteColors, setPaletteColors] = useState("");

  const fileInput = useRef<HTMLInputElement>(null);
  const backupInput = useRef<HTMLInputElement>(null);

  const refresh = useCallback(async () => {
    setItems(await listItems());
    setLoading(false);
  }, []);

  useEffect(() => {
    let active = true;
    void (async () => {
      try {
        const stored = await listItems();
        if (active) setItems(stored);
      } catch {
        if (active) setStatus("Não foi possível abrir o arquivo neste navegador.");
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  const announce = useCallback((message: string) => {
    setStatus(message);
    window.setTimeout(() => setStatus((current) => (current === message ? null : current)), 6000);
  }, []);

  const counts = useMemo(() => {
    const map = new Map<string, number>();
    for (const item of items) map.set(item.category, (map.get(item.category) ?? 0) + 1);
    return map;
  }, [items]);

  const visible = useMemo(() => {
    const term = query.trim().toLowerCase();
    return items.filter((item) => {
      if (filter !== "todos" && item.category !== filter) return false;
      if (!term) return true;
      return (
        item.name.toLowerCase().includes(term) ||
        item.fileName.toLowerCase().includes(term) ||
        item.notes.toLowerCase().includes(term) ||
        item.tags.some((tag) => tag.includes(term))
      );
    });
  }, [items, filter, query]);

  const selected = useMemo(
    () => items.find((item) => item.id === selectedId) ?? null,
    [items, selectedId],
  );

  const totalBytes = useMemo(
    () => items.reduce((total, item) => total + item.size, 0),
    [items],
  );

  const importFiles = useCallback(
    async (files: FileList | File[]) => {
      const list = Array.from(files);
      if (list.length === 0) return;
      const now = Date.now();
      for (const file of list) {
        await putItem({
          id: newId(),
          name: file.name.replace(/\.[^.]+$/, "") || file.name,
          fileName: file.name,
          category:
            filter === "todos" ? detectCategory(file.name, file.type) : filter,
          mimeType: file.type,
          size: file.size,
          tags: [],
          notes: "",
          colors: [],
          createdAt: now,
          updatedAt: now,
          blob: file,
        });
      }
      await refresh();
      announce(
        `${list.length} ${list.length === 1 ? "arquivo guardado" : "arquivos guardados"}.`,
      );
    },
    [announce, filter, refresh],
  );

  async function handleSavePalette() {
    const colors = parseColors(paletteColors);
    if (colors.length === 0) {
      announce("Informe ao menos uma cor em hex, por exemplo #5b4cff.");
      return;
    }
    const name = paletteName.trim() || "Paleta sem nome";
    const blob = new Blob([JSON.stringify({ name, colors }, null, 2)], {
      type: "application/json",
    });
    const now = Date.now();
    await putItem({
      id: newId(),
      name,
      fileName: `${safePath(name)}.json`,
      category: "paletas",
      mimeType: "application/json",
      size: blob.size,
      tags: [],
      notes: "",
      colors,
      createdAt: now,
      updatedAt: now,
      blob,
    });
    setPaletteName("");
    setPaletteColors("");
    setPaletteOpen(false);
    await refresh();
    announce(`Paleta "${name}" guardada com ${colors.length} cores.`);
  }

  async function handleDownloadOne(id: string) {
    const full = await getItem(id);
    if (!full) return;
    download(full.blob, full.fileName);
  }

  async function handleExportZip(scope: Filter) {
    const chosen = items.filter(
      (item) => scope === "todos" || item.category === scope,
    );
    if (chosen.length === 0) {
      announce("Nada para exportar aqui ainda.");
      return;
    }
    announce(`Montando o pacote com ${chosen.length} arquivos…`);

    const entries: ZipEntry[] = [];
    const manifest: ManifestItem[] = [];
    const used = new Set<string>();

    for (const meta of chosen) {
      const full = await getItem(meta.id);
      if (!full) continue;
      let path = `${meta.category}/${safePath(meta.fileName)}`;
      let suffix = 2;
      while (used.has(path)) {
        path = `${meta.category}/${suffix++}-${safePath(meta.fileName)}`;
      }
      used.add(path);
      entries.push({ path, blob: full.blob, date: new Date(meta.createdAt) });
      manifest.push({
        path,
        name: meta.name,
        fileName: meta.fileName,
        category: meta.category,
        mimeType: meta.mimeType,
        tags: meta.tags,
        notes: meta.notes,
        colors: meta.colors,
        createdAt: meta.createdAt,
      });
    }

    entries.push({
      path: "manifest.json",
      blob: new Blob(
        [
          JSON.stringify(
            { version: 1, exportedAt: new Date().toISOString(), items: manifest },
            null,
            2,
          ),
        ],
        { type: "application/json" },
      ),
    });

    const zip = await createZip(entries);
    const stamp = new Date().toISOString().slice(0, 10);
    download(zip, `arquivo-${scope}-${stamp}.zip`);
    announce(`Exportado: ${chosen.length} arquivos em um .zip.`);
  }

  async function handleImportBackup(file: File) {
    announce("Lendo o pacote…");
    let parsed;
    try {
      parsed = await readZip(file);
    } catch (error) {
      announce(error instanceof Error ? error.message : "Não deu para ler o .zip.");
      return;
    }

    const manifestEntry = parsed.entries.find((e) => e.path === "manifest.json");
    let manifest = new Map<string, ManifestItem>();
    if (manifestEntry) {
      try {
        const data = JSON.parse(new TextDecoder().decode(manifestEntry.bytes));
        manifest = new Map(
          (data.items as ManifestItem[]).map((item) => [item.path, item]),
        );
      } catch {
        // Sem manifesto utilizável: os arquivos entram pela pasta do zip.
      }
    }

    let restored = 0;
    for (const entry of parsed.entries) {
      if (entry.path === "manifest.json") continue;
      const meta = manifest.get(entry.path);
      const fileName = entry.path.split("/").pop() ?? entry.path;
      const folder = entry.path.includes("/") ? entry.path.split("/")[0] : "";
      const mimeType = meta?.mimeType ?? "";
      const blob = new Blob([entry.bytes as BlobPart], {
        type: mimeType || "application/octet-stream",
      });
      const now = Date.now();
      await putItem({
        id: newId(),
        name: meta?.name ?? fileName.replace(/\.[^.]+$/, ""),
        fileName: meta?.fileName ?? fileName,
        category:
          meta?.category ??
          (CATEGORIES.some((c) => c.id === folder)
            ? (folder as CategoryId)
            : detectCategory(fileName, mimeType)),
        mimeType,
        size: blob.size,
        tags: meta?.tags ?? [],
        notes: meta?.notes ?? "",
        colors: meta?.colors ?? [],
        createdAt: meta?.createdAt ?? now,
        updatedAt: now,
        blob,
      });
      restored++;
    }

    await refresh();
    announce(
      parsed.skipped > 0
        ? `${restored} arquivos restaurados. ${parsed.skipped} ficaram de fora (compactados por outro programa).`
        : `${restored} arquivos restaurados.`,
    );
  }

  async function handleSaveItem(id: string, patch: Partial<ArquivoMeta>) {
    await updateItem(id, patch);
    await refresh();
    announce("Alterações salvas.");
  }

  async function handleDeleteItem(id: string) {
    await deleteItem(id);
    setSelectedId(null);
    await refresh();
    announce("Item removido do arquivo.");
  }

  return (
    <div
      onDragOver={(e) => {
        e.preventDefault();
        setDragging(true);
      }}
      onDragLeave={() => setDragging(false)}
      onDrop={(e) => {
        e.preventDefault();
        setDragging(false);
        if (e.dataTransfer.files.length > 0) void importFiles(e.dataTransfer.files);
      }}
      className={`mx-auto max-w-7xl px-6 py-10 ${dragging ? "outline-2 outline-dashed outline-brand" : ""}`}
    >
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Arquivo</h1>
          <p className="mt-1 max-w-xl text-sm text-muted">
            Guarde trilhas, fotos, vídeos, fontes, paletas e documentos separados por
            categoria. Importe arrastando para a página e exporte quando quiser.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => fileInput.current?.click()}
            className="rounded-full bg-brand px-4 py-2 text-sm font-medium text-white hover:bg-brand-dark"
          >
            Importar arquivos
          </button>
          <button
            type="button"
            onClick={() => setPaletteOpen((open) => !open)}
            className="rounded-full border border-border px-4 py-2 text-sm font-medium hover:border-brand hover:text-brand"
          >
            Nova paleta
          </button>
          <button
            type="button"
            onClick={() => handleExportZip(filter)}
            className="rounded-full border border-border px-4 py-2 text-sm font-medium hover:border-brand hover:text-brand"
          >
            {filter === "todos" ? "Exportar tudo (.zip)" : "Exportar categoria (.zip)"}
          </button>
          <button
            type="button"
            onClick={() => backupInput.current?.click()}
            className="rounded-full border border-border px-4 py-2 text-sm font-medium hover:border-brand hover:text-brand"
          >
            Restaurar backup
          </button>
        </div>
      </header>

      <input
        ref={fileInput}
        type="file"
        multiple
        hidden
        onChange={(e) => {
          if (e.target.files) void importFiles(e.target.files);
          e.target.value = "";
        }}
      />
      <input
        ref={backupInput}
        type="file"
        accept=".zip,application/zip"
        hidden
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) void handleImportBackup(file);
          e.target.value = "";
        }}
      />

      {paletteOpen && (
        <div className="mt-6 flex flex-wrap items-end gap-3 rounded-2xl border border-border bg-surface p-4">
          <label className="text-sm font-medium">
            Nome da paleta
            <input
              value={paletteName}
              onChange={(e) => setPaletteName(e.target.value)}
              placeholder="Marca — verão"
              className="mt-1 block w-56 rounded-lg border border-border bg-background px-3 py-2 text-sm font-normal"
            />
          </label>
          <label className="flex-1 text-sm font-medium">
            Cores em hex
            <input
              value={paletteColors}
              onChange={(e) => setPaletteColors(e.target.value)}
              placeholder="#5b4cff, #14152b, #f7f8fb"
              className="mt-1 block w-full rounded-lg border border-border bg-background px-3 py-2 text-sm font-normal"
            />
          </label>
          <button
            type="button"
            onClick={handleSavePalette}
            className="rounded-full bg-brand px-4 py-2 text-sm font-medium text-white hover:bg-brand-dark"
          >
            Guardar paleta
          </button>
        </div>
      )}

      {status && (
        <p role="status" className="mt-6 rounded-xl border border-border bg-surface px-4 py-3 text-sm">
          {status}
        </p>
      )}

      <div className="mt-6 flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={() => setFilter("todos")}
          className={`rounded-full border px-3 py-1.5 text-sm ${
            filter === "todos"
              ? "border-brand bg-brand text-white"
              : "border-border hover:border-brand hover:text-brand"
          }`}
        >
          Tudo ({items.length})
        </button>
        {CATEGORIES.map((category) => (
          <button
            key={category.id}
            type="button"
            onClick={() => setFilter(category.id)}
            className={`rounded-full border px-3 py-1.5 text-sm ${
              filter === category.id
                ? "border-brand bg-brand text-white"
                : "border-border hover:border-brand hover:text-brand"
            }`}
          >
            {category.icon} {category.name} ({counts.get(category.id) ?? 0})
          </button>
        ))}
      </div>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Buscar por nome, tag ou nota…"
          className="w-full max-w-sm rounded-full border border-border bg-surface px-4 py-2 text-sm"
        />
        <p className="text-xs text-muted">
          {items.length} itens · {formatBytes(totalBytes)} guardados neste navegador
        </p>
      </div>

      <div className="mt-6 flex flex-col gap-6 lg:flex-row">
        <div className="flex-1">
          {loading ? (
            <p className="text-sm text-muted">Abrindo o arquivo…</p>
          ) : visible.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-border bg-surface p-12 text-center">
              <p className="text-2xl">
                {filter === "todos" ? "📦" : getCategory(filter).icon}
              </p>
              <p className="mt-2 text-sm text-muted">
                {items.length === 0
                  ? "Nada guardado ainda. Arraste arquivos para cá ou use “Importar arquivos”."
                  : "Nenhum item nesta categoria ou busca."}
              </p>
            </div>
          ) : (
            <ul className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
              {visible.map((item) => (
                <li key={item.id}>
                  <button
                    type="button"
                    onClick={() => setSelectedId(item.id)}
                    className={`flex h-full w-full flex-col gap-2 rounded-2xl border bg-surface p-4 text-left transition hover:border-brand ${
                      item.id === selectedId ? "border-brand" : "border-border"
                    }`}
                  >
                    <span className="flex items-center gap-2 text-sm font-semibold">
                      <span className="text-lg">{getCategory(item.category).icon}</span>
                      <span className="line-clamp-2 break-all">{item.name}</span>
                    </span>
                    {item.colors.length > 0 && (
                      <span className="flex overflow-hidden rounded-md">
                        {item.colors.slice(0, 8).map((color) => (
                          <span key={color} className="h-4 flex-1" style={{ background: color }} />
                        ))}
                      </span>
                    )}
                    <span className="text-xs text-muted">
                      {getCategory(item.category).name} · {formatBytes(item.size)} ·{" "}
                      {formatDate(item.createdAt)}
                    </span>
                    {item.tags.length > 0 && (
                      <span className="flex flex-wrap gap-1">
                        {item.tags.slice(0, 4).map((tag) => (
                          <span
                            key={tag}
                            className="rounded-full bg-background px-2 py-0.5 text-[11px] text-muted"
                          >
                            #{tag}
                          </span>
                        ))}
                      </span>
                    )}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        {selected && (
          <ItemDetails
            key={selected.id}
            item={selected}
            onSave={handleSaveItem}
            onDelete={handleDeleteItem}
            onDownload={handleDownloadOne}
            onClose={() => setSelectedId(null)}
          />
        )}
      </div>
    </div>
  );
}
