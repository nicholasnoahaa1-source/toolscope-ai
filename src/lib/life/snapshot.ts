import { readFile } from "node:fs/promises";
import path from "node:path";
import type { LifeSnapshot } from "./types";

/**
 * Resolve o snapshot do painel, na ordem:
 *
 *  1. `LIFE_SNAPSHOT_JSON`   — o JSON inteiro numa variável de ambiente (usado
 *     em deploy, onde não há arquivo local: cole o conteúdo na Vercel).
 *  2. `data/life-snapshot.local.json` — o seu snapshot real, fora do git.
 *  3. `data/life-snapshot.example.json` — exemplo público, para o painel nunca
 *     ficar vazio.
 *
 * Os conectores (Gmail, Calendar, Todoist, Notion, Drive...) são autenticados
 * dentro do Claude, não neste site — quem regrava o snapshot é o assistente,
 * a pedido ("atualiza meu painel"). A leitura aqui é sempre de arquivo/env.
 */
const DATA_DIR = path.join(process.cwd(), "data");

async function readJsonFile(file: string): Promise<LifeSnapshot | null> {
  try {
    return JSON.parse(await readFile(path.join(DATA_DIR, file), "utf8")) as LifeSnapshot;
  } catch {
    return null;
  }
}

export async function getLifeSnapshot(): Promise<LifeSnapshot> {
  const raw = process.env.LIFE_SNAPSHOT_JSON;
  if (raw) {
    try {
      return JSON.parse(raw) as LifeSnapshot;
    } catch {
      // JSON inválido na env: segue para os arquivos em vez de derrubar a página.
    }
  }

  const local = await readJsonFile("life-snapshot.local.json");
  if (local) return local;

  const sample = await readJsonFile("life-snapshot.example.json");
  if (sample) return { ...sample, isSample: true };

  throw new Error(
    "Nenhum snapshot encontrado. Crie data/life-snapshot.local.json ou defina LIFE_SNAPSHOT_JSON.",
  );
}
