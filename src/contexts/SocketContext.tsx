"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useRef,
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

  useEffect(() => {
    // Initialize socket connection
    const socketInstance = io({
      path: "/api/socket",
      autoConnect: true,
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    // Set the socket instance to state
    setSocket(socketInstance);

    // Socket event handlers
    socketInstance.on("connect", () => {
      console.log("Socket connected!");
      setIsConnected(true);
    });

    socketInstance.on("disconnect", () => {
      console.log("Socket disconnected!");
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

  useEffect(() => {
    if (!socket) return;

    const handleDisconnect = (reason: string) => {
      console.log("Socket disconnected:", reason);
      setIsConnected(false);
    };

    const handleError = (error: unknown) => {
      console.error("Socket error:", error);
    };

    const handleMessageReceived = (message: Message) => {
      console.log("Message received:", message);
      // Make sure the message has a unique ID
      if (!message.id) {
        message.id = uuidv4();
      }
      setLastMessage(message);
    };

    const handleNewMessage = (message: Message) => {
      console.log("New message received:", message);
      // Make sure the message has a unique ID
      if (!message.id) {
        message.id = uuidv4();
      }
      // Ensure we don't have duplicate message IDs by using a different handling path
      setLastMessage({ ...message, receivedAt: Date.now() });
    };

    const handleSessionUpdated = (session: any) => {
      console.log("Session updated:", session);
      setLastSessionUpdate(session);
    };

    socket.on("disconnect", handleDisconnect);
    socket.on("error", handleError);
    socket.on("messageReceived", handleMessageReceived);
    socket.on("sessionUpdated", handleSessionUpdated);
    socket.on("agentTyping", setAgentTyping);
    socket.on("customerTyping", setCustomerTyping);

    return () => {
      socket.off("disconnect", handleDisconnect);
      socket.off("error", handleError);
      socket.off("messageReceived", handleMessageReceived);
      socket.off("sessionUpdated", handleSessionUpdated);
      socket.off("agentTyping", setAgentTyping);
      socket.off("customerTyping", setCustomerTyping);
    };
  }, [socket]);

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
