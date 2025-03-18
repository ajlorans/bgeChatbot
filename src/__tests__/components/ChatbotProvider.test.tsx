import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import ChatbotProvider, {
  useChatbotContext,
} from "@/components/ChatbotProvider";

// Mock child component that uses the context
const MockChildComponent = () => {
  const { isOpen, openChat, closeChat, toggleChat } = useChatbotContext();

  return (
    <div>
      <div data-testid="is-open">{isOpen ? "true" : "false"}</div>
      <button data-testid="open-button" onClick={openChat}>
        Open Chat
      </button>
      <button data-testid="close-button" onClick={closeChat}>
        Close Chat
      </button>
      <button data-testid="toggle-button" onClick={toggleChat}>
        Toggle Chat
      </button>
    </div>
  );
};

// Mock Chatbot component
jest.mock("@/components/Chatbot", () => {
  return function MockChatbot({
    initialMessage,
    primaryColor,
    botName,
    showChatBubble,
  }: {
    initialMessage?: string;
    primaryColor?: string;
    botName?: string;
    showChatBubble?: boolean;
  }) {
    return (
      <div data-testid="chatbot">
        <div data-testid="initial-message">{initialMessage}</div>
        <div data-testid="primary-color">{primaryColor}</div>
        <div data-testid="bot-name">{botName}</div>
        <div data-testid="show-chat-bubble">{showChatBubble?.toString()}</div>
      </div>
    );
  };
});

describe("ChatbotProvider", () => {
  test("provides chatbot context to children", () => {
    render(
      <ChatbotProvider>
        <MockChildComponent />
      </ChatbotProvider>
    );

    // Initial state should be closed
    expect(screen.getByTestId("is-open")).toHaveTextContent("false");

    // Chatbot component should be rendered
    expect(screen.getByTestId("chatbot")).toBeInTheDocument();
  });

  test("opens chat when openChat is called", () => {
    render(
      <ChatbotProvider>
        <MockChildComponent />
      </ChatbotProvider>
    );

    // Chat should start closed
    expect(screen.getByTestId("is-open")).toHaveTextContent("false");

    // Open chat
    fireEvent.click(screen.getByTestId("open-button"));

    // Chat should now be open
    expect(screen.getByTestId("is-open")).toHaveTextContent("true");
  });

  test("closes chat when closeChat is called", () => {
    render(
      <ChatbotProvider>
        <MockChildComponent />
      </ChatbotProvider>
    );

    // Open chat first
    fireEvent.click(screen.getByTestId("open-button"));
    expect(screen.getByTestId("is-open")).toHaveTextContent("true");

    // Close chat
    fireEvent.click(screen.getByTestId("close-button"));

    // Chat should now be closed
    expect(screen.getByTestId("is-open")).toHaveTextContent("false");
  });

  test("toggles chat state when toggleChat is called", () => {
    render(
      <ChatbotProvider>
        <MockChildComponent />
      </ChatbotProvider>
    );

    // Initial state: closed
    expect(screen.getByTestId("is-open")).toHaveTextContent("false");

    // Toggle once: should open
    fireEvent.click(screen.getByTestId("toggle-button"));
    expect(screen.getByTestId("is-open")).toHaveTextContent("true");

    // Toggle again: should close
    fireEvent.click(screen.getByTestId("toggle-button"));
    expect(screen.getByTestId("is-open")).toHaveTextContent("false");
  });

  test("passes props to Chatbot component", () => {
    const customInitialMessage = "Custom initial message";
    const customPrimaryColor = "#FF0000";
    const customBotName = "Test Bot";

    render(
      <ChatbotProvider
        initialMessage={customInitialMessage}
        primaryColor={customPrimaryColor}
        botName={customBotName}
        showChatBubble={false}
      >
        <div>Child component</div>
      </ChatbotProvider>
    );

    expect(screen.getByTestId("initial-message")).toHaveTextContent(
      customInitialMessage
    );
    expect(screen.getByTestId("primary-color")).toHaveTextContent(
      customPrimaryColor
    );
    expect(screen.getByTestId("bot-name")).toHaveTextContent(customBotName);
    expect(screen.getByTestId("show-chat-bubble")).toHaveTextContent("false");
  });

  test("throws error when useChatbotContext is used outside provider", () => {
    // Suppress error output for this test
    const originalError = console.error;
    console.error = jest.fn();

    expect(() => {
      render(<MockChildComponent />);
    }).toThrow("useChatbotContext must be used within a ChatbotProvider");

    // Restore console.error
    console.error = originalError;
  });
});
