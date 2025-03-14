describe("Customer Support Detection", () => {
  // Helper function to simulate the customer support detection logic
  function isCustomerSupportRequest(message: string): boolean {
    const lowerMessage = message.toLowerCase();

    // Exclude assembly-related customer support queries
    if (
      lowerMessage.includes("assembly") ||
      lowerMessage.includes("assembling") ||
      lowerMessage.includes("assemble")
    ) {
      return false;
    }

    return (
      lowerMessage.includes("customer support assistance") ||
      lowerMessage.includes("customer support")
    );
  }

  test("identifies customer support requests", () => {
    const queries = [
      "I'd like some customer support assistance",
      "Can I get customer support?",
      "I need customer support for my Big Green Egg",
      "How do I contact customer support?",
      "Customer support please",
    ];

    queries.forEach((query) => {
      expect(isCustomerSupportRequest(query)).toBe(true);
    });
  });

  test("does not identify assembly-related customer support as general customer support", () => {
    const queries = [
      "I need customer support with assembly",
      "Customer support for assembly instructions",
      "Help from customer support for assembling my egg",
    ];

    queries.forEach((query) => {
      expect(isCustomerSupportRequest(query)).toBe(false);
    });
  });

  test("does not identify non-customer support queries as customer support requests", () => {
    const queries = [
      "How do I cook a steak?",
      "Where can I buy a Big Green Egg?",
      "Track my order",
      "Register my warranty",
      "Assembly guide please",
      "Help with cooking pizza",
    ];

    queries.forEach((query) => {
      expect(isCustomerSupportRequest(query)).toBe(false);
    });
  });
});
