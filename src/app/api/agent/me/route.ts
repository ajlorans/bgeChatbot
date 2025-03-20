import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import jwt from "jsonwebtoken";

// Use environment variables with fallbacks
const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";
const DEBUG_MODE = process.env.DEBUG_MODE === "true";
const USE_MOCK_DB = process.env.USE_MOCK_DB === "true";

// Define the type for mock users
type MockUserData = {
  id: string;
  agentId: string;
  name: string;
  email: string;
  role: string;
  isActive: boolean;
  isAvailable: boolean;
};

// Mock data for test users
const MOCK_USERS: Record<string, MockUserData> = {
  "agent@example.com": {
    id: "agent-test-id",
    agentId: "agent-id",
    name: "Agent Test",
    email: "agent@example.com",
    role: "agent",
    isActive: true,
    isAvailable: true,
  },
  "admin@example.com": {
    id: "admin-test-id",
    agentId: "admin-agent-id",
    name: "Admin Test",
    email: "admin@example.com",
    role: "admin",
    isActive: true,
    isAvailable: true,
  },
};

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

    console.log("[API] Found token, length:", token.length);

    // Verify the token
    let decodedToken;
    try {
      // Check for special bypass token format for testing
      if (token.startsWith("debug-bypass-")) {
        // Parse email from token for debug mode
        const email = token.replace("debug-bypass-", "");
        console.log("[API] Using debug bypass token for:", email);

        if (MOCK_USERS[email]) {
          const userData = MOCK_USERS[email];
          return NextResponse.json({
            id: userData.agentId,
            name: userData.name,
            email: userData.email,
            role: userData.role,
            isActive: userData.isActive,
            isAvailable: userData.isAvailable,
            activeSessions: 0,
            waitingSessions: 0,
            debugMode: true,
          });
        }
      }

      // Normal JWT verification
      decodedToken = jwt.verify(token, JWT_SECRET) as {
        id: string;
        email: string;
        role: string;
        agentId: string;
      };
      console.log("[API] Token verified for user:", decodedToken.email);
    } catch (jwtError) {
      console.error("[API] JWT verification failed:", jwtError);

      // If we're in debug mode, give more information
      if (DEBUG_MODE) {
        return NextResponse.json(
          {
            error: "Invalid authentication token",
            details: String(jwtError),
            debugHelp:
              "Make sure JWT_SECRET environment variable is correctly set",
          },
          { status: 401 }
        );
      }

      return NextResponse.json(
        { error: "Invalid authentication token" },
        { status: 401 }
      );
    }

    // If we're in mock DB mode, use hardcoded data
    if (USE_MOCK_DB || DEBUG_MODE) {
      console.log("[API] Using mock data for", decodedToken.email);

      // Check if this is a test account
      if (MOCK_USERS[decodedToken.email]) {
        const userData = MOCK_USERS[decodedToken.email];
        return NextResponse.json({
          id: userData.agentId,
          name: userData.name,
          email: userData.email,
          role: userData.role,
          isActive: userData.isActive,
          isAvailable: userData.isAvailable,
          activeSessions: 0,
          waitingSessions: 0,
          mockData: true,
        });
      }

      // Fallback mock data
      return NextResponse.json({
        id: decodedToken.agentId || "mock-agent-id",
        name: decodedToken.email.split("@")[0] || "Mock Agent",
        email: decodedToken.email,
        role: decodedToken.role || "agent",
        isActive: true,
        isAvailable: true,
        activeSessions: 0,
        waitingSessions: 0,
        mockData: true,
      });
    }

    // If using a real DB, query for the user
    try {
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
    } catch (dbError) {
      console.error("[API] Database error:", dbError);

      // If in debug mode, return detailed error
      if (DEBUG_MODE) {
        return NextResponse.json(
          {
            error: "Database error",
            details: String(dbError),
            fallback: {
              id: decodedToken.agentId || "fallback-agent-id",
              name: decodedToken.email.split("@")[0] || "Fallback Agent",
              email: decodedToken.email,
              role: decodedToken.role || "agent",
              isActive: true,
              isAvailable: true,
              activeSessions: 0,
              waitingSessions: 0,
              debugFallback: true,
            },
          },
          { status: 500 }
        );
      }

      throw dbError; // Re-throw to be caught by outer handler
    }
  } catch (error: unknown) {
    console.error("[API] Error in agent/me endpoint:", error);

    // Special detailed error for Vercel environment variables
    if (error instanceof Error && error.message.includes("ENV")) {
      return NextResponse.json(
        {
          error: "Environment configuration error",
          details: DEBUG_MODE ? error.message : "Check server logs for details",
          tip: "Make sure JWT_SECRET and other required environment variables are set",
        },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        error: "Failed to retrieve agent information",
        details: DEBUG_MODE
          ? error instanceof Error
            ? error.message
            : String(error)
          : "An internal server error occurred",
      },
      { status: 500 }
    );
  }
}
