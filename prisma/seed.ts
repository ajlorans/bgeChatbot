const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

async function main() {
  // Create an agent user
  const hashedPassword = await bcrypt.hash("agent123", 10);

  const user = await prisma.user.upsert({
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

  console.log("Created agent:", user);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
