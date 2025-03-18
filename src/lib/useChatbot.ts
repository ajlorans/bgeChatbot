"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { Message, ChatCategory, LiveChatStatus } from "./types";
import { createMessage } from "./utils";

interface UseChatbotProps {
  initialMessage?: string;
}

interface UseChatbotReturn {
  messages: Message[];
  isLoading: boolean;
  sendMessage: (content: string) => Promise<void>;
  resetChat: () => void;
  category?: ChatCategory;
  isLiveChat: boolean;
  requestLiveAgent: (email?: string) => Promise<void>;
  liveChatStatus?: LiveChatStatus;
  liveChatDetails?: LiveChatDetails;
  endLiveChat: () => Promise<void>;
}

interface LiveChatDetails {
  agentName?: string;
  queuePosition?: number;
  estimatedWaitTime?: number;
  sessionId?: string;
}

export function useChatbot({
  initialMessage = "Hi there! I'm your Big Green Egg assistant. How can I help you today?",
}: UseChatbotProps = {}): UseChatbotReturn {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [category, setCategory] = useState<ChatCategory | undefined>(undefined);
  const [isLiveChat, setIsLiveChat] = useState(false);
  const [liveChatStatus, setLiveChatStatus] = useState<
    LiveChatStatus | undefined
  >(undefined);
  const [liveChatDetails, setLiveChatDetails] = useState<
    LiveChatDetails | undefined
  >(undefined);

  const sessionIdRef = useRef<string | undefined>(undefined);
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const lastMessageTimestampRef = useRef<number>(0);

  // Initialize with welcome message
  useEffect(() => {
    if (messages.length === 0) {
      setMessages([createMessage("assistant", initialMessage)]);
    }
  }, [initialMessage, messages.length]);

  // Clean up polling interval on unmount
  useEffect(() => {
    return () => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
      }
    };
  }, []);

  // Set up polling for live chat messages
  useEffect(() => {
    if (
      isLiveChat &&
      liveChatStatus === "active" &&
      liveChatDetails?.sessionId
    ) {
      // Start polling for new messages
      startMessagePolling();
    } else if (!isLiveChat && pollingIntervalRef.current) {
      // Stop polling if we're not in live chat
      clearInterval(pollingIntervalRef.current);
      pollingIntervalRef.current = null;
    }

    return () => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
      }
    };
  }, [isLiveChat, liveChatStatus, liveChatDetails?.sessionId]);

  // Function to poll for new messages in live chat
  const startMessagePolling = useCallback(() => {
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current);
    }

    // Check for new messages every 3 seconds
    pollingIntervalRef.current = setInterval(async () => {
      if (!liveChatDetails?.sessionId) {
        console.warn("No sessionId available for message polling");
        return;
      }

      try {
        const sessionId = liveChatDetails.sessionId;
        const timestamp = lastMessageTimestampRef.current;

        const response = await fetch(
          `/api/chat/live-chat?sessionId=${sessionId}&lastMessageTimestamp=${timestamp}`,
          {
            // Add error handling options
            cache: "no-cache",
            headers: {
              "Content-Type": "application/json",
            },
          }
        );

        if (!response.ok) {
          const errorText = await response.text();
          console.error(`Live chat API error (${response.status}):`, errorText);
          throw new Error(
            `Failed to fetch live chat messages: ${response.status} ${response.statusText}`
          );
        }

        const data = await response.json();

        if (data.success && data.messages && data.messages.length > 0) {
          // Add new messages to the chat
          setMessages((prev) => [...prev, ...data.messages]);

          // Update last message timestamp
          if (data.lastMessageTimestamp) {
            lastMessageTimestampRef.current = data.lastMessageTimestamp;
          }

          // Update live chat status if changed
          if (data.status !== liveChatStatus) {
            setLiveChatStatus(data.status);

            // If chat has ended
            if (data.status === "ended") {
              setIsLiveChat(false);
              if (pollingIntervalRef.current) {
                clearInterval(pollingIntervalRef.current);
                pollingIntervalRef.current = null;
              }

              // Add system message that chat has ended
              setMessages((prev) => [
                ...prev,
                createMessage(
                  "system",
                  "This live chat session has ended. You can continue chatting with our AI assistant."
                ),
              ]);
            }
          }

          // Update agent name if available
          if (
            data.agentName &&
            (!liveChatDetails.agentName ||
              liveChatDetails.agentName !== data.agentName)
          ) {
            setLiveChatDetails((prev) => ({
              ...prev!,
              agentName: data.agentName,
            }));
          }
        }
      } catch (error) {
        console.error("Error polling for live chat messages:", error);
        // Don't stop polling on errors, just log them
      }
    }, 3000);

    return () => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
        pollingIntervalRef.current = null;
      }
    };
  }, [liveChatDetails, liveChatStatus]);

  const sendMessage = useCallback(
    async (content: string) => {
      if (!content.trim() || isLoading) return;

      const userMessage = createMessage("user", content);
      setMessages((prev) => [...prev, userMessage]);
      setIsLoading(true);

      try {
        if (isLiveChat && liveChatDetails?.sessionId) {
          // Send message to live chat endpoint
          const response = await fetch("/api/chat/live-chat", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              sessionId: liveChatDetails.sessionId,
              message: content,
              role: "user",
              lastMessageTimestamp: lastMessageTimestampRef.current,
            }),
          });

          if (!response.ok) {
            throw new Error("Failed to send message to live agent");
          }

          const data = await response.json();

          // Update last message timestamp
          if (data.lastMessageTimestamp) {
            lastMessageTimestampRef.current = data.lastMessageTimestamp;
          }

          // If there are new messages from the agent, add them
          if (data.messages && data.messages.length > 0) {
            const newMessages = data.messages.filter(
              (msg: Message) => msg.role !== "user" // Filter out user's own messages
            );

            if (newMessages.length > 0) {
              setMessages((prev) => [...prev, ...newMessages]);
            }
          }
        } else {
          // Regular chatbot flow
          const response = await fetch("/api/chat", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              messages: [...messages, userMessage],
            }),
          });

          if (!response.ok) {
            throw new Error("Failed to get response");
          }

          const data = await response.json();
          if (data.message) {
            // Handle single message response with category
            const assistantMessage = createMessage("assistant", data.message);
            if (data.category) {
              assistantMessage.category = data.category;
              setCategory(data.category);
            }
            setMessages((prev) => [...prev, assistantMessage]);
          } else if (Array.isArray(data.messages) && data.messages.length > 0) {
            // Handle multiple messages response
            setMessages((prev) => [...prev, ...data.messages]);

            // Set category from the last message if available
            const lastMessage = data.messages[data.messages.length - 1];
            if (lastMessage.category) {
              setCategory(lastMessage.category);
            } else if (data.category) {
              setCategory(data.category);
            }
          } else {
            throw new Error("Invalid response format");
          }
        }
      } catch (error) {
        console.error("Error sending message:", error);
        setMessages((prev) => [
          ...prev,
          createMessage(
            "assistant",
            "Sorry, I encountered an error. Please try again later."
          ),
        ]);
      } finally {
        setIsLoading(false);
      }
    },
    [isLoading, messages, isLiveChat, liveChatDetails]
  );

  const resetChat = useCallback(() => {
    // End live chat if active
    if (isLiveChat && liveChatDetails?.sessionId) {
      endLiveChat();
    }

    // Reset all state
    setMessages([createMessage("assistant", initialMessage)]);
    setCategory(undefined);
    setIsLiveChat(false);
    setLiveChatStatus(undefined);
    setLiveChatDetails(undefined);
    sessionIdRef.current = undefined;

    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current);
      pollingIntervalRef.current = null;
    }

    lastMessageTimestampRef.current = 0;
  }, [initialMessage, isLiveChat, liveChatDetails]);

  // Request a live agent
  const requestLiveAgent = useCallback(
    async (email?: string) => {
      setIsLoading(true);

      try {
        const currentMessages = messages.slice(-10); // Send last 10 messages for context
        const sessionData = {
          sessionId: sessionIdRef.current,
          customerEmail: email,
          issue: category,
          messages: currentMessages,
        };

        const response = await fetch("/api/chat/request-agent", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(sessionData),
        });

        if (!response.ok) {
          throw new Error("Failed to request live agent");
        }

        const data = await response.json();

        if (data.success) {
          // Update session ID
          sessionIdRef.current = data.sessionId;

          // Update live chat state
          setIsLiveChat(true);
          setLiveChatStatus(data.status);
          setLiveChatDetails({
            sessionId: data.sessionId,
            queuePosition: data.position,
            estimatedWaitTime: data.estimatedWaitTime,
          });

          // Set category to live_agent
          setCategory("live_agent");

          // Add system message
          setMessages((prev) => [
            ...prev,
            createMessage("system", data.message),
          ]);

          // Initialize last message timestamp
          lastMessageTimestampRef.current = Date.now();

          // If we're immediately connected to an agent, start polling
          if (data.status === "active") {
            startMessagePolling();
          }
        } else {
          throw new Error(data.message || "Failed to request live agent");
        }
      } catch (error) {
        console.error("Error requesting live agent:", error);

        setMessages((prev) => [
          ...prev,
          createMessage(
            "system",
            "Sorry, we couldn't connect you with a live agent at this time. Please try again later."
          ),
        ]);
      } finally {
        setIsLoading(false);
      }
    },
    [messages, category, startMessagePolling]
  );

  // End the live chat session
  const endLiveChat = useCallback(async () => {
    if (!isLiveChat || !liveChatDetails?.sessionId) return;

    try {
      await fetch(`/api/chat/live-chat/end`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          sessionId: liveChatDetails.sessionId,
        }),
      });

      // Stop polling
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
        pollingIntervalRef.current = null;
      }

      // Update state
      setIsLiveChat(false);
      setLiveChatStatus("ended");

      // Add system message
      setMessages((prev) => [
        ...prev,
        createMessage(
          "system",
          "This live chat session has ended. You can continue chatting with our AI assistant."
        ),
      ]);
    } catch (error) {
      console.error("Error ending live chat:", error);
    }
  }, [isLiveChat, liveChatDetails]);

  return {
    messages,
    isLoading,
    sendMessage,
    resetChat,
    category,
    isLiveChat,
    requestLiveAgent,
    liveChatStatus,
    liveChatDetails,
    endLiveChat,
  };
}
