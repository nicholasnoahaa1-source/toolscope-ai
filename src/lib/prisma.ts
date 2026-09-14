let cachedPrisma: any = null;
let initError: Error | null = null;

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

const getPrisma = (): any => {
  // Check if we're in a build environment (Vercel, GitHub Actions, etc)
  const isBuildEnv =
    process.env.VERCEL === "1" ||
    process.env.VERCEL === "true" ||
    process.env.CI === "true" ||
    process.env.GITHUB_ACTIONS === "true" ||
    process.env.NETLIFY === "true" ||
    process.env.BUILD_ID !== undefined ||
    process.env.AWS_LAMBDA_FUNCTION_NAME !== undefined;

  const isDatabaseUnavailable = !process.env.DATABASE_URL;

  if (isBuildEnv || isDatabaseUnavailable) {
    return prismaStub;
  }

  if (cachedPrisma) return cachedPrisma;

  // If we previously hit an error, use stub
  if (initError) {
    return prismaStub;
  }

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
    initError = e as Error;
    return prismaStub;
  }
};

export const prisma = new Proxy({} as any, {
  get(target, prop) {
    const client = getPrisma();
    return (client as any)[prop];
  },
});
