import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

// PrismaClient is attached to the `global` object in development to prevent
// exhausting your database connection limit.
// Learn more: https://pris.ly/d/help/next-js-best-practices

// Set Prisma log levels directly
const globalForPrisma = global as unknown as { prisma: PrismaClient };

// Mock hashed passwords for test users
const TEST_PASSWORD_HASH = bcrypt.hashSync("password123", 10);

// Test user data for mocking
const TEST_USERS = [
  {
    id: "agent-test-id",
    email: "agent@example.com",
    name: "Agent Test",
    password: TEST_PASSWORD_HASH,
    role: "agent",
    agent: {
      id: "agent-id",
      userId: "agent-test-id",
      isActive: true,
      isAvailable: true,
      role: "agent",
      lastActive: new Date(),
    },
  },
  {
    id: "admin-test-id",
    email: "admin@example.com",
    name: "Admin Test",
    password: TEST_PASSWORD_HASH,
    role: "admin",
    agent: {
      id: "admin-agent-id",
      userId: "admin-test-id",
      isActive: true,
      isAvailable: true,
      role: "admin",
      lastActive: new Date(),
    },
  },
];

// Mock implementation of PrismaClient
const createMockPrismaClient = () => {
  console.log("🔄 Creating MOCK PrismaClient for testing");

  return {
    user: {
      findUnique: async ({ where }: Record<string, any>) => {
        console.log("MOCK DB: Finding user with criteria:", where);

        if (where.email) {
          const user = TEST_USERS.find((u) => u.email === where.email);
          console.log("MOCK DB: User found?", !!user, where.email);
          return user || null;
        }

        if (where.id) {
          const user = TEST_USERS.find((u) => u.id === where.id);
          console.log("MOCK DB: User found?", !!user, where.id);
          return user || null;
        }

        return null;
      },
      create: async () => ({ id: "mock-created-user" }),
      update: async () => ({ id: "mock-updated-user" }),
    },
    agent: {
      findUnique: async ({ where }: Record<string, any>) => {
        console.log("MOCK DB: Finding agent with criteria:", where);

        if (where.id) {
          const user = TEST_USERS.find((u) => u.agent.id === where.id);
          return user ? user.agent : null;
        }

        if (where.userId) {
          const user = TEST_USERS.find((u) => u.id === where.userId);
          return user ? user.agent : null;
        }

        return null;
      },
      findMany: async () => TEST_USERS.map((u) => u.agent),
      update: async ({ where, data }: Record<string, any>) => {
        console.log("MOCK DB: Updating agent:", where, data);
        return { id: where.id, ...data };
      },
    },
    chatSession: {
      findMany: async () => [],
      findUnique: async () => null,
      create: async () => ({ id: "mock-session-id", createdAt: new Date() }),
      update: async () => ({}),
      upsert: async () => ({}),
      count: async (query: any) => {
        console.log("MOCK DB: ChatSession count called with query:", query);
        // Always return 0 for simplicity
        return 0;
      },
    },
    message: {
      findMany: async () => [],
      create: async () => ({ id: "mock-message-id" }),
    },
    session: {
      findUnique: async () => null,
      create: async () => ({ id: "mock-session-id" }),
      update: async () => ({ id: "mock-session-id", updated: true }),
    },
    $connect: async () => {
      console.log("MOCK DB: Connecting to mock database");
      return Promise.resolve();
    },
    $disconnect: async () => {
      console.log("MOCK DB: Disconnecting from mock database");
      return Promise.resolve();
    },
  } as unknown as PrismaClient;
};

// Create a real or mock PrismaClient instance
const getPrismaClient = (): PrismaClient => {
  const isMockMode =
    process.env.MOCK_DB === "true" ||
    process.env.DEBUG_MODE === "true" ||
    process.env.ALLOW_DEBUG_LOGIN === "true";

  console.log(
    `DB Client initialization - DEBUG_MODE: ${process.env.DEBUG_MODE}, MOCK_DB: ${process.env.MOCK_DB}`
  );

  if (isMockMode) {
    console.log(
      "🧪 Using MOCK Prisma client due to DEBUG_MODE or MOCK_DB being true"
    );
    return createMockPrismaClient();
  }

  try {
    console.log("🔌 Creating REAL PrismaClient for production");
    return new PrismaClient();
  } catch (error) {
    console.error(
      "⚠️ Failed to create real PrismaClient - falling back to mock:",
      error
    );
    return createMockPrismaClient();
  }
};

// Declare global type to help TypeScript understand the global prisma instance
declare global {
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined;
}

// Initialize the client with singleton pattern for hot reloading
const prismaClient = global.prisma || getPrismaClient();

// Save prisma client in global to prevent multiple instances in development
if (process.env.NODE_ENV !== "production") {
  global.prisma = prismaClient;
  console.log("✅ PrismaClient initialized and saved globally");
} else {
  console.log("✅ PrismaClient initialized for production");
}

export const prisma = prismaClient;
