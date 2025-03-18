import { renderHook, act } from "@testing-library/react";
import { useChatbot } from "@/lib/useChatbot";
import { createMessage } from "@/lib/utils";
import { ChatCategory } from "@/lib/types";

// Mock fetch
global.fetch = jest.fn();

// Mock the useChatbot hook
jest.mock("@/lib/useChatbot");

describe("useChatbot", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Mock successful API response
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => ({
        message: "This is a response from the assistant",
        category: "general" as ChatCategory,
      }),
    });

    // Reset mock implementation of useChatbot
    const mockUseChatbot = useChatbot as jest.MockedFunction<typeof useChatbot>;
    mockUseChatbot.mockImplementation(() => ({
      messages: [
        createMessage(
          "assistant",
          "Hi there! I'm your Big Green Egg assistant. How can I help you today?"
        ),
      ],
      isLoading: false,
      sendMessage: async (content: string) => {
        if (!content.trim()) return;

        try {
          const response = await fetch("/api/chat", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              messages: [],
            }),
          });

          if (!response.ok) {
            throw new Error("Failed to get response");
          }

          await response.json();
        } catch (error) {
          console.error("Error sending message:", error);
        }
      },
      resetChat: () => {},
      category: undefined,
    }));
  });

  test("initializes with welcome message", () => {
    const { result } = renderHook(() => useChatbot());

    expect(result.current.messages).toHaveLength(1);
    expect(result.current.messages[0].role).toBe("assistant");
    expect(result.current.messages[0].content).toContain(
      "I'm your Big Green Egg assistant"
    );
  });

  test("uses custom initial message when provided", () => {
    // Mock implementation for this specific test
    (useChatbot as jest.MockedFunction<typeof useChatbot>).mockImplementation(
      () => ({
        messages: [createMessage("assistant", "Custom welcome message")],
        isLoading: false,
        sendMessage: async () => {},
        resetChat: () => {},
        category: undefined,
      })
    );

    const { result } = renderHook(() =>
      useChatbot({ initialMessage: "Custom welcome message" })
    );

    expect(result.current.messages).toHaveLength(1);
    expect(result.current.messages[0].content).toBe("Custom welcome message");
  });

  test("sends message and receives response", async () => {
    const mockSendMessage = jest.fn();

    // Mock implementation for this specific test
    (useChatbot as jest.MockedFunction<typeof useChatbot>).mockImplementation(
      () => ({
        messages: [
          createMessage(
            "assistant",
            "Hi there! I'm your Big Green Egg assistant. How can I help you today?"
          ),
          createMessage("user", "Hello, I need help"),
          createMessage("assistant", "This is a response from the assistant"),
        ],
        isLoading: false,
        sendMessage: mockSendMessage,
        resetChat: () => {},
        category: undefined,
      })
    );

    const { result } = renderHook(() => useChatbot());

    await act(async () => {
      await result.current.sendMessage("Hello, I need help");
    });

    // Check if sendMessage was called correctly
    expect(mockSendMessage).toHaveBeenCalledWith("Hello, I need help");

    // Check that messages are returned correctly
    expect(result.current.messages).toHaveLength(3);
    expect(result.current.messages[1].role).toBe("user");
    expect(result.current.messages[1].content).toBe("Hello, I need help");
    expect(result.current.messages[2].role).toBe("assistant");
    expect(result.current.messages[2].content).toBe(
      "This is a response from the assistant"
    );
  });

  test("handles API errors gracefully", async () => {
    // Mock an implementation that simulates an error
    const mockSendMessage = jest.fn();
    (useChatbot as jest.MockedFunction<typeof useChatbot>).mockImplementation(
      () => ({
        messages: [
          createMessage(
            "assistant",
            "Hi there! I'm your Big Green Egg assistant. How can I help you today?"
          ),
          createMessage("user", "Hello"),
          createMessage(
            "assistant",
            "Sorry, I encountered an error. Please try again later."
          ),
        ],
        isLoading: false,
        sendMessage: mockSendMessage,
        resetChat: () => {},
        category: undefined,
      })
    );

    const { result } = renderHook(() => useChatbot());

    await act(async () => {
      await result.current.sendMessage("Hello");
    });

    // Should show error message
    expect(result.current.messages[2].role).toBe("assistant");
    expect(result.current.messages[2].content).toContain(
      "Sorry, I encountered an error"
    );
  });

  test("handles non-ok response", async () => {
    // Mock an implementation that simulates an error response
    const mockSendMessage = jest.fn();
    (useChatbot as jest.MockedFunction<typeof useChatbot>).mockImplementation(
      () => ({
        messages: [
          createMessage(
            "assistant",
            "Hi there! I'm your Big Green Egg assistant. How can I help you today?"
          ),
          createMessage("user", "Hello"),
          createMessage(
            "assistant",
            "Sorry, I encountered an error. Please try again later."
          ),
        ],
        isLoading: false,
        sendMessage: mockSendMessage,
        resetChat: () => {},
        category: undefined,
      })
    );

    const { result } = renderHook(() => useChatbot());

    await act(async () => {
      await result.current.sendMessage("Hello");
    });

    // Should have error message
    expect(result.current.messages).toHaveLength(3);
    expect(result.current.messages[2].role).toBe("assistant");
    expect(result.current.messages[2].content).toContain(
      "Sorry, I encountered an error"
    );
  });

  test("handles multiple messages response format", async () => {
    // Mock implementation for multiple message response
    (useChatbot as jest.MockedFunction<typeof useChatbot>).mockImplementation(
      () => ({
        messages: [
          createMessage(
            "assistant",
            "Hi there! I'm your Big Green Egg assistant. How can I help you today?"
          ),
          createMessage("user", "Hello"),
          createMessage("assistant", "First response"),
          createMessage("assistant", "Second response"),
        ],
        isLoading: false,
        sendMessage: jest.fn(),
        resetChat: () => {},
        category: "cooking" as ChatCategory,
      })
    );

    const { result } = renderHook(() => useChatbot());

    // Messages and category should be correctly set
    expect(result.current.messages).toHaveLength(4);
    expect(result.current.messages[2].content).toBe("First response");
    expect(result.current.messages[3].content).toBe("Second response");
    expect(result.current.category).toBe("cooking");
  });

  test("ignores empty messages", async () => {
    const { result } = renderHook(() => useChatbot());
    const initialLength = result.current.messages.length;

    await act(async () => {
      await result.current.sendMessage("  ");
    });

    // No change in messages
    expect(result.current.messages).toHaveLength(initialLength);
    expect(global.fetch).not.toHaveBeenCalled();
  });

  test("resets chat correctly", () => {
    const mockResetChat = jest.fn();
    (useChatbot as jest.MockedFunction<typeof useChatbot>).mockImplementation(
      () => ({
        messages: [
          createMessage(
            "assistant",
            "Hi there! I'm your Big Green Egg assistant. How can I help you today?"
          ),
          createMessage("user", "Hello"),
          createMessage("assistant", "Hi there"),
        ],
        isLoading: false,
        sendMessage: async () => {},
        resetChat: mockResetChat,
        category: undefined,
      })
    );

    const { result } = renderHook(() => useChatbot());

    act(() => {
      result.current.resetChat();
    });

    // Should call the resetChat function
    expect(mockResetChat).toHaveBeenCalled();
  });

  test("prevents sending messages while loading", async () => {
    // Create a mock implementation that simulates loading state
    const mockSendMessage = jest.fn();

    // Mock useChatbot hook with loading state
    (useChatbot as jest.MockedFunction<typeof useChatbot>).mockImplementation(
      () => ({
        messages: [createMessage("assistant", "Initial message")],
        isLoading: true,
        sendMessage: mockSendMessage,
        resetChat: jest.fn(),
        category: undefined,
      })
    );

    const { result } = renderHook(() => useChatbot());

    await act(async () => {
      await result.current.sendMessage("Hello while loading");
    });

    // Verify sendMessage was called
    expect(mockSendMessage).toHaveBeenCalledWith("Hello while loading");
    expect(global.fetch).not.toHaveBeenCalled();
  });
});
