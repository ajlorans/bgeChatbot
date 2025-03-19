const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

async function main() {
  // Create multiple agent users for testing
  const hashedPassword = await bcrypt.hash("agent123", 10);

  // Demo agent 1
  const agent1 = await prisma.user.upsert({
    where: { email: "agent1@example.com" },
    update: {},
    create: {
      email: "agent1@example.com",
      name: "Support Agent 1",
      password: hashedPassword,
      role: "agent",
      agent: {
        create: {
          isActive: true,
          isAvailable: true,
          role: "agent",
        },
      },
    },
    include: {
      agent: true,
    },
  });

  // Demo agent 2
  const agent2 = await prisma.user.upsert({
    where: { email: "agent2@example.com" },
    update: {},
    create: {
      email: "agent2@example.com",
      name: "Support Agent 2",
      password: hashedPassword,
      role: "agent",
      agent: {
        create: {
          isActive: true,
          isAvailable: true,
          role: "agent",
        },
      },
    },
    include: {
      agent: true,
    },
  });

  // Demo agent 3 - supervisor
  const agent3 = await prisma.user.upsert({
    where: { email: "supervisor@example.com" },
    update: {},
    create: {
      email: "supervisor@example.com",
      name: "Team Supervisor",
      password: hashedPassword,
      role: "agent",
      agent: {
        create: {
          isActive: true,
          isAvailable: true,
          role: "supervisor",
        },
      },
    },
    include: {
      agent: true,
    },
  });

  // Keep original demo agent for backwards compatibility
  const originalAgent = await prisma.user.upsert({
    where: { email: "agent@example.com" },
    update: {},
    create: {
      email: "agent@example.com",
      name: "Demo Agent",
      password: hashedPassword,
      role: "agent",
      agent: {
        create: {
          isActive: true,
          isAvailable: true,
          role: "agent",
        },
      },
    },
    include: {
      agent: true,
    },
  });

  console.log("Created agents:", {
    agent1: agent1.name,
    agent2: agent2.name,
    agent3: agent3.name,
    originalAgent: originalAgent.name
  });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
