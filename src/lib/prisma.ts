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

export const prisma =
  globalForPrisma.prisma ?? new PrismaClient(prismaClientOptions);

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
