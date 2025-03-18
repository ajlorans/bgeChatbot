import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getServerSession } from "@/lib/session";
import { subDays, startOfDay, endOfDay } from "date-fns";

// Define interfaces for type safety
interface ChatMessage {
  id: string;
  role: string;
  createdAt: Date;
  chatSession: {
    id: string;
  };
}

interface ChatSession {
  createdAt: Date;
}

export async function GET() {
  // Get the current user session
  const session = await getServerSession();

  if (!session || !session.user || session.user.role !== "agent") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const agentId = session.user.id;

  try {
    // Time periods for metrics
    const today = new Date();
    const yesterday = subDays(today, 1);
    const lastWeekStart = subDays(today, 7);
    const lastMonthStart = subDays(today, 30);

    // Get total sessions by time period
    const [
      todaySessions,
      yesterdaySessions,
      weekSessions,
      monthSessions,
      totalSessions,
    ] = await Promise.all([
      prisma.chatSession.count({
        where: {
          agentId,
          createdAt: {
            gte: startOfDay(today),
            lte: endOfDay(today),
          },
        },
      }),
      prisma.chatSession.count({
        where: {
          agentId,
          createdAt: {
            gte: startOfDay(yesterday),
            lte: endOfDay(yesterday),
          },
        },
      }),
      prisma.chatSession.count({
        where: {
          agentId,
          createdAt: {
            gte: lastWeekStart,
          },
        },
      }),
      prisma.chatSession.count({
        where: {
          agentId,
          createdAt: {
            gte: lastMonthStart,
          },
        },
      }),
      prisma.chatSession.count({
        where: {
          agentId,
        },
      }),
    ]);

    // Get resolved sessions count
    const resolvedSessions = await prisma.chatSession.count({
      where: {
        agentId,
        status: "closed",
      },
    });

    // Calculate resolution rate
    const resolutionRate =
      totalSessions > 0
        ? Math.round((resolvedSessions / totalSessions) * 100)
        : 0;

    // Get average response time
    const messages = await prisma.chatMessage.findMany({
      where: {
        chatSession: {
          agentId,
        },
        createdAt: {
          gte: lastMonthStart,
        },
      },
      orderBy: {
        createdAt: "asc",
      },
      include: {
        chatSession: {
          select: {
            id: true,
          },
        },
      },
    });

    // Group messages by session
    const messagesBySession: Record<
      string,
      {
        customer: Array<{ id: string; createdAt: Date }>;
        agent: Array<{ id: string; createdAt: Date }>;
      }
    > = {};

    messages.forEach((msg: ChatMessage) => {
      const sessionId = msg.chatSession.id;

      if (!messagesBySession[sessionId]) {
        messagesBySession[sessionId] = {
          customer: [],
          agent: [],
        };
      }

      if (msg.role === "user") {
        messagesBySession[sessionId].customer.push({
          id: msg.id,
          createdAt: msg.createdAt,
        });
      } else if (msg.role === "assistant") {
        messagesBySession[sessionId].agent.push({
          id: msg.id,
          createdAt: msg.createdAt,
        });
      }
    });

    // Calculate response times
    let totalResponseTime = 0;
    let responseCount = 0;

    Object.values(messagesBySession).forEach((session) => {
      session.customer.forEach((customerMsg) => {
        // Find the next agent message after this customer message
        const nextAgentMsg = session.agent.find(
          (agentMsg) => agentMsg.createdAt > customerMsg.createdAt
        );

        if (nextAgentMsg) {
          const responseTime =
            nextAgentMsg.createdAt.getTime() - customerMsg.createdAt.getTime();
          totalResponseTime += responseTime;
          responseCount++;
        }
      });
    });

    // Average response time in seconds
    const avgResponseTime =
      responseCount > 0
        ? Math.round(totalResponseTime / responseCount / 1000)
        : 0;

    // Get busiest days of the week
    const lastMonthSessions = await prisma.chatSession.findMany({
      where: {
        agentId,
        createdAt: {
          gte: lastMonthStart,
        },
      },
      select: {
        createdAt: true,
      },
    });

    // Count sessions by day of week (0 = Sunday, 6 = Saturday)
    const dayOfWeekCounts = [0, 0, 0, 0, 0, 0, 0];
    lastMonthSessions.forEach((session: ChatSession) => {
      const dayOfWeek = session.createdAt.getDay();
      dayOfWeekCounts[dayOfWeek]++;
    });

    // Format day counts for response
    const weekdayNames = [
      "Sunday",
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
    ];
    const sessionsByDay = weekdayNames
      .map((day, index) => ({
        day,
        count: dayOfWeekCounts[index],
      }))
      .sort((a, b) => b.count - a.count);

    // Get sessions by hour of day (0-23)
    const hourCounts = Array(24).fill(0);
    lastMonthSessions.forEach((session: ChatSession) => {
      const hour = session.createdAt.getHours();
      hourCounts[hour]++;
    });

    const sessionsByHour = hourCounts
      .map((count, hour) => ({
        hour,
        count,
      }))
      .sort((a, b) => b.count - a.count);

    return NextResponse.json({
      metrics: {
        sessions: {
          today: todaySessions,
          yesterday: yesterdaySessions,
          week: weekSessions,
          month: monthSessions,
          total: totalSessions,
        },
        resolutionRate,
        avgResponseTime,
        sessionsByDay: sessionsByDay.slice(0, 3), // Top 3 busiest days
        sessionsByHour: sessionsByHour.slice(0, 5), // Top 5 busiest hours
        peakHour: sessionsByHour[0]?.hour || null,
      },
    });
  } catch (error) {
    console.error("Error retrieving analytics:", error);
    return NextResponse.json(
      { error: "Failed to retrieve analytics data" },
      { status: 500 }
    );
  }
}
