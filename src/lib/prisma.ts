import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma?: PrismaClient;
};

let cachedPrisma: PrismaClient | null = null;

const prisma: PrismaClient = (() => {
  // Return cached instance if available
  if (cachedPrisma) {
    return cachedPrisma;
  }

  if (globalForPrisma.prisma) {
    cachedPrisma = globalForPrisma.prisma;
    return cachedPrisma;
  }

  let options: any = {};
  const databaseUrl = process.env.DATABASE_URL;

  // Only create adapter if DATABASE_URL is provided
  if (databaseUrl) {
    try {
      const adapter = new PrismaPg({ connectionString: databaseUrl });
      options = { adapter };
    } catch (error) {
      console.warn("Failed to initialize PrismaPg adapter:", error instanceof Error ? error.message : String(error));
    }
  }

  try {
    // Try to instantiate with options (if DATABASE_URL was set)
    cachedPrisma = new PrismaClient(options);
  } catch (error) {
    console.warn("Failed to initialize Prisma client:", error instanceof Error ? error.message : String(error));
    // Fallback: try without any options
    try {
      cachedPrisma = new PrismaClient();
    } catch (finalError) {
      console.error("Critical: Cannot instantiate PrismaClient:", finalError instanceof Error ? finalError.message : String(finalError));
      throw finalError;
    }
  }

  if (process.env.NODE_ENV !== "production") {
    globalForPrisma.prisma = cachedPrisma;
  }

  return cachedPrisma;
})() as PrismaClient;

export { prisma };

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
