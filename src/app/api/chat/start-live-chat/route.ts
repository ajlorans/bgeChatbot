import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function POST(request: NextRequest) {
  try {
    const { customerName, customerEmail } = await request.json();

    // Validate input
    if (!customerName || !customerEmail) {
      return NextResponse.json(
        { error: "Customer name and email are required" },
        { status: 400 }
      );
    }

    // Find an available agent
    const availableAgent = await prisma.agent.findFirst({
      where: {
        status: "active",
      },
      orderBy: {
        // Prioritize agents with fewer active sessions
        chatSessions: {
          _count: "asc",
        },
      },
    });

    // Create a new chat session
    const session = await prisma.chatSession.create({
      data: {
        customerName,
        customerEmail,
        status: availableAgent ? "active" : "waiting",
        isLiveChat: true,
        agentId: availableAgent?.id || null,
        metadata: {
          source: "web",
          userAgent: request.headers.get("user-agent"),
          ipAddress: request.headers.get("x-forwarded-for") || "unknown",
        },
      },
    });

    // Create initial system message
    await prisma.message.create({
      data: {
        chatSessionId: session.id,
        content: availableAgent
          ? `Chat session started and assigned to ${availableAgent.role}`
          : "Chat session started. Waiting for an available agent.",
        role: "system",
        type: "text",
        timestamp: new Date(),
      },
    });

    // Return session info
    return NextResponse.json({
      sessionId: session.id,
      status: session.status,
      message: availableAgent
        ? "Connected to an agent"
        : "Waiting for an available agent",
    });
  } catch (error) {
    console.error("Error starting live chat:", error);
    return NextResponse.json(
      { error: "Failed to start live chat" },
      { status: 500 }
    );
  }
}
