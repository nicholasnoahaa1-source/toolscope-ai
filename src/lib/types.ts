export type PricingModel =
  | "FREE"
  | "FREEMIUM"
  | "PAID"
  | "USAGE_BASED"
  | "CONTACT_SALES";

export type PricingPlan = {
  name: string;
  priceUsdCents: number | null;
  billingCycle: "monthly" | "yearly" | "one_time" | "usage" | null;
  features: string[];
};

export type ReviewSummary = {
  id: string;
  author: string;
  rating: number;
  title: string;
  body: string;
  createdAt: string;
};

export type Tool = {
  id: string;
  slug: string;
  name: string;
  tagline: string;
  description: string;
  websiteUrl: string;
  logoInitial: string;
  pricingModel: PricingModel;
  categorySlug: string;
  categoryName: string;
  tags: string[];
  pricingPlans: PricingPlan[];
  reviews: ReviewSummary[];
  avgRating: number;
  reviewCount: number;
};

export type Category = {
  slug: string;
  name: string;
  description: string;
};
