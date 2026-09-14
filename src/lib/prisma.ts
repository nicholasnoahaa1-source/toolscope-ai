import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

let prismaClientOptions: any = {};

// Only use PrismaPg adapter if DATABASE_URL is available (runtime)
if (process.env.DATABASE_URL) {
  try {
    const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
    prismaClientOptions = { adapter };
  } catch (error) {
    console.warn("Failed to initialize PrismaPg adapter, using default", error);
  }
}

let prisma: PrismaClient;
if (globalForPrisma.prisma) {
  prisma = globalForPrisma.prisma;
} else {
  try {
    prisma = new PrismaClient(prismaClientOptions);
  } catch (error) {
    console.warn("Failed to initialize Prisma client with adapter, using default", error);
    // Fallback to basic client without options for build-time safety
    prisma = new PrismaClient();
  }
}

export { prisma };

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
