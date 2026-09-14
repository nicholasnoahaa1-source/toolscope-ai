/** Formatação de datas do painel, sempre no fuso do dono do snapshot. */

export function timeOfDay(iso: string, timeZone: string): string {
  return new Date(iso).toLocaleTimeString("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
    timeZone,
  });
}

export function dayLabel(iso: string, timeZone: string): string {
  return new Date(iso).toLocaleDateString("pt-BR", {
    weekday: "long",
    day: "2-digit",
    month: "long",
    timeZone,
  });
}

/** "há 2 h", "em 15 min", "agora" — relativo a `now`. */
export function relative(iso: string, now: Date = new Date()): string {
  const diffMin = Math.round((new Date(iso).getTime() - now.getTime()) / 60000);
  const abs = Math.abs(diffMin);
  if (abs < 1) return "agora";

  const [value, unit] =
    abs < 60
      ? [diffMin, "minute" as const]
      : abs < 60 * 24
        ? [Math.round(diffMin / 60), "hour" as const]
        : [Math.round(diffMin / (60 * 24)), "day" as const];

  return new Intl.RelativeTimeFormat("pt-BR", { numeric: "auto" }).format(value, unit);
}

/** Fração do dia já percorrida (0–1) no fuso indicado, para a barra de progresso. */
export function dayProgress(now: Date, timeZone: string): number {
  const parts = new Intl.DateTimeFormat("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    timeZone,
  }).formatToParts(now);
  const get = (t: string) => Number(parts.find((p) => p.type === t)?.value ?? 0);
  return (get("hour") * 60 + get("minute")) / (24 * 60);
}
