// Test Supabase connection for BGE Chatbot
import { PrismaClient } from "@prisma/client";

async function main() {
  console.log("Testing Supabase connection...");
  const prisma = new PrismaClient();

  try {
    // Try a simple query
    console.log("Attempting to connect to the database...");
    const result = await prisma.$queryRaw`SELECT 1 as connected`;
    console.log("✅ Database connection successful:", result);

    // Check if we can access the tables
    console.log("\nChecking available tables:");
    const tables = await prisma.$queryRaw`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
    `;
    console.log("Tables found:", tables);

    // Check if User table exists and has data
    try {
      const userCount = await prisma.user.count();
      console.log(`\n✅ User table accessible. Count: ${userCount}`);
    } catch (error) {
      console.error("\n❌ Error accessing User table:", error.message);
    }

    // Check if Agent table exists and has data
    try {
      const agentCount = await prisma.agent.count();
      console.log(`✅ Agent table accessible. Count: ${agentCount}`);
    } catch (error) {
      console.error("❌ Error accessing Agent table:", error.message);
    }
  } catch (error) {
    console.error("\n❌ Connection failed:", error);
    console.error(
      "\nPlease check your DATABASE_URL environment variable and make sure:"
    );
    console.error("1. Your Supabase project is running");
    console.error("2. Your database password is correct");
    console.error("3. Network restrictions are not blocking the connection");
    console.error(
      "4. The IP address of your development machine is allowed in Supabase"
    );
  } finally {
    await prisma.$disconnect();
  }
}

main();
