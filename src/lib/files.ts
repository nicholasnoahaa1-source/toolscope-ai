import { randomUUID } from "node:crypto";
import { createClient } from "@supabase/supabase-js";

const BUCKET = "arquivos";

function getStorageClient() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    throw new Error("SUPABASE_URL/SUPABASE_SERVICE_ROLE_KEY não estão definidos no ambiente.");
  }
  return createClient(url, key);
}

export async function saveUploadedFile(file: File) {
  const supabase = getStorageClient();
  const storedName = `${randomUUID()}-${file.name}`.replace(/[^a-zA-Z0-9._-]/g, "_");
  const buffer = Buffer.from(await file.arrayBuffer());

  const { error } = await supabase.storage.from(BUCKET).upload(storedName, buffer, {
    contentType: file.type || "application/octet-stream",
    upsert: false,
  });
  if (error) throw error;

  return {
    caminho: storedName,
    nomeOriginal: file.name,
    mimeType: file.type || "application/octet-stream",
    tamanho: buffer.byteLength,
  };
}

export async function readStoredFile(storedName: string) {
  const supabase = getStorageClient();
  const { data, error } = await supabase.storage.from(BUCKET).download(storedName);
  if (error) throw error;
  return Buffer.from(await data.arrayBuffer());
}
