import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma?: PrismaClient;
};

let cachedPrisma: PrismaClient | null = null;
let cachedStub: any = null;
let initFailed = false;

// Stub object that mimics Prisma's shape for build-time failures
const createStub = (): any => {
  if (cachedStub) return cachedStub;

  const modelStub = {
    findMany: async () => [],
    findUnique: async () => null,
    create: async () => ({}),
    update: async () => ({}),
    delete: async () => ({}),
    findFirst: async () => null,
  };

  cachedStub = {
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

  return cachedStub;
};

export const prisma: PrismaClient = new Proxy({} as PrismaClient, {
  get(target, prop) {
    // Handle special properties
    if (prop === Symbol.toStringTag || prop === "constructor") {
      return "PrismaClient";
    }

    // Return cached instance if available
    if (cachedPrisma) {
      return (cachedPrisma as any)[prop];
    }

    // Return global instance if available
    if (globalForPrisma.prisma) {
      cachedPrisma = globalForPrisma.prisma;
      return (cachedPrisma as any)[prop];
    }

    // If initialization failed before, return stub
    if (initFailed) {
      return (createStub() as any)[prop];
    }

    try {
      const databaseUrl = process.env.DATABASE_URL;

      // Skip initialization if DATABASE_URL is not available (build time)
      if (!databaseUrl) {
        initFailed = true;
        return (createStub() as any)[prop];
      }

      // Lazy import PrismaPg adapter only when needed
      const { PrismaPg } = require("@prisma/adapter-pg");

      // Initialize with adapter
      const adapter = new PrismaPg({ connectionString: databaseUrl });
      cachedPrisma = new PrismaClient({ adapter });

      if (process.env.NODE_ENV !== "production") {
        globalForPrisma.prisma = cachedPrisma;
      }

      return (cachedPrisma as any)[prop];
    } catch (e) {
      // On error, use stub for graceful degradation
      initFailed = true;
      return (createStub() as any)[prop];
    }
  },
});
