import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getServerSession } from "@/lib/session";

/**
 * GET handler to fetch sessions by status
 */
export async function GET(req: NextRequest) {
  try {
    // Get the authenticated session
    const session = await getServerSession();

    // If no session or not an agent, return unauthorized
    if (!session || !session.user || !session.user.agentId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get query parameters for filtering
    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status") || "active";
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const skip = (page - 1) * limit;

    console.log(
      `Fetching sessions with status: ${status} for agent ${session.user.agentId}`
    );

    // Build the where clause based on status
    let where = {};

    if (status === "active") {
      // Only show active chats assigned to this specific agent
      where = {
        status: "active",
        agentId: session.user.agentId,
      };
      console.log("Active filter:", JSON.stringify(where));
    } else if (status === "waiting") {
      where = {
        status: "waiting",
        agentId: null,
      };
      console.log("Waiting filter:", JSON.stringify(where));
    } else if (status === "closed") {
      where = {
        status: { in: ["closed", "ended"] },
        agentId: session.user.agentId,
      };
    } else {
      // For all other statuses, still filter by this agent's ID for personal sessions
      where = {
        OR: [
          {
            AND: [
              { agentId: session.user.agentId },
              { status: { not: "waiting" } },
            ],
          },
          {
            AND: [{ status: "waiting" }, { agentId: null }],
          },
        ],
      };
    }

    // Fetch sessions with the latest message for each
    const chatSessions = await prisma.chatSession.findMany({
      where,
      orderBy: {
        updatedAt: "desc",
      },
      skip,
      take: limit,
      include: {
        agent: {
          include: {
            user: {
              select: {
                name: true,
              },
            },
          },
        },
        messages: {
          orderBy: {
            timestamp: "desc",
          },
          take: 5,
        },
      },
    });

    // Count total sessions matching criteria for pagination
    const totalSessions = await prisma.chatSession.count({ where });

    // Format the response data
    const sessions = chatSessions.map((session) => ({
      id: session.id,
      customerName: session.customerName,
      customerEmail: session.customerEmail,
      status: session.status,
      createdAt: session.createdAt.toISOString(),
      updatedAt: session.updatedAt.toISOString(),
      agentId: session.agentId || null,
      agentName: session.agent?.user?.name || null,
      lastMessage: session.messages[0]?.content || null,
      recentMessages: session.messages.map((msg) => ({
        id: msg.id,
        content: msg.content,
        timestamp: msg.timestamp.toISOString(),
        role: msg.role,
        isAgent: msg.role === "agent",
      })),
    }));

    return NextResponse.json({
      sessions,
      pagination: {
        total: totalSessions,
        page,
        limit,
        pages: Math.ceil(totalSessions / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching sessions:", error);
    return NextResponse.json(
      { error: "Failed to fetch sessions" },
      { status: 500 }
    );
  }
}
