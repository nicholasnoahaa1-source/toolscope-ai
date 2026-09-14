// Check build environment at module load time
const isBuildEnvAtLoad =
  process.env.VERCEL === "1" ||
  process.env.VERCEL === "true" ||
  process.env.CI === "true" ||
  process.env.GITHUB_ACTIONS === "true" ||
  process.env.NETLIFY === "true" ||
  process.env.BUILD_ID !== undefined ||
  process.env.AWS_LAMBDA_FUNCTION_NAME !== undefined;

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
  // If we detected build environment at module load time, use stub immediately
  if (isBuildEnvAtLoad) {
    return prismaStub;
  }

  // Also check at runtime in case environment changed
  const isDatabaseUnavailable = !process.env.DATABASE_URL;
  if (isDatabaseUnavailable) {
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
    // Wrap the requires in a secondary try-catch
    let PrismaClient: any;
    let PrismaPg: any;

    try {
      PrismaClient = require("@prisma/client").PrismaClient;
    } catch (e) {
      // If we can't load @prisma/client, fall back to stub
      initError = e as Error;
      return prismaStub;
    }

    try {
      PrismaPg = require("@prisma/adapter-pg").PrismaPg;
    } catch (e) {
      // If we can't load @prisma/adapter-pg, fall back to stub
      initError = e as Error;
      return prismaStub;
    }

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
    // Handle internal properties and inspection methods
    if (prop === Symbol.toStringTag || prop === "constructor" || prop === Symbol.toPrimitive) {
      return undefined;
    }

    const client = getPrisma();
    return (client as any)[prop];
  },

  has(target, prop) {
    // Return true for known model names to help with property checks
    const knownModels = [
      "category", "tool", "analyticsMetric", "analyticsContentGenerated",
      "analyticsContentPublished", "analyticsSyncLog", "tag", "pricingPlan",
      "user", "review", "benchmark", "favorite", "collection", "collectionTool",
      "workflow", "workflowStep", "workflowTool", "toolTag", "toolEmbedding",
      "$connect", "$disconnect"
    ];
    return knownModels.includes(String(prop));
  },

  ownKeys(target) {
    // Return known model names for Object.keys() and similar operations
    return [
      "category", "tool", "analyticsMetric", "analyticsContentGenerated",
      "analyticsContentPublished", "analyticsSyncLog", "tag", "pricingPlan",
      "user", "review", "benchmark", "favorite", "collection", "collectionTool",
      "workflow", "workflowStep", "workflowTool", "toolTag", "toolEmbedding",
      "$connect", "$disconnect"
    ];
  },

  getOwnPropertyDescriptor(target, prop) {
    // Describe properties for introspection
    const knownModels = [
      "category", "tool", "analyticsMetric", "analyticsContentGenerated",
      "analyticsContentPublished", "analyticsSyncLog", "tag", "pricingPlan",
      "user", "review", "benchmark", "favorite", "collection", "collectionTool",
      "workflow", "workflowStep", "workflowTool", "toolTag", "toolEmbedding",
      "$connect", "$disconnect"
    ];

    if (knownModels.includes(String(prop))) {
      return { configurable: true, enumerable: true, value: {} };
    }
    return undefined;
  }
});
