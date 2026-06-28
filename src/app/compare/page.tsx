import Link from "next/link";
import type { Metadata } from "next";
import { formatPrice, getAllTools } from "@/lib/data";

export const metadata: Metadata = {
  title: "Comparador de ferramentas de IA",
  description: "Compare preço, categoria, avaliação e tags de várias ferramentas de IA lado a lado.",
};

function parseSlugs(raw?: string): string[] {
  if (!raw) return [];
  return raw.split(",").map((s) => s.trim()).filter(Boolean);
}

function buildHref(currentSlugs: string[], slug: string): string {
  const isSelected = currentSlugs.includes(slug);
  const next = isSelected
    ? currentSlugs.filter((s) => s !== slug)
    : [...currentSlugs, slug].slice(-4); // máximo 4 ferramentas por comparação
  return next.length ? `/compare?tools=${next.join(",")}` : "/compare";
}

export default async function ComparePage({
  searchParams,
}: {
  searchParams: Promise<{ tools?: string }>;
}) {
  const { tools: toolsParam } = await searchParams;
  const selectedSlugs = parseSlugs(toolsParam);
  const tools = await getAllTools();
  const selectedTools = tools.filter((t) => selectedSlugs.includes(t.slug));

  return (
    <div className="mx-auto max-w-7xl px-6 py-10">
      <h1 className="text-3xl font-bold text-foreground">Comparador de ferramentas</h1>
      <p className="mt-2 max-w-2xl text-muted">
        Selecione até 4 ferramentas para comparar preço, categoria, avaliação e recursos lado a lado.
      </p>

      <div className="mt-6 flex flex-wrap gap-2">
        {tools.map((tool) => {
          const selected = selectedSlugs.includes(tool.slug);
          return (
            <Link
              key={tool.slug}
              href={buildHref(selectedSlugs, tool.slug)}
              className={`rounded-full border px-3 py-1.5 text-sm font-medium transition ${
                selected
                  ? "border-brand bg-brand text-white"
                  : "border-border text-muted hover:border-brand hover:text-brand"
              }`}
            >
              {selected ? "✓ " : "+ "}
              {tool.name}
            </Link>
          );
        })}
      </div>

      {selectedTools.length === 0 ? (
        <p className="mt-10 text-muted">Nenhuma ferramenta selecionada ainda. Clique nas opções acima.</p>
      ) : (
        <div className="mt-10 overflow-x-auto">
          <table className="w-full min-w-[640px] border-collapse text-left text-sm">
            <thead>
              <tr>
                <th className="w-40 border-b border-border pb-3 text-muted">Critério</th>
                {selectedTools.map((tool) => (
                  <th key={tool.slug} className="border-b border-border pb-3">
                    <Link href={`/tools/${tool.slug}`} className="font-semibold text-foreground hover:text-brand">
                      {tool.name}
                    </Link>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="border-b border-border py-3 text-muted">Categoria</td>
                {selectedTools.map((tool) => (
                  <td key={tool.slug} className="border-b border-border py-3">
                    {tool.categoryName}
                  </td>
                ))}
              </tr>
              <tr>
                <td className="border-b border-border py-3 text-muted">Avaliação</td>
                {selectedTools.map((tool) => (
                  <td key={tool.slug} className="border-b border-border py-3">
                    <span className="text-amber-500">★</span> {tool.avgRating || "—"} ({tool.reviewCount})
                  </td>
                ))}
              </tr>
              <tr>
                <td className="border-b border-border py-3 text-muted">Modelo de preço</td>
                {selectedTools.map((tool) => (
                  <td key={tool.slug} className="border-b border-border py-3">
                    {tool.pricingModel}
                  </td>
                ))}
              </tr>
              <tr>
                <td className="border-b border-border py-3 text-muted">Planos</td>
                {selectedTools.map((tool) => (
                  <td key={tool.slug} className="border-b border-border py-3">
                    <ul className="space-y-1">
                      {tool.pricingPlans.map((p) => (
                        <li key={p.name}>
                          {p.name}: {formatPrice(p.priceUsdCents)}
                        </li>
                      ))}
                    </ul>
                  </td>
                ))}
              </tr>
              <tr>
                <td className="py-3 align-top text-muted">Tags</td>
                {selectedTools.map((tool) => (
                  <td key={tool.slug} className="py-3 align-top">
                    <div className="flex flex-wrap gap-1">
                      {tool.tags.map((tag) => (
                        <span key={tag} className="rounded-full bg-foreground/5 px-2 py-0.5 text-xs text-muted">
                          #{tag}
                        </span>
                      ))}
                    </div>
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
