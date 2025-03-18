import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getServerSession } from "@/lib/session";
import { formatDistanceToNow } from "date-fns";

interface Activity {
  type: string;
  content: string;
  timestamp: string;
  sessionId?: string;
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

    // Get the agent's recently active sessions (last 24 hours)
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

    // Find recent sessions for this agent
    const recentSessions = await prisma.chatSession.findMany({
      where: {
        OR: [{ agentId }, { status: "waiting" }],
        updatedAt: {
          gte: oneDayAgo,
        },
      },
      orderBy: {
        updatedAt: "desc",
      },
      take: 10,
      include: {
        messages: {
          orderBy: {
            timestamp: "desc",
          },
          take: 1,
        },
      },
    });

    // Transform the data into activity items
    const activities: Activity[] = [];

    for (const session of recentSessions) {
      // Session creation activity
      activities.push({
        type: "new_session",
        content: `${
          session.customerName || "Anonymous customer"
        } started a new chat session`,
        timestamp: formatTimestamp(session.createdAt),
        sessionId: session.id,
      });

      // Last message activity (if exists)
      if (session.messages.length > 0) {
        const lastMessage = session.messages[0];
        const isByAgent = lastMessage.role === "agent";
        const isSystem = lastMessage.role === "system";

        // Skip system messages for activity feed
        if (!isSystem) {
          activities.push({
            type: "message",
            content: `${
              isByAgent ? "You" : session.customerName || "Customer"
            } sent a message: "${truncateText(lastMessage.content, 50)}"`,
            timestamp: formatTimestamp(lastMessage.timestamp),
            sessionId: session.id,
          });
        }
      }

      // Session closure activity (if applicable)
      if (session.status === "closed") {
        activities.push({
          type: "session_closed",
          content: `Chat session with ${
            session.customerName || "Anonymous customer"
          } was closed`,
          timestamp: formatTimestamp(session.updatedAt),
          sessionId: session.id,
        });
      }
    }

    // Sort activities by timestamp (most recent first) and limit to 15
    activities.sort((a, b) => {
      return (
        new Date(parseTimestamp(b.timestamp)).getTime() -
        new Date(parseTimestamp(a.timestamp)).getTime()
      );
    });

    const limitedActivities = activities.slice(0, 15);

    return NextResponse.json({
      activities: limitedActivities,
    });
  } catch (error) {
    console.error("Error fetching recent activity:", error);
    return NextResponse.json(
      { error: "Failed to fetch recent activity" },
      { status: 500 }
    );
  }
}

// Helper function to format timestamps
function formatTimestamp(date: Date): string {
  return formatDistanceToNow(date, { addSuffix: true });
}

// Helper function to parse formatted timestamps for sorting
function parseTimestamp(timestamp: string): Date {
  // This is a rough approximation since we're formatting with "ago" syntax
  const now = new Date();
  const timeUnits: Record<string, number> = {
    second: 1000,
    minute: 60 * 1000,
    hour: 60 * 60 * 1000,
    day: 24 * 60 * 60 * 1000,
    week: 7 * 24 * 60 * 60 * 1000,
    month: 30 * 24 * 60 * 60 * 1000,
    year: 365 * 24 * 60 * 60 * 1000,
  };

  // Parse timestamps like "3 hours ago", "2 days ago", etc.
  for (const [unit, ms] of Object.entries(timeUnits)) {
    const pluralUnit = unit + "s";
    const singularRegex = new RegExp(`1 ${unit} ago`);
    const pluralRegex = new RegExp(`(\\d+) ${pluralUnit} ago`);

    if (singularRegex.test(timestamp)) {
      return new Date(now.getTime() - ms);
    }

    const pluralMatch = timestamp.match(pluralRegex);
    if (pluralMatch && pluralMatch[1]) {
      const value = parseInt(pluralMatch[1], 10);
      return new Date(now.getTime() - value * ms);
    }
  }

  // If we can't parse it, just return now
  return now;
}

// Helper function to truncate text
function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + "...";
}
