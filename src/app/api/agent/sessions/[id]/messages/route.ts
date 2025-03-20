import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getServerSession } from "@/lib/session";
import { io } from "@/lib/socketService";
import { SessionIdParams } from "@/lib/types";

/**
 * Verify if an agent has access to a session
 */
async function verifyAgentAccess(agentId: string, sessionId: string) {
  const session = await prisma.chatSession.findUnique({
    where: { id: sessionId },
  });

  // Agent has access if:
  // 1. Session is waiting and not assigned to anyone
  // 2. Session is already assigned to this agent
  return (
    session && (session.status === "waiting" || session.agentId === agentId)
  );
}

/**
 * GET handler to fetch messages for a specific session
 */
export async function GET(req: NextRequest, { params }: SessionIdParams) {
  try {
    // Type-safe access to the session ID
    const sessionId = params.id;

    // Get the authenticated session
    const userSession = await getServerSession();

    // If no session or not an agent, return unauthorized
    if (!userSession || !userSession.user || !userSession.user.agentId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if agent has access to this chat session
    const hasAccess = await verifyAgentAccess(
      userSession.user.agentId,
      sessionId
    );

    if (!hasAccess) {
      return NextResponse.json(
        { error: "You don't have access to this session" },
        { status: 403 }
      );
    }

    // Get query parameters for pagination
    const { searchParams } = new URL(req.url);
    const cursor = searchParams.get("cursor");
    const limit = parseInt(searchParams.get("limit") || "50");

    // Build the query
    interface WhereClause {
      sessionId: string;
      timestamp?: {
        lt: Date;
      };
    }

    const whereClause: WhereClause = {
      sessionId,
    };

    // If cursor provided, fetch messages older than the cursor
    if (cursor) {
      whereClause.timestamp = {
        lt: new Date(parseInt(cursor)),
      };
    }

    // Fetch messages for this session
    const messages = await prisma.message.findMany({
      where: whereClause,
      orderBy: {
        timestamp: "desc",
      },
      take: limit + 1, // Take one more to determine if there are more messages
    });

    // Check if there are more messages
    const hasMore = messages.length > limit;
    const resultMessages = hasMore ? messages.slice(0, limit) : messages;

    // Get the next cursor if there are more messages
    const nextCursor = hasMore
      ? resultMessages[resultMessages.length - 1].timestamp.getTime().toString()
      : null;

    // Return messages in chronological order (oldest first)
    return NextResponse.json({
      messages: resultMessages.reverse(),
      pagination: {
        hasMore,
        nextCursor,
      },
    });
  } catch (error) {
    console.error("Error fetching messages:", error);
    return NextResponse.json(
      { error: "Failed to fetch messages" },
      { status: 500 }
    );
  }
}

/**
 * POST handler to create a new message
 */
export async function POST(req: NextRequest, { params }: SessionIdParams) {
  try {
    // Type-safe access to the session ID
    const sessionId = params.id;

    const { content, category } = await req.json();

    // Get the authenticated session
    const userSession = await getServerSession();

    // If no session or not an agent, return unauthorized
    if (!userSession || !userSession.user || !userSession.user.agentId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if agent has access to this chat session
    const hasAccess = await verifyAgentAccess(
      userSession.user.agentId,
      sessionId
    );

    if (!hasAccess) {
      return NextResponse.json(
        { error: "You don't have access to this session" },
        { status: 403 }
      );
    }

    // Get agent information for the message
    const agent = await prisma.user.findUnique({
      where: { id: userSession.user.id },
      select: {
        name: true,
        email: true,
      },
    });

    // Create the message
    const message = await prisma.message.create({
      data: {
        sessionId,
        role: "agent",
        content,
        category: category || "general",
        timestamp: new Date(),
        metadata: JSON.stringify({
          agentId: userSession.user.agentId,
          agentName: agent?.name || "Agent",
          agentEmail: agent?.email,
        }),
      },
    });

    // Update the chat session's updated_at timestamp
    await prisma.chatSession.update({
      where: { id: sessionId },
      data: {
        updatedAt: new Date(),
      },
    });

    // Enhanced socket emission for real-time updates
    try {
      if (io) {
        console.log(
          `Broadcasting agent message to session ${sessionId} via socket.io`
        );

        // Format the message for socket clients
        const formattedMessage = {
          id: message.id,
          content: message.content,
          role: "agent",
          sender: "Agent",
          timestamp: message.timestamp.toISOString(),
          isAgent: true,
          isSystem: false,
          sessionId: String(sessionId),
          chatSessionId: String(sessionId),
          agentName: agent?.name || "Agent",
          metadata: {
            chatSessionId: String(sessionId),
            messageId: message.id,
            agentId: userSession.user.agentId,
            agentName: agent?.name || "Agent",
          },
        };

        // Log active rooms
        console.log(`Active socket rooms:`, io.sockets.adapter.rooms);
        console.log(`Sending message from agent: ${agent?.name}`);

        // Use multiple strategies to ensure message delivery

        // 1. Send to specific session room
        io.to(String(sessionId)).emit("messageReceived", formattedMessage);
        console.log(`Emitted to session room: ${sessionId}`);

        // 2. Send to the customers room (all customers)
        io.to("customers").emit("messageReceived", formattedMessage);
        console.log(`Emitted to customers room`);

        // 3. Broadcast globally to all connected clients
        io.emit("messageReceived", formattedMessage);
        console.log(`Broadcasted to all clients`);

        // Also emit a session update event
        io.emit("sessionUpdated", {
          sessionId: String(sessionId),
          lastMessage: message.content,
          updatedAt: new Date().toISOString(),
          status: "active",
          role: "agent",
        });

        console.log("Socket events emitted successfully");
      } else {
        console.log("Socket.io instance not available for real-time updates");
      }
    } catch (error) {
      console.error("Error emitting socket event:", error);
      // Continue processing even if socket emission fails
    }

    // Return the created message to the agent UI
    return NextResponse.json({
      success: true,
      message,
      broadcast: true, // Flag to confirm message was broadcasted
    });
  } catch (error) {
    console.error("Error creating message:", error);
    return NextResponse.json(
      { error: "Failed to create message" },
      { status: 500 }
    );
  }
}
