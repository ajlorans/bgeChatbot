import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { corsConfig, getAllowedOrigins } from "@/config/cors";
import { io } from "@/lib/socketService";

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

// Disable logging
console.log = () => {};
console.error = () => {};

/**
 * API handler for ending chat sessions
 * Can be called:
 * 1. Explicitly by customer ending chat
 * 2. Via beforeunload event when customer closes window
 * 3. By agent ending the chat
 */
export async function POST(req: NextRequest) {
  try {
    // Parse the request body
    let body;
    try {
      body = await req.json();
    } catch (error) {
      // For sendBeacon, we might need to read as text first
      const text = await req.text();
      if (text) {
        try {
          body = JSON.parse(text);
        } catch (e) {
          return NextResponse.json(
            { success: false, message: 'Invalid request format' },
            { status: 400 }
          );
        }
      }
    }

    const { sessionId, endedBy = 'customer', reason = 'ended_by_customer' } = body || {};

    if (!sessionId) {
      return NextResponse.json(
        { success: false, message: 'Session ID is required' },
        { status: 400 }
      );
    }

    // Find the chat session
    const chatSession = await prisma.chatSession.findUnique({
      where: { id: sessionId },
    });

    if (!chatSession) {
      return NextResponse.json(
        { success: false, message: 'Chat session not found' },
        { status: 404 }
      );
    }

    // If the chat is already closed or abandoned, just return success
    if (chatSession.status === 'closed' || chatSession.status === 'abandoned') {
      return NextResponse.json({
        success: true,
        message: 'Chat session already closed',
        session: chatSession,
      });
    }

    // Update session status based on the reason
    const status = reason === 'customer_left' ? 'abandoned' : 'closed';

    // Update the chat session status
    const updatedSession = await prisma.chatSession.update({
      where: { id: sessionId },
      data: {
        status,
        closedAt: new Date(),
        closedReason: reason,
      },
    });

    // Add a system message about the chat ending
    let message = 'This chat session has ended.';
    if (endedBy === 'customer') {
      message = 'The customer has ended this chat session.';
    } else if (endedBy === 'agent') {
      message = 'The agent has ended this chat session.';
    } else if (reason === 'customer_left') {
      message = 'The customer appears to have left. This chat session has been marked as abandoned.';
    } else if (reason === 'inactive') {
      message = 'This chat session has been closed due to inactivity.';
    }

    await prisma.message.create({
      data: {
        sessionId,
        role: 'system',
        content: message,
        timestamp: new Date(),
      },
    });

    // Notify connected clients via socket if available
    if (io) {
      io.to(String(sessionId)).emit('sessionUpdated', {
        id: sessionId,
        status,
        closedReason: reason,
        message,
      });

      // Notify all agents to refresh their dashboard
      io.to('agents').emit('sessionUpdated', {
        id: sessionId,
        status,
        closedReason: reason,
      });
    }

    return NextResponse.json({
      success: true,
      message: 'Chat session closed successfully',
      session: updatedSession,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: 'Failed to close chat session' },
      { status: 500 }
    );
  }
}
