#!/usr/bin/env node
/**
 * This script creates test data for the agent dashboard
 * It populates the database with agents, customers, chat sessions, and messages
 *
 * Usage: node scripts/create-test-data.mjs
 */

import { PrismaClient } from "@prisma/client";
import { faker } from "@faker-js/faker";
import { createHash } from "crypto";

const prisma = new PrismaClient();

// Constants
const NUM_AGENTS = 2;
const NUM_CUSTOMERS = 20;
const NUM_SESSIONS_PER_CUSTOMER = 3;
const MAX_MESSAGES_PER_SESSION = 15;

// Helper function to hash passwords
function hashPassword(password) {
  return createHash("sha256").update(password).digest("hex");
}

// Helper function to create a random date within the last 30 days
function randomRecentDate(daysAgo = 30) {
  const date = new Date();
  date.setDate(date.getDate() - Math.floor(Math.random() * daysAgo));
  return date;
}

async function createTestData() {
  console.log("🚀 Creating test data for agent dashboard...");

  try {
    // Create agent users
    console.log("👥 Creating agent users...");
    const agents = [];

    for (let i = 0; i < NUM_AGENTS; i++) {
      const firstName = faker.person.firstName();
      const lastName = faker.person.lastName();

      const user = await prisma.user.create({
        data: {
          email: faker.internet.email({ firstName, lastName }).toLowerCase(),
          name: `${firstName} ${lastName}`,
          role: "agent",
          passwordHash: hashPassword("password123"),
        },
      });

      const agent = await prisma.agent.create({
        data: {
          userId: user.id,
          isActive: true,
          department: faker.commerce.department(),
        },
      });

      agents.push({
        ...agent,
        user,
      });

      console.log(`  ✅ Created agent: ${user.name} (${user.email})`);
    }

    // Create customers and chat sessions
    console.log("\n👤 Creating customers and chat sessions...");
    const customers = [];
    const sessions = [];

    for (let i = 0; i < NUM_CUSTOMERS; i++) {
      const firstName = faker.person.firstName();
      const lastName = faker.person.lastName();
      const email = faker.internet.email({ firstName, lastName }).toLowerCase();

      const customer = {
        name: `${firstName} ${lastName}`,
        email,
      };

      customers.push(customer);

      // Create sessions for this customer
      for (let j = 0; j < NUM_SESSIONS_PER_CUSTOMER; j++) {
        // Randomly assign an agent (or null for waiting sessions)
        const assignStatus = Math.random();
        const status =
          assignStatus < 0.3
            ? "active"
            : assignStatus < 0.6
            ? "waiting"
            : "closed";

        // For active and closed sessions, assign an agent
        const agent =
          status !== "waiting"
            ? agents[Math.floor(Math.random() * agents.length)]
            : null;

        const createdAt = randomRecentDate();
        const updatedAt = new Date(createdAt);

        // If closed, set updatedAt to some time after createdAt
        if (status === "closed") {
          updatedAt.setMinutes(
            updatedAt.getMinutes() + Math.floor(Math.random() * 120) + 5
          );
        }

        const session = await prisma.chatSession.create({
          data: {
            customerName: customer.name,
            customerEmail: customer.email,
            status,
            agentId: agent?.id || null,
            createdAt,
            updatedAt,
            metadata: {
              browser: faker.internet.userAgent(),
              ipAddress: faker.internet.ip(),
              referrer: faker.internet.url(),
            },
          },
        });

        sessions.push(session);

        console.log(
          `  ✅ Created ${status} session for ${customer.name} ${
            agent ? `with agent ${agent.user.name}` : "(waiting)"
          }`
        );

        // Create messages for this session
        const numMessages =
          Math.floor(Math.random() * MAX_MESSAGES_PER_SESSION) + 1;

        // Always start with a customer message
        let lastMessageTime = new Date(createdAt);

        // Initial customer message
        await prisma.chatMessage.create({
          data: {
            chatSessionId: session.id,
            content: faker.helpers.arrayElement([
              "Hi, I need some help please",
              "Hello, is anyone available?",
              "I have a question about my order",
              "Can someone help me with my account?",
              "I'm having an issue with your website",
            ]),
            sender: "customer",
            role: "user",
            createdAt: lastMessageTime,
          },
        });

        // If the status is active or closed, add more messages
        if (status !== "waiting") {
          // System message about agent assignment
          lastMessageTime = new Date(
            lastMessageTime.getTime() + 15000 + Math.random() * 30000
          );
          await prisma.chatMessage.create({
            data: {
              chatSessionId: session.id,
              content: `${agent.user.name} has joined the conversation.`,
              sender: "system",
              role: "system",
              createdAt: lastMessageTime,
            },
          });

          // Agent's first response
          lastMessageTime = new Date(
            lastMessageTime.getTime() + 15000 + Math.random() * 30000
          );
          await prisma.chatMessage.create({
            data: {
              chatSessionId: session.id,
              content: faker.helpers.arrayElement([
                `Hi ${customer.name}, how can I help you today?`,
                `Hello ${customer.name}! I'm here to assist you. What can I do for you?`,
                `Good day ${customer.name}. I'd be happy to help with your question.`,
                `Welcome to our support chat. How may I assist you today?`,
              ]),
              sender: "agent",
              role: "assistant",
              createdAt: lastMessageTime,
            },
          });

          // Add remaining conversation
          for (let k = 3; k < numMessages; k++) {
            lastMessageTime = new Date(
              lastMessageTime.getTime() + 30000 + Math.random() * 120000
            );

            const isCustomer = k % 2 === 1; // alternate between customer and agent

            await prisma.chatMessage.create({
              data: {
                chatSessionId: session.id,
                content: isCustomer
                  ? faker.helpers.arrayElement([
                      "I ordered product ABC and it hasn't arrived yet",
                      "Can you check the status of my order?",
                      "I need to change my shipping address",
                      "The product I received was damaged",
                      "How do I return this item?",
                      "Thank you for your help!",
                    ])
                  : faker.helpers.arrayElement([
                      "Let me check that for you",
                      "I can definitely help with that",
                      "I've updated your information",
                      "Is there anything else I can help with?",
                      "I've processed your request",
                      "You're welcome! Happy to help.",
                    ]),
                sender: isCustomer ? "customer" : "agent",
                role: isCustomer ? "user" : "assistant",
                createdAt: lastMessageTime,
              },
            });
          }

          // If closed status, add closing message
          if (status === "closed") {
            lastMessageTime = new Date(updatedAt);
            await prisma.chatMessage.create({
              data: {
                chatSessionId: session.id,
                content: "This conversation has been closed.",
                sender: "system",
                role: "system",
                createdAt: lastMessageTime,
              },
            });
          }
        }
      }
    }

    console.log("\n✅ Test data creation complete!");
    console.log(`Created ${agents.length} agents`);
    console.log(`Created ${customers.length} customers`);
    console.log(`Created ${sessions.length} chat sessions`);

    console.log("\n🔑 Agent credentials:");
    agents.forEach((agent) => {
      console.log(`Email: ${agent.user.email}, Password: password123`);
    });
  } catch (error) {
    console.error("❌ Error creating test data:", error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the function
createTestData();
