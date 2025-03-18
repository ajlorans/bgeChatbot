import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { corsConfig, getAllowedOrigins } from "@/config/cors";

// CORS middleware for the live chat API
export async function OPTIONS(req: NextRequest) {
  const origin = req.headers.get("origin");
  const allowedOrigins = getAllowedOrigins();

  if (origin && allowedOrigins.includes(origin)) {
    return new NextResponse(null, {
      status: 200,
      headers: {
        "Access-Control-Allow-Origin": origin,
        "Access-Control-Allow-Methods": corsConfig.methods.join(", "),
        "Access-Control-Allow-Headers": corsConfig.allowedHeaders.join(", "),
        "Access-Control-Max-Age": corsConfig.maxAge.toString(),
        "Access-Control-Allow-Credentials": "true",
      },
    });
  }

  return new NextResponse(null, { status: 403 });
}

/**
 * POST handler for ending a live chat session
 */
export async function POST(req: NextRequest) {
  const origin = req.headers.get("origin");
  const allowedOrigins = getAllowedOrigins();

  // Check if the origin is allowed
  if (!origin || !allowedOrigins.includes(origin)) {
    return new NextResponse(null, { status: 403 });
  }

  try {
    const { sessionId, endedBy = "customer" } = (await req.json()) as {
      sessionId: string;
      endedBy?: "customer" | "agent" | "system";
    };

    if (!sessionId) {
      return NextResponse.json(
        {
          success: false,
          message: "Session ID is required",
        },
        { status: 400 }
      );
    }

    // Find the chat session
    const chatSession = await prisma.chatSession.findUnique({
      where: { id: sessionId },
    });

    if (!chatSession) {
      return NextResponse.json(
        {
          success: false,
          message: "Chat session not found",
        },
        { status: 404 }
      );
    }

    // Update the session status to 'ended'
    await prisma.chatSession.update({
      where: { id: sessionId },
      data: {
        status: "ended",
        updatedAt: new Date(),
      },
    });

    // Add a system message indicating the chat ended
    await prisma.message.create({
      data: {
        sessionId,
        role: "system",
        content: `Live chat ended by ${endedBy}.`,
        category: "live_agent",
        timestamp: new Date(),
      },
    });

    // If an agent was assigned, update their status
    if (chatSession.agentId) {
      await prisma.agent.update({
        where: { id: chatSession.agentId },
        data: {
          lastActive: new Date(),
          // Maybe set isAvailable back to true here if appropriate
        },
      });
    }

    return NextResponse.json({
      success: true,
      message: "Live chat session ended successfully.",
    });
  } catch (error) {
    console.error("Error ending live chat session:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to end the chat session. Please try again later.",
      },
      { status: 500 }
    );
  }
}
