// Test file for the order detection functionality in the chat API

describe("Order Detection", () => {
  // Define the regex patterns for testing
  const orderStatusIntentRegex =
    /order status|tracking|where.*order|shipment|delivery|package|when.*arrive/i;
  const directOrderPattern =
    /^\s*#?(\d{5,})\s+([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9._-]+)\s*$/i;
  const emailFirstPattern =
    /^\s*([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9._-]+)\s+#?(\d{5,})\s*$/i;
  const punctuationSeparatedPattern =
    /^\s*#?(\d{5,})[,.\s]+([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9._-]+)\s*$/i;
  const emailPunctuationPattern =
    /^\s*([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9._-]+)[,.\s]+#?(\d{5,})\s*$/i;

  // Helper function for order status intent detection
  function detectOrderStatusIntent(message: string): boolean {
    return orderStatusIntentRegex.test(message);
  }

  // Helper function for order details extraction
  function extractOrderDetails(
    message: string
  ): { orderNumber: string; email: string } | null {
    let match: RegExpMatchArray | null;

    // Try direct order pattern: #12345 email@example.com
    match = message.match(directOrderPattern);
    if (match) {
      return { orderNumber: match[1], email: match[2] };
    }

    // Try email first pattern: email@example.com #12345
    match = message.match(emailFirstPattern);
    if (match) {
      return { orderNumber: match[2], email: match[1] };
    }

    // Try punctuation separated pattern: #12345, email@example.com
    match = message.match(punctuationSeparatedPattern);
    if (match) {
      return { orderNumber: match[1], email: match[2] };
    }

    // Try email punctuation pattern: email@example.com, #12345
    match = message.match(emailPunctuationPattern);
    if (match) {
      return { orderNumber: match[2], email: match[1] };
    }

    return null;
  }

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

  describe("Order Details Extraction", () => {
    test("extracts order details from various patterns", () => {
      expect(extractOrderDetails("#12345 test@example.com")).toEqual({
        orderNumber: "12345",
        email: "test@example.com",
      });

      expect(extractOrderDetails("test@example.com #12345")).toEqual({
        orderNumber: "12345",
        email: "test@example.com",
      });

      expect(extractOrderDetails("#12345, test@example.com")).toEqual({
        orderNumber: "12345",
        email: "test@example.com",
      });

      expect(extractOrderDetails("test@example.com, #12345")).toEqual({
        orderNumber: "12345",
        email: "test@example.com",
      });
    });

    test("returns null for non-matching patterns", () => {
      expect(extractOrderDetails("just some random text")).toBeNull();
      expect(extractOrderDetails("123 test@example.com")).toBeNull(); // Too few digits
      expect(extractOrderDetails("#12345 invalid-email")).toBeNull(); // Invalid email
    });
  });

  describe("Order Status Intent Detection", () => {
    test("detects various order status phrases", () => {
      expect(detectOrderStatusIntent("What is my order status?")).toBe(true);
      expect(detectOrderStatusIntent("I need help tracking my order")).toBe(
        true
      );
      expect(detectOrderStatusIntent("Where is my order?")).toBe(true);
      expect(detectOrderStatusIntent("When will my package arrive?")).toBe(
        true
      );
      expect(detectOrderStatusIntent("I need updates on my shipment")).toBe(
        true
      );
      expect(detectOrderStatusIntent("I haven't received my delivery")).toBe(
        true
      );
    });

    test("returns false for unrelated queries", () => {
      expect(detectOrderStatusIntent("How do I cook a steak?")).toBe(false);
      expect(detectOrderStatusIntent("Tell me about your products")).toBe(
        false
      );
      expect(detectOrderStatusIntent("What's the best grill for me?")).toBe(
        false
      );
      expect(detectOrderStatusIntent("")).toBe(false);
    });
  });
});
