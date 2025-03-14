import OpenAI from "openai";
import { createMessage } from "./utils";
import { Message } from "./types";

/**
 * Generates a detailed recipe for a specified dish using the Big Green Egg
 * @param openai - OpenAI client instance
 * @param dish - The dish to generate a recipe for
 * @returns A formatted recipe string
 */
export async function generateRecipeWithAI(
  openai: OpenAI,
  dish: string
): Promise<string> {
  try {
    const recipePrompt = `Create a detailed recipe for ${dish} cooked on a Big Green Egg ceramic grill/smoker. 
    Include a title, introduction, complete ingredients list with measurements, step-by-step instructions specifically for cooking on a Big Green Egg, 
    and tips for success. Focus on techniques specific to the Big Green Egg like temperature control, using the ConvEGGtor for indirect cooking, 
    and taking advantage of the EGG's unique properties. Format the recipe with markdown headings and bullet points.`;

    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content:
            "You are a culinary expert specializing in cooking on the Big Green Egg ceramic grill and smoker. Create detailed, accurate recipes with proper ingredients, measurements, temperatures, and cooking times. Include Big Green Egg-specific techniques and tips.",
        },
        { role: "user", content: recipePrompt },
      ],
      temperature: 0.7,
      max_tokens: 1000,
    });

    return (
      response.choices[0]?.message?.content ||
      "I'm sorry, I couldn't generate a recipe at this time. Please try again or ask for a different recipe."
    );
  } catch (error) {
    console.error("Error generating recipe with AI:", error);
    return "I'm sorry, I encountered an error while creating your recipe. Please try again later.";
  }
}

/**
 * Checks if a message is asking for a specific recipe
 * @param message - The user message to check
 * @returns An object with a boolean indicating if it's a recipe request and the requested dish if found
 */
export function detectRecipeRequest(message: string): {
  isRecipeRequest: boolean;
  requestedDish: string | null;
} {
  const lowerMessage = message.toLowerCase();

  // Check for recipe-related keywords
  const isRecipeRelated =
    lowerMessage.includes("recipe") ||
    lowerMessage.includes("cook") ||
    lowerMessage.includes("how to make") ||
    lowerMessage.includes("how do i make");

  if (!isRecipeRelated) {
    return { isRecipeRequest: false, requestedDish: null };
  }

  // Check for general recipe requests without a specific dish
  if (
    lowerMessage.includes("find a recipe") ||
    lowerMessage.includes("looking for a recipe") ||
    lowerMessage.includes("recipe for cooking") ||
    lowerMessage.includes("recipe on my big green egg") ||
    lowerMessage.includes("recipe for my big green egg") ||
    (lowerMessage.includes("recipe") && !lowerMessage.includes("for "))
  ) {
    return { isRecipeRequest: true, requestedDish: null };
  }

  // Extract the requested dish using regex
  const recipeRequestPattern =
    /(?:recipe(?:\s+for)?|how\s+to\s+(?:cook|make)|i\s+want\s+(?:to\s+cook|a\s+recipe\s+for)|can\s+you\s+(?:give|show)\s+me\s+(?:a\s+recipe|how\s+to\s+cook)|cooking)\s+([a-z\s]+)/i;

  const recipeMatch = lowerMessage.match(recipeRequestPattern);

  if (recipeMatch && recipeMatch[1] && recipeMatch[1].trim().length > 0) {
    return {
      isRecipeRequest: true,
      requestedDish: recipeMatch[1].trim(),
    };
  }

  return { isRecipeRequest: false, requestedDish: null };
}

/**
 * Handles a recipe request and generates an appropriate response
 * @param openai - OpenAI client instance
 * @param message - The user message
 * @param messages - The conversation history
 * @returns A response object with the assistant message
 */
