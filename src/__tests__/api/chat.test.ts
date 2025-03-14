// Import the regex patterns from the chat route
// Note: We're extracting these patterns for testing purposes
const directOrderPattern =
  /^\s*#?(\d{5,})\s+([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9._-]+)\s*$/i;
const emailFirstPattern =
  /^\s*([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9._-]+)\s+#?(\d{5,})\s*$/i;
const punctuationSeparatedPattern =
  /^\s*#?(\d{5,})[,.\s]+([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9._-]+)\s*$/i;
const emailPunctuationPattern =
  /^\s*([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9._-]+)[,.\s]+#?(\d{5,})\s*$/i;

describe("Order Pattern Recognition", () => {
  test("recognizes direct order pattern", () => {
    const message = "#123456 test@example.com";
    const match = message.match(directOrderPattern);
    expect(match).not.toBeNull();
    if (match) {
      expect(match[1]).toBe("123456");
      expect(match[2]).toBe("test@example.com");
    }
  });

  test("recognizes email first pattern", () => {
    const message = "test@example.com #123456";
    const match = message.match(emailFirstPattern);
    expect(match).not.toBeNull();
    if (match) {
      expect(match[1]).toBe("test@example.com");
      expect(match[2]).toBe("123456");
    }
  });

  test("recognizes punctuation separated pattern", () => {
    const message = "#123456, test@example.com";
    const match = message.match(punctuationSeparatedPattern);
    expect(match).not.toBeNull();
    if (match) {
      expect(match[1]).toBe("123456");
      expect(match[2]).toBe("test@example.com");
    }
  });

  test("recognizes email punctuation pattern", () => {
    const message = "test@example.com, #123456";
    const match = message.match(emailPunctuationPattern);
    expect(match).not.toBeNull();
    if (match) {
      expect(match[1]).toBe("test@example.com");
      expect(match[2]).toBe("123456");
    }
  });

  test("handles order number without hash symbol", () => {
    const message = "123456 test@example.com";
    const match = message.match(directOrderPattern);
    expect(match).not.toBeNull();
    if (match) {
      expect(match[1]).toBe("123456");
      expect(match[2]).toBe("test@example.com");
    }
  });

  test("handles extra whitespace", () => {
    const message = "  #123456   test@example.com  ";
    const match = message.match(directOrderPattern);
    expect(match).not.toBeNull();
    if (match) {
      expect(match[1]).toBe("123456");
      expect(match[2]).toBe("test@example.com");
    }
  });
});
