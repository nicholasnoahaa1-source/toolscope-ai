import { PrismaClient } from "@prisma/client";

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

let cachedPrisma: PrismaClient | null = null;

const getPrisma = (): PrismaClient | any => {
  // During Vercel builds, always use stub to avoid initialization issues
  if (process.env.VERCEL === "1") {
    return prismaStub;
  }

  if (cachedPrisma) return cachedPrisma;

  const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };
  if (globalForPrisma.prisma) {
    cachedPrisma = globalForPrisma.prisma;
    return cachedPrisma;
  }

  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    return prismaStub;
  }

  try {
    const { PrismaPg } = require("@prisma/adapter-pg");
    const adapter = new PrismaPg({ connectionString: databaseUrl });
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
