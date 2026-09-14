import type { PrismaClient } from "@prisma/client";

const modelStub = {
  findMany: async () => [],
  findUnique: async () => null,
  create: async () => ({}),
  update: async () => ({}),
  delete: async () => ({}),
  findFirst: async () => null,
};

const prismaStub: any = {
  $connect: async () => {},
  $disconnect: async () => {},
  category: modelStub,
  tool: modelStub,
  analyticsMetric: modelStub,
  analyticsContentGenerated: modelStub,
  analyticsContentPublished: modelStub,
  analyticsSyncLog: modelStub,
  tag: modelStub,
  pricingPlan: modelStub,
  user: modelStub,
  review: modelStub,
  benchmark: modelStub,
  favorite: modelStub,
  collection: modelStub,
  collectionTool: modelStub,
  workflow: modelStub,
  workflowStep: modelStub,
  workflowTool: modelStub,
  toolTag: modelStub,
  toolEmbedding: modelStub,
};

let cachedPrisma: any = null;

const getPrisma = (): any => {
  // During Vercel builds or when DATABASE_URL is unavailable, use stub immediately
  if (process.env.VERCEL === "1" || !process.env.DATABASE_URL) {
    return prismaStub;
  }

  if (cachedPrisma) return cachedPrisma;

  const globalForPrisma = globalThis as unknown as { prisma?: any };
  if (globalForPrisma.prisma) {
    cachedPrisma = globalForPrisma.prisma;
    return cachedPrisma;
  }

  try {
    const { PrismaClient } = require("@prisma/client");
    const { PrismaPg } = require("@prisma/adapter-pg");
    const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
    cachedPrisma = new PrismaClient({ adapter });

    if (process.env.NODE_ENV !== "production") {
      globalForPrisma.prisma = cachedPrisma;
    }

    return cachedPrisma;
  } catch (e) {
    return prismaStub;
  }
};

export const prisma = new Proxy({} as PrismaClient, {
  get(target, prop) {
    const client = getPrisma();
    return (client as any)[prop];
  },
});
