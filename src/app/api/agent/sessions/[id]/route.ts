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
 * GET handler to fetch a specific session's details
 */
export async function GET(
  req: NextRequest,
  context: { params: { id: string } }
) {
  try {
    // Get the session ID from context params
    const sessionId = context.params.id;

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

    // Fetch the chat session with related data
    const chatSession = await prisma.chatSession.findUnique({
      where: { id: sessionId },
      include: {
        agent: {
          include: {
            user: {
              select: {
                name: true,
                email: true,
              },
            },
          },
        },
      },
    });

    if (!chatSession) {
      return NextResponse.json({ error: "Session not found" }, { status: 404 });
    }

    // Return session details
    return NextResponse.json({
      session: {
        id: chatSession.id,
        customerName: chatSession.customerName,
        customerEmail: chatSession.customerEmail,
        status: chatSession.status,
        createdAt: chatSession.createdAt.toISOString(),
        updatedAt: chatSession.updatedAt.toISOString(),
        agentName: chatSession.agent?.user?.name || null,
        agentEmail: chatSession.agent?.user?.email || null,
        metadata: chatSession.metadata,
      },
    });
  } catch (error) {
    console.error("Error fetching session:", error);
    return NextResponse.json(
      { error: "Failed to fetch session" },
      { status: 500 }
    );
  }
}

/**
 * PATCH handler to update a session's status
 */
export async function PATCH(
  req: NextRequest,
  context: { params: { id: string } }
) {
  try {
    // Get the session ID from context params
    const sessionId = context.params.id;

    const { status } = await req.json();

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

    // Validate the requested status
    if (!["active", "waiting", "closed", "ended"].includes(status)) {
      return NextResponse.json(
        { error: "Invalid status value" },
        { status: 400 }
      );
    }

    // Update the session
    const updatedSession = await prisma.chatSession.update({
      where: { id: sessionId },
      data: {
        status,
        // If status is active and session not assigned, assign to this agent
        ...(status === "active" && {
          agentId: userSession.user.agentId,
        }),
      },
    });

    // If status is "ended", add a system message
    if (status === "ended") {
      await prisma.message.create({
        data: {
          sessionId,
          role: "system",
          content: "Chat session ended by agent.",
          timestamp: new Date(),
          category: "live_agent",
        },
      });
    }

    // Return updated session
    return NextResponse.json({
      success: true,
      session: {
        id: updatedSession.id,
        status: updatedSession.status,
        updatedAt: updatedSession.updatedAt.toISOString(),
      },
    });
  } catch (error) {
    console.error("Error updating session:", error);
    return NextResponse.json(
      { error: "Failed to update session" },
      { status: 500 }
    );
  }
}
