import type { CategoryId } from "./categories";

export type ArquivoItem = {
  id: string;
  /** Nome exibido — pode ser renomeado sem perder o nome original do arquivo. */
  name: string;
  fileName: string;
  category: CategoryId;
  mimeType: string;
  size: number;
  tags: string[];
  notes: string;
  /** Cores em hex, usadas principalmente por paletas. */
  colors: string[];
  createdAt: number;
  updatedAt: number;
  blob: Blob;
};

/** O item sem o Blob — o que a UI carrega para listar sem segurar arquivos na memória. */
export type ArquivoMeta = Omit<ArquivoItem, "blob">;

const DB_NAME = "toolscope-arquivo";
const DB_VERSION = 1;
const STORE = "items";

let dbPromise: Promise<IDBDatabase> | null = null;

function openDb(): Promise<IDBDatabase> {
  if (dbPromise) return dbPromise;
  dbPromise = new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE)) {
        const store = db.createObjectStore(STORE, { keyPath: "id" });
        store.createIndex("category", "category");
        store.createIndex("createdAt", "createdAt");
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
  return dbPromise;
}

function run<T>(
  mode: IDBTransactionMode,
  fn: (store: IDBObjectStore) => IDBRequest<T>,
): Promise<T> {
  return openDb().then(
    (db) =>
      new Promise<T>((resolve, reject) => {
        const tx = db.transaction(STORE, mode);
        const request = fn(tx.objectStore(STORE));
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
      }),
  );
}

function stripBlob(item: ArquivoItem): ArquivoMeta {
  const { blob: _blob, ...meta } = item;
  void _blob;
  return meta;
}

export function newId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

export async function listItems(): Promise<ArquivoMeta[]> {
  const items = await run<ArquivoItem[]>("readonly", (s) => s.getAll());
  return items.map(stripBlob).sort((a, b) => b.createdAt - a.createdAt);
}

export async function getItem(id: string): Promise<ArquivoItem | undefined> {
  return run<ArquivoItem | undefined>("readonly", (s) => s.get(id));
}

export async function putItem(item: ArquivoItem): Promise<ArquivoMeta> {
  await run("readwrite", (s) => s.put(item));
  return stripBlob(item);
}

export async function updateItem(
  id: string,
  patch: Partial<Omit<ArquivoItem, "id" | "blob">>,
): Promise<ArquivoMeta | undefined> {
  const existing = await getItem(id);
  if (!existing) return undefined;
  const updated: ArquivoItem = { ...existing, ...patch, updatedAt: Date.now() };
  await run("readwrite", (s) => s.put(updated));
  return stripBlob(updated);
}

export async function deleteItem(id: string): Promise<void> {
  await run("readwrite", (s) => s.delete(id));
}

export async function usedBytes(): Promise<number> {
  const items = await listItems();
  return items.reduce((total, item) => total + item.size, 0);
}
