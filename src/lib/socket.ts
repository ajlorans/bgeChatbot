import { Server } from "socket.io";
import { Server as HttpServer } from "http";
import { PrismaClient } from "@prisma/client";
import { ServerToClientEvents, ClientToServerEvents } from "@/types/socketTypes";
import { Message } from "@/types/chatTypes";

const prisma = new PrismaClient();

export function initializeSocket(server: HttpServer) {
  const io = new Server<ClientToServerEvents, ServerToClientEvents>(server, {
    cors: {
      origin: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
      methods: ["GET", "POST"],
    },
  });

  io.on("connection", (socket) => {
    console.log("Client connected:", socket.id);

    // Handle joining a session
    socket.on("joinSession", (sessionId: string) => {
      socket.join(sessionId);
      console.log(`Client ${socket.id} joined session ${sessionId}`);
    });

    // Handle leaving a session
    socket.on("leaveSession", (sessionId: string) => {
      socket.leave(sessionId);
      console.log(`Client ${socket.id} left session ${sessionId}`);
    });

    // Handle sending a message
    socket.on("sendMessage", async (message: Omit<Message, 'id' | 'timestamp'>) => {
      try {
        if (!message.chatSessionId) {
          console.error("Message missing chatSessionId");
          return;
        }

        // Save message to database
        const savedMessage = await prisma.message.create({
          data: {
            sessionId: message.chatSessionId,
            content: message.content,
            role: message.role,
            timestamp: new Date(),
            category: message.category || undefined,
            metadata: message.metadata || null,
          },
        });

        // Broadcast message to all clients in the session
        const broadcastMessage: Message = {
          ...savedMessage,
          timestamp: savedMessage.timestamp.toISOString(),
          role: savedMessage.role as "agent" | "customer" | "system",
          category: savedMessage.category || undefined,
          metadata: savedMessage.metadata || undefined,
        };

        io.to(message.chatSessionId).emit("messageReceived", broadcastMessage);
      } catch (error) {
        console.error("Error saving message:", error);
      }
    });

    // Handle typing indicators
    socket.on("typing", (data) => {
      socket.to(data.sessionId).emit("agentTyping", data);
    });

    // Handle ending chat
    socket.on("endChat", async (sessionId: string) => {
      try {
        // Update the session status in the database
        await prisma.chatSession.update({
          where: { id: sessionId },
          data: { status: "ended" },
        });

        // Broadcast the chat ended event to all clients
        io.emit("chatEnded", {
          sessionId,
          endedBy: "agent",
        });

        // Leave the session room
        socket.leave(sessionId);
      } catch (error) {
        console.error("Error ending chat:", error);
      }
    });

    // Handle customer ending chat
    socket.on("endChat", async (sessionId: string) => {
      try {
        // Update the session status in the database
        await prisma.chatSession.update({
          where: { id: sessionId },
          data: { status: "ended" },
        });

        // Broadcast the chat ended event to all clients
        io.emit("chatEnded", {
          sessionId,
          endedBy: "customer",
        });

        // Leave the session room
        socket.leave(sessionId);
      } catch (error) {
        console.error("Error ending chat:", error);
      }
    });

    // Handle disconnection
    socket.on("disconnect", () => {
      console.log("Client disconnected:", socket.id);
    });
  });

  return io;
} 