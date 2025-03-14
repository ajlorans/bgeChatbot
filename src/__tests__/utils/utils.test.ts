import { createMessage, defaultSystemPrompt } from "@/lib/utils";

describe("Utility Functions", () => {
  describe("createMessage", () => {
    test("creates a user message correctly", () => {
      const message = createMessage("user", "Hello, world!");
      expect(message).toEqual({
        role: "user",
        content: "Hello, world!",
        id: expect.any(String),
        timestamp: expect.any(Number),
      });
    });

    test("creates an assistant message correctly", () => {
      const message = createMessage("assistant", "I can help with that.");
      expect(message).toEqual({
        role: "assistant",
        content: "I can help with that.",
        id: expect.any(String),
        timestamp: expect.any(Number),
      });
    });

    test("creates a system message correctly", () => {
      const message = createMessage("system", "System instructions");
      expect(message).toEqual({
        role: "system",
        content: "System instructions",
        id: expect.any(String),
        timestamp: expect.any(Number),
      });
    });

    test("generates unique IDs for each message", () => {
      const message1 = createMessage("user", "Message 1");
      const message2 = createMessage("user", "Message 2");
      expect(message1.id).not.toEqual(message2.id);
    });
  });

  describe("defaultSystemPrompt", () => {
    test("contains Big Green Egg information", () => {
      expect(defaultSystemPrompt).toContain("Big Green Egg");
    });

    test("contains instructions about the chatbot role", () => {
      expect(defaultSystemPrompt).toContain("customer service");
    });
  });
});
