export function formatBytes(bytes: number): string {
  if (!bytes) return "0 B";
  const units = ["B", "KB", "MB", "GB", "TB"];
  const exponent = Math.min(
    Math.floor(Math.log(bytes) / Math.log(1024)),
    units.length - 1,
  );
  const value = bytes / 1024 ** exponent;
  return `${value.toFixed(value >= 10 || exponent === 0 ? 0 : 1)} ${units[exponent]}`;
}

export function formatDate(timestamp: number): string {
  return new Date(timestamp).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

/** Extrai cores hex de um texto livre ("#fff, 1a2b3c" etc.). */
export function parseColors(input: string): string[] {
  const matches = input.match(/#?[0-9a-fA-F]{6}|#?[0-9a-fA-F]{3}\b/g) ?? [];
  const seen = new Set<string>();
  for (const raw of matches) {
    let hex = raw.replace("#", "").toLowerCase();
    if (hex.length === 3) {
      hex = hex
        .split("")
        .map((c) => c + c)
        .join("");
    }
    seen.add(`#${hex}`);
  }
  return [...seen];
}
