import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { corsConfig, getAllowedOrigins } from "@/config/cors";
import { io } from "@/lib/socketService";

// CORS middleware for the live chat API
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

/**
 * POST handler for ending a live chat session
 */
export async function POST(req: NextRequest) {
  const origin = req.headers.get("origin");
  const allowedOrigins = getAllowedOrigins();

  // Check if the origin is allowed
  if (!origin || !allowedOrigins.includes(origin)) {
    return new NextResponse(null, { status: 403 });
  }

  try {
    const { sessionId, endedBy = "customer" } = (await req.json()) as {
      sessionId: string;
      endedBy?: "customer" | "agent" | "system";
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

    console.log(`Chat session ${sessionId} ended by ${endedBy}`);

    // Find the chat session
    const chatSession = await prisma.chatSession.findUnique({
      where: { id: sessionId },
      include: {
        agent: true,
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

    // Create a system message indicating the chat was ended by customer
    const systemMessage = await prisma.message.create({
      data: {
        sessionId,
        role: "system",
        content: `Live chat ended by ${endedBy}.`,
        category: "live_agent",
        timestamp: new Date(),
      },
    });

    // Update the session status to 'closed'
    await prisma.chatSession.update({
      where: { id: sessionId },
      data: {
        status: "closed",
        updatedAt: new Date(),
      },
    });

    // Emit socket events if socket.io is available
    if (io) {
      console.log(`Emitting chat ended notifications for session ${sessionId}`);

      // Format the message for the socket
      const formattedMessage = {
        id: systemMessage.id,
        content: systemMessage.content,
        role: "system",
        sender: "System",
        timestamp: systemMessage.timestamp.toISOString(),
        isAgent: false,
        isSystem: true,
        sessionId: String(sessionId),
        chatSessionId: String(sessionId),
        metadata: {
          chatSessionId: String(sessionId),
          endedBy,
          messageId: systemMessage.id,
          type: "chat_ended",
        },
      };

      // Log active rooms
      console.log(`Active socket rooms:`, io.sockets.adapter.rooms);

      // Use multiple strategies to ensure delivery of chat end notification

      // 1. To specific session room
      io.to(String(sessionId)).emit("messageReceived", formattedMessage);
      console.log(`Emitted chat end to session room: ${sessionId}`);

      // 2. To the agents room (all connected agents)
      io.to("agents").emit("messageReceived", formattedMessage);
      console.log(`Emitted chat end to agents room`);

      // 3. Broadcast to all - guaranteed to reach everyone
      io.emit("messageReceived", formattedMessage);
      console.log(`Broadcasted chat end message to all clients`);

      // Also emit specialized events for chat ending

      // Session updated event with endedBy info
      io.emit("sessionUpdated", {
        sessionId: String(sessionId),
        status: "closed",
        endedBy,
        timestamp: new Date().toISOString(),
        message: `Chat ended by ${endedBy}`,
        type: "chat_ended",
      });

      // Specific chat ended event
      io.emit("chatEnded", {
        sessionId: String(sessionId),
        endedBy,
        timestamp: new Date().toISOString(),
        agentId: chatSession.agentId,
      });

      console.log("Socket events for chat ending emitted successfully");
    } else {
      console.log(
        "Socket.io instance not available for chat ended notification"
      );
    }

    // If an agent was assigned, update their status
    if (chatSession.agentId) {
      await prisma.agent.update({
        where: { id: chatSession.agentId },
        data: {
          lastActive: new Date(),
          // Release agent for other chats
          isAvailable: true,
        },
      });
    }

    return NextResponse.json({
      success: true,
      message: "Live chat session ended successfully.",
    });
  } catch (error) {
    console.error("Error ending live chat session:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to end the chat session. Please try again later.",
      },
      { status: 500 }
    );
  }
}
