import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";

export async function POST(request: NextRequest) {
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

    // Parse the request body
    const body = await request.json();
    const { status } = body;

    // Validate status
    const validStatuses = ["active", "away", "offline"];
    if (!status || !validStatuses.includes(status)) {
      return NextResponse.json(
        { error: "Invalid status. Must be one of: active, away, offline" },
        { status: 400 }
      );
    }

    // Update the agent's status
    const updatedAgent = await prisma.agent.update({
      where: {
        id: decoded.agentId,
      },
      data: {
        status,
        lastActive: new Date(),
      },
    });

    // Return updated agent status
    return NextResponse.json({
      status: "success",
      agent: {
        id: updatedAgent.id,
        status: updatedAgent.status,
      },
    });
  } catch (error) {
    console.error("Error updating agent status:", error);
    return NextResponse.json(
      { error: "Failed to update agent status" },
      { status: 500 }
    );
  }
}
