import { prisma } from "./prisma";
import type { Prisma } from "@/generated/prisma/client";
import type { Category, PricingPlan, ReviewSummary, Tool } from "./types";

const toolInclude = {
  category: true,
  tags: { include: { tag: true } },
  pricingPlans: true,
  reviews: {
    where: { status: "APPROVED" as const },
    include: { user: true },
    orderBy: { createdAt: "desc" as const },
  },
} satisfies Prisma.ToolInclude;

type ToolWithRelations = Prisma.ToolGetPayload<{ include: typeof toolInclude }>;

function mapPricingPlan(plan: {
  name: string;
  priceUsdCents: number | null;
  billingCycle: string | null;
  featuresJson: unknown;
}): PricingPlan {
  return {
    name: plan.name,
    priceUsdCents: plan.priceUsdCents,
    billingCycle: plan.billingCycle as PricingPlan["billingCycle"],
    features: Array.isArray(plan.featuresJson) ? (plan.featuresJson as string[]) : [],
  };
}

function mapReview(review: {
  id: string;
  rating: number;
  title: string;
  body: string;
  createdAt: Date;
  user: { name: string | null; email: string };
}): ReviewSummary {
  return {
    id: review.id,
    author: review.user.name ?? review.user.email.split("@")[0],
    rating: review.rating,
    title: review.title,
    body: review.body,
    createdAt: review.createdAt.toISOString().slice(0, 10),
  };
}

function mapTool(tool: ToolWithRelations): Tool {
  const reviews = tool.reviews.map(mapReview);
  const avgRating = reviews.length
    ? Math.round((reviews.reduce((s, r) => s + r.rating, 0) / reviews.length) * 10) / 10
    : 0;

  return {
    id: tool.id,
    slug: tool.slug,
    name: tool.name,
    tagline: tool.tagline,
    description: tool.description,
    websiteUrl: tool.websiteUrl,
    logoInitial: tool.name.charAt(0).toUpperCase(),
    pricingModel: tool.pricingModel,
    categorySlug: tool.category.slug,
    categoryName: tool.category.name,
    tags: tool.tags.map((t) => t.tag.name),
    pricingPlans: tool.pricingPlans.map(mapPricingPlan),
    reviews,
    avgRating,
    reviewCount: reviews.length,
  };
}

export async function getCategories(): Promise<Category[]> {
  const categories = await prisma.category.findMany({ orderBy: { name: "asc" } });
  return categories.map((c) => ({
    slug: c.slug,
    name: c.name,
    description: c.description ?? "",
  }));
}

export async function getCategoryBySlug(slug: string): Promise<Category | null> {
  const category = await prisma.category.findUnique({ where: { slug } });
  if (!category) return null;
  return { slug: category.slug, name: category.name, description: category.description ?? "" };
}

export async function getAllTools(): Promise<Tool[]> {
  const tools = await prisma.tool.findMany({ include: toolInclude, orderBy: { name: "asc" } });
  return tools.map(mapTool);
}

export async function getToolBySlug(slug: string): Promise<Tool | null> {
  const tool = await prisma.tool.findUnique({ where: { slug }, include: toolInclude });
  if (!tool) return null;
  return mapTool(tool);
}

export async function getToolsByCategory(categorySlug: string): Promise<Tool[]> {
  const tools = await prisma.tool.findMany({
    where: { category: { slug: categorySlug } },
    include: toolInclude,
    orderBy: { name: "asc" },
  });
  return tools.map(mapTool);
}

export async function searchTools(query: string): Promise<Tool[]> {
  const q = query.trim();
  if (!q) return getAllTools();

  const tools = await prisma.tool.findMany({
    where: {
      OR: [
        { name: { contains: q, mode: "insensitive" } },
        { tagline: { contains: q, mode: "insensitive" } },
        { category: { slug: { contains: q, mode: "insensitive" } } },
        { tags: { some: { tag: { name: { contains: q, mode: "insensitive" } } } } },
      ],
    },
    include: toolInclude,
    orderBy: { name: "asc" },
  });
  return tools.map(mapTool);
}

export function formatPrice(cents: number | null): string {
  if (cents === null) return "Sob consulta";
  if (cents === 0) return "Grátis";
  return `US$ ${(cents / 100).toFixed(2)}`;
}
