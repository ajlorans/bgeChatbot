import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getServerSession } from "@/lib/session";
import { io } from "@/lib/socketService";

export async function POST(
  req: NextRequest,
  context: { params: { id: string } }
) {
  try {
    // Get the authenticated session
    const session = await getServerSession();

    // If no session or not an agent, return unauthorized
    if (!session || !session.user || !session.user.agentId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const agentId = session.user.agentId;
    const sessionId = context.params.id;

    // Log important information for debugging
    console.log(`Agent ${agentId} attempting to claim session ${sessionId}`);

    // Use a transaction with pessimistic locking to ensure exclusive access
    const result = await prisma.$transaction(
      async (tx) => {
        // Get a lock on the chat session
        const chatSession = await tx.chatSession.findUnique({
          where: { id: sessionId },
          select: {
            id: true,
            status: true,
            agentId: true,
            customerName: true,
            customerEmail: true,
          },
        });

        if (!chatSession) {
          console.log(`Session ${sessionId} not found`);
          throw new Error("Chat session not found");
        }

        console.log(
          `Session status: ${chatSession.status}, current agent: ${
            chatSession.agentId || "none"
          }`
        );

        // Check if the session is already claimed
        if (chatSession.status !== "waiting" || chatSession.agentId) {
          // If it's claimed by this agent, it's fine
          if (chatSession.agentId === agentId) {
            console.log(
              `Session ${sessionId} already claimed by this agent ${agentId}`
            );
            return {
              success: true,
              alreadyClaimed: true,
              message: "You have already claimed this session",
              session: chatSession,
            };
          }

          // Otherwise, it's claimed by someone else
          console.log(
            `Session ${sessionId} already claimed by another agent: ${chatSession.agentId}`
          );
          throw new Error(
            `Session cannot be claimed (current status: ${
              chatSession.status
            }, ${
              chatSession.agentId ? "already assigned to another agent" : ""
            })`
          );
        }

        // Get agent info
        const agent = await tx.user.findUnique({
          where: { id: session.user.id },
          select: {
            id: true,
            name: true,
            email: true,
          },
        });

        if (!agent) {
          console.log(`Agent user not found: ${session.user.id}`);
          throw new Error("Agent not found");
        }

        console.log(`Agent info retrieved: ${agent.name} (${agent.email})`);

        // Claim the chat session - critical section
        console.log(
          `Updating session ${sessionId} to assign to agent ${agentId}`
        );
        const updatedSession = await tx.chatSession.update({
          where: { id: sessionId },
          data: {
            status: "active",
            agentId,
            updatedAt: new Date(),
          },
        });

        // Add system message about the agent claiming the chat
        const agentName = agent?.name || "Agent";
        const systemMessage = await tx.message.create({
          data: {
            sessionId,
            role: "system",
            content: `Agent ${agentName} has joined the conversation.`,
            timestamp: new Date(),
            category: "live_agent",
            metadata: JSON.stringify({
              agentName: agentName,
            }),
          },
        });

        console.log(`Created system message: ${systemMessage.id}`);

        return {
          success: true,
          message: "Session claimed successfully",
          session: updatedSession,
          agent: {
            id: agent.id,
            name: agent.name,
            email: agent.email,
          },
        };
      },
      {
        // Use a longer timeout for the transaction to avoid timing issues
        timeout: 10000,
        // Use serializable isolation level for strongest consistency
        isolationLevel: "Serializable",
      }
    );

    // Notify all connected clients that this chat has been claimed
    if (io && result.success && !result.alreadyClaimed) {
      console.log(`Broadcasting chat:claimed event for session ${sessionId}`);

      // Emit to the specific session room
      io.to(String(sessionId)).emit("chat:claimed", {
        sessionId,
        agentId,
        agentName: result.agent?.name || "An agent",
        timestamp: new Date(),
      });

      // Also emit to all agents
      io.to("agents").emit("chat:claimed", {
        sessionId,
        agentId,
        agentName: result.agent?.name || "An agent",
        timestamp: new Date(),
      });
    }

    // Return success response
    return NextResponse.json(result);
  } catch (error) {
    console.error("Error claiming chat session:", error);

    // Return appropriate error based on the type
    if ((error as Error).message.includes("already assigned")) {
      return NextResponse.json(
        {
          error: "This session has already been claimed by another agent",
          details: (error as Error).message,
        },
        { status: 409 } // Conflict status code
      );
    }

    if ((error as Error).message.includes("not found")) {
      return NextResponse.json(
        {
          error: "Chat session not found",
          details: (error as Error).message,
        },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        error: "Failed to claim chat session",
        details: (error as Error).message,
      },
      { status: 500 }
    );
  }
}
