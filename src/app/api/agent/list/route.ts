import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";

export async function GET(request: NextRequest) {
  try {
    // Get the token from cookies
    const cookieStore = cookies();
    const token = cookieStore.get("agent_token")?.value;

    if (!token) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    // Verify the token
    let decoded;
    try {
      decoded = jwt.verify(token, JWT_SECRET) as {
        userId: string;
        agentId: string;
        role: string;
      };
    } catch {
      return NextResponse.json(
        { error: "Invalid or expired token" },
        { status: 401 }
      );
    }

    // Parse query parameters
    const url = new URL(request.url);
    const status = url.searchParams.get("status");

    // Build query
    const where: Record<string, any> = {};

    // Filter by status if provided
    if (status) {
      where.status = status;
    }

    // Only supervisors and admins can see all agents
    if (decoded.role !== "admin" && decoded.role !== "supervisor") {
      // Regular agents can only see active agents
      where.status = "active";
    }

    // Get agents
    const agents = await prisma.agent.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
          },
        },
      },
      orderBy: {
        user: {
          name: "asc",
        },
      },
    });

    // Get active sessions count for each agent
    const agentIds = agents.map((agent) => agent.id);
    const sessionCounts = await prisma.chatSession.groupBy({
      by: ["agentId"],
      where: {
        agentId: {
          in: agentIds,
        },
        status: "active",
        isLiveChat: true,
      },
      _count: {
        id: true,
      },
    });

    // Create a map of agent ID to session count
    const sessionCountMap = new Map();
    sessionCounts.forEach((item) => {
      sessionCountMap.set(item.agentId, item._count.id);
    });

    // Add session count to agents data
    const agentsWithSessionCount = agents.map((agent) => ({
      ...agent,
      activeSessionCount: sessionCountMap.get(agent.id) || 0,
    }));

    return NextResponse.json({
      agents: agentsWithSessionCount,
    });
  } catch (error) {
    console.error("Error fetching agents:", error);
    return NextResponse.json(
      { error: "Failed to fetch agents" },
      { status: 500 }
    );
  }
}
