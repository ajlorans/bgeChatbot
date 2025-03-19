import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getServerSession } from "@/lib/session";

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Get the authenticated session
    const session = await getServerSession();

    // If no session or not an agent, return unauthorized
    if (!session || !session.user || !session.user.agentId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const agentId = session.user.agentId;
    const sessionId = params.id;

    // 1. Check if the chat session exists and is in waiting status
    const chatSession = await prisma.chatSession.findUnique({
      where: { id: sessionId },
    });

    if (!chatSession) {
      return NextResponse.json(
        { error: "Chat session not found" },
        { status: 404 }
      );
    }

    // 2. Verify the session is in waiting status and not already claimed
    if (chatSession.status !== "waiting") {
      return NextResponse.json(
        {
          error: `Session cannot be claimed (current status: ${chatSession.status})`,
        },
        { status: 400 }
      );
    }

    if (chatSession.agentId) {
      return NextResponse.json(
        { error: "This session has already been claimed by another agent" },
        { status: 409 }
      );
    }

    // 3. Claim the session by updating its status and assigning the agent
    const updatedSession = await prisma.chatSession.update({
      where: { id: sessionId },
      data: {
        status: "active",
        agentId,
        updatedAt: new Date(), // Force update timestamp to trigger polling
      },
    });

    // 4. Get the agent's name for the system message
    const agent = await prisma.user.findUnique({
      where: { id: session.user.id },
    });

    const agentName = agent?.name || "Agent";

    // 5. Add a system message indicating the agent has joined
    await prisma.message.create({
      data: {
        sessionId,
        role: "system",
        content: `Agent ${agentName} has joined the conversation.`,
        timestamp: new Date(),
        category: "live_agent",
      },
    });

    // Add a delay to ensure messages are processed before client polling
    await new Promise((resolve) => setTimeout(resolve, 100));

    // Double check that the session is now active with the correct agent
    const verifySession = await prisma.chatSession.findUnique({
      where: { id: sessionId },
    });

    if (
      !verifySession ||
      verifySession.status !== "active" ||
      verifySession.agentId !== agentId
    ) {
      console.warn("Session status verification failed - forcing update");
      // Force update again to ensure consistency
      await prisma.chatSession.update({
        where: { id: sessionId },
        data: {
          status: "active",
          agentId,
          updatedAt: new Date(),
        },
      });
    }

    // Return success with the updated session
    return NextResponse.json({
      success: true,
      message: "Session claimed successfully",
      session: updatedSession,
    });
  } catch (error) {
    console.error("Error claiming chat session:", error);
    return NextResponse.json(
      {
        error: "Failed to claim chat session",
        details: (error as Error).message,
      },
      { status: 500 }
    );
  }
}
