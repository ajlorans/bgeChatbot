import React from "react";

interface ChatInputProps {
  input: string;
  handleInputChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  handleSubmit: (
    e:
      | React.FormEvent<HTMLFormElement>
      | React.KeyboardEvent<HTMLTextAreaElement>
  ) => void;
  isLoading: boolean;
}

export function ChatInput({
  input,
  handleInputChange,
  handleSubmit,
  isLoading,
}: ChatInputProps) {
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const handleQuickReply = (message: string) => {
    // Create a synthetic change event
    const event = {
      target: { value: message },
    } as React.ChangeEvent<HTMLTextAreaElement>;

    handleInputChange(event);

    // Submit the form after a short delay to ensure the input value is updated
    setTimeout(() => {
      const submitEvent = {} as React.FormEvent<HTMLFormElement>;
      handleSubmit(submitEvent);
    }, 100);
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-gradient-to-t from-white via-white to-transparent dark:from-gray-950 dark:via-gray-950 dark:to-transparent pt-20 pb-4 px-4">
      <div className="mx-auto max-w-3xl">
        <div className="flex flex-wrap gap-2 mb-4 justify-center">
          <button
            onClick={() =>
              handleQuickReply("I'd like to check my order status")
            }
            className="px-3 py-2 text-sm bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
            disabled={isLoading}
          >
            Order Status
          </button>
          <button
            onClick={() =>
              handleQuickReply("I'd like some customer support assistance")
            }
            className="px-3 py-2 text-sm bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
            disabled={isLoading}
          >
            Customer Support
          </button>
          <button
            onClick={() =>
              handleQuickReply(
                "I need help with cooking pizza on my Big Green Egg"
              )
            }
            className="px-3 py-2 text-sm bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
            disabled={isLoading}
          >
            Cooking Tips
          </button>
          <button
            onClick={() =>
              handleQuickReply(
                "I'd like help choosing the right Big Green Egg products for my needs"
              )
            }
            className="px-3 py-2 text-sm bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
            disabled={isLoading}
          >
            Product Recommendations
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex items-start space-x-2">
          <textarea
            className="flex-1 border border-gray-300 dark:border-gray-700 rounded-md p-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 dark:bg-gray-800 dark:text-white resize-none min-h-[60px] text-gray-900"
            placeholder="Type your message..."
            value={input}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            rows={1}
            disabled={isLoading}
          />
          <button
            type="submit"
            className="bg-green-600 text-white rounded-md px-4 py-2 hover:bg-green-700 transition-colors"
            disabled={isLoading || !input.trim()}
          >
            {isLoading ? (
              <div className="w-5 h-5 border-t-2 border-white rounded-full animate-spin"></div>
            ) : (
              "Send"
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
