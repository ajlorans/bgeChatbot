import { PrismaClient } from "@prisma/client";

// PrismaClient is attached to the `global` object in development to prevent
// exhausting your database connection limit.
// Learn more: https://pris.ly/d/help/next-js-best-practices

// Set Prisma log levels directly
const globalForPrisma = global as unknown as { prisma: PrismaClient };

// Create Prisma client with logging disabled
export const prisma = globalForPrisma.prisma || 
  new PrismaClient({
    log: ["error", "warn"],
  });

// Save prisma client in global to prevent multiple instances in development
if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
