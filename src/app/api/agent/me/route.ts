import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";
const DEBUG_MODE = process.env.DEBUG_MODE === "true";

export async function GET(req: NextRequest) {
  console.log("[API] GET /api/agent/me request received");

  try {
    // Get token from cookies
    const token = req.cookies.get("agent_token")?.value;

    if (!token) {
      console.log("[API] No agent token found in cookies");
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    // Verify the token
    let decodedToken;
    try {
      decodedToken = jwt.verify(token, JWT_SECRET) as {
        id: string;
        email: string;
        role: string;
        agentId: string;
      };
      console.log("[API] Token verified for user:", decodedToken.email);
    } catch (jwtError) {
      console.error("[API] JWT verification failed:", jwtError);
      return NextResponse.json(
        { error: "Invalid authentication token" },
        { status: 401 }
      );
    }

    // If we're in debug mode, allow using mock data for testing
    if (DEBUG_MODE) {
      console.log("[API] Debug mode enabled, checking for test accounts");

      // Return mock data for test accounts
      if (
        decodedToken.email === "agent@example.com" ||
        decodedToken.email === "admin@example.com"
      ) {
        console.log(
          `[API] Using mock data for test account: ${decodedToken.email}`
        );

        return NextResponse.json({
          id: decodedToken.agentId,
          name:
            decodedToken.email === "admin@example.com"
              ? "Admin Test"
              : "Agent Test",
          email: decodedToken.email,
          role: decodedToken.role,
          isActive: true,
          isAvailable: true,
          activeSessions: 0,
          waitingSessions: 0,
        });
      }
    }

    // Get the user from the database
    const user = await prisma.user.findUnique({
      where: { id: decodedToken.id },
      include: { agent: true },
    });

    if (!user) {
      console.error(`[API] User not found for id: ${decodedToken.id}`);
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    if (!user.agent) {
      console.error(`[API] No agent profile for user: ${user.email}`);
      return NextResponse.json(
        { error: "No agent profile found" },
        { status: 404 }
      );
    }

    // Count active chat sessions
    const activeSessions = await prisma.chatSession.count({
      where: {
        agentId: user.agent.id,
        status: "ACTIVE",
      },
    });

    // Count waiting chat sessions
    const waitingSessions = await prisma.chatSession.count({
      where: {
        status: "WAITING",
      },
    });

    // Return agent information
    return NextResponse.json({
      id: user.agent.id,
      name: user.name,
      email: user.email,
      role: user.role,
      isActive: user.agent.isActive,
      isAvailable: user.agent.isAvailable,
      activeSessions,
      waitingSessions,
    });
  } catch (error: unknown) {
    console.error("[API] Error in agent/me endpoint:", error);

    return NextResponse.json(
      {
        error: "Failed to retrieve agent information",
        details: DEBUG_MODE
          ? error instanceof Error
            ? error.message
            : String(error)
          : undefined,
      },
      { status: 500 }
    );
  }
}
