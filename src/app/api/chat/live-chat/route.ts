import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { corsConfig, getAllowedOrigins } from "@/config/cors";

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
      role = "user",
      lastMessageTimestamp,
    } = (await req.json()) as {
      sessionId: string;
      message?: string;
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
        data: { updatedAt: new Date() },
      });

      // Emit socket event for real-time updates if this is running on a server with socket.io
      try {
        // Get the global socket.io instance if it exists
        const globalThis = global as any;
        if (globalThis.io) {
          console.log("Emitting message via socket for sessionId:", sessionId);

          // Emit to all clients in this session room
          globalThis.io.to(sessionId).emit("messageReceived", {
            ...newMessage,
            chatSessionId: sessionId,
          });

          // Also emit a session update event
          globalThis.io.emit("sessionUpdated", {
            id: sessionId,
            lastMessage: message,
            updatedAt: new Date().toISOString(),
            status: chatSession.status,
          });
        }
      } catch (error) {
        console.error("Error emitting socket event:", error);
        // Continue processing even if socket emission fails
      }
    }

    // Get messages since the last message timestamp if provided
    const messageQuery: any = {
      where: { sessionId },
      orderBy: { timestamp: "asc" as const },
    };

    if (lastMessageTimestamp) {
      messageQuery.where.timestamp = {
        gt: new Date(lastMessageTimestamp),
      };
    }

    const messages = await prisma.message.findMany(messageQuery);

    // Format messages for response
    const formattedMessages = messages.map((msg) => ({
      id: msg.id,
      role: msg.role,
      content: msg.content,
      timestamp: msg.timestamp.getTime(),
      category: msg.category || "live_agent",
    }));

    // Get session status
    const agentName = chatSession.agent?.user?.name || "Customer Support";
    const status = chatSession.status || "active";

    return NextResponse.json({
      success: true,
      sessionId,
      status,
      messages: formattedMessages,
      agentName,
      isActive: status === "active",
      lastMessageTimestamp:
        formattedMessages.length > 0
          ? formattedMessages[formattedMessages.length - 1].timestamp
          : lastMessageTimestamp || Date.now(),
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

    // Get messages since the last message timestamp if provided
    const messageQuery: any = {
      where: { sessionId },
      orderBy: { timestamp: "asc" as const },
    };

    if (lastMessageTimestamp) {
      messageQuery.where.timestamp = {
        gt: new Date(parseInt(lastMessageTimestamp, 10)),
      };
    }

    const messages = await prisma.message.findMany(messageQuery);

    // Format messages for response
    const formattedMessages = messages.map((msg) => ({
      id: msg.id,
      role: msg.role,
      content: msg.content,
      timestamp: msg.timestamp.getTime(),
      category: msg.category || "live_agent",
    }));

    // Get session status
    const agentName = chatSession.agent?.user?.name || "Customer Support";
    const status = chatSession.status || "active";

    return NextResponse.json({
      success: true,
      sessionId,
      status,
      messages: formattedMessages,
      agentName,
      isActive: status === "active",
      lastMessageTimestamp:
        formattedMessages.length > 0
          ? formattedMessages[formattedMessages.length - 1].timestamp
          : lastMessageTimestamp
          ? parseInt(lastMessageTimestamp, 10)
          : Date.now(),
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
