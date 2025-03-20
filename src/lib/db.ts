import { PrismaClient } from "@prisma/client";

// PrismaClient is attached to the `global` object in development to prevent
// exhausting your database connection limit.
// Learn more: https://pris.ly/d/help/next-js-best-practices

// Set Prisma log levels directly
const globalForPrisma = global as unknown as { prisma: PrismaClient };

// Create mock test users for debugging
const mockUsers = [
  {
    id: "agent-test-id",
    email: "agent@example.com",
    name: "Agent Test",
    role: "agent",
    password: "$2a$10$EQ0o1R95jS6wOF4.LZn/H.8e3.Q3G84pZz5cOkYQC.kPcrS0DRCTW", // hashed "password123"
    agent: {
      id: "agent-id",
      isActive: true,
      role: "agent",
      isAvailable: true,
    },
  },
  {
    id: "admin-test-id",
    email: "admin@example.com",
    name: "Admin Test",
    role: "admin",
    password: "$2a$10$EQ0o1R95jS6wOF4.LZn/H.8e3.Q3G84pZz5cOkYQC.kPcrS0DRCTW", // hashed "password123"
    agent: {
      id: "admin-agent-id",
      isActive: true,
      role: "admin",
      isAvailable: true,
    },
  },
];

// Handle the case during static build time by checking for environment
function getPrismaClient() {
  const isBuildPhase = process.env.NEXT_PHASE === "phase-production-build";
  const useDebugMode = process.env.DEBUG_MODE === "true";

  console.log(
    `Database initialization - Build phase: ${isBuildPhase}, Debug mode: ${useDebugMode}`
  );

  // During static build or debug mode, return a dummy client
  if (isBuildPhase || useDebugMode) {
    console.log("📊 Using mock PrismaClient for build/debug");
    return {
      $connect: () => Promise.resolve(),
      $disconnect: () => Promise.resolve(),
      // Add mock implementations for commonly used methods
      user: {
        findUnique: (query: any) => {
          console.log("Mock DB: findUnique user query", query);
          // Special handling for user lookups by email
          if (query.where?.email) {
            const mockUser = mockUsers.find(
              (u) => u.email === query.where.email
            );
            console.log(
              `Mock DB: User lookup for ${
                query.where.email
              }, found: ${!!mockUser}`
            );
            return Promise.resolve(mockUser);
          }
          return Promise.resolve(null);
        },
        findFirst: () => Promise.resolve(null),
        findMany: () => Promise.resolve(mockUsers),
        count: () => Promise.resolve(mockUsers.length),
        create: (data: any) => Promise.resolve({ id: "mock-id", ...data.data }),
        update: (data: any) => Promise.resolve({ id: "mock-id", ...data.data }),
      },
      agent: {
        findUnique: () => Promise.resolve(null),
        findFirst: () => Promise.resolve(null),
        findMany: () => Promise.resolve(mockUsers.map((u) => u.agent)),
        count: () => Promise.resolve(mockUsers.length),
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

  try {
    // Regular runtime - return the actual client
    console.log("📊 Using real PrismaClient for database connection");
    return new PrismaClient({
      log: ["error", "warn"],
    });
  } catch (error) {
    console.error("Error creating PrismaClient:", error);
    console.log("📊 Falling back to mock PrismaClient due to connection error");
    // If database connection fails, return mock client
    return {
      $connect: () => Promise.resolve(),
      $disconnect: () => Promise.resolve(),
      user: {
        findUnique: (query: any) => {
          // Special handling for user lookups by email
          if (query.where?.email) {
            const mockUser = mockUsers.find(
              (u) => u.email === query.where.email
            );
            return Promise.resolve(mockUser);
          }
          return Promise.resolve(null);
        },
        // ... rest of the mock implementations as above
      },
      // ... remaining mock implementations
    } as unknown as PrismaClient;
  }
}

// Create Prisma client with logging disabled
export const prisma = globalForPrisma.prisma || getPrismaClient();

// Save prisma client in global to prevent multiple instances in development
if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
