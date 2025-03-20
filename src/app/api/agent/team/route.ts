import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getServerSession } from "@/lib/session";

// Disable logging
console.log = () => {};
console.error = () => {};

/**
 * GET handler to retrieve team information
 * Only agents can access this endpoint
 */
export async function GET(req: NextRequest) {
  try {
    // Get the authenticated session
    const session = await getServerSession();

    // If no session or not an agent, return unauthorized
    if (!session || !session.user || !session.user.agentId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get all agents with their users
    const agents = await prisma.agent.findMany({
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: {
        lastActive: 'desc', // Most recently active first
      },
    });

    // Get active session counts for each agent
    const activeSessions = await prisma.chatSession.groupBy({
      by: ['agentId'],
      where: {
        status: 'active',
        agentId: {
          not: null,
        },
      },
      _count: {
        id: true,
      },
    });

    // Calculate time threshold for "active" status - 15 minutes
    const activeThreshold = new Date(Date.now() - 15 * 60 * 1000);

    // Get currently active agent sessions from the database
    const activeAgentSessions = await prisma.session.findMany({
      where: {
        expires: {
          gt: new Date(), // Session hasn't expired yet
        },
      },
      select: {
        userId: true,
      }
    });

    // Extract active user IDs
    const activeUserIds = new Set(activeAgentSessions.map(session => session.userId));

    // Map the active session counts to the agents
    const agentsWithCounts = agents.map((agent) => {
      const sessionCount = activeSessions.find(s => s.agentId === agent.id);
      const lastActiveTime = new Date(agent.lastActive);
      
      // Check if the agent is currently logged in (has an active session)
      const hasActiveSession = activeUserIds.has(agent.userId);
      
      // Consider agent active if they're logged in OR have been active in the last 15 minutes
      const isReallyActive = hasActiveSession || lastActiveTime > activeThreshold;
      
      return {
        id: agent.id,
        userId: agent.userId,
        name: agent.user?.name || 'Unknown Agent',
        email: agent.user?.email || '',
        isActive: isReallyActive,
        isAvailable: isReallyActive && agent.isAvailable,
        role: agent.role,
        activeSessions: sessionCount ? sessionCount._count.id : 0,
        lastActive: agent.lastActive,
        // Include whether the agent is currently logged in
        isLoggedIn: hasActiveSession,
      };
    });

    return NextResponse.json({ agents: agentsWithCounts });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch agent team data" },
      { status: 500 }
    );
  }
} 