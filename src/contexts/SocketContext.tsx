"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { io, Socket } from "socket.io-client";
import {
  ClientToServerEvents,
  ServerToClientEvents,
} from "@/lib/socketService";

interface SocketProviderProps {
  children: React.ReactNode;
}

interface SocketContextType {
  socket: Socket<ServerToClientEvents, ClientToServerEvents> | null;
  isConnected: boolean;
  lastMessage: any;
  typing: { [sessionId: string]: boolean };
  errors: string[];
}

const SocketContext = createContext<SocketContextType>({
  socket: null,
  isConnected: false,
  lastMessage: null,
  typing: {},
  errors: [],
});

export const useSocket = () => useContext(SocketContext);

export const SocketProvider: React.FC<SocketProviderProps> = ({ children }) => {
  const [socket, setSocket] = useState<Socket<
    ServerToClientEvents,
    ClientToServerEvents
  > | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [lastMessage, setLastMessage] = useState<any>(null);
  const [typing, setTyping] = useState<{ [sessionId: string]: boolean }>({});
  const [errors, setErrors] = useState<string[]>([]);

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
      setErrors((prev) => [...prev, error]);
    });

    socketInstance.on("messageReceived", (message) => {
      console.log("Socket context received message:", message);
      setLastMessage(message);
      // Note: Individual components will handle the message via their own listeners
    });

    socketInstance.on("sessionUpdated", (session) => {
      console.log("Socket context received session update:", session);
      // Individual components will handle this via their own listeners
    });

    socketInstance.on("agentTyping", (data) => {
      console.log("Agent typing:", data);
      setTyping((prev) => ({
        ...prev,
        [data.sessionId]: data.isTyping,
      }));
    });

    socketInstance.on("customerTyping", (data) => {
      console.log("Customer typing:", data);
      setTyping((prev) => ({
        ...prev,
        [data.sessionId]: data.isTyping,
      }));
    });

    // Cleanup on unmount
    return () => {
      console.log("Cleaning up socket...");
      socketInstance.disconnect();
    };
  }, []);

  // Provide the socket and related state to the application
  return (
    <SocketContext.Provider
      value={{
        socket,
        isConnected,
        lastMessage,
        typing,
        errors,
      }}
    >
      {children}
    </SocketContext.Provider>
  );
};

export default SocketProvider;
