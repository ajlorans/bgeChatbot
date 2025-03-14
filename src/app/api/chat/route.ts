import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import { createMessage, defaultSystemPrompt } from "@/lib/utils";
import { Message } from "@/lib/types";
import {
  getProductRecommendations,
  getProductBundles,
  recommendEggSize,
  generateProductRecommendationMessage,
  generateBundleRecommendationMessage,
  generateEggSizeRecommendationMessage,
  generateGuidedSelectionMessage,
  isProductSelectionQuery,
  eggSizeRecommendations,
} from "@/lib/productRecommendations";
import { handleRecipeRequest } from "@/lib/recipeHandler";

interface OrderItem {
  quantity: number;
  name: string;
  price: string;
}

interface ShopifyOrder {
  name: string;
  status?: string;
  fulfillment_status?: string;
  financial_status: string;
  created_at: string;
  total_price: string;
  line_items: OrderItem[];
  tracking_number?: string;
  tracking_url?: string;
  estimated_delivery?: string;
}

// Helper function to check if error is an OpenAI error
function isOpenAIError(
  error: unknown
): error is { status?: number; code?: string } {
  return (
    typeof error === "object" &&
    error !== null &&
    ("status" in error || "code" in error)
  );
}

const OPENAI_API_KEY = process.env.OPENAI_API_KEY || "";

