import Link from "next/link";
import ToolCard from "@/components/ToolCard";
import { categories, searchTools, tools } from "@/lib/mock-data";

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  const results = searchTools(q ?? "");
  const isSearching = Boolean(q && q.trim());

  return (
    <div>
      <section className="border-b border-border bg-gradient-to-b from-brand/5 to-transparent px-6 py-16">
        <div className="mx-auto max-w-3xl text-center">
          <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
            Encontre a ferramenta de IA certa.
            <br />
            <span className="text-brand">Com prova, não opinião.</span>
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-muted">
            Pesquise, compare e analise milhares de ferramentas de IA com benchmarks reais e reviews verificadas.
          </p>

          <form action="/" className="mx-auto mt-8 flex max-w-xl gap-2">
            <input
              type="text"
              name="q"
              defaultValue={q}
              placeholder="Buscar por nome, categoria ou caso de uso..."
              className="flex-1 rounded-full border border-border bg-surface px-5 py-3 text-sm text-foreground outline-none focus:border-brand"
            />
            <button
              type="submit"
              className="rounded-full bg-brand px-6 py-3 text-sm font-medium text-white hover:bg-brand-dark"
            >
              Buscar
            </button>
          </form>

          <div className="mt-6 flex flex-wrap justify-center gap-2">
            {categories.map((c) => (
              <Link
                key={c.slug}
                href={`/categories/${c.slug}`}
                className="rounded-full border border-border bg-surface px-3 py-1 text-xs font-medium text-muted hover:border-brand hover:text-brand"
              >
                {c.name}
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-12">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-foreground">
            {isSearching ? `Resultados para "${q}"` : "Ferramentas em destaque"}
          </h2>
          <span className="text-sm text-muted">{results.length} ferramentas</span>
        </div>

        {results.length === 0 ? (
          <p className="text-muted">Nenhuma ferramenta encontrada para essa busca.</p>
        ) : (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {results.map((tool) => (
              <ToolCard key={tool.id} tool={tool} />
            ))}
          </div>
        )}
      </section>

      {!isSearching && (
        <section className="mx-auto max-w-7xl px-6 pb-16 text-sm text-muted">
          Catálogo total no MVP: {tools.length} ferramentas (dados de demonstração).
        </section>
      )}
    </div>
  );
}
