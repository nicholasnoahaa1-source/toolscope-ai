import Link from "next/link";
import { categories } from "@/lib/mock-data";

export default function Header() {
  return (
    <header className="sticky top-0 z-50 border-b border-border bg-surface/95 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center gap-8 px-6 py-4">
        <Link href="/" className="flex items-center gap-2 text-lg font-bold text-foreground">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand text-white">
            AI
          </span>
          ToolScope
        </Link>

        <nav className="hidden flex-1 items-center gap-6 text-sm font-medium text-muted md:flex">
          {categories.slice(0, 5).map((c) => (
            <Link key={c.slug} href={`/categories/${c.slug}`} className="hover:text-foreground">
              {c.name}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <Link
            href="/compare"
            className="rounded-full border border-border px-4 py-2 text-sm font-medium text-foreground hover:border-brand hover:text-brand"
          >
            Comparar
          </Link>
          <Link
            href="/"
            className="rounded-full bg-brand px-4 py-2 text-sm font-medium text-white hover:bg-brand-dark"
          >
            Entrar
          </Link>
        </div>
      </div>
    </header>
  );
}
