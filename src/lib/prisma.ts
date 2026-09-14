import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma?: PrismaClient;
};

let cachedPrisma: PrismaClient | null = null;

export const prisma: PrismaClient = new Proxy({} as PrismaClient, {
  get(target, prop) {
    if (cachedPrisma) return (cachedPrisma as any)[prop];
    if (globalForPrisma.prisma) {
      cachedPrisma = globalForPrisma.prisma;
      return (cachedPrisma as any)[prop];
    }

    // Initialize on first access
    let options: any = {};
    const databaseUrl = process.env.DATABASE_URL;

    if (databaseUrl) {
      try {
        const adapter = new PrismaPg({ connectionString: databaseUrl });
        options = { adapter };
      } catch (e) {
        // Silently handle adapter errors
      }
    }

    try {
      cachedPrisma = new PrismaClient(
        Object.keys(options).length > 0 ? options : {}
      );
    } catch (e) {
      try {
        cachedPrisma = new PrismaClient();
      } catch {
        throw new Error("Failed to initialize PrismaClient");
      }
    }

    if (process.env.NODE_ENV !== "production") {
      globalForPrisma.prisma = cachedPrisma;
    }

    return (cachedPrisma as any)[prop];
  },
});