export async function POST(req: NextRequest) {
  try {
    // Initialize OpenAI client
    const openai = new OpenAI({
      apiKey: OPENAI_API_KEY,
    });

    const { messages } = await req.json();
    const lastMessage = messages[messages.length - 1];

    // Check for direct order number and email pattern first (e.g., "#123456 example@email.com")
    const directOrderPattern =
      /^\s*#?(\d{5,})\s+([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9._-]+)\s*$/i;
    const directOrderMatch = lastMessage.content.match(directOrderPattern);

    // Also check for email followed by order number pattern
    const emailFirstPattern =
      /^\s*([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9._-]+)\s+#?(\d{5,})\s*$/i;
    const emailFirstMatch = lastMessage.content.match(emailFirstPattern);

    // Check for order number and email separated by punctuation (comma, period, etc.)
    const punctuationSeparatedPattern =
      /^\s*#?(\d{5,})[,.\s]+([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9._-]+)\s*$/i;
    const punctuationSeparatedMatch = lastMessage.content.match(
      punctuationSeparatedPattern
    );

    // Check for email and order number separated by punctuation
    const emailPunctuationPattern =
      /^\s*([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9._-]+)[,.\s]+#?(\d{5,})\s*$/i;
    const emailPunctuationMatch = lastMessage.content.match(
      emailPunctuationPattern
    );

    if (
      directOrderMatch ||
      emailFirstMatch ||
      punctuationSeparatedMatch ||
      emailPunctuationMatch
    ) {
      let orderNumber, email;

      if (directOrderMatch) {
        orderNumber = directOrderMatch[1];
        email = directOrderMatch[2];
      } else if (emailFirstMatch) {
        email = emailFirstMatch[1];
        orderNumber = emailFirstMatch[2];
      } else if (punctuationSeparatedMatch) {
        orderNumber = punctuationSeparatedMatch[1];
        email = punctuationSeparatedMatch[2];
      } else {
        email = emailPunctuationMatch[1];
        orderNumber = emailPunctuationMatch[2];
      }

      try {
        // Use the current request URL to determine the correct port
        const currentUrl = new URL(req.url);
        const baseUrl = `${currentUrl.protocol}//${currentUrl.host}`;

        // Create an AbortController to handle timeout
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 second timeout

        try {
          const response = await fetch(`${baseUrl}/api/shopify`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              action: "getOrderStatus",
              orderId: orderNumber,
              email: email,
              requireBoth: true, // Add this flag to indicate both are required
            }),
            signal: controller.signal,
          });

          clearTimeout(timeoutId); // Clear the timeout if the request completes

          const data = await response.json();

          if (data.error) {
            let errorMessage =
              "I apologize, but I couldn't find any information. ";

            // Handle specific error messages
            if (data.error.includes("timed out")) {
              errorMessage =
                "I apologize, but the request to fetch your order information timed out. This could be due to high traffic or temporary issues with our order system. Please try again in a few minutes or contact our customer service for immediate assistance.";
            } else {
              errorMessage +=
                "Please verify that both your order number and email address are correct. For security purposes, we require both to access order information.";
            }

            return NextResponse.json({
              messages: [createMessage("assistant", errorMessage)],
            });
          }

          // Single order response
          const order = data.order as ShopifyOrder;

          if (!order) {
            throw new Error("Order not found");
          }

          const orderDetailsHtml = `
<div class="order-details">
  <h3>Order Details</h3>
  
  <div class="status-item">
    <span class="label">Order Number:</span>
    <span class="value">${order.name}</span>
  </div>
  
  <div class="status-item">
    <span class="label">Order Date:</span>
    <span class="value">${new Date(
      order.created_at
    ).toLocaleDateString()}</span>
  </div>
  
  <div class="status-item">
    <span class="label">Order Status:</span>
    <span class="value ${order.fulfillment_status}">${
            order.fulfillment_status
          }</span>
  </div>
  
  <div class="status-item">
    <span class="label">Payment Status:</span>
    <span class="value ${order.financial_status}">${
            order.financial_status
          }</span>
  </div>
  
  <div class="status-item">
    <span class="label">Total Price:</span>
    <span class="value">USD: $${order.total_price}</span>
  </div>
  
  ${
    order.tracking_number
      ? `
    <div class="detail-item">
      <span class="label">Tracking:</span>
      <div class="flex-1">
        <a href="${order.tracking_url}" target="_blank" class="tracking-link">${order.tracking_number}</a>
      </div>
    </div>
  `
      : ""
  }
  
  ${
    order.estimated_delivery
      ? `
    <div class="detail-item">
      <span class="label">Estimated Delivery:</span>
      <span class="value">${new Date(
        order.estimated_delivery
      ).toLocaleDateString()}</span>
    </div>
  `
      : ""
  }
  
  <div class="items-list">
    <strong>Order Items:</strong>
    ${order.line_items
      .map(
        (item) => `
        <div class="detail-item">
          <span class="value">• ${item.quantity}x ${item.name}</span>
          <span class="value ml-auto">USD: $${item.price}</span>
        </div>
      `
      )
      .join("")}
  </div>
</div>`;

          return NextResponse.json({
            messages: [createMessage("assistant", orderDetailsHtml)],
          });
        } catch (error) {
          clearTimeout(timeoutId); // Clear the timeout if there's an error

          // Check if it's a timeout error
          if (error instanceof Error && error.name === "AbortError") {
            return NextResponse.json({
              messages: [
                createMessage(
                  "assistant",
                  "I apologize, but the request to fetch your order information timed out. This could be due to high traffic or temporary issues with our order system. Please try again in a few minutes or contact our customer service for immediate assistance."
                ),
              ],
            });
          }

          throw error; // Re-throw for the outer catch block
        }
      } catch (error) {
        console.error("Error fetching order status:", error);
        return NextResponse.json({
          messages: [
            createMessage(
              "assistant",
              "I apologize, but I encountered an error while checking your order status. Please try again later or contact our customer service for assistance."
            ),
          ],
        });
      }
    }

    // Check for warranty information inquiries
    if (
      lastMessage.content.toLowerCase() ===
        "i want to know the warranty information" ||
      lastMessage.content.toLowerCase().includes("warranty information") ||
      lastMessage.content.toLowerCase().includes("warranty details") ||
      lastMessage.content.toLowerCase().includes("what is the warranty") ||
      lastMessage.content.toLowerCase().includes("warranty period") ||
      lastMessage.content.toLowerCase().includes("how long is the warranty") ||
      (lastMessage.content.toLowerCase().includes("warranty") &&
        (lastMessage.content.toLowerCase().includes("know") ||
          lastMessage.content.toLowerCase().includes("tell me") ||
          lastMessage.content.toLowerCase().includes("what") ||
          lastMessage.content.toLowerCase().includes("how")))
    ) {
      const warrantyInfoMessage =
        "Big Green Egg offers different warranty terms depending on the product:\n\n" +
        "• **Ceramic Components**: Limited Lifetime Warranty for the ceramic base, ceramic dome, ceramic fire ring, ceramic fire box, and ceramic damper top.\n\n" +
        "• **Metal Components**: 5-year warranty for metal bands, metal hinge, metal cap top, cooking grid, fire grate, and draft door.\n\n" +
        "• **Wood Products**: 1-year warranty for wooden EGG mates and wooden handlers.\n\n" +
        "• **Thermometers and Gaskets**: 1-year warranty.\n\n" +
        "• **Other Accessories**: Warranty periods vary by product.\n\n" +
        "For complete warranty details and to register your product, please visit our [Warranty Page](https://biggreenegg.com/pages/warranty). If you have specific questions about warranty coverage for your product, please contact our customer support team at Support@BigGreenEgg.com or call 404-344-4323.";

      return NextResponse.json({
        messages: [createMessage("assistant", warrantyInfoMessage)],
        category: "customer_support",
      });
    }

    // Check for product registration request
    if (
      lastMessage.content.toLowerCase().includes("register") &&
      (lastMessage.content.toLowerCase().includes("product") ||
        lastMessage.content.includes("warranty") ||
        lastMessage.content.includes("egg"))
    ) {
      const registrationMessage =
        "Big Green Egg offers different warranty terms depending on the product. The ceramic components of EGG grills have a limited lifetime warranty, while metal components, wood products, and other accessories have varying warranty periods. To register your Big Green Egg product and view detailed warranty information, please visit our official website at [Big Green Egg Warranty Registration](https://biggreenegg.com/pages/warranty) and follow the instructions provided. If you encounter any difficulties, feel free to reach out to our customer service team for assistance.";

      return NextResponse.json({
        messages: [createMessage("assistant", registrationMessage)],
        category: "product_registration",
      });
    }

    // Check for product category inquiries
    const lowerMessage = lastMessage.content.toLowerCase();
    let productMessage = "";
    let isProductInquiry = false;
    let isAssemblyInquiry = false;

    // Check if this is a response to a previous product recommendation question
    // Look for the previous message asking about household size, outdoor space, etc.
    if (messages.length >= 2) {
      const previousMessage = messages[messages.length - 2];

      // Check if the previous message was asking about which size EGG they have for accessories
      if (
        previousMessage.role === "assistant" &&
        previousMessage.content &&
        previousMessage.content.includes(
          "I'd be happy to recommend accessories for your Big Green Egg"
        ) &&
        previousMessage.content.includes("which size EGG you have")
      ) {
        console.log("User is responding to accessory size inquiry");

        // Determine which size EGG they mentioned
        let eggSize = "Large"; // Default to Large if we can't determine

        if (
          lowerMessage.includes("2xl") ||
          lowerMessage.includes("2 xl") ||
          lowerMessage.includes("xxl") ||
          lowerMessage.includes("2x large") ||
          lowerMessage.includes("double extra large")
        ) {
          eggSize = "2XL";
        } else if (
          lowerMessage.includes("xl") ||
          lowerMessage.includes("x large") ||
          (lowerMessage.includes("extra large") &&
            !lowerMessage.includes("2xl") &&
            !lowerMessage.includes("2 xl") &&
            !lowerMessage.includes("xxl"))
        ) {
          eggSize = "XL";
        } else if (
          lowerMessage.includes("large") &&
          !lowerMessage.includes("xl") &&
          !lowerMessage.includes("extra large") &&
          !lowerMessage.includes("2xl") &&
          !lowerMessage.includes("2 xl") &&
          !lowerMessage.includes("xxl")
        ) {
          eggSize = "Large";
        } else if (
          lowerMessage.includes("medium") ||
          lowerMessage.includes("med")
        ) {
          eggSize = "Medium";
        } else if (
          lowerMessage.includes("small") &&
          !lowerMessage.includes("minimax") &&
          !lowerMessage.includes("mini max")
        ) {
          eggSize = "Small";
        } else if (
          lowerMessage.includes("minimax") ||
          lowerMessage.includes("mini max")
        ) {
          eggSize = "MiniMax";
        } else if (
          lowerMessage.includes("mini") &&
          !lowerMessage.includes("minimax") &&
          !lowerMessage.includes("mini max")
        ) {
          eggSize = "Mini";
        } else if (
          lowerMessage.includes("don't have") ||
          lowerMessage.includes("dont have") ||
          lowerMessage.includes("do not have") ||
          lowerMessage.includes("looking to buy") ||
          lowerMessage.includes("planning to buy") ||
          lowerMessage.includes("want to buy") ||
          lowerMessage.includes("new purchase")
        ) {
          // They don't have an EGG yet
          const noEggMessage =
            "Since you don't have an EGG yet, I'd be happy to help you choose both the right size and accessories. To recommend the perfect Big Green Egg for your needs, could you tell me:\n\n" +
            "• How many people do you typically cook for?\n" +
            "• Do you entertain frequently?\n" +
            "• How much outdoor space do you have?\n" +
            "• Do you need portability (for camping, tailgating, etc.)?\n\n" +
            "Once we determine the right size, I can recommend the perfect accessories to enhance your cooking experience!";

          return NextResponse.json({
            messages: [createMessage("assistant", noEggMessage)],
            category: "product_recommendation",
          });
        }

        console.log("Detected EGG size for accessories:", eggSize);

        // Generate accessory recommendations based on the size
        let accessoryMessage = `Here are some essential accessories that work perfectly with your ${eggSize} Big Green Egg:\n\n`;

        if (eggSize === "2XL" || eggSize === "XL") {
          accessoryMessage +=
            "1. **[5-Piece EGGspander Kit](https://biggreenegg.com/collections/eggspander-system/products/5-piece-eggspander-kit-for-xl)** ($349.99) - This versatile system allows you to cook multiple dishes at different temperatures simultaneously.\n\n" +
            "2. **[Stainless Steel Fire Bowl](https://biggreenegg.com/collections/ceramics-grids/products/stainless-steel-fire-bowl)** ($84.99) - Improves airflow and makes cleanup easier, extending the life of your ceramic fire box.\n\n" +
            "3. **[EGG Genius Temperature Controller](https://biggreenegg.com/collections/temperature-control/products/egg-genius-temperature-controller)** ($249.99) - Monitor and adjust your EGG's temperature remotely for perfect results every time.\n\n" +
            "4. **[Acacia Hardwood Table](https://biggreenegg.com/collections/all-modular-system-tables-stands)** - A beautiful, durable option that provides ample workspace for your EGG.\n\n" +
            "5. **[Pizza & Baking Stone](https://biggreenegg.com/collections/pizza/products/pizza-baking-stone)** ($69.99) - For perfect pizzas with crispy crusts.\n\n";

          // Add pizza-specific accessories if they mentioned pizza
          if (
            lowerMessage.includes("pizza") ||
            (previousMessage.content &&
              previousMessage.content.toLowerCase().includes("pizza"))
          ) {
            accessoryMessage +=
              "**For pizza specifically, I recommend:**\n\n" +
              "• **[Pizza & Baking Stone](https://biggreenegg.com/collections/pizza/products/pizza-baking-stone)** ($69.99) - Essential for crispy crusts\n" +
              "• **[Aluminum Pizza Peel](https://biggreenegg.com/collections/pizza/products/aluminum-pizza-peel)** ($39.99) - Makes transferring pizzas easy\n" +
              "• **[Compact Pizza Cutter](https://biggreenegg.com/collections/pizza/products/compact-pizza-cutter)** ($19.99) - Perfect for slicing your masterpiece\n" +
              "• **[Pizza Oven Wedge for XL EGG](https://biggreenegg.com/collections/pizza/products/pizza-oven-wedge-for-xl-egg)** ($119.99) - Creates the perfect pizza oven environment\n\n";
          }

          accessoryMessage +=
            "Would you like more specific information about any of these accessories?";
        } else if (eggSize === "Large") {
          accessoryMessage +=
            "1. **[5-Piece EGGspander Kit for Large](https://biggreenegg.com/collections/eggspander-system/products/5-piece-eggspander-kit-for-large)** ($329.99) - This versatile system allows you to cook multiple dishes at different temperatures simultaneously.\n\n" +
            "2. **[Stainless Steel Fire Bowl](https://biggreenegg.com/collections/ceramics-grids/products/stainless-steel-fire-bowl)** ($84.99) - Improves airflow and makes cleanup easier, extending the life of your ceramic fire box.\n\n" +
            "3. **[EGG Genius Temperature Controller](https://biggreenegg.com/collections/temperature-control/products/egg-genius-temperature-controller)** ($249.99) - Monitor and adjust your EGG's temperature remotely for perfect results every time.\n\n" +
            "4. **[Acacia Hardwood Table for Large EGG](https://biggreenegg.com/collections/all-modular-system-tables-stands/products/table-solid-acacia-hardwood-for-large-egg)** ($659.99) - A beautiful, durable option that provides ample workspace.\n\n" +
            "5. **[Pizza Oven Wedge for Large EGG](https://biggreenegg.com/collections/pizza/products/pizza-oven-wedge-for-large-egg)** ($119.99) - Creates the perfect environment for cooking pizzas with crispy crusts.\n\n";

          // Add pizza-specific accessories if they mentioned pizza
          if (
            lowerMessage.includes("pizza") ||
            (previousMessage.content &&
              previousMessage.content.toLowerCase().includes("pizza"))
          ) {
            accessoryMessage +=
              "**For pizza specifically, I recommend:**\n\n" +
              "• **[Pizza & Baking Stone](https://biggreenegg.com/collections/pizza/products/pizza-baking-stone)** ($69.99) - Essential for crispy crusts\n" +
              "• **[Aluminum Pizza Peel](https://biggreenegg.com/collections/pizza/products/aluminum-pizza-peel)** ($39.99) - Makes transferring pizzas easy\n" +
              "• **[Compact Pizza Cutter](https://biggreenegg.com/collections/pizza/products/compact-pizza-cutter)** ($19.99) - Perfect for slicing your masterpiece\n" +
              "• **[Pizza Oven Wedge for Large EGG](https://biggreenegg.com/collections/pizza/products/pizza-oven-wedge-for-large-egg)** ($119.99) - Creates the perfect pizza oven environment\n\n";
          }

          accessoryMessage +=
            "Would you like more specific information about any of these accessories?";
        } else if (eggSize === "Medium" || eggSize === "Small") {
          accessoryMessage +=
            "1. **[Stainless Steel Grid](https://biggreenegg.com/collections/ceramics-grids/products/stainless-steel-grid)** ($41.99) - Durable stainless steel grid provides excellent heat retention.\n\n" +
            "2. **[Stainless Steel Fire Bowl](https://biggreenegg.com/collections/ceramics-grids/products/stainless-steel-fire-bowl)** ($84.99) - Improves airflow and makes cleanup easier, extending the life of your ceramic fire box.\n\n" +
            "3. **[EGG Genius Temperature Controller](https://biggreenegg.com/collections/temperature-control/products/egg-genius-temperature-controller)** ($249.99) - Monitor and adjust your EGG's temperature remotely for perfect results every time.\n\n" +
            "4. **[Pizza & Baking Stone](https://biggreenegg.com/collections/pizza/products/pizza-baking-stone)** ($69.99) - For perfect pizzas with crispy crusts.\n\n" +
            "5. **[Premium Whiskey Barrel Smoking Chips](https://biggreenegg.com/collections/charcoal-wood-starters/products/premium-whiskey-barrel-smoking-chips-2-9-l-180-cu-in)** ($14.99) - Add delicious smoky flavor to your foods.\n\n";

          // Add pizza-specific accessories if they mentioned pizza
          if (
            lowerMessage.includes("pizza") ||
            (previousMessage.content &&
              previousMessage.content.toLowerCase().includes("pizza"))
          ) {
            accessoryMessage +=
              "**For pizza specifically, I recommend:**\n\n" +
              "• **[Pizza & Baking Stone](https://biggreenegg.com/collections/pizza/products/pizza-baking-stone)** ($69.99) - Essential for crispy crusts\n" +
              "• **[Aluminum Pizza Peel](https://biggreenegg.com/collections/pizza/products/aluminum-pizza-peel)** ($39.99) - Makes transferring pizzas easy\n" +
              "• **[Compact Pizza Cutter](https://biggreenegg.com/collections/pizza/products/compact-pizza-cutter)** ($19.99) - Perfect for slicing your masterpiece\n\n";
          }

          accessoryMessage +=
            "Would you like more specific information about any of these accessories?";
        } else if (eggSize === "MiniMax" || eggSize === "Mini") {
          accessoryMessage +=
            "1. **[Stainless Steel Grid](https://biggreenegg.com/collections/ceramics-grids/products/stainless-steel-grid)** ($41.99) - Durable stainless steel grid provides excellent heat retention.\n\n" +
            "2. **[EGG Carrier](https://biggreenegg.com/collections/all-modular-system-tables-stands)** - Perfect for taking your portable EGG on the go.\n\n" +
            "3. **[Pizza & Baking Stone](https://biggreenegg.com/collections/pizza/products/pizza-baking-stone)** ($69.99) - For perfect pizzas with crispy crusts, sized to fit your EGG.\n\n" +
            "4. **[Premium Whiskey Barrel Smoking Chips](https://biggreenegg.com/collections/charcoal-wood-starters/products/premium-whiskey-barrel-smoking-chips-2-9-l-180-cu-in)** ($14.99) - Add delicious smoky flavor to your foods.\n\n" +
            "5. **[Cast Iron Cooking Grid](https://biggreenegg.com/collections/ceramics-grids)** - For perfect sear marks and excellent heat retention.\n\n";

          // Add pizza-specific accessories if they mentioned pizza
          if (
            lowerMessage.includes("pizza") ||
            (previousMessage.content &&
              previousMessage.content.toLowerCase().includes("pizza"))
          ) {
            accessoryMessage +=
              "**For pizza specifically, I recommend:**\n\n" +
              "• **[Pizza & Baking Stone](https://biggreenegg.com/collections/pizza/products/pizza-baking-stone)** ($69.99) - Essential for crispy crusts, available in a size that fits your Mini/MiniMax\n" +
              "• **[Compact Pizza Cutter](https://biggreenegg.com/collections/pizza/products/compact-pizza-cutter)** ($19.99) - Perfect for slicing your masterpiece\n\n";
          }

          accessoryMessage +=
            "Would you like more specific information about any of these accessories?";
        }

        return NextResponse.json({
          messages: [createMessage("assistant", accessoryMessage)],
          category: "product_recommendation",
        });
      }

      // Check if the previous message was asking about egg size recommendation
      if (
        previousMessage.role === "assistant" &&
        previousMessage.content &&
        (previousMessage.content.includes(
          "How many people do you typically cook for?"
        ) ||
          previousMessage.content.includes("Do you entertain frequently?") ||
          previousMessage.content.includes(
            "How much outdoor space do you have?"
          ) ||
          previousMessage.content.includes("Do you need portability") ||
          previousMessage.content.includes(
            "To help you find the perfect Big Green Egg size"
          ))
      ) {
        // Check if the user is asking for accessories instead of answering the size questions
        if (
          lowerMessage.includes("accessories") ||
          lowerMessage.includes("accessory") ||
          lowerMessage === "i want accessories" ||
          lowerMessage === "accessories" ||
          lowerMessage.includes("show me accessories") ||
          lowerMessage.includes("what accessories") ||
          lowerMessage.includes("need accessories") ||
          lowerMessage.includes("looking for accessories")
        ) {
          console.log(
            "User is asking for accessories instead of answering size questions"
          );

          // Ask which size EGG they have or are interested in
          const accessoryInquiryMessage =
            "I'd be happy to recommend accessories for your Big Green Egg! To provide the most appropriate recommendations, could you tell me which size EGG you have or are interested in?\n\n" +
            "• Mini\n" +
            "• MiniMax\n" +
            "• Small\n" +
            "• Medium\n" +
            "• Large\n" +
            "• XL\n" +
            "• 2XL\n\n" +
            "If you're not sure which size would be best for you, I can help you determine that first based on your cooking needs.";

          return NextResponse.json({
            messages: [createMessage("assistant", accessoryInquiryMessage)],
            category: "product_recommendation",
          });
        }

        // This is a response to our egg size questions, so let's recommend a product
        let recommendationKey = "AVERAGE-FAMILY"; // Default to average family

        // Log the user's response for debugging
        console.log("User response to size question:", lastMessage.content);

        // Check for number of people mentioned - ALWAYS recommend XL for 6+ people
        if (
          lastMessage.content.toLowerCase().match(/\b[6-9]\b/) ||
          lastMessage.content.toLowerCase().includes("six") ||
          lastMessage.content.toLowerCase().includes("seven") ||
          lastMessage.content.toLowerCase().includes("eight") ||
          lastMessage.content.toLowerCase().includes("nine") ||
          lastMessage.content.toLowerCase().includes("ten") ||
          lastMessage.content.toLowerCase().includes("6 people") ||
          lastMessage.content.toLowerCase().includes("7 people") ||
          lastMessage.content.toLowerCase().includes("8 people") ||
          lastMessage.content.toLowerCase().includes("9 people") ||
          lastMessage.content.toLowerCase().includes("10 people") ||
          lastMessage.content.toLowerCase().includes("for 6") ||
          lastMessage.content.toLowerCase().includes("for 7") ||
          lastMessage.content.toLowerCase().includes("for 8") ||
          lastMessage.content.toLowerCase().includes("for 9") ||
          lastMessage.content.toLowerCase().includes("for 10") ||
          lastMessage.content.toLowerCase().includes("for six") ||
          lastMessage.content.toLowerCase().includes("for seven") ||
          lastMessage.content.toLowerCase().includes("for eight") ||
          lastMessage.content.toLowerCase().includes("for nine") ||
          lastMessage.content.toLowerCase().includes("for ten") ||
          lastMessage.content.toLowerCase().includes("large family") ||
          lastMessage.content.toLowerCase().includes("big family") ||
          lastMessage.content.toLowerCase().includes("many people") ||
          lastMessage.content.toLowerCase().includes("lots of people")
        ) {
          // If they mentioned cooking for 6+ people, they should get an XL recommendation
          recommendationKey = "LARGE-FAMILY";
          console.log("Recommending XL EGG for 6+ people");
        } else if (
          lastMessage.content.toLowerCase().includes("4 people") ||
          lastMessage.content.toLowerCase().includes("four people") ||
          lastMessage.content.toLowerCase().includes("for 4") ||
          lastMessage.content.toLowerCase().includes("for four") ||
          lastMessage.content.toLowerCase().includes("4") ||
          lastMessage.content.toLowerCase().includes("four")
        ) {
          // Recommend Large EGG for 4 people
          recommendationKey = "AVERAGE-FAMILY";
        } else if (
          lastMessage.content.toLowerCase().includes("2 people") ||
          lastMessage.content.toLowerCase().includes("two people") ||
          lastMessage.content.toLowerCase().includes("for 2") ||
          lastMessage.content.toLowerCase().includes("for two") ||
          lastMessage.content.toLowerCase().includes("couple") ||
          lastMessage.content.toLowerCase().includes("2") ||
          lastMessage.content.toLowerCase().includes("two")
        ) {
          // Recommend Small or Medium EGG for 2 people
          recommendationKey = "SMALL-FAMILY";
        } else if (
          lastMessage.content.toLowerCase().includes("1 person") ||
          lastMessage.content.toLowerCase().includes("one person") ||
          lastMessage.content.toLowerCase().includes("just me") ||
          lastMessage.content.toLowerCase().includes("myself") ||
          lastMessage.content.toLowerCase().includes("1") ||
          lastMessage.content.toLowerCase().includes("one")
        ) {
          // Recommend Mini or MiniMax EGG for 1 person
          recommendationKey = "SINGLE-PERSON";
        }

        // Check for outdoor space mention
        if (
          lastMessage.content.toLowerCase().includes("lot of outdoor space") ||
          lastMessage.content.toLowerCase().includes("large outdoor space") ||
          lastMessage.content.toLowerCase().includes("big outdoor space") ||
          lastMessage.content.toLowerCase().includes("plenty of space") ||
          lastMessage.content.toLowerCase().includes("large backyard") ||
          lastMessage.content.toLowerCase().includes("big backyard") ||
          (lastMessage.content.toLowerCase().includes("lot") &&
            lastMessage.content.toLowerCase().includes("space"))
        ) {
          // If they mention having a lot of space and many people, recommend XL or 2XL
          if (recommendationKey === "LARGE-FAMILY") {
            recommendationKey = "COMMERCIAL";
          }
          // If they have a lot of space but average family, recommend XL
          else if (recommendationKey === "AVERAGE-FAMILY") {
            recommendationKey = "LARGE-FAMILY";
          }
        }

        // Generate the recommendation message
        const responseMessage = generateEggSizeRecommendationMessage(
          eggSizeRecommendations[recommendationKey]
        );

        return NextResponse.json({
          messages: [createMessage("assistant", responseMessage)],
          category: "product_recommendation",
        });
      }
    }

    // Check for general customer support request
    if (
      lowerMessage.includes("customer support assistance") ||
      (lowerMessage.includes("customer support") &&
        !lowerMessage.includes("assembly"))
    ) {
      const supportMessage =
        "I'd be happy to help with customer support. What specific assistance do you need today? I can help with:\n\n" +
        "• Assembly and setup questions\n\n" +
        "• Product troubleshooting\n\n" +
        "• Warranty information\n\n" +
        "• Replacement parts\n\n" +
        "• Cooking techniques\n\n" +
        "• Maintenance and cleaning\n\n" +
        "Please let me know what you need help with, and I'll provide the relevant information.\n\n" +
        "If you need direct assistance, you can contact our customer support team:\n\n" +
        "• Email: Support@BigGreenEgg.com\n\n" +
        "• Phone: 404-344-4323 (404-EGG-HEAD)\n\n" +
        "• Visit our [Customer Support Page](https://biggreenegg.com/pages/customer-support) for more options";

      return NextResponse.json({
        messages: [createMessage("assistant", supportMessage)],
        category: "customer_support",
      });
    }

    // Check for product recommendation queries
    if (isProductRecommendation(lastMessage.content)) {
      // Check if the user is specifically asking about accessories
      if (
        lowerMessage.includes("accessories") ||
        lowerMessage.includes("accessory") ||
        (lowerMessage.includes("pizza") &&
          (lowerMessage.includes("stone") ||
            lowerMessage.includes("accessories") ||
            lowerMessage.includes("help"))) ||
        lowerMessage.includes("eggspander") ||
        lowerMessage.includes("expander") ||
        lowerMessage.includes("fire bowl") ||
        lowerMessage.includes("firebowl") ||
        lowerMessage.includes("temperature controller") ||
        lowerMessage.includes("egg genius")
      ) {
        console.log("User is asking specifically about accessories");

        // Ask which size EGG they have to provide appropriate accessories
        const accessoryInquiryMessage =
          "I'd be happy to recommend accessories for your Big Green Egg! To provide the most appropriate recommendations, could you tell me which size EGG you have?\n\n" +
          "• Mini\n" +
          "• MiniMax\n" +
          "• Small\n" +
          "• Medium\n" +
          "• Large\n" +
          "• XL\n" +
          "• 2XL\n\n" +
          "If you don't have an EGG yet and are looking for accessories to go with a new purchase, let me know and I can help you choose both the right size and the perfect accessories for your needs.";

        return NextResponse.json({
          messages: [createMessage("assistant", accessoryInquiryMessage)],
          category: "product_recommendation",
        });
      }

      // Get product recommendations based on the user's query
      const recommendedProducts = getProductRecommendations(
        lastMessage.content
      );
      const recommendedBundles = getProductBundles(lastMessage.content);

      let responseMessage = "";

      // If the user is asking about egg sizes, provide a size recommendation
      if (isProductSelectionQuery(lastMessage.content)) {
        const sizeRecommendation = recommendEggSize(lastMessage.content);
        if (!sizeRecommendation) {
          // Customize the initial product recommendation prompt
          responseMessage =
            "To help you find the perfect Big Green Egg size or accessories, could you tell me:\n\n" +
            "• How many people do you typically cook for?\n" +
            "• Do you entertain frequently?\n" +
            "• How much outdoor space do you have?\n" +
            "• Do you need portability (for camping, tailgating, etc.)?\n\n" +
            "If you're looking for accessories instead, please let me know which size EGG you have, and I can recommend the perfect accessories for your needs.";
        } else {
          responseMessage =
            generateEggSizeRecommendationMessage(sizeRecommendation);
        }
      }
      // If the user is asking for general product guidance, provide a guided selection flow
      else if (isGuidedSelectionQuery(lastMessage.content)) {
        responseMessage = generateGuidedSelectionMessage();
      }
      // Otherwise, provide product recommendations
      else {
        responseMessage = generateProductRecommendationMessage(
          recommendedProducts,
          lastMessage.content
        );

        // Add bundle recommendations if available
        const bundleMessage =
          generateBundleRecommendationMessage(recommendedBundles);
        if (bundleMessage) {
          responseMessage += "\n\n" + bundleMessage;
        }
      }

      return NextResponse.json({
        messages: [createMessage("assistant", responseMessage)],
        category: "product_recommendation",
      });
    }

    // Check for assembly guide inquiries
    if (
      (lowerMessage.includes("assembly") &&
        (lowerMessage.includes("guide") ||
          lowerMessage.includes("instruction") ||
          lowerMessage.includes("manual") ||
          lowerMessage.includes("help"))) ||
      (lowerMessage.includes("assemble") && lowerMessage.includes("egg")) ||
      (lowerMessage.includes("put together") && lowerMessage.includes("egg")) ||
      (lowerMessage.includes("putting together") &&
        lowerMessage.includes("egg")) ||
      (lowerMessage.includes("build") && lowerMessage.includes("egg")) ||
      (lowerMessage.includes("setup") && lowerMessage.includes("egg")) ||
      (lowerMessage.includes("set up") && lowerMessage.includes("egg")) ||
      (lowerMessage.includes("install") && lowerMessage.includes("egg")) ||
      (lowerMessage.includes("installation") && lowerMessage.includes("egg")) ||
      (lowerMessage.includes("white glove") &&
        lowerMessage.includes("delivery")) ||
      lowerMessage.includes("gasket replacement") ||
      (lowerMessage.includes("help") &&
        lowerMessage.includes("assembling") &&
        lowerMessage.includes("egg")) ||
      (lowerMessage.includes("need help") &&
        lowerMessage.includes("assembly") &&
        lowerMessage.includes("egg"))
    ) {
      isAssemblyInquiry = true;
      let assemblyMessage =
        "We have comprehensive assembly guides for all Big Green Egg products at our [Assembly Guides page](https://biggreenegg.com/blogs/guides/assembly). ";

      // Specific EGG size assembly
      if (
        lowerMessage.includes("2xl") ||
        lowerMessage.includes("2 xl") ||
        lowerMessage.includes("xxl")
      ) {
        assemblyMessage +=
          "For your 2XL EGG, we have specific [assembly videos and PDFs](https://biggreenegg.com/blogs/guides/assembly) that walk you through the process step by step. The 2XL EGG is our largest model and requires careful handling during assembly due to its weight.";
      } else if (
        lowerMessage.includes("xl") &&
        !lowerMessage.includes("2xl") &&
        !lowerMessage.includes("2 xl") &&
        !lowerMessage.includes("xxl")
      ) {
        assemblyMessage +=
          "For your XL EGG, we have specific [assembly videos and PDFs](https://biggreenegg.com/blogs/guides/assembly) that walk you through the process step by step. The XL EGG is a popular size for those who entertain frequently.";
      } else if (lowerMessage.includes("large")) {
        assemblyMessage +=
          "For your Large EGG, we have specific [assembly videos and PDFs](https://biggreenegg.com/blogs/guides/assembly) that walk you through the process step by step. The Large EGG is our most popular size and fits most cooking needs.";
      } else if (lowerMessage.includes("medium")) {
        assemblyMessage +=
          "For your Medium EGG, we have specific [assembly videos and PDFs](https://biggreenegg.com/blogs/guides/assembly) that walk you through the process step by step. The Medium EGG is perfect for smaller families or limited spaces.";
      } else if (lowerMessage.includes("small")) {
        assemblyMessage +=
          "For your Small EGG, we have specific [assembly videos and PDFs](https://biggreenegg.com/blogs/guides/assembly) that walk you through the process step by step. The Small EGG is great for individuals or couples.";
      } else if (
        lowerMessage.includes("minimax") ||
        lowerMessage.includes("mini max")
      ) {
        assemblyMessage +=
          "For your MiniMax EGG, we have specific [assembly videos and PDFs](https://biggreenegg.com/blogs/guides/assembly) that walk you through the process step by step. The MiniMax EGG is portable yet powerful.";
      } else if (lowerMessage.includes("mini")) {
        assemblyMessage +=
          "For your Mini EGG, we have specific [assembly videos and PDFs](https://biggreenegg.com/blogs/guides/assembly) that walk you through the process step by step. The Mini EGG is our most portable option.";
      }
      // Specific component assembly
      else if (lowerMessage.includes("nest")) {
        if (lowerMessage.includes("handler")) {
          assemblyMessage +=
            "For the intEGGrated Nest+Handler, we have a specific [assembly guide](https://biggreenegg.com/blogs/guides/assembly) that shows you how to properly assemble this convenient carrier system for your EGG.";
        } else if (lowerMessage.includes("modular")) {
          assemblyMessage +=
            "For the Modular Nest System, we have detailed [assembly guides](https://biggreenegg.com/blogs/guides/assembly) that show you how to set up this versatile system for your EGG.";
        } else if (lowerMessage.includes("table")) {
          assemblyMessage +=
            "For the Table Nest, we have a specific [assembly guide](https://biggreenegg.com/blogs/guides/assembly) that shows you how to properly set up your EGG in a table.";
        } else {
          assemblyMessage +=
            "For standard Nest assembly, we have detailed [guides](https://biggreenegg.com/blogs/guides/assembly) that walk you through the process step by step.";
        }
      } else if (lowerMessage.includes("table")) {
        assemblyMessage +=
          "For table assembly, we have detailed [guides](https://biggreenegg.com/blogs/guides/assembly) that show you how to properly set up your table and place your EGG safely within it.";
      } else if (lowerMessage.includes("carrier")) {
        assemblyMessage +=
          "For the EGG Carrier, we have a specific [assembly guide](https://biggreenegg.com/blogs/guides/assembly) that shows you how to properly assemble this portable option for your EGG.";
      } else if (
        lowerMessage.includes("band") ||
        lowerMessage.includes("hinge")
      ) {
        assemblyMessage +=
          "For Egg & Band Assembly, we have detailed [guides](https://biggreenegg.com/blogs/guides/assembly) that show you how to properly install or adjust the metal bands and hinge on your EGG.";
      } else if (
        lowerMessage.includes("gasket") ||
        lowerMessage.includes("felt")
      ) {
        assemblyMessage +=
          "For gasket replacement, we have specific [video guides](https://biggreenegg.com/blogs/guides/assembly) that show you how to remove the old gasket and install a new one for a proper seal on your EGG.";
      } else if (
        lowerMessage.includes("built in") ||
        lowerMessage.includes("built-in")
      ) {
        assemblyMessage +=
          "For built-in installations, we provide detailed spec sheets and [guides](https://biggreenegg.com/blogs/guides/assembly) for contractors and DIY enthusiasts to safely install an EGG in an outdoor kitchen.";
      } else if (lowerMessage.includes("white glove")) {
        assemblyMessage +=
          "We offer White Glove Delivery service where our team will deliver and completely assemble your EGG for you. This service is available through our authorized dealers. Contact your local dealer for availability and pricing.";
      }
      // General assembly
      else {
        assemblyMessage +=
          "Our guides include videos and PDFs for all EGG sizes and accessories, including Nests, Tables, Carriers, and more. Big Green Eggs arrive partially assembled, and our guides will help you complete the setup quickly and correctly. We also offer White Glove Delivery service where our team will deliver and completely assemble your EGG for you.";
      }

      assemblyMessage +=
        "\n\nRemember that EGGs are heavy ceramic cookers and should be handled with care during assembly. If you have any specific questions about your assembly process, feel free to ask!";

      return NextResponse.json({
        messages: [createMessage("assistant", assemblyMessage)],
        category: "customer_support",
      });
    }

    // Check for cooking-related queries - MOVED AFTER product recommendation checks
    if (
      !isAssemblyInquiry &&
      (lowerMessage.includes("cook") ||
        lowerMessage.includes("recipe") ||
        lowerMessage.includes("bake") ||
        lowerMessage.includes("grill") ||
        lowerMessage.includes("smoke") ||
        lowerMessage.includes("roast") ||
        lowerMessage.includes("temperature") ||
        lowerMessage.includes("how to make"))
    ) {
      // Use the new recipe handler
      return NextResponse.json(
        await handleRecipeRequest(openai, lowerMessage, messages)
      );
    }

    // Check if this is a product inquiry (looking for, want to buy, etc.)
    if (
      !isAssemblyInquiry &&
      (lowerMessage.includes("buy") ||
        lowerMessage.includes("purchase") ||
        lowerMessage.includes("get") ||
        lowerMessage.includes("where") ||
        lowerMessage.includes("link") ||
        lowerMessage.includes("help") ||
        lowerMessage.includes("looking for") ||
        lowerMessage.includes("find") ||
        lowerMessage.includes("shop") ||
        lowerMessage.includes("browse") ||
        lowerMessage === "i want to purchase" ||
        lowerMessage === "i want to buy" ||
        lowerMessage.includes("want to purchase") ||
        lowerMessage.includes("want to buy") ||
        lowerMessage.includes("how do i buy") ||
        lowerMessage.includes("how do i purchase") ||
        lowerMessage.includes("where can i buy") ||
        lowerMessage.includes("where can i purchase"))
    ) {
      // Check if this is the exact browse products message from the button
      if (lowerMessage === "i want to browse your products") {
        productMessage =
          "You can browse all our products on the [Big Green Egg website](https://biggreenegg.com/collections). Here are some popular categories:\n\n" +
          "• [EGGs by Size](https://biggreenegg.com/collections/all-eggs-egg-packages)\n" +
          "• [Modular Systems, Tables & Stands](https://biggreenegg.com/collections/all-modular-system-tables-stands)\n" +
          "• [Accessories](https://biggreenegg.com/collections/accessories)\n" +
          "• [Cookware & Tools](https://biggreenegg.com/collections/cookware-tools)\n" +
          "• [Lifestyle & Gear](https://biggreenegg.com/collections/all-lifestyle-gear-1)\n" +
          "• [Spices & Sauces](https://biggreenegg.com/collections/spices-sauces)\n" +
          "• [Covers & Cleaning](https://biggreenegg.com/collections/covers-cleaning)\n" +
          "• [Charcoal, Woods & Starters](https://biggreenegg.com/collections/charcoal-wood-starters)\n\n" +
          "Let me know if you're looking for something specific!";

        return NextResponse.json({
          messages: [createMessage("assistant", productMessage)],
          category: "merchandise",
        });
      }

      // Check if this is a direct purchase request after product recommendations
      if (
        lowerMessage === "i want to purchase" ||
        lowerMessage === "i want to buy" ||
        lowerMessage === "purchase" ||
        lowerMessage === "buy" ||
        lowerMessage === "yes i want to purchase" ||
        lowerMessage === "yes i want to buy" ||
        lowerMessage.includes("i want to purchase all of this") ||
        lowerMessage.includes("i want to purchase the accessories") ||
        lowerMessage.includes("i want to buy all of this") ||
        lowerMessage.includes("i want to buy the accessories") ||
        lowerMessage.includes("i want the xl package") ||
        lowerMessage.includes("i want the large package") ||
        lowerMessage.includes("i want the 2xl package") ||
        lowerMessage.includes("i want the medium package") ||
        lowerMessage.includes("i want the small package") ||
        lowerMessage.includes("i want the minimax package") ||
        lowerMessage.includes("i want the mini package") ||
        lowerMessage.includes("purchase the accessories") ||
        lowerMessage.includes("buy the accessories") ||
        lowerMessage.includes("purchase all of this") ||
        lowerMessage.includes("buy all of this") ||
        (lowerMessage.includes("purchase") &&
          lowerMessage.includes("package")) ||
        (lowerMessage.includes("buy") && lowerMessage.includes("package"))
      ) {
        // Look back through messages to find what product was recommended
        let recommendedProduct = "";
        let recommendedAccessories = false;

        // First check if the current message mentions a specific product
        if (
          lowerMessage.includes("xl package") ||
          lowerMessage.includes("xl big green egg")
        ) {
          recommendedProduct = "XL Big Green Egg";
        } else if (
          lowerMessage.includes("2xl package") ||
          lowerMessage.includes("2xl big green egg")
        ) {
          recommendedProduct = "2XL Big Green Egg";
        } else if (
          lowerMessage.includes("large package") ||
          lowerMessage.includes("large big green egg")
        ) {
          recommendedProduct = "Large Big Green Egg";
        } else if (
          lowerMessage.includes("medium package") ||
          lowerMessage.includes("medium big green egg")
        ) {
          recommendedProduct = "Medium Big Green Egg";
        } else if (
          lowerMessage.includes("small package") ||
          lowerMessage.includes("small big green egg")
        ) {
          recommendedProduct = "Small Big Green Egg";
        } else if (
          lowerMessage.includes("minimax package") ||
          lowerMessage.includes("minimax big green egg")
        ) {
          recommendedProduct = "MiniMax Big Green Egg";
        } else if (
          lowerMessage.includes("mini package") ||
          lowerMessage.includes("mini big green egg")
        ) {
          recommendedProduct = "Mini Big Green Egg";
        }

        // Check if accessories are mentioned
        if (
          lowerMessage.includes("accessories") ||
          lowerMessage.includes("all of this") ||
          lowerMessage.includes("with this")
        ) {
          recommendedAccessories = true;
        }

        // If no specific product in current message, look through conversation history
        if (!recommendedProduct) {
          for (let i = messages.length - 2; i >= 0; i--) {
            const msg = messages[i];
            if (msg.role === "assistant" && msg.content) {
              if (msg.content.includes("XL Big Green Egg")) {
                recommendedProduct = "XL Big Green Egg";
                break;
              } else if (msg.content.includes("2XL Big Green Egg")) {
                recommendedProduct = "2XL Big Green Egg";
                break;
              } else if (msg.content.includes("Large Big Green Egg")) {
                recommendedProduct = "Large Big Green Egg";
                break;
              } else if (msg.content.includes("Medium Big Green Egg")) {
                recommendedProduct = "Medium Big Green Egg";
                break;
              } else if (msg.content.includes("Small Big Green Egg")) {
                recommendedProduct = "Small Big Green Egg";
                break;
              } else if (msg.content.includes("MiniMax Big Green Egg")) {
                recommendedProduct = "MiniMax Big Green Egg";
                break;
              } else if (msg.content.includes("Mini Big Green Egg")) {
                recommendedProduct = "Mini Big Green Egg";
                break;
              }
            }
          }
        }

        // Also check for accessories in conversation history if not already found
        if (!recommendedAccessories) {
          for (let i = messages.length - 10; i < messages.length; i++) {
            if (i >= 0 && messages[i] && messages[i].content) {
              const content = messages[i].content.toLowerCase();
              if (
                content.includes("eggspander kit") ||
                content.includes("fire bowl") ||
                content.includes("egg genius") ||
                content.includes("temperature controller") ||
                content.includes("acacia hardwood table") ||
                content.includes("pizza & baking stone") ||
                content.includes("pizza stone")
              ) {
                recommendedAccessories = true;
                break;
              }
            }
          }
        }

        if (recommendedProduct) {
          if (recommendedAccessories) {
            productMessage =
              `Great choice! You can purchase the ${recommendedProduct} with all the recommended accessories through our website or at an authorized dealer.\n\n` +
              "**Complete Package Purchase Options:**\n" +
              "1. Visit our [official Big Green Egg website](https://biggreenegg.com/collections/all-eggs-egg-packages) to browse all EGG packages.\n" +
              "2. For the XL EGG with accessories, check out the [XL Big Green Egg Package](https://biggreenegg.com/collections/all-eggs-egg-packages/products/xl-big-green-egg-in-a-corner-modular-package).\n\n" +
              "**Recommended Accessories for Your Package:**\n" +
              "• 5-Piece EGGspander Kit ($349.99)\n" +
              "• Stainless Steel Fire Bowl ($84.99)\n" +
              "• EGG Genius Temperature Controller ($249.99)\n" +
              "• Acacia Hardwood Table\n" +
              "• Pizza & Baking Stone ($69.99)\n\n" +
              "**Find a Dealer Near You:**\n" +
              "Big Green Egg products are sold through authorized dealers who can help you create a custom package with all these accessories. You can [find your nearest dealer here](https://biggreenegg.com/pages/international-dealers).\n\n" +
              "Would you like me to help you with anything else about your purchase?";
          } else {
            productMessage =
              `Great choice! You can purchase the ${recommendedProduct} through our website or at an authorized dealer.\n\n` +
              "**Online Purchase Options:**\n" +
              "1. Visit our [official Big Green Egg website](https://biggreenegg.com/collections/all-eggs-egg-packages) to browse all EGG sizes and packages.\n" +
              "2. For the complete package with accessories you're interested in, check out our [EGG packages](https://biggreenegg.com/collections/all-eggs-egg-packages).\n\n" +
              "**Find a Dealer Near You:**\n" +
              "Big Green Egg products are sold through authorized dealers. You can [find your nearest dealer here](https://biggreenegg.com/pages/international-dealers).\n\n" +
              "Would you like me to help you with anything else about your purchase?";
          }

          isProductInquiry = true;
        }
        // Temperature controllers
        else if (
          lowerMessage.includes("temperature") ||
          lowerMessage.includes("controller") ||
          lowerMessage.includes("monitor") ||
          lowerMessage.includes("remote") ||
          lowerMessage.includes("egg genius")
        ) {
          productMessage =
            "Take control of your cooking with our [EGG Genius Temperature Controller](https://biggreenegg.com/collections/temperature-control/products/egg-genius-temperature-controller) for $249.99. Monitor and adjust your EGG's temperature remotely for perfect results every time. It connects to your smartphone so you can monitor and control your cook from anywhere!";
          isProductInquiry = true;
        }
        // EGGspander systems
        else if (
          lowerMessage.includes("eggspander") ||
          lowerMessage.includes("multi level") ||
          lowerMessage.includes("multilevel") ||
          lowerMessage.includes("multiple dishes") ||
          lowerMessage.includes("cooking levels")
        ) {
          productMessage =
            "Expand your cooking possibilities with our [5-Piece EGGspander Kit for XL](https://biggreenegg.com/collections/eggspander-system/products/5-piece-eggspander-kit-for-xl) for $349.99. This versatile system allows you to cook multiple dishes at different temperatures simultaneously, perfect for preparing complete meals on your EGG!";
          isProductInquiry = true;
        }
        // Fire bowls
        else if (
          lowerMessage.includes("fire bowl") ||
          lowerMessage.includes("firebowl") ||
          lowerMessage.includes("stainless bowl")
        ) {
          productMessage =
            "Upgrade your EGG with our [Stainless Steel Fire Bowl](https://biggreenegg.com/collections/ceramics-grids/products/stainless-steel-fire-bowl) starting from $84.99. This durable stainless steel bowl improves airflow and makes cleanup easier, extending the life of your ceramic fire box.";
          isProductInquiry = true;
        }
        // Grids
        else if (
          lowerMessage.includes("grid") ||
          lowerMessage.includes("grate") ||
          lowerMessage.includes("cooking surface") ||
          lowerMessage.includes("half grid")
        ) {
          if (lowerMessage.includes("half")) {
            productMessage =
              "Our [Stainless Steel Half Grid](https://biggreenegg.com/collections/ceramics-grids/products/stainless-steel-half-grid) starting from $32.99 gives you more flexibility in your cooking setup. Perfect for creating different temperature zones or when cooking smaller portions!";
          } else {
            productMessage =
              "Enhance your grilling surface with our [Stainless Steel Grid](https://biggreenegg.com/collections/ceramics-grids/products/stainless-steel-grid) starting from $41.99. These durable stainless steel grids provide excellent heat retention and are built to last!";
          }
          isProductInquiry = true;
        }
        // Smoking chips
        else if (
          lowerMessage.includes("smoking chip") ||
          lowerMessage.includes("wood chip") ||
          lowerMessage.includes("whiskey barrel") ||
          lowerMessage.includes("smoke flavor")
        ) {
          productMessage =
            "Add delicious smoky flavor with our [Premium Whiskey Barrel Smoking Chips](https://biggreenegg.com/collections/charcoal-wood-starters/products/premium-whiskey-barrel-smoking-chips-2-9-l-180-cu-in) for $14.99. These chips are made from genuine whiskey barrels and impart a unique, rich flavor to your smoked foods!";
          isProductInquiry = true;
        }
        // Pizza accessories
        else if (
          lowerMessage.includes("pizza") ||
          lowerMessage.includes("pizza stone") ||
          lowerMessage.includes("pizza oven") ||
          lowerMessage.includes("pizza wedge")
        ) {
          productMessage =
            "Make restaurant-quality pizza with our [Pizza Oven Wedge for Large EGG](https://biggreenegg.com/collections/pizza/products/pizza-oven-wedge-for-large-egg) for $119.99. This specialized accessory creates the perfect environment for cooking pizzas with crispy crusts and perfectly melted toppings. Check out our full [Pizza Accessories Collection](https://biggreenegg.com/collections/pizza) for everything you need to make amazing pizzas at home!";
          isProductInquiry = true;
        }
        // Knives
        else if (
          lowerMessage.includes("knife") ||
          lowerMessage.includes("knives") ||
          lowerMessage.includes("cut") ||
          lowerMessage.includes("slice") ||
          lowerMessage.includes("brisket knife")
        ) {
          productMessage =
            'Yes, we offer high-quality knives like our [Brisket Knife 12" Stainless Steel](https://biggreenegg.com/products/brisket-knife-12-stainless-steel) for $29.99. This premium knife features a Granton edge that creates small air pockets between the blade and the food, making it perfect for slicing through your smoked meats with precision.\n\n' +
            "You can also browse our full selection of [Cookware & Tools](https://biggreenegg.com/collections/cookware-tools) for more cutting and serving options.";
          isProductInquiry = true;
        }
        // Tables and covers combined request
        else if (
          lowerMessage.includes("table") &&
          lowerMessage.includes("cover") &&
          lowerMessage.includes("egg")
        ) {
          productMessage =
            "For your Large EGG table, I recommend our [Acacia Hardwood Table for Large EGG](https://biggreenegg.com/collections/all-modular-system-tables-stands/products/table-solid-acacia-hardwood-for-large-egg). It's a beautiful, durable option that provides ample workspace.\n\n" +
            "And to protect your investment, you'll want our [Premium Cover for Acacia Table with Large EGG](https://biggreenegg.com/collections/covers-cleaning/products/cover-e-fits-acacia-table-for-l). This cover is specifically designed to fit the Acacia table with a Large EGG installed.\n\n" +
            "You can also browse our full selection of [Tables & Stands](https://biggreenegg.com/collections/all-modular-system-tables-stands) and [Covers](https://biggreenegg.com/collections/covers-cleaning) if you'd like to see other options.";
          isProductInquiry = true;
        }
        // Tables and stands
        else if (
          lowerMessage.includes("table") ||
          lowerMessage.includes("stand") ||
          lowerMessage.includes("nest") ||
          lowerMessage.includes("modular") ||
          lowerMessage.includes("handler") ||
          (lowerMessage.includes("egg") && lowerMessage.includes("setup"))
        ) {
          if (lowerMessage.includes("large") && lowerMessage.includes("egg")) {
            productMessage =
              "For your Large EGG, I recommend our [Acacia Hardwood Table for Large EGG](https://biggreenegg.com/collections/all-modular-system-tables-stands/products/table-solid-acacia-hardwood-for-large-egg). It's a beautiful, durable option that provides ample workspace.\n\n" +
              "You can also browse our full selection of [Modular Systems, Tables & Stands](https://biggreenegg.com/collections/all-modular-system-tables-stands) to find the perfect setup for your EGG. From portable nests to complete modular systems, we have options for every space!";
          } else {
            productMessage =
              "Browse our selection of [Modular Systems, Tables & Stands](https://biggreenegg.com/collections/all-modular-system-tables-stands) to find the perfect setup for your EGG. From portable nests to complete modular systems, we have options for every space!";
          }
          isProductInquiry = true;
        }
        // Covers and cleaning
        else if (
          lowerMessage.includes("cover") ||
          lowerMessage.includes("cleaning") ||
          lowerMessage.includes("clean") ||
          lowerMessage.includes("maintenance")
        ) {
          if (
            lowerMessage.includes("large") &&
            lowerMessage.includes("table")
          ) {
            productMessage =
              "For your Large EGG with table, I recommend our [Premium Cover for Acacia Table with Large EGG](https://biggreenegg.com/collections/covers-cleaning/products/cover-e-fits-acacia-table-for-l). This cover is specifically designed to fit the Acacia table with a Large EGG installed.\n\n" +
              "You can also browse our full selection of [Covers & Cleaning](https://biggreenegg.com/collections/covers-cleaning) products to protect your investment!";
          } else {
            productMessage =
              "Keep your EGG in top condition with our [Covers & Cleaning](https://biggreenegg.com/collections/covers-cleaning) products. Protect your investment!";
          }
          isProductInquiry = true;
        }
        // General product browsing
        else if (
          (lowerMessage.includes("product") ||
            lowerMessage.includes("browse") ||
            lowerMessage === "i want to browse your products") &&
          !lowerMessage.includes("hat") &&
          !lowerMessage.includes("grill") &&
          !lowerMessage.includes("egg") &&
          !lowerMessage.includes("accessory") &&
          !lowerMessage.includes("tool") &&
          !lowerMessage.includes("pizza") &&
          !lowerMessage.includes("apparel") &&
          !lowerMessage.includes("charcoal") &&
          !lowerMessage.includes("rub") &&
          !lowerMessage.includes("sauce") &&
          !lowerMessage.includes("cover") &&
          !lowerMessage.includes("part") &&
          !lowerMessage.includes("table") &&
          !lowerMessage.includes("stand") &&
          !lowerMessage.includes("nest") &&
          !lowerMessage.includes("modular")
        ) {
          productMessage =
            "You can browse all our products on the [Big Green Egg website](https://biggreenegg.com/collections). Here are some popular categories:\n\n" +
            "• [EGGs by Size](https://biggreenegg.com/collections/all-eggs-egg-packages)\n" +
            "• [Modular Systems, Tables & Stands](https://biggreenegg.com/collections/all-modular-system-tables-stands)\n" +
            "• [Accessories](https://biggreenegg.com/collections/accessories)\n" +
            "• [Cookware & Tools](https://biggreenegg.com/collections/cookware-tools)\n" +
            "• [Lifestyle & Gear](https://biggreenegg.com/collections/all-lifestyle-gear-1)\n" +
            "• [Spices & Sauces](https://biggreenegg.com/collections/spices-sauces)\n" +
            "• [Covers & Cleaning](https://biggreenegg.com/collections/covers-cleaning)\n" +
            "• [Charcoal, Woods & Starters](https://biggreenegg.com/collections/charcoal-wood-starters)\n\n" +
            "Let me know if you're looking for something specific!";
          isProductInquiry = true;
        }
        // Hats
        else if (
          lowerMessage.includes("hat") ||
          lowerMessage.includes("cap") ||
          lowerMessage.includes("beanie") ||
          lowerMessage.includes("trucker")
        ) {
          productMessage =
            "You can browse our hat collection at [Big Green Egg Hats](https://biggreenegg.com/collections/hats). We have various styles including trucker hats, beanies, and caps to show your BGE pride!";
          isProductInquiry = true;
        }
        // Grills/Eggs
        else if (
          (lowerMessage.includes("grill") || lowerMessage.includes("egg")) &&
          !lowerMessage.includes("accessory") &&
          !lowerMessage.includes("tool")
        ) {
          productMessage =
            "You can explore our range of EGGs at [Big Green Egg Grills](https://biggreenegg.com/collections/all-eggs-egg-packages). From Mini to 2XL, we have the perfect size for your cooking needs!";
          isProductInquiry = true;
        }
        // Accessories (general)
        else if (
          lowerMessage.includes("accessory") ||
          lowerMessage.includes("accessories")
        ) {
          productMessage =
            "Check out our accessories at [Big Green Egg Accessories](https://biggreenegg.com/collections/accessories). We have everything you need to enhance your cooking experience!";
          isProductInquiry = true;
        }
        // Cooking tools
        else if (
          lowerMessage.includes("tool") ||
          lowerMessage.includes("utensil") ||
          lowerMessage.includes("spatula") ||
          lowerMessage.includes("tong")
        ) {
          productMessage =
            "Browse our cooking tools at [Big Green Egg Cookware & Tools](https://biggreenegg.com/collections/cookware-tools). Find the perfect tools to elevate your grilling game, including our popular [Brisket Knife](https://biggreenegg.com/products/brisket-knife-12-stainless-steel) for precision cutting!";
          isProductInquiry = true;
        }
        // Apparel
        else if (
          lowerMessage.includes("apparel") ||
          lowerMessage.includes("clothing") ||
          lowerMessage.includes("shirt") ||
          lowerMessage.includes("hoodie") ||
          lowerMessage.includes("wear") ||
          lowerMessage.includes("merch") ||
          lowerMessage.includes("merchandise")
        ) {
          productMessage =
            "Show your BGE pride with our apparel and lifestyle collection at [Big Green Egg Lifestyle & Gear](https://biggreenegg.com/collections/all-lifestyle-gear-1). Find comfortable, stylish clothing and accessories for every season!";
          isProductInquiry = true;
        }
        // Charcoal and starters
        else if (
          lowerMessage.includes("charcoal") ||
          lowerMessage.includes("starter") ||
          lowerMessage.includes("fuel") ||
          lowerMessage.includes("wood")
        ) {
          productMessage =
            "Get your cook started right with our [Charcoal, Woods & Starters](https://biggreenegg.com/collections/charcoal-wood-starters). Premium quality for the best flavor!";
          isProductInquiry = true;
        }
        // Rubs and sauces
        else if (
          lowerMessage.includes("rub") ||
          lowerMessage.includes("sauce") ||
          lowerMessage.includes("seasoning") ||
          lowerMessage.includes("spice")
        ) {
          productMessage =
            "Enhance your food's flavor with our [Spices & Sauces](https://biggreenegg.com/collections/spices-sauces). The perfect complement to your BGE cooking!";
          isProductInquiry = true;
        }
        // Replacement parts
        else if (
          lowerMessage.includes("replacement") ||
          lowerMessage.includes("part") ||
          lowerMessage.includes("parts") ||
          lowerMessage.includes("fix") ||
          lowerMessage.includes("repair")
        ) {
          productMessage =
            "Need a replacement part? Find what you need at [Replacement Parts](https://biggreenegg.com/collections/replacement-parts). Keep your EGG performing at its best!";
          isProductInquiry = true;
        }
      }

      if (isProductInquiry) {
        return NextResponse.json({
          messages: [createMessage("assistant", productMessage)],
          category: "merchandise",
        });
      }
    }

    // If no order number or email is found, proceed with OpenAI
    if (!OPENAI_API_KEY) {
      console.warn("No OpenAI API key provided. Using mock response.");
      return NextResponse.json({
        messages: [
          createMessage(
            "assistant",
            "This is a mock response. Please add your OpenAI API key to enable the AI chatbot."
          ),
        ],
      });
    }

    // Prepare messages for OpenAI
    const systemMessage = createMessage("system", defaultSystemPrompt);
    const apiMessages = [
      { role: systemMessage.role as "system", content: systemMessage.content },
      ...messages.map((msg: Message) => ({
        role: msg.role as "user" | "assistant" | "system",
        content: msg.content,
      })),
    ];

    // Call OpenAI API
    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: apiMessages,
      temperature: 0.7,
      max_tokens: 500,
    });

    const assistantMessage =
      response.choices[0]?.message?.content ||
      "Sorry, I could not generate a response.";

    return NextResponse.json({
      messages: [createMessage("assistant", assistantMessage)],
    });
  } catch (error: unknown) {
    console.error("Error in chat API:", error);

    // Handle specific OpenAI API errors
    if (isOpenAIError(error)) {
      if (error.status === 429 || error.code === "insufficient_quota") {
        return NextResponse.json({
          messages: [
            createMessage(
              "assistant",
              "The AI service is temporarily unavailable. Please try again later."
            ),
          ],
        });
      }
    }

    return NextResponse.json({
      messages: [
        createMessage(
          "assistant",
          "Failed to process chat request. Please try again."
        ),
      ],
    });
  }
}

