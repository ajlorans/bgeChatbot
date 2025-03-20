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
  requestLiveAgent: (email?: string, name?: string) => Promise<void>;
  liveChatStatus?: LiveChatStatus;
  liveChatDetails?: LiveChatDetails;
  endLiveChat: () => Promise<void>;
  agentName: string | null;
}

interface LiveChatDetails {
  agentName?: string;
  queuePosition?: number;
  estimatedWaitTime?: number;
  sessionId?: string;
}

// Add a retry utility function at the top of the file after imports
async function fetchWithRetry(url: string, options: RequestInit, retries = 3, backoff = 300) {
  try {
    return await fetch(url, options);
  } catch (err) {
    if (retries <= 1) throw err;
    await new Promise(resolve => setTimeout(resolve, backoff));
    return fetchWithRetry(url, options, retries - 1, backoff * 2);
  }
}

// Add at the top of the file after imports
const DEBUG = false; // Set to false to disable debug console logs

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
  const [agentName, setAgentName] = useState<string | null>(null);

  const sessionIdRef = useRef<string | undefined>(undefined);
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const lastMessageTimestampRef = useRef<number>(0);

  // Function to poll for new messages in live chat
  const startMessagePolling = useCallback(() => {
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current);
    }

    // Immediate first poll when starting
    const pollForMessages = async () => {
      if (!liveChatDetails?.sessionId) {
        if (DEBUG) console.warn("No sessionId available for message polling");
        return;
      }

      try {
        const sessionId = liveChatDetails.sessionId;
        const timestamp = lastMessageTimestampRef.current;

        // Add cache-busting parameter with random component
        const cacheBust = `${Date.now()}-${Math.random()}`;

        if (DEBUG) {
          console.log(
            `Polling for messages after timestamp ${new Date(
              timestamp
            ).toISOString()}`
          );
        }

        const response = await fetch(
          `/api/chat/live-chat?sessionId=${sessionId}&lastMessageTimestamp=${timestamp}&_=${cacheBust}`,
          {
            // Ensure no caching
            cache: "no-store",
            headers: {
              "Content-Type": "application/json",
              "Cache-Control": "no-cache, no-store, must-revalidate",
              Pragma: "no-cache",
              Expires: "0",
            },
          }
        );

        if (!response.ok) {
          const errorText = await response.text();
          if (DEBUG) console.error(`Live chat API error (${response.status}):`, errorText);
          throw new Error(
            `Failed to fetch live chat messages: ${response.status} ${response.statusText}`
          );
        }

        const data = await response.json();

        // Process response only if we have actual data
        if (data.success) {
          // Handle new messages if any
          if (data.messages && data.messages.length > 0) {
            if (DEBUG) console.log(`Received ${data.messages.length} new messages from poll`);

            // Process messages to ensure they have the right format for the UI
            const formattedMessages = data.messages.map(
              (msg: {
                id: string;
                role: string;
                content: string;
                timestamp: string | number;
                category?: string;
              }) => ({
                id: msg.id,
                role: msg.role,
                content: msg.content,
                timestamp: (() => {
                  try {
                    if (typeof msg.timestamp === "string") {
                      return msg.timestamp;
                    } else {
                      // Safely convert timestamp to ISO string
                      const date = new Date(msg.timestamp);
                      // Check if date is valid before converting
                      return isNaN(date.getTime())
                        ? new Date().toISOString() // Fallback to current time if invalid
                        : date.toISOString();
                    }
                  } catch (e) {
                    if (DEBUG) console.error("Error formatting timestamp:", e);
                    return new Date().toISOString(); // Fallback to current time
                  }
                })(),
                category: msg.category || "live_agent",
                agentName: data.agentName,
              })
            );

            // Add new messages to the chat, avoiding duplicates
            setMessages((prev) => {
              // Filter out any messages we already have (avoid duplicates)
              const existingIds = new Set(prev.map((m: Message) => m.id));
              const existingContents = new Map(
                prev.map((m: Message) => [
                  `${m.role}:${m.content}:${m.timestamp}`,
                  true,
                ])
              );

              // Check for agent joined messages - special deduplication
              const hasAgentJoinedMessage = prev.some(
                (msg) =>
                  msg.role === "system" &&
                  msg.content.includes("has joined the conversation")
              );

              // Enhanced deduplication checking both ID and content+role+timestamp
              const newMessages = formattedMessages.filter(
                (m: {
                  id: string;
                  role: string;
                  content: string;
                  timestamp: string;
                }) => {
                  // Skip if we already have this ID
                  if (existingIds.has(m.id)) return false;

                  // Skip agent joined messages if we already have one
                  if (
                    hasAgentJoinedMessage &&
                    m.role === "system" &&
                    m.content.includes("has joined the conversation")
                  )
                    return false;

                  // Also check for exact content+role+timestamp duplicates
                  const contentKey = `${m.role}:${m.content}:${m.timestamp}`;
                  if (existingContents.has(contentKey)) return false;

                  return true;
                }
              );

              if (newMessages.length === 0) return prev;
              if (DEBUG) console.log(`Adding ${newMessages.length} new messages to chat`);
              return [...prev, ...newMessages];
            });
          }

          // Update last message timestamp if provided - CRITICAL FIX
          if (data.lastMessageTimestamp) {
            // Make sure to parse string timestamp to number
            const newTimestamp = parseInt(data.lastMessageTimestamp, 10);
            // Only update if it's a valid number and greater than current timestamp
            if (
              !isNaN(newTimestamp) &&
              newTimestamp > lastMessageTimestampRef.current
            ) {
              if (DEBUG) console.log(`Updating lastMessageTimestamp from ${lastMessageTimestampRef.current} to ${newTimestamp}`);
              lastMessageTimestampRef.current = newTimestamp;
            }
          }

          // Update live chat status if changed
          if (data.status && data.status !== liveChatStatus) {
            if (DEBUG) console.log(`Chat status changed from ${liveChatStatus} to ${data.status}`);
            const previousStatus = liveChatStatus;
            setLiveChatStatus(data.status as LiveChatStatus);

            // If status changes from waiting/queued to active, notify the user
            if (
              (previousStatus === "waiting" || previousStatus === "queued") &&
              data.status === "active" &&
              data.agentName &&
              !messages.some(
                (msg) =>
                  msg.role === "system" &&
                  msg.content.includes("has joined the conversation")
              )
            ) {
              // We'll rely on the server to provide the agent joined message
              // The code here is just a fallback and ensures we don't add duplicates
              if (DEBUG) console.log("Status changed to active, agent has joined");

              // Update live chat details to include agent name
              if (data.agentName) {
                setLiveChatDetails((prev) => ({
                  ...prev!,
                  agentName: data.agentName,
                }));
              }
            }

            // If chat has ended
            if (data.status === "ended" || data.status === "closed") {
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
          } else if (data.agentName && !liveChatDetails?.agentName) {
            // Still update agent name even if status didn't change
            if (DEBUG) console.log(`Updating agent name to ${data.agentName}`);
            setLiveChatDetails((prev) => ({
              ...prev!,
              agentName: data.agentName,
            }));
          }

          // Update live chat details with queue position and estimated wait time
          setLiveChatDetails((prev) => ({
            ...prev,
            queuePosition: data.queuePosition || 0,
            estimatedWaitTime: data.estimatedWaitTime || 5,
            agentName: data.agentName,
          }));
        }
      } catch (error) {
        if (DEBUG) console.error("Error polling for live chat messages:", error);
        // Don't stop polling on errors, just log them
      }
    };

    // Run polling immediately and then regularly
    pollForMessages();

    // Poll for new messages every 10 seconds instead of every 3 seconds
    pollingIntervalRef.current = setInterval(pollForMessages, 10000);

    return () => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
        pollingIntervalRef.current = null;
      }
    };
  }, [liveChatDetails, liveChatStatus]);

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
    if (DEBUG) console.log("Live chat status changed:", {
      isLiveChat,
      liveChatStatus,
      sessionId: liveChatDetails?.sessionId,
    });

    // Always start polling as soon as we're in live chat mode, regardless of status
    if (isLiveChat && liveChatDetails?.sessionId) {
      if (DEBUG) console.log("Starting message polling...");

      // Immediately check for messages when starting polling
      // This helps show agent messages right away
      const checkForMessages = async () => {
        try {
          const sessionId = liveChatDetails.sessionId;
          const timestamp = lastMessageTimestampRef.current;
          const response = await fetch(
            `/api/chat/live-chat?sessionId=${sessionId}&lastMessageTimestamp=${timestamp}&_=${Date.now()}-${Math.random()}`,
            {
              cache: "no-store",
              headers: {
                "Content-Type": "application/json",
                "Cache-Control": "no-cache, no-store, must-revalidate",
                Pragma: "no-cache",
                Expires: "0",
              },
            }
          );
          if (response.ok) {
            const data = await response.json();
            if (data.success && data.messages && data.messages.length > 0) {
              if (DEBUG) console.log(`Initial poll found ${data.messages.length} messages`);
            }
          }
        } catch (error) {
          if (DEBUG) console.error("Error in initial message check:", error);
        }
      };

      checkForMessages();
      startMessagePolling();
    } else if (!isLiveChat && pollingIntervalRef.current) {
      // Stop polling if we're not in live chat
      if (DEBUG) console.log("Stopping message polling...");
      clearInterval(pollingIntervalRef.current);
      pollingIntervalRef.current = null;
    }

    return () => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
      }
    };
  }, [
    isLiveChat,
    liveChatStatus,
    liveChatDetails?.sessionId,
    startMessagePolling,
  ]);

  const sendMessage = useCallback(
    async (content: string) => {
      if (!content.trim() || isLoading) return;

      // Create a message with unique ID to prevent duplicates
      const userMessage = createMessage("user", content);

      // Add user message to chat
      setMessages((prev) => {
        // Check if we already have this exact message to prevent duplicates
        const isDuplicate = prev.some(
          (msg) =>
            msg.role === "user" &&
            msg.content === content &&
            Date.now() - new Date(msg.timestamp).getTime() < 5000 // Added in the last 5 seconds
        );

        if (isDuplicate) {
          if (DEBUG) console.log("Preventing duplicate user message:", content);
          return prev;
        }

        return [...prev, userMessage];
      });

      setIsLoading(true);

      try {
        if (isLiveChat && liveChatDetails?.sessionId) {
          // Send message to live chat endpoint
          const response = await fetchWithRetry(
            "/api/chat/live-chat",
            {
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
            },
            3,  // 3 retries
            500  // starting with 500ms backoff
          );

          if (!response.ok) {
            throw new Error("Failed to send message to live agent");
          }

          const data = await response.json();

          // Update last message timestamp
          if (data.lastMessageTimestamp) {
            try {
              // Safely parse the timestamp
              const newTimestamp = parseInt(
                String(data.lastMessageTimestamp),
                10
              );
              if (!isNaN(newTimestamp)) {
                if (DEBUG) console.log(`Updating timestamp after sending message: ${newTimestamp}`);
                lastMessageTimestampRef.current = newTimestamp;
              }
            } catch (e) {
              if (DEBUG) console.error("Error parsing timestamp from send message response:", e);
            }
          }

          // If there are new messages from the agent, add them
          if (data.messages && data.messages.length > 0) {
            // Process messages to ensure they have valid timestamps
            const formattedMessages = data.messages
              .filter((msg: Message) => msg.role !== "user") // Filter out user's own messages
              .map(
                (msg: {
                  id: string;
                  role: string;
                  content: string;
                  timestamp?: string | number;
                  category?: string;
                }) => {
                  // Ensure the timestamp is valid
                  let safeTimestamp;
                  try {
                    if (typeof msg.timestamp === "string") {
                      safeTimestamp = msg.timestamp;
                    } else {
                      const date = new Date(msg.timestamp || Date.now());
                      safeTimestamp = !isNaN(date.getTime())
                        ? date.toISOString()
                        : new Date().toISOString();
                    }
                  } catch (e) {
                    if (DEBUG) console.error("Error processing message timestamp:", e);
                    safeTimestamp = new Date().toISOString();
                  }

                  return {
                    ...msg,
                    timestamp: safeTimestamp,
                    agentName: data.agentName,
                  };
                }
              );

            if (formattedMessages.length > 0) {
              // Add new messages with duplicate checking
              setMessages((prev) => {
                // Get existing IDs and content signatures
                const existingIds = new Set(prev.map((m: Message) => m.id));
                const existingContents = new Set(
                  prev.map((m: Message) => `${m.role}:${m.content}`)
                );

                // Filter out duplicates
                const uniqueMessages = formattedMessages.filter(
                  (msg: {
                    id: string;
                    role: string;
                    content: string;
                    timestamp: string;
                    category?: string;
                  }) =>
                    !existingIds.has(msg.id) &&
                    !existingContents.has(`${msg.role}:${msg.content}`)
                );

                return uniqueMessages.length > 0
                  ? [...prev, ...uniqueMessages]
                  : prev;
              });
            }
          }
        } else {
          // Regular chatbot flow
          const response = await fetchWithRetry(
            "/api/chat",
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                messages: [...messages, userMessage],
              }),
            },
            3,  // 3 retries
            500  // starting with 500ms backoff
          );

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
        if (DEBUG) console.error("Error sending message:", error);
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
    async (email?: string, name?: string) => {
      setIsLoading(true);

      try {
        const currentMessages = messages.slice(-10); // Send last 10 messages for context
        const sessionData = {
          sessionId: sessionIdRef.current,
          customerEmail: email,
          customerName: name,
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
            agentName: data.agentName,
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

          // Start polling immediately regardless of status
          startMessagePolling();
        } else {
          throw new Error(data.message || "Failed to request live agent");
        }
      } catch (error) {
        if (DEBUG) console.error("Error requesting live agent:", error);

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
          endedBy: "customer",
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
      if (DEBUG) console.error("Error ending live chat:", error);
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
    agentName,
  };
}
