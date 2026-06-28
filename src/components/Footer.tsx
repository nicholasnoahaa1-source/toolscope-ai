import Link from "next/link";
import { categories } from "@/lib/mock-data";

export default function Footer() {
  return (
    <footer className="mt-16 border-t border-border bg-surface">
      <div className="mx-auto grid max-w-7xl gap-8 px-6 py-12 text-sm text-muted md:grid-cols-4">
        <div>
          <div className="mb-3 flex items-center gap-2 text-base font-bold text-foreground">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-brand text-white">
              AI
            </span>
            ToolScope
          </div>
          <p>A plataforma para descobrir, comparar e testar ferramentas de IA com dados reais.</p>
        </div>

        <div>
          <h3 className="mb-3 font-semibold text-foreground">Categorias</h3>
          <ul className="space-y-2">
            {categories.map((c) => (
              <li key={c.slug}>
                <Link href={`/categories/${c.slug}`} className="hover:text-brand">
                  {c.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="mb-3 font-semibold text-foreground">Produto</h3>
          <ul className="space-y-2">
            <li><Link href="/compare" className="hover:text-brand">Comparador</Link></li>
            <li><Link href="/" className="hover:text-brand">Ranking</Link></li>
            <li><Link href="/" className="hover:text-brand">Newsletter</Link></li>
          </ul>
        </div>

        <div>
          <h3 className="mb-3 font-semibold text-foreground">Empresa</h3>
          <ul className="space-y-2">
            <li><Link href="/" className="hover:text-brand">Sobre</Link></li>
            <li><Link href="/" className="hover:text-brand">Metodologia de benchmark</Link></li>
            <li><Link href="/" className="hover:text-brand">Privacidade (LGPD/GDPR)</Link></li>
          </ul>
        </div>
      </div>
      <div className="border-t border-border px-6 py-4 text-center text-xs text-muted">
        © {new Date().getFullYear()} ToolScope. Todos os direitos reservados.
      </div>
    </footer>
  );
}
