import { Server, Socket } from "socket.io";
import { NextApiRequest, NextApiResponse } from "next";
import { NextServer } from "next/dist/server/next";
import { parse } from "cookie";
import jwt from "jsonwebtoken";
import { prisma } from "./db";

// Singleton instance of Socket.IO server
export let io: Server | null = null;

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
  newMessage: (message: any) => void;
  sessionUpdated: (session: any) => void;
  error: (error: string) => void;
  agentTyping: (data: { sessionId: string; isTyping: boolean }) => void;
  customerTyping: (data: { sessionId: string; isTyping: boolean }) => void;
  agentStatusChange: (data: { agentId: string; status: string }) => void;
  chatEnded: (data: {
    sessionId: string;
    endedBy: "agent" | "customer";
  }) => void;
  "chat:claimed": (data: {
    sessionId: string;
    agentId: string;
    agentName: string;
    timestamp: Date;
  }) => void;
  "chat:newWaitingSession": (session: any) => void;
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
  endChat: (sessionId: string) => void;
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
const JWT_SECRET =
  process.env.JWT_SECRET ||
  (process.env.NODE_ENV === "production"
    ? (console.error("JWT_SECRET is not set in production environment!"),
      "temporary-fallback-secret-key")
    : "development-secret-key");

// Flag to prevent socket connections on login/public pages
export const shouldConnectSocket = (pathname: string): boolean => {
  // Don't connect on login pages, public pages, or when not in a browser
  if (typeof window === "undefined") return false;

  // Skip socket initialization on these paths
  const noSocketPaths = [
    "/agent-login",
    "/login",
    "/login/agent",
    "/widget",
    "/embed",
  ];

  // Check if we're on a path that shouldn't establish socket connections
  for (const path of noSocketPaths) {
    if (pathname === path || pathname.startsWith(`${path}/`)) {
      console.log(`[Socket] Skipping connection on ${pathname}`);
      return false;
    }
  }

  // Skip socket on API routes
  if (pathname.startsWith("/api/")) {
    console.log(`[Socket] Skipping connection on API route ${pathname}`);
    return false;
  }

  console.log(`[Socket] Should connect socket on ${pathname}`);
  return true;
};

