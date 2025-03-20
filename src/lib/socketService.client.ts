// Client-side socket service
import { io as ioClient, Socket } from "socket.io-client";

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

// Create a socket connection
export const createSocket = () => {
  // Initialize socket connection
  const socket = ioClient({
    path: "/api/socket",
    autoConnect: true,
    reconnection: true,
    reconnectionAttempts: 10,
    reconnectionDelay: 2000,
    timeout: 10000,
    transports: ["polling", "websocket"],
    withCredentials: true,
  });

  return socket;
};
