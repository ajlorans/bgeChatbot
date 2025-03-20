import { PrismaClient } from "@prisma/client";

// PrismaClient is attached to the `global` object in development to prevent
// exhausting your database connection limit.
// Learn more: https://pris.ly/d/help/next-js-best-practices

// Set Prisma log levels directly
const globalForPrisma = global as unknown as { prisma: PrismaClient };

// Handle the case during static build time by checking for environment
function getPrismaClient() {
  // During static build, return a dummy client to avoid connecting to the DB
  if (process.env.NEXT_PHASE === "phase-production-build") {
    console.log("📊 Using mock PrismaClient during build phase");
    return {
      $connect: () => Promise.resolve(),
      $disconnect: () => Promise.resolve(),
      // Add mock implementations for commonly used methods
      user: {
        findUnique: () => Promise.resolve(null),
        findFirst: () => Promise.resolve(null),
        findMany: () => Promise.resolve([]),
        count: () => Promise.resolve(0),
        create: (data: any) => Promise.resolve({ id: "mock-id", ...data.data }),
        update: (data: any) => Promise.resolve({ id: "mock-id", ...data.data }),
      },
      agent: {
        findUnique: () => Promise.resolve(null),
        findFirst: () => Promise.resolve(null),
        findMany: () => Promise.resolve([]),
        count: () => Promise.resolve(0),
        create: (data: any) => Promise.resolve({ id: "mock-id", ...data.data }),
        update: (data: any) => Promise.resolve({ id: "mock-id", ...data.data }),
      },
      chatSession: {
        findUnique: () => Promise.resolve(null),
        findFirst: () => Promise.resolve(null),
        findMany: () => Promise.resolve([]),
        count: () => Promise.resolve(0),
        create: (data: any) => Promise.resolve({ id: "mock-id", ...data.data }),
        update: (data: any) => Promise.resolve({ id: "mock-id", ...data.data }),
      },
      message: {
        findMany: () => Promise.resolve([]),
        count: () => Promise.resolve(0),
        create: (data: any) => Promise.resolve({ id: "mock-id", ...data.data }),
      },
      session: {
        findUnique: () => Promise.resolve(null),
        findFirst: () => Promise.resolve(null),
        findMany: () => Promise.resolve([]),
        create: (data: any) => Promise.resolve({ id: "mock-id", ...data.data }),
        delete: () => Promise.resolve({ id: "mock-id" }),
      },
      $queryRaw: () => Promise.resolve([{ count: 0 }]),
      $transaction: (queries: any) => Promise.resolve(queries.map(() => ({}))),
    } as unknown as PrismaClient;
  }

  // Regular runtime - return the actual client
  return new PrismaClient({
    log: ["error", "warn"],
  });
}

// Create Prisma client with logging disabled
export const prisma = globalForPrisma.prisma || getPrismaClient();

// Save prisma client in global to prevent multiple instances in development
if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
