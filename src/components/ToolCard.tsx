import Link from "next/link";
import type { Tool } from "@/lib/types";
import { formatPrice } from "@/lib/data";

export default function ToolCard({ tool }: { tool: Tool }) {
  const cheapestPaid = tool.pricingPlans.find((p) => (p.priceUsdCents ?? 0) > 0);

  return (
    <Link
      href={`/tools/${tool.slug}`}
      className="group flex flex-col rounded-2xl border border-border bg-surface p-5 transition hover:-translate-y-0.5 hover:shadow-lg hover:shadow-brand/5"
    >
      <div className="mb-4 flex items-center gap-3">
        <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand/10 text-base font-bold text-brand">
          {tool.logoInitial}
        </span>
        <div>
          <h3 className="font-semibold text-foreground group-hover:text-brand">{tool.name}</h3>
          <span className="text-xs text-muted">{tool.categoryName}</span>
        </div>
      </div>

      <p className="mb-4 line-clamp-2 text-sm text-muted">{tool.tagline}</p>

      <div className="mt-auto flex items-center justify-between text-sm">
        <div className="flex items-center gap-1 font-medium text-foreground">
          <span className="text-amber-500">★</span>
          {tool.avgRating || "—"}
          <span className="text-muted">({tool.reviewCount})</span>
        </div>
        <span className="text-muted">
          {tool.pricingModel === "FREEMIUM" || tool.pricingModel === "FREE"
            ? "Grátis disponível"
            : cheapestPaid
            ? `A partir de ${formatPrice(cheapestPaid.priceUsdCents)}`
            : "Sob consulta"}
        </span>
      </div>
    </Link>
  );
}
