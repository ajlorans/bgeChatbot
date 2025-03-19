import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { corsConfig, getAllowedOrigins } from "@/config/cors";
import { io } from "@/lib/socketService";

// Helper function to check if origin is allowed
function isOriginAllowed(origin: string | null): boolean {
  // Allow requests with no origin (like mobile apps, curl, or from same site)
  if (!origin) return true;

  const allowedOrigins = getAllowedOrigins();

  // If wildcard is included, allow all origins
  if (allowedOrigins.includes("*")) return true;

  // Otherwise check specific origin
  return allowedOrigins.includes(origin);
}

// CORS middleware for the live chat API
export async function OPTIONS(req: NextRequest) {
  const origin = req.headers.get("origin");

  if (origin && isOriginAllowed(origin)) {
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

/**
 * POST handler for live chat message exchange
 * This endpoint handles:
 * 1. Sending messages in an active live chat
 * 2. Getting messages since a specific time/message ID
 * 3. Checking chat status
 */
export async function POST(req: NextRequest) {
  const origin = req.headers.get("origin");

  // Check if the origin is allowed
  if (!isOriginAllowed(origin)) {
    return new NextResponse(null, { status: 403 });
  }

  try {
    const {
      sessionId,
      message,
      messageId,
      role = "user",
      lastMessageTimestamp,
    } = (await req.json()) as {
      sessionId: string;
      message?: string;
      messageId?: string;
      role?: "user" | "agent" | "system";
      lastMessageTimestamp?: number;
    };

    if (!sessionId) {
      return NextResponse.json(
        {
          success: false,
          message: "Session ID is required",
        },
        { status: 400 }
      );
    }

    // Find the chat session
    const chatSession = await prisma.chatSession.findUnique({
      where: { id: sessionId },
      include: {
        agent: {
          include: {
            user: true,
          },
        },
      },
    });

    if (!chatSession) {
      return NextResponse.json(
        {
          success: false,
          message: "Chat session not found",
        },
        { status: 404 }
      );
    }

    // Check if this is a live chat session
    if (!chatSession.isLiveChat) {
      return NextResponse.json(
        {
          success: false,
          message: "This is not a live chat session",
        },
        { status: 400 }
      );
    }

    // If a message was provided, save it
    if (message) {
      // Log incoming message for debugging
      console.log(
        `Received ${role} message for session ${sessionId}: ${message.substring(
          0,
          30
        )}...`
      );

      // Check for duplicate message if messageId is provided
      if (messageId) {
        const existingMessage = await prisma.message.findFirst({
          where: {
            sessionId,
            role,
            content: message,
            OR: [
              { id: messageId },
              {
                timestamp: {
                  gte: new Date(Date.now() - 5000), // Messages in the last 5 seconds
                },
              },
            ],
          },
        });

        if (existingMessage) {
          console.log(
            `Duplicate message detected, skipping save: ${message.substring(
              0,
              30
            )}...`
          );
          // Still update the session timestamp to trigger client polling
          await prisma.chatSession.update({
            where: { id: sessionId },
            data: { updatedAt: new Date() },
          });

          // Get recent messages instead of creating a duplicate
          const recentMessages = await prisma.message.findMany({
            where: {
              sessionId,
              timestamp: {
                gte: new Date(Date.now() - 5000),
              },
            },
            orderBy: { timestamp: "desc" },
            take: 5,
          });

          // Format messages for response
          const formattedMessages = recentMessages.map((msg) => ({
            id: msg.id,
            role: msg.role,
            content: msg.content,
            timestamp: msg.timestamp.getTime(),
            category: msg.category || "live_agent",
          }));

          return NextResponse.json({
            success: true,
            sessionId,
            status: chatSession.status,
            messages: formattedMessages,
            skippedDuplicate: true,
            lastMessageTimestamp: Date.now().toString(),
          });
        }
      }

      const newMessage = await prisma.message.create({
        data: {
          sessionId,
          role,
          content: message,
          category: "live_agent",
          timestamp: new Date(),
        },
      });

      // Update the session to notify it was updated
      await prisma.chatSession.update({
        where: { id: sessionId },
        data: {
          updatedAt: new Date(),
          // For agent messages, force a status update to trigger customer polling
          ...(role === "agent" && {
            status: "active",
            isAgentTyping: false,
          }),
        },
      });

      // Emit socket event for real-time updates
      try {
        if (io) {
          console.log(
            `Emitting message via socket for sessionId: ${sessionId}, role: ${role}`
          );

          // Create properly formatted message for socket clients
          const formattedMessage = {
            id: newMessage.id,
            content: newMessage.content,
            role: role,
            sender: role === "agent" ? "Agent" : "Customer",
            timestamp: newMessage.timestamp.toISOString(),
            isAgent: role === "agent",
            isSystem: false,
            sessionId: String(sessionId),
            chatSessionId: String(sessionId),
            metadata: {
              chatSessionId: String(sessionId),
              messageId: newMessage.id,
            },
          };

          // Important debugging logs
          console.log(`Socket active rooms:`, io.sockets.adapter.rooms);

          // Use multiple strategies to ensure delivery

          // 1. Direct to session room
          io.to(String(sessionId)).emit("messageReceived", formattedMessage);
          console.log(`Emitted to session room: ${sessionId}`);

          // 2. Send to agents room (all agents get notified)
          io.to("agents").emit("messageReceived", formattedMessage);
          console.log(`Emitted to agents room`);

          // 3. Global broadcast (this is a fallback)
          io.emit("messageReceived", formattedMessage);
          console.log(`Broadcasted to all clients`);

          // Session update event to trigger UI refreshes
          io.emit("sessionUpdated", {
            sessionId: String(sessionId),
            lastMessage: message,
            updatedAt: new Date().toISOString(),
            status: chatSession.status,
            role: role,
          });

          console.log("Socket events emitted successfully");
        } else {
          console.log("Socket.io instance not available for real-time updates");
        }
      } catch (error) {
        console.error("Error emitting socket event:", error);
        // Continue processing even if socket emission fails
      }
    }

    // Get messages since the last message timestamp if provided
    const messageQuery: {
      where: {
        sessionId: string;
        timestamp?: {
          gt: Date;
        };
      };
      orderBy: {
        timestamp: "asc";
      };
    } = {
      where: { sessionId },
      orderBy: { timestamp: "asc" },
    };

    if (lastMessageTimestamp) {
      // Convert the timestamp string to a number, then to a Date
      const timestamp = parseInt(lastMessageTimestamp, 10);
      if (!isNaN(timestamp)) {
        // Log the timestamp we're filtering from
        console.log(
          `Getting messages after ${new Date(
            timestamp
          ).toISOString()} for session ${sessionId}`
        );

        // Use timestamp without any adjustments to ensure accurate query
        const filterDate = new Date(timestamp);

        messageQuery.where.timestamp = {
          gt: filterDate,
        };
      }
    } else {
      // If no timestamp provided, get all messages from the last 5 minutes
      // This ensures the customer always sees agent joining messages
      console.log(
        `No timestamp provided, getting recent messages for session ${sessionId}`
      );
      const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
      messageQuery.where.timestamp = {
        gt: fiveMinutesAgo,
      };
    }

    // Fetch messages with this query
    const messages = await prisma.message.findMany(messageQuery);
    console.log(
      `Found ${messages.length} new messages for session ${sessionId}`
    );

    // Get agent name if an agent is assigned
    let agentName = "Customer Support";
    if (chatSession.agent && chatSession.agent.userId) {
      try {
        const user = await prisma.user.findUnique({
          where: { id: chatSession.agent.userId },
          select: { name: true },
        });
        agentName = user?.name || "Customer Support";
      } catch (error) {
        console.error("Error fetching agent name:", error);
      }
    }

    // Look for any system messages about agent joining - CHECK IN DATABASE not just current response
    const hasAgentJoinedMessage = messages.some(
      (msg) =>
        msg.role === "system" &&
        msg.content.includes("has joined the conversation")
    );

    // If no agent joined message found in current response, check database
    if (
      !hasAgentJoinedMessage &&
      chatSession.agentId &&
      chatSession.status === "active"
    ) {
      console.log(
        `Checking for existing agent join message in database for session ${sessionId}`
      );

      // Check if we already have an agent joined message in the database
      const existingJoinMessage = await prisma.message.findFirst({
        where: {
          sessionId,
          role: "system",
          content: {
            contains: "has joined the conversation",
          },
        },
      });

      if (existingJoinMessage) {
        console.log(
          `Found existing agent join message in database, adding to response`
        );
        // Make sure we don't already have this message in the response
        if (!messages.some((msg) => msg.id === existingJoinMessage.id)) {
          messages.push(existingJoinMessage);
        }
      } else {
        console.log(
          `No existing join message found, creating synthetic agent joined message`
        );
        try {
          // Create an agent joined message with timestamp 1 second ago
          const joinedMessage = await prisma.message.create({
            data: {
              sessionId,
              role: "system",
              content: `Agent ${agentName} has joined the conversation.`,
              timestamp: new Date(Date.now() - 1000),
              category: "live_agent",
            },
          });

          // Add to messages list
          messages.push(joinedMessage);
        } catch (error) {
          console.error("Error creating synthetic agent join message:", error);
        }
      }
    }

    // Format messages for response, ensuring timestamp is a number
    const formattedMessages = messages.map((msg) => ({
      id: msg.id,
      role: msg.role,
      content: msg.content,
      timestamp: msg.timestamp.getTime(), // Convert to epoch milliseconds
      category: msg.category || "live_agent",
    }));

    // Get session status
    const status = chatSession.status || "active";

    // Calculate the new lastMessageTimestamp for the next request
    const newTimestamp =
      messages.length > 0
        ? messages[messages.length - 1].timestamp.getTime()
        : lastMessageTimestamp
        ? parseInt(String(lastMessageTimestamp), 10)
        : Date.now();

    // Add a cache buster to prevent browser caching
    const cacheBuster = `${Date.now()}-${Math.random()}`;

    return NextResponse.json({
      success: true,
      sessionId,
      status,
      messages: formattedMessages,
      agentName,
      isActive: status === "active",
      lastMessageTimestamp: newTimestamp.toString(),
      _cacheBuster: cacheBuster,
    });
  } catch (error) {
    console.error("Error in live chat message:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to process your request. Please try again later.",
      },
      { status: 500 }
    );
  }
}

// GET endpoint for retrieving messages (polling)
export async function GET(req: NextRequest) {
  const origin = req.headers.get("origin");

  // Check if the origin is allowed
  if (!isOriginAllowed(origin)) {
    return new NextResponse(null, { status: 403 });
  }

  try {
    const url = new URL(req.url);
    const sessionId = url.searchParams.get("sessionId");
    const lastMessageTimestamp = url.searchParams.get("lastMessageTimestamp");

    if (!sessionId) {
      return NextResponse.json(
        {
          success: false,
          message: "Session ID is required",
        },
        { status: 400 }
      );
    }

    // Find the chat session
    const chatSession = await prisma.chatSession.findUnique({
      where: { id: sessionId },
      include: {
        agent: {
          select: {
            id: true,
            userId: true,
          },
        },
      },
    });

    if (!chatSession) {
      return NextResponse.json(
        {
          success: false,
          message: "Chat session not found",
        },
        { status: 404 }
      );
    }

    // Get agent name if an agent is assigned
    let agentName = "Customer Support";
    if (chatSession.agent && chatSession.agent.userId) {
      try {
        const user = await prisma.user.findUnique({
          where: { id: chatSession.agent.userId },
          select: { name: true },
        });
        agentName = user?.name || "Customer Support";
      } catch (error) {
        console.error("Error fetching agent name:", error);
      }
    }

    // Get messages since the last message timestamp if provided
    const messageQuery: {
      where: {
        sessionId: string;
        timestamp?: {
          gt: Date;
        };
      };
      orderBy: {
        timestamp: "asc";
      };
    } = {
      where: { sessionId },
      orderBy: { timestamp: "asc" },
    };

    if (lastMessageTimestamp) {
      // Convert the timestamp string to a number, then to a Date
      const timestamp = parseInt(lastMessageTimestamp, 10);
      if (!isNaN(timestamp)) {
        // Log the timestamp we're filtering from
        console.log(
          `Getting messages after ${new Date(
            timestamp
          ).toISOString()} for session ${sessionId}`
        );

        // Use timestamp without any adjustments to ensure accurate query
        const filterDate = new Date(timestamp);

        messageQuery.where.timestamp = {
          gt: filterDate,
        };
      }
    } else {
      // If no timestamp provided, get all messages from the last 5 minutes
      // This ensures the customer always sees agent joining messages
      console.log(
        `No timestamp provided, getting recent messages for session ${sessionId}`
      );
      const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
      messageQuery.where.timestamp = {
        gt: fiveMinutesAgo,
      };
    }

    // Fetch messages with this query
    const messages = await prisma.message.findMany(messageQuery);
    console.log(
      `Found ${messages.length} new messages for session ${sessionId}`
    );

    // Look for any system messages about agent joining - CHECK IN DATABASE not just current response
    const hasAgentJoinedMessage = messages.some(
      (msg) =>
        msg.role === "system" &&
        msg.content.includes("has joined the conversation")
    );

    // If no agent joined message found in current response, check database
    if (
      !hasAgentJoinedMessage &&
      chatSession.agentId &&
      chatSession.status === "active"
    ) {
      console.log(
        `Checking for existing agent join message in database for session ${sessionId}`
      );

      // Check if we already have an agent joined message in the database
      const existingJoinMessage = await prisma.message.findFirst({
        where: {
          sessionId,
          role: "system",
          content: {
            contains: "has joined the conversation",
          },
        },
      });

      if (existingJoinMessage) {
        console.log(
          `Found existing agent join message in database, adding to response`
        );
        // Make sure we don't already have this message in the response
        if (!messages.some((msg) => msg.id === existingJoinMessage.id)) {
          messages.push(existingJoinMessage);
        }
      } else {
        console.log(
          `No existing join message found, creating synthetic agent joined message`
        );
        try {
          // Create an agent joined message with timestamp 1 second ago
          const joinedMessage = await prisma.message.create({
            data: {
              sessionId,
              role: "system",
              content: `Agent ${agentName} has joined the conversation.`,
              timestamp: new Date(Date.now() - 1000),
              category: "live_agent",
            },
          });

          // Add to messages list
          messages.push(joinedMessage);
        } catch (error) {
          console.error("Error creating synthetic agent join message:", error);
        }
      }
    }

    // Format messages for response, ensuring timestamp is a number
    const formattedMessages = messages.map((msg) => ({
      id: msg.id,
      role: msg.role,
      content: msg.content,
      timestamp: msg.timestamp.getTime(), // Convert to epoch milliseconds
      category: msg.category || "live_agent",
    }));

    // Get session status
    const status = chatSession.status || "active";

    // Calculate the new lastMessageTimestamp for the next request
    const newTimestamp =
      messages.length > 0
        ? messages[messages.length - 1].timestamp.getTime()
        : lastMessageTimestamp
        ? parseInt(String(lastMessageTimestamp), 10)
        : Date.now();

    // Add a cache buster to prevent browser caching
    const cacheBuster = `${Date.now()}-${Math.random()}`;

    return NextResponse.json({
      success: true,
      sessionId,
      status,
      messages: formattedMessages,
      agentName,
      isActive: status === "active",
      lastMessageTimestamp: newTimestamp.toString(),
      _cacheBuster: cacheBuster,
    });
  } catch (error) {
    console.error("Error fetching live chat messages:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to retrieve messages. Please try again later.",
      },
      { status: 500 }
    );
  }
}