// Initialize with socket.io server
export const initSocketServer = (
  req: NextApiRequest,
  res: NextApiResponseWithSocket
) => {
  // If socket.io server is already initialized, do nothing
  if (res.socket.server.io) {
    console.log("Socket.io already running, reusing existing instance");
    io = res.socket.server.io;
    return res;
  }

  console.log("Initializing Socket.io server from scratch");
  const ioServer = new Server<
    ClientToServerEvents,
    ServerToClientEvents,
    InterServerEvents,
    SocketData
  >(res.socket.server as any, {
    path: "/api/socket",
    addTrailingSlash: false,
    // Enable CORS for all origins during debugging
    cors: {
      origin: "*",
      methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
      credentials: true,
    },
  });

  res.socket.server.io = ioServer;
  io = ioServer;

  // Debug sockets on connect to track session/agent connections
  ioServer.on("connection", (socket) => {
    console.log(`🔌 Socket connected: ${socket.id}`);

    // Log all connected sockets on server
    console.log(`💻 Total connected sockets: ${ioServer.engine.clientsCount}`);

    // Auto-join the socket to a notification room based on role
    if (socket.data.user?.agentId) {
      socket.join("agents");
      console.log(`👮 Agent ${socket.data.user.agentId} joined agents room`);
    } else {
      socket.join("customers");
      console.log(`👨 Customer joined customers room`);
    }

    // Log disconnect events
    socket.on("disconnect", (reason) => {
      console.log(`🔌 Socket disconnected: ${socket.id}, reason: ${reason}`);
    });
  });

  // Middleware for authentication
  io.use(async (socket, next) => {
    try {
      const cookies = socket.handshake.headers.cookie;

      // Log cookies for debugging
      if (process.env.DEBUG_MODE === "true") {
        console.log(`Socket auth - cookies present: ${!!cookies}`);
        if (cookies) {
          try {
            const parsedCookies = parse(cookies);
            console.log(
              "Socket cookies:",
              Object.keys(parsedCookies).join(", ")
            );
          } catch (e) {
            console.error("Error parsing cookies:", e);
          }
        }
      }

      // Allow unauthenticated connections (for customers)
      if (!cookies) {
        console.log(
          "No cookies found, allowing unauthenticated connection for customer"
        );
        socket.data.user = {
          id: `guest-${Date.now()}`,
          role: "customer",
        };
        return next();
      }

      // Parse cookies and look for tokens
      let parsedCookies;
      try {
        parsedCookies = parse(cookies);
      } catch (e) {
        console.error("Error parsing cookies:", e);
        socket.data.user = {
          id: `guest-${Date.now()}`,
          role: "customer",
        };
        return next();
      }

      const token = parsedCookies.agent_token || parsedCookies.token;

      // Log token details for debugging
      if (process.env.DEBUG_MODE === "true") {
        console.log(`Socket auth - token present: ${!!token}`);
        if (token) {
          console.log(
            `Token length: ${token.length}, starts with: ${token.substring(
              0,
              10
            )}...`
          );
        }
      }

      // If no token, still allow connection as guest
      if (!token) {
        console.log(
          "No token found, allowing unauthenticated connection for customer"
        );
        socket.data.user = {
          id: `guest-${Date.now()}`,
          role: "customer",
        };
        return next();
      }

      try {
        // More robust JWT verification with helpful error message
        let decoded;
        try {
          decoded = jwt.verify(token, JWT_SECRET) as any;
        } catch (jwtError) {
          console.error("JWT verification failed:", jwtError.message);

          // If in debug mode, create a debug token
          if (process.env.DEBUG_MODE === "true") {
            console.log("DEBUG MODE: Creating a test agent user for socket");
            socket.data.user = {
              id: "agent-test-id",
              role: "agent",
              agentId: "agent-id",
            };
            return next();
          }

          // Otherwise, fall back to guest
          socket.data.user = {
            id: `guest-${Date.now()}`,
            role: "customer",
          };
          return next();
        }

        // Check if user ID exists in decoded payload
        if (!decoded?.user?.id) {
          console.error("Invalid token format - missing user.id in payload");
          socket.data.user = {
            id: `guest-${Date.now()}`,
            role: "customer",
          };
          return next();
        }

        // Check if user exists - with error handling
        try {
          // Debug user check for faster development testing
          if (
            process.env.DEBUG_MODE === "true" &&
            (decoded.user.id === "agent-test-id" ||
              decoded.user.id === "admin-test-id")
          ) {
            console.log("DEBUG MODE: Using fast-path for test agent");
            socket.data.user = {
              id: decoded.user.id,
              role: decoded.user.role || "agent",
              agentId:
                decoded.user.id === "admin-test-id"
                  ? "admin-agent-id"
                  : "agent-id",
            };
            return next();
          }

          // Normal database lookup
          const user = await prisma.user.findUnique({
            where: {
              id: decoded.user.id,
            },
            include: {
              agent: true,
            },
          });

          if (!user) {
            console.log(
              "User not found in database but allowing connection as guest"
            );
            socket.data.user = {
              id: `guest-${Date.now()}`,
              role: "customer",
            };
            return next();
          }

          // Attach user data to socket
          socket.data.user = {
            id: decoded.user.id,
            role: user.role,
            agentId: user.agent?.id,
          };

          next();
        } catch (dbError) {
          console.error("Database error when verifying user:", dbError);

          // If in debug mode, use the decoded user data directly
          if (process.env.DEBUG_MODE === "true") {
            console.log("DEBUG MODE: Using decoded token data due to DB error");
            socket.data.user = {
              id: decoded.user.id,
              role: decoded.user.role || "customer",
              agentId: decoded.user.agentId,
            };
            return next();
          }

          // Fallback to guest user
          socket.data.user = {
            id: `guest-${Date.now()}`,
            role: "customer",
          };
          return next();
        }
      } catch (error) {
        console.error("General socket authentication error:", error);
        // Still allow connection as guest
        socket.data.user = {
          id: `guest-${Date.now()}`,
          role: "customer",
        };
        return next();
      }
    } catch (outerError) {
      // Catch-all error handler to ensure socket connections are always allowed
      console.error("Critical socket auth error:", outerError);
      socket.data.user = {
        id: `guest-${Date.now()}`,
        role: "customer",
      };
      return next();
    }
  });

  // Handle connections
  io.on("connection", (socket) => {
    console.log(`Socket connected: ${socket.id}`);

    // Debug socket rooms
    const logRooms = () => {
      const rooms = Array.from(socket.rooms);
      console.log(`Socket ${socket.id} is in rooms:`, rooms);

      // Log all active rooms
      if (io) {
        const allRooms = io.sockets.adapter.rooms;
        console.log("All active rooms:", Array.from(allRooms.keys()));
      }
    };

    // Initial room logging
    logRooms();

    // Join a specific chat session
    socket.on("joinSession", (sessionId) => {
      // Convert sessionId to string to ensure it works as a room name
      const roomId = String(sessionId);
      socket.join(roomId);
      console.log(`User ${socket.data.user.id} joined session ${roomId}`);

      // Log active rooms after joining
      logRooms();
    });

    // Leave a specific chat session
    socket.on("leaveSession", (sessionId) => {
      // Convert sessionId to string to ensure it works as a room name
      const roomId = String(sessionId);
      socket.leave(roomId);
      console.log(`User ${socket.data.user.id} left session ${roomId}`);

      // Log active rooms after leaving
      logRooms();
    });

    // Send a message
    socket.on("sendMessage", async (data) => {
      try {
        const { sessionId, content, type = "text" } = data;
        const userId = socket.data.user.id;
        const isAgent = !!socket.data.user.agentId;

        console.log(
          `Message from ${
            isAgent ? "agent" : "customer"
          } in session ${sessionId}`
        );

        // Verify the session exists
        const session = await prisma.chatSession.findUnique({
          where: { id: sessionId },
          include: {
            agent: {
              include: {
                user: {
                  select: {
                    name: true,
                    email: true,
                  },
                },
              },
            },
          },
        });

        if (!session) {
          console.error(`Session ${sessionId} not found`);
          socket.emit("error", "Session not found");
          return;
        }

        // For agents, verify they have access to this session
        if (isAgent && socket.data.user.agentId !== session.agentId) {
          console.error(
            `Agent ${socket.data.user.agentId} doesn't have access to session ${sessionId}`
          );
          socket.emit("error", "You don't have access to this session");
          return;
        }

        // Get agent name if this is an agent message
        let agentName = null;
        if (isAgent && session.agent?.user) {
          agentName = session.agent.user.name || "Agent";
          console.log(`Using agent name from session: ${agentName}`);
        } else if (isAgent) {
          // Fallback to user lookup if not in session
          const agent = await prisma.user.findUnique({
            where: { id: userId },
            select: {
              name: true,
              email: true,
            },
          });

          agentName = agent?.name || "Agent";
          console.log(`Agent name retrieved from user lookup: ${agentName}`);
        }

        // Create the message with metadata
        const messageData: any = {
          content,
          role: isAgent ? "agent" : "user",
          sessionId,
          timestamp: new Date(),
        };

        // Only add metadata if it's from an agent
        if (isAgent) {
          messageData.metadata = JSON.stringify({
            agentId: socket.data.user.agentId,
            agentName: agentName,
          });
        }

        const message = await prisma.message.create({
          data: messageData,
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

        // Create the formatted message to broadcast
        const formattedMessage = {
          id: message.id,
          content: message.content,
          role: message.role,
          timestamp: message.timestamp.toISOString(),
          sessionId: String(sessionId),
          agentName: agentName, // Add agent name directly to the message
        };

        console.log(`Broadcasting message to session ${sessionId}`);

        // Broadcast the message to everyone in the session
        if (io) {
          io.to(String(sessionId)).emit("messageReceived", formattedMessage);
          console.log(`Message broadcast to session ${sessionId} complete`);
        }
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
            sessionId,
          },
          data: {
            // Fields that don't exist in the Message model removed
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
            lastActive: new Date(),
          },
        });

        // Broadcast status change to all connected clients
        if (io) {
          io.emit("agentStatusChange", { agentId, status });
        }
      } catch (error) {
        console.error("Error updating agent status:", error);
        socket.emit("error", "Failed to update status");
      }
    });

    // End chat session
    socket.on("endChat", async (sessionId) => {
      try {
        // Get the session
        const session = await prisma.chatSession.findUnique({
          where: { id: sessionId },
        });

        if (!session) {
          socket.emit("error", "Session not found");
          return;
        }

        // Update the session status
        await prisma.chatSession.update({
          where: { id: sessionId },
          data: {
            status: "ended",
            updatedAt: new Date(),
          },
        });

        // Determine who ended the chat
        const endedBy = socket.data.user.agentId ? "agent" : "customer";

        // Create a system message about the chat ending
        await prisma.message.create({
          data: {
            sessionId,
            role: "system",
            content: `Chat ended by ${endedBy}.`,
            timestamp: new Date(),
          },
        });

        // Broadcast the chat ended event to all clients in the session
        if (io) {
          io.to(sessionId).emit("chatEnded", {
            sessionId,
            endedBy,
          });
        }

        // Leave the session room
        socket.leave(sessionId);
        console.log(
          `User ${socket.data.user.id} left session ${sessionId} after ending chat`
        );

        // Log active rooms
        logRooms();
      } catch (error) {
        console.error("Error ending chat:", error);
        socket.emit("error", "Failed to end chat");
      }
    });

    // Handle disconnection
    socket.on("disconnect", () => {
      console.log(`Socket disconnected: ${socket.id}`);
    });
  });

  return res;
};

export default initSocketServer;
