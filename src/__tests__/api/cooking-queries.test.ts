describe("Cooking Query Detection", () => {
  // Helper function to simulate the cooking query detection logic
  function isCookingQuery(message: string): boolean {
    const lowerMessage = message.toLowerCase();
    return (
      lowerMessage.includes("cook") ||
      lowerMessage.includes("recipe") ||
      lowerMessage.includes("bake") ||
      lowerMessage.includes("grill") ||
      lowerMessage.includes("smoke") ||
      lowerMessage.includes("roast") ||
      lowerMessage.includes("temperature") ||
      lowerMessage.includes("how to make")
    );
  }

  // Helper function to simulate the pizza query detection logic
  function isPizzaQuery(message: string): boolean {
    return isCookingQuery(message) && message.toLowerCase().includes("pizza");
  }

  test("identifies general cooking query", () => {
    const queries = [
      "How do I cook a steak?",
      "What's a good recipe for chicken?",
      "Can I bake bread in my Big Green Egg?",
      "Best temperature for grilling vegetables",
      "How to smoke ribs on Big Green Egg",
      "Roast turkey cooking time",
      "How to make pulled pork",
    ];

    queries.forEach((query) => {
      expect(isCookingQuery(query)).toBe(true);
    });
  });

  test("identifies pizza cooking query", () => {
    const queries = [
      "How do I cook a pizza on my Big Green Egg?",
      "Pizza recipe for BGE",
      "What temperature for pizza?",
      "How to make pizza dough for Big Green Egg",
    ];

    queries.forEach((query) => {
      expect(isPizzaQuery(query)).toBe(true);
    });
  });

  test("does not identify non-cooking queries as cooking queries", () => {
    const queries = [
      "How do I assemble my Big Green Egg?",
      "Where can I buy a Big Green Egg?",
      "Customer support please",
      "Track my order",
      "Register my warranty",
    ];

    queries.forEach((query) => {
      expect(isCookingQuery(query)).toBe(false);
    });
  });

  test("does not identify general cooking queries as pizza queries", () => {
    const queries = [
      "How do I cook a steak?",
      "What's a good recipe for chicken?",
      "Can I bake bread in my Big Green Egg?",
      "Best temperature for grilling vegetables",
    ];

    queries.forEach((query) => {
      expect(isPizzaQuery(query)).toBe(false);
    });
  });
});
