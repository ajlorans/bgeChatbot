import { Server, Socket } from "socket.io";
import { NextApiRequest, NextApiResponse } from "next";
import { NextServer } from "next/dist/server/next";
import { parse } from "cookie";
import jwt from "jsonwebtoken";
import { prisma } from "./db";

export type NextApiResponseWithSocket = NextApiResponse & {
  socket: {
    server: NextServer & {
      io?: Server;
    };
  };
};

// Types for socket connections
export interface ServerToClientEvents {
  noArg: () => void;
  messageReceived: (message: any) => void;
  sessionUpdated: (session: any) => void;
  error: (error: string) => void;
  agentTyping: (data: { sessionId: string; isTyping: boolean }) => void;
  customerTyping: (data: { sessionId: string; isTyping: boolean }) => void;
  agentStatusChange: (data: { agentId: string; status: string }) => void;
}

export interface ClientToServerEvents {
  joinSession: (sessionId: string) => void;
  leaveSession: (sessionId: string) => void;
  sendMessage: (data: {
    sessionId: string;
    content: string;
    type?: string;
  }) => void;
  typing: (data: { sessionId: string; isTyping: boolean }) => void;
  markRead: (data: { sessionId: string; messageIds: string[] }) => void;
  updateStatus: (data: { status: string }) => void;
}

export interface InterServerEvents {
  ping: () => void;
}

export interface SocketData {
  user: {
    id: string;
    role: string;
    agentId?: string;
  };
}

// JWT verification
const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";

// Initialize Socket.IO server
export const initSocketServer = (
  req: NextApiRequest,
  res: NextApiResponseWithSocket
) => {
  if (!res.socket.server.io) {
    console.log("Initializing Socket.IO server...");
    const io = new Server<
      ClientToServerEvents,
      ServerToClientEvents,
      InterServerEvents,
      SocketData
    >(res.socket.server, {
      path: "/api/socket",
      cors: {
        origin: "*",
        methods: ["GET", "POST"],
      },
    });

    // Save the io instance to the server object
    res.socket.server.io = io;

    // Also make it globally available for API routes to use
    (global as any).io = io;

    // Middleware for authentication
    io.use(async (socket, next) => {
      const cookies = socket.handshake.headers.cookie;
      if (!cookies) {
        return next(new Error("Authentication error"));
      }

      const parsedCookies = parse(cookies);
      const token = parsedCookies.agent_token || parsedCookies.token;

      if (!token) {
        return next(new Error("Authentication error"));
      }

      try {
        const decoded = jwt.verify(token, JWT_SECRET) as any;

        // Check if user exists
        const user = await prisma.user.findUnique({
          where: {
            id: decoded.user?.id,
          },
          include: {
            agent: true,
          },
        });

        if (!user) {
          return next(new Error("User not found"));
        }

        // Attach user data to socket
        socket.data.user = {
          id: decoded.user?.id,
          role: user.role,
          agentId: user.agent?.id,
        };

        next();
      } catch (error) {
        return next(new Error("Authentication error"));
      }
    });

    // Handle connections
    io.on("connection", (socket) => {
      console.log(`Socket connected: ${socket.id}`);

      // Join a specific chat session
      socket.on("joinSession", (sessionId) => {
        socket.join(sessionId);
        console.log(`User ${socket.data.user.id} joined session ${sessionId}`);
      });

      // Leave a specific chat session
      socket.on("leaveSession", (sessionId) => {
        socket.leave(sessionId);
        console.log(`User ${socket.data.user.id} left session ${sessionId}`);
      });

      // Send a message
      socket.on("sendMessage", async (data) => {
        try {
          const { sessionId, content, type = "text" } = data;
          const userId = socket.data.user.id;
          const isAgent = !!socket.data.user.agentId;

          // Verify the session exists
          const session = await prisma.chatSession.findUnique({
            where: { id: sessionId },
          });

          if (!session) {
            socket.emit("error", "Session not found");
            return;
          }

          // Create the message
          const message = await prisma.message.create({
            data: {
              content,
              type,
              role: isAgent ? "agent" : "customer",
              userId,
              chatSessionId: sessionId,
              timestamp: new Date(),
            },
          });

          // Update session's last activity
          await prisma.chatSession.update({
            where: { id: sessionId },
            data: { updatedAt: new Date() },
          });

          // If this is an agent, update their last active timestamp
          if (isAgent && socket.data.user.agentId) {
            await prisma.agent.update({
              where: { id: socket.data.user.agentId },
              data: { lastActive: new Date() },
            });
          }

          // Broadcast the message to everyone in the session
          io.to(sessionId).emit("messageReceived", message);
        } catch (error) {
          console.error("Error sending message via socket:", error);
          socket.emit("error", "Failed to send message");
        }
      });

      // Typing indicator
      socket.on("typing", (data) => {
        const { sessionId, isTyping } = data;
        const isAgent = !!socket.data.user.agentId;

        if (isAgent) {
          // Broadcast agent typing to the session (except the sender)
          socket.to(sessionId).emit("agentTyping", { sessionId, isTyping });
        } else {
          // Broadcast customer typing to the session (except the sender)
          socket.to(sessionId).emit("customerTyping", { sessionId, isTyping });
        }
      });

      // Mark messages as read
      socket.on("markRead", async (data) => {
        try {
          const { sessionId, messageIds } = data;

          // Update the messages
          await prisma.message.updateMany({
            where: {
              id: { in: messageIds },
              chatSessionId: sessionId,
            },
            data: {
              isRead: true,
              readAt: new Date(),
            },
          });
        } catch (error) {
          console.error("Error marking messages as read:", error);
          socket.emit("error", "Failed to mark messages as read");
        }
      });

      // Update agent status
      socket.on("updateStatus", async (data) => {
        try {
          const { status } = data;
          const agentId = socket.data.user.agentId;

          if (!agentId) {
            socket.emit("error", "Not authorized as an agent");
            return;
          }

          // Validate status
          const validStatuses = ["active", "away", "offline"];
          if (!validStatuses.includes(status)) {
            socket.emit("error", "Invalid status");
            return;
          }

          // Update the agent's status
          await prisma.agent.update({
            where: { id: agentId },
            data: {
              status,
              lastActive: new Date(),
            },
          });

          // Broadcast status change to all connected clients
          io.emit("agentStatusChange", { agentId, status });
        } catch (error) {
          console.error("Error updating agent status:", error);
          socket.emit("error", "Failed to update status");
        }
      });

      // Handle disconnection
      socket.on("disconnect", () => {
        console.log(`Socket disconnected: ${socket.id}`);
      });
    });
  }

  return res.socket.server.io;
};

export default initSocketServer;
