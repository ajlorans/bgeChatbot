import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getServerSession } from "@/lib/session";

export async function GET() {
  try {
    // Get the authenticated session
    const session = await getServerSession();

    // If no session or not an agent, return unauthorized
    if (!session || !session.user || !session.user.agentId) {
      return NextResponse.json(
        { authenticated: false, message: "Not authenticated" },
        { status: 401 }
      );
    }

    // Get agent details from database
    const agent = await prisma.agent.findUnique({
      where: {
        id: session.user.agentId,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        },
      },
    });

    if (!agent) {
      return NextResponse.json(
        { authenticated: false, message: "Agent not found" },
        { status: 401 }
      );
    }

    // Get counts of active and waiting sessions
    const activeSessionsCount = await prisma.chatSession.count({
      where: {
        agentId: agent.id,
        status: "active",
      },
    });

    const waitingSessionsCount = await prisma.chatSession.count({
      where: {
        status: "waiting",
      },
    });

    // Check if agent is active
    if (!agent.isActive) {
      return NextResponse.json(
        {
          authenticated: true,
          message: "Agent account is deactivated",
          user: {
            id: agent.user.id,
            name: agent.user.name,
            email: agent.user.email,
            role: agent.user.role,
            status: "inactive",
          },
        },
        { status: 403 }
      );
    }

    // Return agent data
    return NextResponse.json({
      authenticated: true,
      user: {
        id: agent.user.id,
        name: agent.user.name,
        email: agent.user.email,
        role: agent.user.role,
        agentId: agent.id,
        status: "active",
        lastActive: agent.lastActive,
      },
      stats: {
        activeSessions: activeSessionsCount,
        waitingSessions: waitingSessionsCount,
      },
    });
  } catch (error) {
    console.error("Error fetching agent data:", error);
    return NextResponse.json(
      { authenticated: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
