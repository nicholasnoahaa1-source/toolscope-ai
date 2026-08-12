const LABELS: Record<string, string> = {
  PENDENTE: "Pendente",
  ENTREGUE: "Entregue",
  ATRASADA: "Atrasada",
  AVALIADA: "Avaliada",
};

const STYLES: Record<string, string> = {
  PENDENTE: "bg-surface-muted text-muted",
  ENTREGUE: "bg-brand-light text-brand-dark",
  ATRASADA: "bg-red-100 text-red-700",
  AVALIADA: "bg-green-100 text-green-700",
};

export default function StatusBadge({ status }: { status: string }) {
  return (
    <span className={`rounded-full px-3 py-1 text-xs font-medium ${STYLES[status] ?? STYLES.PENDENTE}`}>
      {LABELS[status] ?? status}
    </span>
  );
}
