import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getServerSession } from "@/lib/session";

interface ChatMessage {
  id: string;
  sessionId: string;
  timestamp: Date;
}

interface ChatSession {
  id: string;
}

interface SessionMessages {
  customer: ChatMessage[];
  agent: ChatMessage[];
}

export async function GET() {
  try {
    // Get the authenticated session
    const session = await getServerSession();

    // If no session or not an agent, return unauthorized
    if (!session || !session.user || !session.user.agentId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const agentId = session.user.agentId;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Get total sessions handled by the agent today
    const totalSessionsToday = await prisma.chatSession.count({
      where: {
        agentId,
        createdAt: {
          gte: today,
        },
      },
    });

    // Get resolved (closed) sessions handled by the agent today
    const resolvedSessions = await prisma.chatSession.count({
      where: {
        agentId,
        status: "closed",
        updatedAt: {
          gte: today,
        },
      },
    });

    // Calculate average response time
    // This would be the average time between a customer message and the agent's first response
    const chatSessions = await prisma.chatSession.findMany({
      where: {
        agentId,
        createdAt: {
          gte: new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000), // Last 7 days
        },
      },
      select: {
        id: true,
      },
    });

    const sessionIds = chatSessions.map((session: ChatSession) => session.id);

    let avgResponseTime = 0;

    if (sessionIds.length > 0) {
      // Get customer messages
      const customerMessages = await prisma.message.findMany({
        where: {
          sessionId: {
            in: sessionIds,
          },
          role: "user",
        },
        orderBy: {
          timestamp: "asc",
        },
        select: {
          id: true,
          sessionId: true,
          timestamp: true,
        },
      });

      // Get agent messages
      const agentMessages = await prisma.message.findMany({
        where: {
          sessionId: {
            in: sessionIds,
          },
          role: "agent",
        },
        orderBy: {
          timestamp: "asc",
        },
        select: {
          id: true,
          sessionId: true,
          timestamp: true,
        },
      });

      // Calculate response times
      let totalResponseTime = 0;
      let responseCount = 0;

      // Group messages by chat session
      const messagesBySession: Record<string, SessionMessages> = {};

      customerMessages.forEach((msg) => {
        if (!messagesBySession[msg.sessionId]) {
          messagesBySession[msg.sessionId] = { customer: [], agent: [] };
        }
        messagesBySession[msg.sessionId].customer.push(msg);
      });

      agentMessages.forEach((msg) => {
        if (!messagesBySession[msg.sessionId]) {
          messagesBySession[msg.sessionId] = { customer: [], agent: [] };
        }
        messagesBySession[msg.sessionId].agent.push(msg);
      });

      // Calculate response times for each session
      Object.values(messagesBySession).forEach((sessionMessages) => {
        sessionMessages.customer.forEach((customerMsg) => {
          // Find the next agent message after this customer message
          const nextAgentMsg = sessionMessages.agent.find(
            (agentMsg) => agentMsg.timestamp > customerMsg.timestamp
          );

          if (nextAgentMsg) {
            const responseTime =
              (new Date(nextAgentMsg.timestamp).getTime() -
                new Date(customerMsg.timestamp).getTime()) /
              (1000 * 60); // in minutes
            totalResponseTime += responseTime;
            responseCount++;
          }
        });
      });

      // Calculate average
      avgResponseTime =
        responseCount > 0 ? totalResponseTime / responseCount : 0;
    }

    // Return the dashboard stats
    return NextResponse.json({
      totalSessionsToday,
      resolvedSessions,
      avgResponseTime,
    });
  } catch (error) {
    console.error("Error fetching dashboard stats:", error);
    return NextResponse.json(
      { error: "Failed to fetch dashboard stats" },
      { status: 500 }
    );
  }
}
