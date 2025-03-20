import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET() {
  try {
    // Get the session data from the server
    const session = await getServerSession();
    console.log("Agent/me API: Session data:", JSON.stringify(session));

    // Check if the user is authenticated
    if (!session || !session.user) {
      console.error("Agent/me API: No authenticated session found");
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const userEmail = session.user.email;
    if (!userEmail) {
      console.error("Agent/me API: Missing email in session");
      return NextResponse.json(
        { error: "Invalid session data - missing email" },
        { status: 401 }
      );
    }

    // Find the user by email
    console.log(`Agent/me API: Finding user with email ${userEmail}`);
    const user = await prisma.user.findUnique({
      where: { email: userEmail },
    });

    // If no user found, return 401
    if (!user) {
      console.error(`Agent/me API: No user found for email ${userEmail}`);

      // If in debug mode, return mock data
      if (process.env.DEBUG_MODE === "true") {
        console.log("DEBUG MODE: Returning mock agent data");
        return NextResponse.json({
          id: "debug-agent-id",
          role: "agent",
          name: "Debug Agent",
          email: userEmail,
          isActive: true,
          isAvailable: true,
          activeSessions: 0,
          waitingSessions: 0,
          debugMode: true,
        });
      }

      return NextResponse.json({ error: "User not found" }, { status: 401 });
    }

    // Find the agent associated with the user
    console.log(`Agent/me API: Finding agent for userId ${user.id}`);
    const agent = await prisma.agent.findUnique({
      where: { userId: user.id },
    });

    // If no agent found, return 401
    if (!agent) {
      console.error(`Agent/me API: No agent found for user ${user.id}`);

      // If in debug mode, return mock data
      if (process.env.DEBUG_MODE === "true") {
        console.log("DEBUG MODE: Returning mock agent data");
        return NextResponse.json({
          id: "debug-agent-id",
          role: user.role || "agent",
          name: user.name,
          email: user.email,
          isActive: true,
          isAvailable: true,
          activeSessions: 0,
          waitingSessions: 0,
          debugMode: true,
        });
      }

      return NextResponse.json({ error: "Not an agent" }, { status: 401 });
    }

    // Count active chat sessions for this agent
    let activeSessions = 0;
    let waitingSessions = 0;

    try {
      activeSessions = await prisma.chatSession.count({
        where: {
          agentId: agent.id,
          status: "active",
        },
      });

      waitingSessions = await prisma.chatSession.count({
        where: {
          status: "waiting",
        },
      });
    } catch (error) {
      console.error("Error counting chat sessions:", error);
      // Continue with default values of 0
    }

    // Return the agent data
    return NextResponse.json({
      id: agent.id,
      role: agent.role,
      name: user.name,
      email: user.email,
      isActive: agent.isActive,
      isAvailable: agent.isAvailable,
      activeSessions,
      waitingSessions,
    });
  } catch (dbError: unknown) {
    console.error("Error in agent/me API route:", dbError);

    // Return a detailed error response
    return NextResponse.json(
      {
        error: "Failed to retrieve agent data",
        details: dbError instanceof Error ? dbError.message : String(dbError),
        debugMode: process.env.DEBUG_MODE === "true",
      },
      { status: 500 }
    );
  }
}
