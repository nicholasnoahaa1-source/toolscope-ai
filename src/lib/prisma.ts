import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma?: PrismaClient;
};

let cachedPrisma: PrismaClient | null = null;
let initError: Error | null = null;

export const prisma: PrismaClient = new Proxy({} as PrismaClient, {
  get(target, prop) {
    // Check if we already have a cached instance or global one
    if (cachedPrisma) {
      return (cachedPrisma as any)[prop];
    }

    if (globalForPrisma.prisma) {
      cachedPrisma = globalForPrisma.prisma;
      return (cachedPrisma as any)[prop];
    }

    // If we already tried to initialize and failed, return stub
    if (initError) {
      return undefined;
    }

    try {
      const databaseUrl = process.env.DATABASE_URL;

      let options: any = {};
      if (databaseUrl) {
        const adapter = new PrismaPg({ connectionString: databaseUrl });
        options = { adapter };
      }

      cachedPrisma = new PrismaClient(
        Object.keys(options).length > 0 ? options : undefined
      );

      if (process.env.NODE_ENV !== "production") {
        globalForPrisma.prisma = cachedPrisma;
      }

      return (cachedPrisma as any)[prop];
    } catch (e) {
      // Cache the error and return undefined to allow graceful degradation
      initError = e instanceof Error ? e : new Error(String(e));
      return undefined;
    }
  },
});
