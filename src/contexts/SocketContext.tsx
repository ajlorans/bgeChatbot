"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useRef,
  useCallback,
} from "react";
import { io, Socket } from "socket.io-client";
import type {
  ClientToServerEvents,
  ServerToClientEvents,
} from "@/lib/socketService";
import { v4 as uuidv4 } from "uuid";
import { Message } from "@/types/chatTypes";

interface SocketProviderProps {
  children: React.ReactNode;
}

interface SocketContextType {
  socket: Socket<ServerToClientEvents, ClientToServerEvents> | null;
  isConnected: boolean;
  lastMessage: Message | null;
  lastSessionUpdate: any;
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
  const [socket, setSocket] = useState<Socket<
    ServerToClientEvents,
    ClientToServerEvents
  > | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [lastMessage, setLastMessage] = useState<Message | null>(null);
  const [lastSessionUpdate, setLastSessionUpdate] = useState<any>(null);
  const [agentTyping, setAgentTyping] = useState(false);
  const [customerTyping, setCustomerTyping] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);

  // Define all callbacks at the component level, not inside useEffect
  const handleMessageReceived = useCallback((message: any) => {
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
        } else if (message.metadata.agentName) {
          agentName = message.metadata.agentName;
        }
      } catch (e) {
        console.error("Error parsing message metadata:", e);
      }
    }

    // Create formatted message with agent name
    const formattedMessage = {
      ...message,
      agentName,
      timestamp: message.timestamp || new Date().toISOString(),
    };

    // Add to messages
    setMessages((prevMessages) => [...prevMessages, formattedMessage]);

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

  const handleSessionUpdated = useCallback((session: any) => {
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
    // Initialize socket connection
    const socketInstance = io({
      path: "/api/socket",
      autoConnect: true,
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 2000,
      timeout: 20000,
      transports: ["polling", "websocket"],
      withCredentials: true,
    });

    // Log debug info
    console.log("Socket initializing with path: /api/socket");

    // Set the socket instance to state
    setSocket(socketInstance);

    // Socket event handlers
    socketInstance.on("connect", () => {
      console.log("Socket connected with ID:", socketInstance.id);
      setIsConnected(true);
    });

    socketInstance.on("connect_error", (error) => {
      console.error("Socket connection error:", error.message);
      // Retry connection with polling only if websocket fails
      if (socketInstance.io.opts.transports?.includes("websocket")) {
        console.log("Retrying connection with polling transport only");
        socketInstance.io.opts.transports = ["polling"];
      }
    });

    socketInstance.on("disconnect", (reason) => {
      console.log("Socket disconnected, reason:", reason);
      setIsConnected(false);
    });

    socketInstance.on("error", (error) => {
      console.error("Socket error:", error);
    });

    socketInstance.on("messageReceived", (message) => {
      console.log("Socket context received message:", message);
      setLastMessage(message);
      // Note: Individual components will handle the message via their own listeners
    });

    socketInstance.on("newMessage", (message) => {
      console.log("Socket context received new message broadcast:", message);
      // This is a backup mechanism to ensure all clients get the message
      // Set the last message so that components can react to it
      setLastMessage(message);
    });

    socketInstance.on("sessionUpdated", (session) => {
      console.log("Socket context received session update:", session);
      // Individual components will handle this via their own listeners
    });

    socketInstance.on("agentTyping", (data) => {
      console.log("Agent typing:", data);
    });

    socketInstance.on("customerTyping", (data) => {
      console.log("Customer typing:", data);
    });

    // Cleanup on unmount
    return () => {
      console.log("Cleaning up socket...");
      socketInstance.disconnect();
    };
  }, []);

  // Socket event handlers effect
  useEffect(() => {
    if (!socket) return;

    const handleDisconnect = (reason: string) => {
      console.log("Socket disconnected:", reason);
      setIsConnected(false);
    };

    const handleError = (error: unknown) => {
      console.error("Socket error:", error);
    };

    // Update the socket event handlers
    socket.on("disconnect", handleDisconnect);
    socket.on("error", handleError);
    socket.on("messageReceived", handleMessageReceived);
    socket.on("newMessage", handleNewMessage);
    socket.on("sessionUpdated", handleSessionUpdated);
    socket.on("agentTyping", handleAgentTyping);
    socket.on("customerTyping", handleCustomerTyping);

    return () => {
      socket.off("disconnect", handleDisconnect);
      socket.off("error", handleError);
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

  // Provide the socket and related state to the application
  return (
    <SocketContext.Provider
      value={{
        socket,
        isConnected,
        lastMessage,
        lastSessionUpdate,
        agentTyping,
        customerTyping,
        joinSession: () => {},
        leaveSession: () => {},
        emitEvent: () => {},
      }}
    >
      {children}
    </SocketContext.Provider>
  );
};

export default SocketProvider;
