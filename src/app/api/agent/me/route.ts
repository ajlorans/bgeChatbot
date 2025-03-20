import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import jwt from "jsonwebtoken";

const prisma = new PrismaClient();
const DEBUG_MODE = process.env.DEBUG_MODE === "true";
const JWT_SECRET =
  process.env.JWT_SECRET || "fallback-secret-do-not-use-in-production";
const USE_MOCK_DB = process.env.USE_MOCK_DB === "true";

// Define the mock user type
type MockUser = {
  agentId: string;
  id: string;
  name: string;
  email: string;
  role: string;
  isActive: boolean;
  isAvailable: boolean;
  activeSessions: number;
  waitingSessions: number;
};

// Sample mock data for testing without a database
const MOCK_USERS: Record<string, MockUser> = {
  "agent@example.com": {
    agentId: "mock-agent-1",
    id: "user-1",
    name: "Test Agent",
    email: "agent@example.com",
    role: "agent",
    isActive: true,
    isAvailable: true,
    activeSessions: 1,
    waitingSessions: 3,
  },
  "admin@example.com": {
    agentId: "mock-admin-1",
    id: "user-2",
    name: "Test Admin",
    email: "admin@example.com",
    role: "admin",
    isActive: true,
    isAvailable: true,
    activeSessions: 0,
    waitingSessions: 5,
  },
};

// Function to verify JWT token
async function verifyToken(token: string) {
  try {
    // Verify the token with the secret
    const decoded = jwt.verify(token, JWT_SECRET) as {
      id: string;
      email: string;
      role: string;
      agentId?: string;
    };

    return decoded;
  } catch (error) {
    console.error("[API] JWT verification error:", error);
    throw new Error("Invalid token");
  }
}

export async function GET(req: NextRequest) {
  console.log("[API] GET /api/agent/me called");

  try {
    // Get token from cookies
    const token = req.cookies.get("agent_token")?.value;

    // Log token presence (not the actual value for security)
    console.log("[API] Token exists:", !!token);

    // If no token, return 401 Unauthorized
    if (!token) {
      console.log("[API] No token found in cookies");
      return NextResponse.json(
        { error: "Unauthorized - No token provided" },
        { status: 401 }
      );
    }

    // Handle bypass token (for development)
    if (
      token.startsWith("BYPASS_TOKEN_") &&
      process.env.NODE_ENV !== "production"
    ) {
      console.log("[API] Using bypass token");
      return NextResponse.json({
        ...MOCK_USERS["agent@example.com"],
        bypassMode: true,
      });
    }

    // Verify the token - with proper error handling to prevent undefined.split error
    let verified;
    try {
      verified = await verifyToken(token);

      // If token verification fails, it will throw an error that's caught in the catch block below
      console.log("[API] Token verified successfully");
    } catch (tokenError) {
      console.log("[API] Token verification failed:", tokenError);
      return NextResponse.json(
        { error: "Invalid or expired token" },
        { status: 401 }
      );
    }

    // If we're here, token is valid and verified contains the decoded token data
    const { email } = verified;

    if (!email) {
      console.log("[API] No email in token payload");
      return NextResponse.json(
        { error: "Invalid token format" },
        { status: 400 }
      );
    }

    // Debug mode - return mock data if enabled
    if (process.env.DEBUG_MODE === "true") {
      console.log("[API] Debug mode enabled, returning mock data");
      return NextResponse.json({
        ...MOCK_USERS["agent@example.com"],
        email,
        debugMode: true,
      });
    }

    // If we're in mock DB mode, use hardcoded data
    if (USE_MOCK_DB || DEBUG_MODE) {
      console.log("[API] Using mock data for", email);

      // Check if this is a test account
      if (MOCK_USERS[email]) {
        const userData = MOCK_USERS[email];
        return NextResponse.json({
          id: userData.agentId,
          name: userData.name,
          email: userData.email,
          role: userData.role,
          isActive: userData.isActive,
          isAvailable: userData.isAvailable,
          activeSessions: userData.activeSessions,
          waitingSessions: userData.waitingSessions,
          mockData: true,
        });
      }

      // Fallback mock data
      return NextResponse.json({
        id: verified.agentId || "mock-agent-id",
        name: email.split("@")[0] || "Mock Agent",
        email: email,
        role: verified.role || "agent",
        isActive: true,
        isAvailable: true,
        activeSessions: 0,
        waitingSessions: 2,
        mockData: true,
      });
    }

    try {
      // Get the user from the database
      const user = await prisma.user.findUnique({
        where: { email },
        include: { agent: true },
      });

      if (!user || !user.agent) {
        console.error(`[API] User or agent not found for email: ${email}`);
        return NextResponse.json({ error: "Agent not found" }, { status: 404 });
      }

      // Count active chat sessions
      const activeSessions = await prisma.chatSession.count({
        where: {
          agentId: user.agent.id,
          status: "ACTIVE",
        },
      });

      // Count waiting sessions
      const waitingSessions = await prisma.chatSession.count({
        where: {
          agentId: null,
          status: "WAITING",
        },
      });

      // Return agent information
      const response = {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        agentId: user.agent.id,
        isActive: user.agent.isActive,
        isAvailable: user.agent.isAvailable,
        activeSessions,
        waitingSessions,
      };

      console.log("[API] Successfully returned agent data");
      return NextResponse.json(response);
    } catch (dbError) {
      console.error("[API] Database error:", dbError);

      // In debug mode, return more details about the error
      if (DEBUG_MODE) {
        return NextResponse.json(
          {
            error: "Database error",
            details: String(dbError),
            fallback: {
              id: verified.agentId || "fallback-agent-id",
              name: email.split("@")[0] || "Fallback Agent",
              email: email,
              role: verified.role || "agent",
              isActive: true,
              isAvailable: true,
              activeSessions: 0,
              waitingSessions: 2,
              debugFallback: true,
            },
          },
          { status: 500 }
        );
      }

      return NextResponse.json(
        { error: "Error retrieving agent data" },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("[API] Unhandled error in agent/me endpoint:", error);

    if (DEBUG_MODE) {
      return NextResponse.json(
        {
          error: "Internal server error",
          details: String(error),
        },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
