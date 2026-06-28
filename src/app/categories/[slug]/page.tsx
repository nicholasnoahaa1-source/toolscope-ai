import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import ToolCard from "@/components/ToolCard";
import { getCategories, getCategoryBySlug, getToolsByCategory } from "@/lib/data";

export async function generateStaticParams() {
  const categories = await getCategories();
  return categories.map((category) => ({ slug: category.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const category = await getCategoryBySlug(slug);
  if (!category) return {};
  return {
    title: `Melhores ferramentas de IA para ${category.name}`,
    description: category.description,
  };
}

export default async function CategoryPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const [category, categoryTools, categories] = await Promise.all([
    getCategoryBySlug(slug),
    getToolsByCategory(slug),
    getCategories(),
  ]);
  if (!category) notFound();

  return (
    <div className="mx-auto max-w-7xl px-6 py-10">
      <nav className="mb-6 text-sm text-muted">
        <Link href="/" className="hover:text-brand">Início</Link>
        {" / "}
        <span className="text-foreground">{category.name}</span>
      </nav>

      <h1 className="text-3xl font-bold text-foreground">{category.name}</h1>
      <p className="mt-2 max-w-2xl text-muted">{category.description}</p>

      <div className="mt-4 flex flex-wrap gap-2">
        {categories
          .filter((c) => c.slug !== slug)
          .map((c) => (
            <Link
              key={c.slug}
              href={`/categories/${c.slug}`}
              className="rounded-full border border-border px-3 py-1 text-xs font-medium text-muted hover:border-brand hover:text-brand"
            >
              {c.name}
            </Link>
          ))}
      </div>

      <div className="mt-8 mb-4 text-sm text-muted">
        {categoryTools.length} ferramenta(s) encontrada(s)
      </div>

      {categoryTools.length === 0 ? (
        <p className="text-muted">Ainda não há ferramentas cadastradas nesta categoria.</p>
      ) : (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {categoryTools.map((tool) => (
            <ToolCard key={tool.id} tool={tool} />
          ))}
        </div>
      )}
    </div>
  );
}
