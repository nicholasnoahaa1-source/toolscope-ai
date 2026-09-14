import type { AgendaEvent, HistoryEntry } from "./types";

/**
 * Métricas derivadas da agenda. Nada aqui vem do snapshot pronto: tudo é
 * calculado a partir dos blocos, para que um snapshot novo atualize os números
 * sozinho.
 */

export type Bucket = "escola" | "treino" | "deslocamento" | "sono" | "refeicao" | "outros";

export const BUCKET_LABEL: Record<Bucket, string> = {
  escola: "Escola",
  treino: "Treino",
  deslocamento: "Deslocamento",
  sono: "Sono",
  refeicao: "Refeições",
  outros: "Outros",
};

export const BUCKET_COLOR: Record<Bucket, string> = {
  escola: "bg-indigo-500",
  treino: "bg-emerald-500",
  deslocamento: "bg-amber-500",
  sono: "bg-slate-400",
  refeicao: "bg-rose-400",
  outros: "bg-cyan-500",
};

/** Classifica um bloco pelo título. Deslocamento vem primeiro: "Deslocamento —
 *  Casa para Basquete" é trânsito, não treino. */
export function bucketOf(title: string): Bucket {
  const t = title.toLowerCase();
  if (t.includes("deslocamento")) return "deslocamento";
  if (t.includes("escola") || t.includes("aula") || t.includes("prova")) return "escola";
  if (t.includes("basquete") || t.includes("academia") || t.includes("treino")) return "treino";
  if (t.includes("dormir") || t.includes("sono")) return "sono";
  if (t.includes("almoço") || t.includes("jantar") || t.includes("café")) return "refeicao";
  return "outros";
}

function hours(event: { start: string; end: string }): number {
  return (new Date(event.end).getTime() - new Date(event.start).getTime()) / 3_600_000;
}

export interface BucketTotal {
  bucket: Bucket;
  hours: number;
  share: number;
}

/** Horas por categoria, da maior para a menor. */
export function bucketTotals(events: AgendaEvent[]): BucketTotal[] {
  const totals = new Map<Bucket, number>();
  for (const event of events) {
    const bucket = bucketOf(event.title);
    totals.set(bucket, (totals.get(bucket) ?? 0) + hours(event));
  }

  const sum = [...totals.values()].reduce((a, b) => a + b, 0);
  return [...totals.entries()]
    .map(([bucket, h]) => ({ bucket, hours: h, share: sum > 0 ? h / sum : 0 }))
    .sort((a, b) => b.hours - a.hours);
}

/** Chave AAAA-MM-DD no fuso indicado (não em UTC). */
export function dateKey(iso: string, timeZone: string): string {
  const parts = new Intl.DateTimeFormat("en-CA", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    timeZone,
  }).formatToParts(new Date(iso));
  const get = (t: string) => parts.find((p) => p.type === t)?.value ?? "";
  return `${get("year")}-${get("month")}-${get("day")}`;
}

export interface Habit {
  id: string;
  name: string;
  /** Um item por dia, do mais antigo ao mais recente. */
  days: { key: string; done: boolean }[];
  /** Dias com ocorrência na janela. */
  count: number;
  /** Dias corridos consecutivos com ocorrência, terminando na última vez. */
  streak: number;
  /** Quando foi a última vez (AAAA-MM-DD), se houve. */
  lastDone?: string;
}

/**
 * Monta o histórico de um hábito numa janela de `windowDays` dias terminando
 * em `today`. `match` é comparado com o título do bloco, sem acento de caixa.
 */
export function buildHabit(
  id: string,
  name: string,
  match: string,
  entries: HistoryEntry[],
  today: Date,
  timeZone: string,
  windowDays = 14,
): Habit {
  const needle = match.toLowerCase();
  const done = new Set(
    entries
      .filter((e) => e.title.toLowerCase().includes(needle))
      .map((e) => dateKey(e.start, timeZone)),
  );

  const days: Habit["days"] = [];
  for (let i = windowDays - 1; i >= 0; i--) {
    const day = new Date(today.getTime() - i * 86_400_000);
    const key = dateKey(day.toISOString(), timeZone);
    days.push({ key, done: done.has(key) });
  }

  let streak = 0;
  for (let i = days.length - 1; i >= 0; i--) {
    if (days[i].done) streak++;
    else if (streak > 0) break;
  }

  const lastDone = [...days].reverse().find((d) => d.done)?.key;
  return { id, name, days, count: days.filter((d) => d.done).length, streak, lastDone };
}

export interface DaySummary {
  key: string;
  label: string;
  events: AgendaEvent[];
  busyHours: number;
}

/** Agrupa os blocos da semana por dia local, do mais próximo ao mais distante. */
export function groupByDay(events: AgendaEvent[], timeZone: string): DaySummary[] {
  const byDay = new Map<string, AgendaEvent[]>();
  for (const event of events) {
    const key = dateKey(event.start, timeZone);
    byDay.set(key, [...(byDay.get(key) ?? []), event]);
  }

  return [...byDay.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, dayEvents]) => ({
      key,
      label: new Date(`${key}T12:00:00`).toLocaleDateString("pt-BR", {
        weekday: "short",
        day: "2-digit",
        month: "2-digit",
      }),
      events: dayEvents.sort((a, b) => a.start.localeCompare(b.start)),
      busyHours: dayEvents
        .filter((e) => bucketOf(e.title) !== "sono")
        .reduce((total, e) => total + hours(e), 0),
    }));
}