export async function handleRecipeRequest(
  openai: OpenAI,
  message: string,
  messages: Message[]
): Promise<{ messages: Message[]; category: string }> {
  const lowerMessage = message.toLowerCase();

  // Check if this is a response to a previous recipe preference question
  let previousRecipeRequest = null;
  if (messages.length >= 2) {
    const previousMessage = messages[messages.length - 2];
    if (
      previousMessage.role === "assistant" &&
      previousMessage.content &&
      previousMessage.content.includes("Would you like me to provide:") &&
      previousMessage.content.includes(
        "A detailed recipe with ingredients and instructions"
      ) &&
      previousMessage.content.includes(
        "Let me know which aspects you're most interested in"
      )
    ) {
      // Extract the dish name from the previous message
      const dishMatch = previousMessage.content.match(
        /making\s+([a-z\s]+)\s+on your Big Green Egg/i
      );
      if (dishMatch && dishMatch[1]) {
        previousRecipeRequest = dishMatch[1].trim();
        console.log(
          "Found previous recipe request for:",
          previousRecipeRequest
        );

        // Generate a recipe for the previously requested dish
        console.log("Generating AI recipe for:", previousRecipeRequest);
        const aiGeneratedRecipe = await generateRecipeWithAI(
          openai,
          previousRecipeRequest
        );

        return {
          messages: [createMessage("assistant", aiGeneratedRecipe)],
          category: "tips_and_tricks",
        };
      }
    }
  }

  // Check for pizza-specific queries
  if (lowerMessage.includes("pizza")) {
    const pizzaMessage =
      "Here's how to cook a perfect pizza on your Big Green Egg:\n\n" +
      "1. **Setup**: Set up your EGG for indirect cooking using the ConvEGGtor at 600-650°F (315-340°C).\n\n" +
      "2. **Preheat**: Place your pizza stone on the cooking grid and preheat for at least 30 minutes.\n\n" +
      "3. **Prepare**: While preheating, prepare your pizza with your favorite toppings. Use cornmeal or flour on your pizza peel to help the pizza slide easily.\n\n" +
      "4. **Cook**: Slide the pizza onto the hot stone and close the dome. Cook for 6-8 minutes, depending on thickness.\n\n" +
      "5. **Check**: The pizza is done when the crust is golden brown and the cheese is bubbly.\n\n" +
      "For even better results, consider our [Pizza & Baking Stone](https://biggreenegg.com/collections/pizza/products/pizza-baking-stone) and [Pizza Oven Wedge](https://biggreenegg.com/collections/pizza/products/pizza-oven-wedge-for-large-egg) accessories.\n\n" +
      "Would you like a specific pizza recipe or have questions about any of these steps?";

    return {
      messages: [createMessage("assistant", pizzaMessage)],
      category: "tips_and_tricks",
    };
  }

  // Check for specific recipe requests
  const { isRecipeRequest, requestedDish } = detectRecipeRequest(message);

  if (isRecipeRequest) {
    // If a specific dish was requested, generate a recipe for it
    if (requestedDish) {
      console.log("Detected specific recipe request for:", requestedDish);

      // Generate a recipe for the requested dish
      console.log("Generating AI recipe for:", requestedDish);
      const aiGeneratedRecipe = await generateRecipeWithAI(
        openai,
        requestedDish
      );

      return {
        messages: [createMessage("assistant", aiGeneratedRecipe)],
        category: "tips_and_tricks",
      };
    }
    // If it's a general recipe request without a specific dish, ask for what they want to cook
    else {
      const recipePromptMessage =
        "I'd be happy to provide a recipe for your Big Green Egg! What specific dish would you like to cook? For example:\n\n" +
        "• Smoked brisket\n\n" +
        "• Grilled salmon\n\n" +
        "• Pizza\n\n" +
        "• Roast chicken\n\n" +
        "• Pulled pork\n\n" +
        "• Smoked ribs\n\n" +
        "• Grilled vegetables\n\n" +
        "Just let me know what you'd like to make, and I'll provide a detailed recipe specifically for cooking on your Big Green Egg!";

      return {
        messages: [createMessage("assistant", recipePromptMessage)],
        category: "tips_and_tricks",
      };
    }
  }

  // General cooking query
  const cookingMessage =
    "I'd be happy to help with cooking tips! What specific dish or cooking technique would you like to learn about? I can provide guidance on:\n\n" +
    "• Grilling techniques (direct/indirect heat)\n\n" +
    "• Smoking methods and wood choices\n\n" +
    "• Temperature control tips\n\n" +
    "• Specific recipes (pizza, brisket, ribs, etc.)\n\n" +
    "• Baking in your EGG\n\n" +
    "• Roasting techniques\n\n" +
    "Let me know what you'd like to cook, and I'll provide specific instructions!\n\n" +
    "If you need direct assistance, you can contact our customer support team:\n\n" +
    "• Email: Support@BigGreenEgg.com\n\n" +
    "• Phone: 404-344-4323 (404-EGG-HEAD)\n\n" +
    "• Visit our [Customer Support Page](https://biggreenegg.com/pages/customer-support) for more options";

  return {
    messages: [createMessage("assistant", cookingMessage)],
    category: "tips_and_tricks",
  };
}
