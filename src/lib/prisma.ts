import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

let prismaClientOptions: any = {};

// Only use PrismaPg adapter for PostgreSQL (matching the schema provider)
const databaseUrl = process.env.DATABASE_URL;

if (databaseUrl) {
  try {
    const adapter = new PrismaPg({ connectionString: databaseUrl });
    prismaClientOptions = { adapter };
  } catch (error) {
    console.warn("Failed to initialize PrismaPg adapter", error);
  }
}

let prisma: PrismaClient;
if (globalForPrisma.prisma) {
  prisma = globalForPrisma.prisma;
} else {
  try {
    // Prisma 7 requires an adapter for PostgreSQL provider
    if (Object.keys(prismaClientOptions).length > 0) {
      prisma = new PrismaClient(prismaClientOptions);
    } else {
      // Try without adapter (might fail if DATABASE_URL is not set)
      prisma = new PrismaClient();
    }
  } catch (error) {
    console.warn("Failed to initialize Prisma client", error);
    // Try one more time without options
    try {
      prisma = new PrismaClient();
    } catch (finalError) {
      console.error("Critical: Cannot instantiate PrismaClient", finalError);
      throw finalError;
    }
  }
}

export { prisma };

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
