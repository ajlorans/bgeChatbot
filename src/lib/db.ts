import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

// PrismaClient is attached to the `global` object in development to prevent
// exhausting your database connection limit.
// Learn more: https://pris.ly/d/help/next-js-best-practices

// Define global for PrismaClient - prevents multiple instances during hot reloading
// See: https://www.prisma.io/docs/guides/other/troubleshooting-orm/help-articles/nextjs-prisma-client-dev-practices
const globalForPrisma = global as unknown as {
  prisma: PrismaClient | undefined;
};

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

// Mock users for testing
const mockUsers = [
  {
    id: "agent-test-id",
    email: "agent@example.com",
    name: "Agent Test",
    password: "$2a$10$EYMPUt46Pap.aH8.8CZl8.PZ0ZM2TV0DZfBJQqJv4yvRZLL2WNLDe", // password123
    role: "agent",
    agent: {
      id: "agent-id",
      userId: "agent-test-id",
      role: "agent",
      isActive: true,
      isAvailable: true,
      lastActive: new Date(),
    },
  },
  {
    id: "admin-test-id",
    email: "admin@example.com",
    name: "Admin Test",
    password: "$2a$10$EYMPUt46Pap.aH8.8CZl8.PZ0ZM2TV0DZfBJQqJv4yvRZLL2WNLDe", // password123
    role: "admin",
    agent: {
      id: "admin-agent-id",
      userId: "admin-test-id",
      role: "admin",
      isActive: true,
      isAvailable: true,
      lastActive: new Date(),
    },
  },
];

// Types for our mock database
type WhereCondition = {
  id?: string;
  email?: string;
  userId?: string;
  [key: string]: any;
};

type DataPayload = {
  data: Record<string, any>;
  [key: string]: any;
};

// Create a mock Prisma client for development and testing
// This helps when the real database is unavailable or for debugging
class MockPrismaClient {
  user = {
    findUnique: async ({ where }: { where: WhereCondition }) => {
      console.log("MOCK DB: Finding user with criteria:", where);
      let foundUser = null;

      if (where.id) {
        foundUser = mockUsers.find((user) => user.id === where.id);
      } else if (where.email) {
        foundUser = mockUsers.find((user) => user.email === where.email);
      }

      console.log("MOCK DB: User found?", !!foundUser, foundUser?.id);
      return foundUser ? { ...foundUser } : null;
    },
    create: async (data: DataPayload) => {
      console.log("MOCK DB: Creating user:", data);
      return { id: `mock-${Date.now()}`, ...data.data };
    },
  };

  agent = {
    findUnique: async ({ where }: { where: WhereCondition }) => {
      console.log("MOCK DB: Finding agent with criteria:", where);
      const foundUser = mockUsers.find((user) => user.agent.id === where.id);
      if (foundUser) {
        console.log("MOCK DB: Agent found:", foundUser.agent.id);
        return { ...foundUser.agent, user: foundUser };
      }
      return null;
    },
    update: async ({
      where,
      data,
    }: {
      where: WhereCondition;
      data: Record<string, any>;
    }) => {
      console.log("MOCK DB: Updating agent:", where, data);
      const foundUser = mockUsers.find((user) => user.agent.id === where.id);
      if (foundUser) {
        Object.assign(foundUser.agent, data);
        return { ...foundUser.agent };
      }
      return null;
    },
  };

  chatSession = {
    count: async ({ where }: { where: WhereCondition }) => {
      console.log("MOCK DB: Counting chat sessions with criteria:", where);
      return 0; // Always return 0 for mock
    },
    findMany: async () => {
      console.log("MOCK DB: Finding many chat sessions");
      return []; // Return empty array
    },
    create: async (data: DataPayload) => {
      console.log("MOCK DB: Creating chat session:", data);
      return { id: `mock-session-${Date.now()}`, ...data.data };
    },
    update: async ({
      where,
      data,
    }: {
      where: WhereCondition;
      data: Record<string, any>;
    }) => {
      console.log("MOCK DB: Updating chat session:", where, data);
      return { id: where.id, ...data };
    },
  };

  message = {
    findMany: async () => {
      console.log("MOCK DB: Finding many messages");
      return []; // Return empty array
    },
    create: async (data: DataPayload) => {
      console.log("MOCK DB: Creating message:", data);
      return { id: `mock-msg-${Date.now()}`, ...data.data };
    },
  };

  // Add a simulate connection method for testing
  $connect() {
    console.log("MOCK DB: Connected to mock database");
    return Promise.resolve();
  }

  $disconnect() {
    console.log("MOCK DB: Disconnected from mock database");
    return Promise.resolve();
  }
}

// Determine whether to use a real or mock Prisma client
function getPrismaClient() {
  // Use mock client if specified in environment or if we're in testing/development
  const useMockDb =
    process.env.USE_MOCK_DB === "true" ||
    process.env.NODE_ENV === "test" ||
    process.env.DEBUG_MODE === "true";

  console.log(
    `Database Init: Using ${useMockDb ? "MOCK" : "REAL"} database client`
  );
  console.log(
    `Environment: NODE_ENV=${process.env.NODE_ENV}, USE_MOCK_DB=${process.env.USE_MOCK_DB}, DEBUG_MODE=${process.env.DEBUG_MODE}`
  );

  if (useMockDb) {
    console.log(
      "Creating mock PrismaClient - database operations will be simulated"
    );
    return new MockPrismaClient() as unknown as PrismaClient;
  }

  try {
    console.log(
      "Creating real PrismaClient - will attempt to connect to the database"
    );
    // Use the global instance to avoid multiple connections during hot reloading
    if (!globalForPrisma.prisma) {
      globalForPrisma.prisma = new PrismaClient({
        log: ["error", "warn"],
      });
      console.log("✅ PrismaClient initialized for", process.env.NODE_ENV);
    }
    return globalForPrisma.prisma;
  } catch (error) {
    console.error("❌ Failed to create PrismaClient:", error);
    console.log("⚠️ Falling back to mock database");
    return new MockPrismaClient() as unknown as PrismaClient;
  }
}

// Create a singleton instance of PrismaClient
export const prisma = getPrismaClient();
