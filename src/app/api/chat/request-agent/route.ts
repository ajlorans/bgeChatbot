import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { corsConfig, getAllowedOrigins } from "@/config/cors";
import { LiveChatRequest, LiveChatStatus, Message } from "@/lib/types";
import { v4 as uuidv4 } from "uuid";

// CORS middleware for the chat API
export async function OPTIONS(req: NextRequest) {
  const origin = req.headers.get("origin");
  const allowedOrigins = getAllowedOrigins();

  if (origin && allowedOrigins.includes(origin)) {
    return new NextResponse(null, {
      status: 200,
      headers: {
        "Access-Control-Allow-Origin": origin,
        "Access-Control-Allow-Methods": corsConfig.methods.join(", "),
        "Access-Control-Allow-Headers": corsConfig.allowedHeaders.join(", "),
        "Access-Control-Max-Age": corsConfig.maxAge.toString(),
        "Access-Control-Allow-Credentials": "true",
      },
    });
  }

  return new NextResponse(null, { status: 403 });
}

export async function POST(req: NextRequest) {
  const origin = req.headers.get("origin");

  // TEMPORARY: Disable strict origin checking for debugging
  // Check if the origin is allowed
  /*
  if (!origin || !allowedOrigins.includes(origin)) {
    return new NextResponse(null, { status: 403 });
  }
  */

  // Set CORS headers in the response
  const headers = {
    "Access-Control-Allow-Origin": origin || "*",
    "Access-Control-Allow-Methods": corsConfig.methods.join(", "),
    "Access-Control-Allow-Headers": corsConfig.allowedHeaders.join(", "),
    "Access-Control-Allow-Credentials": "true",
  };

  try {
    const { sessionId, customerEmail, customerName, issue, messages } =
      (await req.json()) as LiveChatRequest & {
        messages: Message[];
      };

    // Store the issue in the session metadata if provided
    const metadata = issue ? { issue } : undefined;

    // Check if there are any available agents
    const availableAgents = await prisma.agent.findMany({
      where: {
        isActive: true,
        isAvailable: true,
      },
      orderBy: {
        lastActive: "asc", // Get the agent who's been waiting the longest
      },
      take: 1,
    });

    let chatSession;
    const hasAvailableAgent = availableAgents.length > 0;
    const status: LiveChatStatus = "waiting"; // Always use "waiting" status initially

    // Create or update the chat session
    if (sessionId) {
      // If session already exists, try to find it
      const existingSession = await prisma.chatSession.findUnique({
        where: { id: sessionId },
      });

      if (existingSession) {
        // Update existing session
        chatSession = await prisma.chatSession.update({
          where: { id: sessionId },
          data: {
            isLiveChat: true,
            status,
            customerEmail,
            customerName,
            metadata: metadata ? JSON.stringify(metadata) : undefined,
            agentId: null, // Always set to null so agent needs to claim it
            updatedAt: new Date(),
          },
        });

        // Create a system message noting the live agent request
        await prisma.message.create({
          data: {
            sessionId,
            role: "system",
            content: `Customer has requested to speak with a live agent. ${
              hasAvailableAgent ? "Connected to agent." : "Added to queue."
            }`,
            category: "live_agent",
            timestamp: new Date(),
          },
        });

        // If messages were provided, save them to the database
        if (messages && messages.length > 0) {
          for (const msg of messages) {
            await prisma.message.create({
              data: {
                sessionId,
                role: msg.role,
                content: msg.content,
                category: msg.category || "live_agent",
                timestamp: new Date(msg.timestamp),
              },
            });
          }
        }
      } else {
        // Session ID was provided but not found, create a new one
        chatSession = await prisma.chatSession.create({
          data: {
            id: sessionId, // Use the provided ID
            isLiveChat: true,
            status,
            customerEmail,
            customerName,
            metadata: metadata ? JSON.stringify(metadata) : undefined,
            agentId: null, // Always set to null so agent needs to claim it
            messages: {
              create: {
                role: "system",
                content: `Chat session started. Customer has requested to speak with a live agent. ${
                  hasAvailableAgent ? "Connected to agent." : "Added to queue."
                }`,
                category: "live_agent",
              },
            },
          },
          include: {
            messages: true,
          },
        });
      }
    } else {
      // Create a new session if no ID was provided
      chatSession = await prisma.chatSession.create({
        data: {
          isLiveChat: true,
          status,
          customerEmail,
          customerName,
          metadata: metadata ? JSON.stringify(metadata) : undefined,
          agentId: null, // Always set to null so agent needs to claim it
          messages: {
            create: {
              role: "system",
              content: `Chat session started. Customer has requested to speak with a live agent. ${
                hasAvailableAgent ? "Connected to agent." : "Added to queue."
              }`,
              category: "live_agent",
            },
          },
        },
        include: {
          messages: true,
        },
      });
    }

    // If an agent is available, update their status
    if (hasAvailableAgent) {
      const agent = availableAgents[0];

      // Add this session to the agent's active sessions
      await prisma.agent.update({
        where: { id: agent.id },
        data: {
          lastActive: new Date(),
          // Optionally update availability if they've reached max concurrent chats
          // isAvailable: concurrentChatsCount < MAX_CONCURRENT_CHATS
        },
      });
    }

    // Create a user-friendly response
    const responseMessage = hasAvailableAgent
      ? "Your request has been received. An agent will be with you shortly. Please wait."
      : "Thank you for your request. All our agents are currently busy. You've been added to the queue and an agent will assist you as soon as possible.";

    return NextResponse.json(
      {
        success: true,
        sessionId: chatSession.id,
        status,
        message: responseMessage,
        position: hasAvailableAgent
          ? 0
          : await getQueuePosition(chatSession.id),
        estimatedWaitTime: hasAvailableAgent
          ? 0
          : await calculateEstimatedWaitTime(),
      },
      { headers }
    );
  } catch (error) {
    console.error("Error handling agent request:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to process your request. Please try again later.",
      },
      { status: 500, headers }
    );
  }
}

// Helper function to get position in queue
async function getQueuePosition(sessionId: string): Promise<number> {
  const queuedSessions = await prisma.chatSession.findMany({
    where: {
      status: "waiting",
    },
    orderBy: {
      createdAt: "asc", // First come, first served
    },
  });

  const position = queuedSessions.findIndex(
    (session: { id: string }) => session.id === sessionId
  );
  return position >= 0 ? position + 1 : 0; // 1-based position
}

// Helper function to calculate estimated wait time
async function calculateEstimatedWaitTime(): Promise<number> {
  // Get count of available agents
  const availableAgentsCount = await prisma.agent.count({
    where: {
      isActive: true,
      isAvailable: true,
    },
  });

  // Get count of queued sessions
  const queuedSessionsCount = await prisma.chatSession.count({
    where: {
      status: "waiting",
    },
  });

  // If no agents or way too many queued sessions, return a default max wait time
  if (availableAgentsCount === 0 || queuedSessionsCount > 50) {
    return 15; // 15 minutes maximum wait time
  }

  // Simple calculation: average 5 minutes per customer in queue, divided by number of available agents
  const avgTimePerCustomer = 5; // minutes
  const estimatedWaitTime = Math.ceil(
    (queuedSessionsCount * avgTimePerCustomer) / availableAgentsCount
  );

  // Cap wait time between 1-15 minutes for UX purposes
  return Math.min(Math.max(estimatedWaitTime, 1), 15);
}
