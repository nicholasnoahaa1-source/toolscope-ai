import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { formatPrice, getToolBySlug } from "@/lib/data";
import { prisma } from "@/lib/prisma";

export async function generateStaticParams() {
  const tools = await prisma.tool.findMany({ select: { slug: true } });
  return tools.map((tool) => ({ slug: tool.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const tool = await getToolBySlug(slug);
  if (!tool) return {};
  return {
    title: `${tool.name} — preço, reviews e alternativas`,
    description: tool.tagline,
  };
}

export default async function ToolPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const tool = await getToolBySlug(slug);
  if (!tool) notFound();

  return (
    <div className="mx-auto max-w-5xl px-6 py-10">
      <nav className="mb-6 text-sm text-muted">
        <Link href="/" className="hover:text-brand">Início</Link>
        {" / "}
        <Link href={`/categories/${tool.categorySlug}`} className="hover:text-brand">
          {tool.categoryName}
        </Link>
        {" / "}
        <span className="text-foreground">{tool.name}</span>
      </nav>

      <div className="flex flex-wrap items-start justify-between gap-6 border-b border-border pb-8">
        <div className="flex items-start gap-4">
          <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-brand/10 text-xl font-bold text-brand">
            {tool.logoInitial}
          </span>
          <div>
            <h1 className="text-2xl font-bold text-foreground">{tool.name}</h1>
            <p className="mt-1 text-muted">{tool.tagline}</p>
            <div className="mt-2 flex items-center gap-2 text-sm">
              <span className="flex items-center gap-1 font-medium text-foreground">
                <span className="text-amber-500">★</span>
                {tool.avgRating || "—"}
              </span>
              <span className="text-muted">({tool.reviewCount} reviews)</span>
            </div>
          </div>
        </div>

        <div className="flex gap-3">
          <Link
            href={`/compare?tools=${tool.slug}`}
            className="rounded-full border border-border px-5 py-2.5 text-sm font-medium hover:border-brand hover:text-brand"
          >
            Comparar
          </Link>
          <a
            href={tool.websiteUrl}
            target="_blank"
            rel="noopener noreferrer nofollow"
            className="rounded-full bg-brand px-5 py-2.5 text-sm font-medium text-white hover:bg-brand-dark"
          >
            Visitar site
          </a>
        </div>
      </div>

      <div className="grid gap-10 py-8 md:grid-cols-3">
        <div className="md:col-span-2">
          <h2 className="mb-3 text-lg font-semibold text-foreground">Sobre</h2>
          <p className="leading-relaxed text-muted">{tool.description}</p>

          <div className="mt-6 flex flex-wrap gap-2">
            {tool.tags.map((tag) => (
              <span key={tag} className="rounded-full bg-foreground/5 px-3 py-1 text-xs text-muted">
                #{tag}
              </span>
            ))}
          </div>

          <h2 className="mb-3 mt-10 text-lg font-semibold text-foreground">
            Reviews ({tool.reviewCount})
          </h2>
          <div className="space-y-4">
            {tool.reviews.map((review) => (
              <div key={review.id} className="rounded-xl border border-border p-4">
                <div className="mb-1 flex items-center justify-between">
                  <span className="font-medium text-foreground">{review.title}</span>
                  <span className="flex items-center gap-1 text-sm text-amber-500">
                    ★ {review.rating}
                  </span>
                </div>
                <p className="text-sm text-muted">{review.body}</p>
                <span className="mt-2 block text-xs text-muted">
                  {review.author} · {review.createdAt}
                </span>
              </div>
            ))}
          </div>
        </div>

        <aside>
          <h2 className="mb-3 text-lg font-semibold text-foreground">Planos de preço</h2>
          <div className="space-y-3">
            {tool.pricingPlans.map((plan) => (
              <div key={plan.name} className="rounded-xl border border-border p-4">
                <div className="flex items-center justify-between">
                  <span className="font-medium text-foreground">{plan.name}</span>
                  <span className="text-sm font-semibold text-brand">
                    {formatPrice(plan.priceUsdCents)}
                    {plan.billingCycle === "monthly" && plan.priceUsdCents ? "/mês" : ""}
                  </span>
                </div>
                <ul className="mt-2 space-y-1 text-sm text-muted">
                  {plan.features.map((f) => (
                    <li key={f}>· {f}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </aside>
      </div>
    </div>
  );
}
