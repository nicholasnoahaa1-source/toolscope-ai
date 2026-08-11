import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { randomUUID } from "node:crypto";

const UPLOAD_ROOT = path.join(process.cwd(), "uploads");

export async function saveUploadedFile(file: File) {
  await mkdir(UPLOAD_ROOT, { recursive: true });
  const storedName = `${randomUUID()}-${file.name}`.replace(/[^a-zA-Z0-9._-]/g, "_");
  const buffer = Buffer.from(await file.arrayBuffer());
  await writeFile(path.join(UPLOAD_ROOT, storedName), buffer);
  return {
    caminho: storedName,
    nomeOriginal: file.name,
    mimeType: file.type || "application/octet-stream",
    tamanho: buffer.byteLength,
  };
}

export async function readStoredFile(storedName: string) {
  const safeName = path.basename(storedName);
  return readFile(path.join(UPLOAD_ROOT, safeName));
}
