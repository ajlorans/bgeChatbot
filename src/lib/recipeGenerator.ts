import OpenAI from "openai";

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
