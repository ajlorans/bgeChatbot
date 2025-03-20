// Test Supabase connection for BGE Chatbot
import { PrismaClient } from "@prisma/client";

// Log environment variables (without exposing sensitive values)
console.log("Database URL exists:", !!process.env.DATABASE_URL);
console.log("Non-pooling URL exists:", !!process.env.POSTGRES_URL_NON_POOLING);

// Initialize Prisma client
const prisma = new PrismaClient({
  log: ["query", "info", "warn", "error"],
});

async function main() {
  console.log("Testing database connection...");

  try {
    // Simple query to test connection
    const result = await prisma.$queryRaw`SELECT 1 as test`;
    console.log("Connection successful!", result);

    // Get database information
    const dbInfo = await prisma.$queryRaw`SELECT version()`;
    console.log("Database info:", dbInfo);

    return { success: true };
  } catch (error) {
    console.error("Connection failed:", error);
    return { success: false, error };
  } finally {
    await prisma.$disconnect();
  }
}

main()
  .then((result) => {
    console.log("Script completed:", result);
    if (!result.success) {
      process.exit(1);
    }
  })
  .catch((e) => {
    console.error("Script error:", e);
    process.exit(1);
  });