// Helper function to check if a message is asking for product recommendations
function isProductRecommendation(message: string): boolean {
  const lowerMessage = message.toLowerCase();

  // Check for product recommendation keywords
  return (
    lowerMessage.includes("recommend") ||
    lowerMessage.includes("suggest") ||
    lowerMessage.includes("which product") ||
    lowerMessage.includes("what product") ||
    lowerMessage.includes("best product") ||
    lowerMessage.includes("looking for") ||
    lowerMessage.includes("interested in") ||
    lowerMessage.includes("buy") ||
    lowerMessage.includes("purchase") ||
    lowerMessage.includes("shopping") ||
    lowerMessage.includes("accessories") ||
    lowerMessage.includes("accessory") ||
    lowerMessage.includes("which size") ||
    lowerMessage.includes("what size") ||
    lowerMessage.includes("compare") ||
    lowerMessage.includes("difference between") ||
    // Check for guided product selection queries
    lowerMessage.includes("help me choose") ||
    lowerMessage.includes("help me find") ||
    // Check for specific product categories
    lowerMessage.includes("pizza stone") ||
    lowerMessage.includes("temperature controller") ||
    lowerMessage.includes("eggspander") ||
    lowerMessage.includes("table") ||
    lowerMessage.includes("stand") ||
    lowerMessage.includes("cover") ||
    lowerMessage.includes("grid") ||
    lowerMessage.includes("smoking chips") ||
    lowerMessage.includes("knife") ||
    // Check for bundle queries
    lowerMessage.includes("bundle") ||
    lowerMessage.includes("package") ||
    lowerMessage.includes("starter kit") ||
    lowerMessage.includes("best value") ||
    lowerMessage.includes("discount") ||
    lowerMessage.includes("deal")
  );
}

// Helper function to check if a message is asking for guided product selection
function isGuidedSelectionQuery(message: string): boolean {
  const lowerMessage = message.toLowerCase();

  return (
    lowerMessage.includes("help me choose") ||
    lowerMessage.includes("help me find") ||
    lowerMessage.includes("not sure which") ||
    lowerMessage.includes("which one should i") ||
    lowerMessage.includes("what do you recommend") ||
    lowerMessage.includes("what would you recommend") ||
    lowerMessage.includes("what should i get") ||
    lowerMessage.includes("what should i buy") ||
    lowerMessage.includes("need advice") ||
    lowerMessage.includes("need help choosing") ||
    lowerMessage.includes("guide me") ||
    (lowerMessage.includes("new") && lowerMessage.includes("big green egg"))
  );
}
