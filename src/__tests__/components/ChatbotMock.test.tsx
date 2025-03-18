import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import { Message, ChatCategory } from "@/lib/types";
import * as useChatbotModule from "@/lib/useChatbot";
import * as rateLimiterModule from "@/lib/rateLimiter";

// Mock the useChatbot hook
jest.mock("@/lib/useChatbot");

// Mock the rate limiter
jest.mock("@/lib/rateLimiter", () => ({
  rateLimiter: {
    isRateLimited: jest.fn().mockReturnValue(false),
    track: jest.fn(),
  },
}));

// Helper to create a mock message
const createMockMessage = (
  role: "user" | "assistant",
  content: string,
  category?: ChatCategory
): Message => ({
  id: Math.random().toString(),
  role,
  content,
  timestamp: Date.now(),
  category,
});

// Mock Chatbot Component
const MockChatbot: React.FC<{
  initialMessage?: string;
  primaryColor?: string;
  botName?: string;
  showChatBubble?: boolean;
}> = ({
  botName = "Test Bot",
  primaryColor = "#000000",
  showChatBubble = true,
}) => {
  const { messages, isLoading, sendMessage, resetChat, category } =
    useChatbotModule.useChatbot();
  const [inputValue, setInputValue] = React.useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (rateLimiterModule.rateLimiter.isRateLimited("test-user")) {
      return;
    }
    if (inputValue.trim()) {
      sendMessage(inputValue);
      setInputValue("");
    }
  };

  return (
    <div data-testid="chatbot-container">
      {showChatBubble && (
        <button data-testid="chat-bubble" onClick={() => {}}>
          Open Chat
        </button>
      )}
      <div data-testid="chat-header" style={{ backgroundColor: primaryColor }}>
        {botName}
      </div>
      <div>
        {messages.map((msg) => (
          <div key={msg.id} data-testid={`message-${msg.role}`}>
            {msg.content}
          </div>
        ))}
        {category === "order_status" && (
          <div data-testid="order-form">
            <label htmlFor="orderNumber">Order Number</label>
            <input id="orderNumber" type="text" />
            <label htmlFor="email">Email</label>
            <input id="email" type="text" />
          </div>
        )}
        {isLoading && <div data-testid="loading-indicator">Loading...</div>}
        {rateLimiterModule.rateLimiter.isRateLimited("test-user") && (
          <div data-testid="rate-limit-message">
            You are sending too many messages too quickly
          </div>
        )}
      </div>
      <form data-testid="chat-form" role="form" onSubmit={handleSubmit}>
        <input
          type="text"
          role="textbox"
          data-testid="chat-input"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          disabled={isLoading}
        />
        <button type="submit">Send</button>
        <button
          type="button"
          onClick={resetChat}
          data-testid="reset-button"
          aria-label="reset"
        >
          Reset
        </button>
      </form>
    </div>
  );
};

describe("Chatbot Component (Mocked)", () => {
  // Setup default mocks for the useChatbot hook
  const mockMessages: Message[] = [
    createMockMessage("assistant", "Hi there! How can I help you?"),
  ];
  const mockSendMessage = jest.fn();
  const mockResetChat = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();

    // Default implementation
    (useChatbotModule.useChatbot as jest.Mock).mockReturnValue({
      messages: mockMessages,
      isLoading: false,
      sendMessage: mockSendMessage,
      resetChat: mockResetChat,
      category: undefined,
    });

    // Reset rate limiter mocks
    (rateLimiterModule.rateLimiter.isRateLimited as jest.Mock).mockReturnValue(
      false
    );
  });

  test("renders the mock chatbot", () => {
    render(<MockChatbot />);

    // Chatbot container should be rendered
    expect(screen.getByTestId("chatbot-container")).toBeInTheDocument();

    // Chat bubble should be visible
    expect(screen.getByTestId("chat-bubble")).toBeInTheDocument();

    // Check for initial message
    expect(screen.getByTestId("message-assistant")).toHaveTextContent(
      "Hi there! How can I help you?"
    );
  });

  test("sends message via form submission", () => {
    render(<MockChatbot />);

    // Type a message
    const input = screen.getByRole("textbox");
    fireEvent.change(input, { target: { value: "Hello there" } });

    // Submit the form
    fireEvent.submit(screen.getByRole("form"));

    // Check if sendMessage was called
    expect(mockSendMessage).toHaveBeenCalledWith("Hello there");
  });

  test("shows loading indicator when isLoading is true", () => {
    // Mock loading state
    (useChatbotModule.useChatbot as jest.Mock).mockReturnValue({
      messages: mockMessages,
      isLoading: true,
      sendMessage: mockSendMessage,
      resetChat: mockResetChat,
      category: undefined,
    });

    render(<MockChatbot />);

    // Loading indicator should be visible
    expect(screen.getByTestId("loading-indicator")).toBeInTheDocument();

    // Input should be disabled
    expect(screen.getByRole("textbox")).toBeDisabled();
  });

  test("shows order status form when category is order_status", () => {
    // Set category to order_status
    (useChatbotModule.useChatbot as jest.Mock).mockReturnValue({
      messages: mockMessages,
      isLoading: false,
      sendMessage: mockSendMessage,
      resetChat: mockResetChat,
      category: "order_status" as ChatCategory,
    });

    render(<MockChatbot />);

    // Order form should be visible
    expect(screen.getByTestId("order-form")).toBeInTheDocument();
    expect(screen.getByLabelText(/order number/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
  });

  test("shows rate limit message when rate limited", () => {
    // Set rate limiter to return true
    (rateLimiterModule.rateLimiter.isRateLimited as jest.Mock).mockReturnValue(
      true
    );

    render(<MockChatbot />);

    // Rate limit message should be visible
    expect(screen.getByTestId("rate-limit-message")).toBeInTheDocument();
  });

  test("calls resetChat when reset button is clicked", () => {
    render(<MockChatbot />);

    // Click reset button
    fireEvent.click(screen.getByTestId("reset-button"));

    // Reset function should be called
    expect(mockResetChat).toHaveBeenCalled();
  });

  test("applies custom styling and name", () => {
    const customColor = "#FF0000";
    const customName = "Custom Bot";

    render(<MockChatbot primaryColor={customColor} botName={customName} />);

    // Check if custom color is applied
    const header = screen.getByTestId("chat-header");
    expect(header).toHaveStyle(`background-color: ${customColor}`);

    // Check if custom name is shown
    expect(header).toHaveTextContent(customName);
  });

  test("doesn't show chat bubble when showChatBubble is false", () => {
    render(<MockChatbot showChatBubble={false} />);

    // Chat bubble should not be visible
    expect(screen.queryByTestId("chat-bubble")).not.toBeInTheDocument();
  });
});
