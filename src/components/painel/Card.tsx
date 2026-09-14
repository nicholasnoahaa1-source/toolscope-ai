import Link from "next/link";

export default function Card({
  title,
  badge,
  action,
  children,
}: {
  title: string;
  badge?: string;
  action?: { label: string; href: string };
  children: React.ReactNode;
}) {
  return (
    <section className="flex flex-col rounded-2xl border border-border bg-surface p-5">
      <header className="mb-4 flex items-center gap-3">
        <h2 className="text-sm font-semibold tracking-wide text-foreground uppercase">{title}</h2>
        {badge && (
          <span className="rounded-full bg-brand/10 px-2 py-0.5 text-xs font-medium text-brand">
            {badge}
          </span>
        )}
        {action && (
          <Link
            href={action.href}
            className="ml-auto text-xs font-medium text-muted hover:text-brand"
          >
            {action.label} →
          </Link>
        )}
      </header>
      <div className="flex-1">{children}</div>
    </section>
  );
}

export function Empty({ children }: { children: React.ReactNode }) {
  return <p className="py-6 text-center text-sm text-muted">{children}</p>;
}
