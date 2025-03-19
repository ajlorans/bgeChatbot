// Database cleanup script
// Usage: node scripts/cleanup-db.js

const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function cleanupDatabase() {
  console.log("Starting database cleanup...");

  try {
    // Get current agent info to preserve
    const agents = await prisma.agent.findMany({
      include: {
        user: true,
      },
    });

    console.log(`Found ${agents.length} agent(s) that will be preserved`);
    agents.forEach((agent) => {
      if (agent.user) {
        console.log(`- Agent: ${agent.user.name} (${agent.user.email})`);
      }
    });

    // Delete all messages
    const deletedMessages = await prisma.message.deleteMany({});
    console.log(`Deleted ${deletedMessages.count} messages`);

    // Delete all chat sessions
    const deletedSessions = await prisma.chatSession.deleteMany({});
    console.log(`Deleted ${deletedSessions.count} chat sessions`);

    // Reset active agents
    const updatedAgents = await prisma.agent.updateMany({
      data: {
        isActive: true,
        isAvailable: true,
        lastActive: new Date(),
      },
    });
    console.log(`Reset ${updatedAgents.count} agent status`);

    console.log("Database cleanup completed successfully!");
    console.log("All chat sessions and messages have been deleted.");
    console.log("Agent accounts have been preserved with credentials intact.");
  } catch (error) {
    console.error("Error during database cleanup:", error);
  } finally {
    await prisma.$disconnect();
  }
}

cleanupDatabase().catch((e) => {
  console.error("Cleanup script failed:", e);
  process.exit(1);
});
