"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from "react";
import { Socket } from "socket.io-client";
import type {
  ClientToServerEvents,
  ServerToClientEvents,
} from "@/lib/socketService.client";
import { shouldConnectSocket, createSocket } from "@/lib/socketService.client";
import { v4 as uuidv4 } from "uuid";
import { Message } from "@/types/chatTypes";
import { usePathname } from "next/navigation";

interface SocketProviderProps {
  children: React.ReactNode;
}

interface SessionUpdate {
  sessionId: string;
  status?: string;
  agentId?: string;
  customerId?: string;
  updatedAt?: string;
  [key: string]: string | number | boolean | undefined | null;
}

interface SocketContextType {
  socket: Socket<ServerToClientEvents, ClientToServerEvents> | null;
  isConnected: boolean;
  lastMessage: Message | null;
  lastSessionUpdate: SessionUpdate | null;
  agentTyping: boolean;
  customerTyping: boolean;
  joinSession: (sessionId: string) => void;
  leaveSession: (sessionId: string) => void;
  emitEvent: <T extends keyof ClientToServerEvents>(
    event: T,
    ...args: Parameters<ClientToServerEvents[T]>
  ) => void;
}

const SocketContext = createContext<SocketContextType | undefined>(undefined);

export const useSocket = () => useContext(SocketContext);

export const SocketProvider: React.FC<SocketProviderProps> = ({ children }) => {
  const pathname = usePathname() || "";
  const [socket, setSocket] = useState<Socket<
    ServerToClientEvents,
    ClientToServerEvents
  > | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [lastMessage, setLastMessage] = useState<Message | null>(null);
  const [lastSessionUpdate, setLastSessionUpdate] =
    useState<SessionUpdate | null>(null);
  const [agentTyping, setAgentTyping] = useState(false);
  const [customerTyping, setCustomerTyping] = useState(false);

  // Define all callbacks at the component level, not inside useEffect
  const handleMessageReceived = useCallback((message: Message) => {
    console.log("Message received:", message);

    // Make sure the message has a unique ID
    if (!message.id) {
      message.id = uuidv4();
    }

    // Extract agent name from metadata if available
    let agentName = message.agentName;

    // Fallback to metadata extraction if agentName not directly on message
    if (!agentName && message.role === "agent" && message.metadata) {
      try {
        // Handle both string and object metadata
        if (typeof message.metadata === "string") {
          const parsedMetadata = JSON.parse(message.metadata);
          agentName = parsedMetadata.agentName;
        } else if (
          typeof message.metadata === "object" &&
          message.metadata &&
          "agentName" in message.metadata
        ) {
          agentName = message.metadata.agentName;
        }
      } catch (e) {
        console.error("Error parsing message metadata:", e);
      }
    }

    // Create formatted message with agent name
    const formattedMessage: Message = {
      ...message,
      agentName,
      timestamp: message.timestamp || new Date().toISOString(),
    };

    // Update last message
    setLastMessage(formattedMessage);
  }, []);

  const handleNewMessage = useCallback((message: Message) => {
    console.log("New message:", message);

    // Ensure we don't have duplicate message IDs by using a different handling path
    setLastMessage({
      ...message,
      // For typescript compatibility, we need to ensure the property exists
      timestamp: message.timestamp,
      // Only add agentName if it exists in the source message object
      ...(message.agentName ? { agentName: message.agentName } : {}),
    });
  }, []);

  const handleSessionUpdated = useCallback((session: SessionUpdate) => {
    console.log("Session updated:", session);
    setLastSessionUpdate(session);
  }, []);

  // Handle typing indicators with proper typing
  const handleAgentTyping = useCallback(
    (data: { sessionId: string; isTyping: boolean }) => {
      setAgentTyping(data.isTyping);
    },
    []
  );

  const handleCustomerTyping = useCallback(
    (data: { sessionId: string; isTyping: boolean }) => {
      setCustomerTyping(data.isTyping);
    },
    []
  );

  // Socket initialization effect
  useEffect(() => {
    // Check if we should connect socket on this page
    const enableSocket = shouldConnectSocket(pathname);

    if (!enableSocket) {
      console.log(`[Socket] Skipping socket connection on ${pathname}`);
      return;
    }

    console.log(`[Socket] Initializing socket connection on ${pathname}`);

    // Initialize socket connection
    const socketInstance = createSocket();

    // Log debug info
    console.log("[Socket] Initializing with path: /api/socket");

    // Set the socket instance to state
    setSocket(socketInstance);

    // Socket event handlers
    socketInstance.on("connect", () => {
      console.log("[Socket] Connected with ID:", socketInstance.id);
      setIsConnected(true);
    });

    socketInstance.on("connect_error", (error) => {
      console.error("[Socket] Connection error:", error.message);

      // Don't try to reconnect on login pages
      if (!enableSocket) {
        console.log("[Socket] Not reconnecting on login/public page");
        socketInstance.disconnect();
        return;
      }
    });

    // Handle disconnections with auto-reconnect strategy
    socketInstance.on("disconnect", (reason) => {
      console.log("[Socket] Disconnected, reason:", reason);
      setIsConnected(false);
    });

    // Cleanup on unmount
    return () => {
      console.log("[Socket] Cleaning up socket connection");
      socketInstance.disconnect();
    };
  }, [pathname]);

  // Socket event handlers effect
  useEffect(() => {
    if (!socket) return;

    // Add event listeners
    socket.on("messageReceived", handleMessageReceived);
    socket.on("newMessage", handleNewMessage);
    socket.on("sessionUpdated", handleSessionUpdated);
    socket.on("agentTyping", handleAgentTyping);
    socket.on("customerTyping", handleCustomerTyping);

    // Cleanup listeners on unmount or socket change
    return () => {
      socket.off("messageReceived", handleMessageReceived);
      socket.off("newMessage", handleNewMessage);
      socket.off("sessionUpdated", handleSessionUpdated);
      socket.off("agentTyping", handleAgentTyping);
      socket.off("customerTyping", handleCustomerTyping);
    };
  }, [
    socket,
    handleMessageReceived,
    handleNewMessage,
    handleSessionUpdated,
    handleAgentTyping,
    handleCustomerTyping,
  ]);

  // Define socket event handlers
  const joinSession = useCallback(
    (sessionId: string) => {
      if (socket && isConnected) {
        console.log(`[Socket] Joining session: ${sessionId}`);
        socket.emit("joinSession", sessionId);
      } else {
        console.warn("[Socket] Cannot join session - socket not connected");
      }
    },
    [socket, isConnected]
  );

  const leaveSession = useCallback(
    (sessionId: string) => {
      if (socket && isConnected) {
        console.log(`[Socket] Leaving session: ${sessionId}`);
        socket.emit("leaveSession", sessionId);
      }
    },
    [socket, isConnected]
  );

  const emitEvent = useCallback(
    <T extends keyof ClientToServerEvents>(
      event: T,
      ...args: Parameters<ClientToServerEvents[T]>
    ) => {
      if (socket && isConnected) {
        console.log(`[Socket] Emitting event: ${String(event)}`, args);
        socket.emit(event, ...args);
      } else {
        console.warn(
          `[Socket] Cannot emit event ${String(event)} - socket not connected`
        );
      }
    },
    [socket, isConnected]
  );

  return (
    <SocketContext.Provider
      value={{
        socket,
        isConnected,
        lastMessage,
        lastSessionUpdate,
        agentTyping,
        customerTyping,
        joinSession,
        leaveSession,
        emitEvent,
      }}
    >
      {children}
    </SocketContext.Provider>
  );
};

export default SocketProvider;
