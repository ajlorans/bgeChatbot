import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getServerSession } from "@/lib/session";

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
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Await the params object before accessing its properties
    const { id: sessionId } = await params;

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
export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Await the params object before accessing its properties
    const { id: sessionId } = await params;

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

    // Create the message
    const message = await prisma.message.create({
      data: {
        sessionId,
        role: "agent",
        content,
        category: category || null,
        timestamp: new Date(),
        metadata: {},
      },
    });

    // Update the session's last activity timestamp
    await prisma.chatSession.update({
      where: { id: sessionId },
      data: {
        updatedAt: new Date(),
        // If the session is waiting, assign it to this agent and mark as active
        ...(hasAccess && {
          agentId: userSession.user.agentId,
          status: "active",
        }),
      },
    });

    return NextResponse.json({ success: true, message });
  } catch (error) {
    console.error("Error creating message:", error);
    return NextResponse.json(
      { error: "Failed to create message" },
      { status: 500 }
    );
  }
}
