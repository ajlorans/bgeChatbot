import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import { createMessage, defaultSystemPrompt } from "@/lib/utils";
import { Message } from "@/lib/types";
import {
  generateProductRecommendationMessage,
  generateBundleRecommendationMessage,
  generateEggSizeRecommendationMessage,
  generateGuidedSelectionMessage,
  getProductRecommendations,
  getProductBundles,
  recommendEggSize,
  isProductSelectionQuery,
  eggSizeRecommendations,
  recommendEggCover,
  generateEggCoverRecommendationMessage,
  isEggCoverQuery,
  products,
  parseEggSize,
} from "@/lib/productRecommendations";
import { handleRecipeRequest } from "@/lib/recipeHandler";
import { getAllowedOrigins, corsConfig } from "@/config/cors";
import { searchFAQs, generateFAQResponse } from "@/lib/faqData";
import { searchProducts, generateProductResponse } from "@/lib/productDatabase";
import { v4 as uuidv4 } from "uuid";

// Add to top after imports
// Disable ALL logging
const originalConsoleLog = console.log;
const originalConsoleError = console.error;
console.log = () => {};
console.error = () => {};

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

// CORS middleware for the chat API
export async function OPTIONS(req: NextRequest) {
  const origin = req.headers.get("origin") || "";

  return new NextResponse(null, {
    status: 200,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
      "Access-Control-Allow-Headers":
        "Content-Type, Authorization, X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Date, X-Api-Version",
      "Access-Control-Max-Age": "86400",
    },
  });
}

export async function POST(req: NextRequest) {
  // Add CORS headers to the response
  const origin = req.headers.get("origin") || "";

  try {
    const body = await req.json();

    // Get messages from request body
    const messages = Array.isArray(body.messages) ? body.messages : [];
    if (messages.length === 0) {
      throw new Error("No messages provided");
    }

    // Make sure we declare lowerMessage only once
    const lastMessage = messages[messages.length - 1];
    const lowerMessage = lastMessage.content.toLowerCase();

    // For debugging
    console.log("Received message:", lastMessage.content);
    console.log("Total messages in conversation:", messages.length);

    // EARLY ACCESSORY DETECTION - Check if the user is asking about a specific accessory
    // This needs to happen BEFORE any other flows to prevent triggering the egg recommendation
    if (
      (lowerMessage.includes("brisket knife") ||
        lowerMessage.includes("knife") ||
        lowerMessage.includes("eggspander") ||
        lowerMessage.includes("fire bowl") ||
        lowerMessage.includes("genius") ||
        lowerMessage.includes("controller") ||
        lowerMessage.includes("pizza stone") ||
        lowerMessage.includes("baking stone") ||
        lowerMessage.includes("grid") ||
        lowerMessage.includes("table") ||
        lowerMessage.includes("acacia") ||
        lowerMessage.includes("conveggtor") ||
        lowerMessage.includes("plate setter") ||
        lowerMessage.includes("carrier") ||
        lowerMessage.includes("whiskey") ||
        lowerMessage.includes("smoking chips") ||
        lowerMessage.includes("wedge") ||
        lowerMessage.includes("cover")) &&
      (lowerMessage.includes("info") ||
        lowerMessage.includes("tell me about") ||
        lowerMessage.includes("more about") ||
        lowerMessage.includes("what is") ||
        lowerMessage.includes("how does") ||
        lowerMessage.includes("tell me more") ||
        lowerMessage.startsWith("about") ||
        lowerMessage.length < 30)
    ) {
      console.log("Early detection: accessory info request:", lowerMessage);

      // Determine which accessory they're asking about
      let accessoryInfo = "";

      if (
        lowerMessage.includes("eggspander") ||
        lowerMessage.includes("expander") ||
        lowerMessage.includes("5-piece") ||
        lowerMessage.includes("5 piece")
      ) {
        accessoryInfo =
          "# 5-Piece EGGspander Kit\n\n" +
          "The EGGspander Kit is one of our most versatile accessories, dramatically increasing your cooking options:\n\n" +
          "- **Multi-Level Cooking**: Cook different foods at different temperatures simultaneously\n" +
          "- **Increased Capacity**: Nearly doubles your cooking surface area\n" +
          "- **Indirect Cooking**: Perfect for slow cooking, smoking, and baking\n" +
          "- **Direct High-Heat Cooking**: Get those perfect sear marks on steaks\n\n" +
          "The kit includes a multi-level rack, 2 half-moon stainless steel cooking grids, a stainless steel mesh basket, and a 5-in-1 multi-tool for easy handling.\n\n" +
          "It's compatible with the ConvEGGtor for even more cooking options. This is truly the ultimate accessory to maximize your EGG's versatility!\n\n" +
          "[View the 5-Piece EGGspander Kit](https://biggreenegg.com/product-category/eggspander-system/)";
      } else if (
        lowerMessage.includes("fire bowl") ||
        lowerMessage.includes("stainless steel bowl")
      ) {
        accessoryInfo =
          "# Stainless Steel Fire Bowl\n\n" +
          "The Stainless Steel Fire Bowl is an excellent upgrade for your EGG:\n\n" +
          "- **Enhanced Airflow**: Improves air circulation for more efficient burning and temperature control\n" +
          "- **Easy Cleaning**: Simply lift it out to remove ash, much easier than cleaning the ceramic fire box\n" +
          "- **Extended Lifespan**: Reduces stress on your ceramic components, extending their life\n" +
          "- **Premium Construction**: Made from heavy-duty stainless steel that withstands high temperatures\n\n" +
          "This is one of our most popular accessories because it makes maintenance so much easier while improving performance. Many EGG owners consider this an essential upgrade!\n\n" +
          "[View the Stainless Steel Fire Bowl](https://biggreenegg.com/product-category/ceramic-stainless-grids-heat-diffusers/)";
      } else if (
        lowerMessage.includes("genius") ||
        lowerMessage.includes("temperature controller") ||
        lowerMessage.includes("temp controller")
      ) {
        accessoryInfo =
          "# EGG Genius Temperature Controller\n\n" +
          "The EGG Genius is your ultimate cooking partner for perfect results every time:\n\n" +
          "- **Smart Monitoring**: Track your cook from anywhere using the EGG Genius app on your phone\n" +
          "- **Precision Control**: Automatically maintains your target temperature within a few degrees\n" +
          "- **Multiple Probes**: Monitor both ambient EGG temperature and food temperature simultaneously\n" +
          "- **Perfect for Long Cooks**: Set it and forget it - ideal for overnight briskets or long smoking sessions\n" +
          "- **Alerts & Notifications**: Get notified when your food reaches target temperature\n\n" +
          "Works with Wi-Fi and includes cloud connectivity, making it perfect for those who want the convenience of remote monitoring and precise temperature control.\n\n" +
          "[View the EGG Genius Temperature Controller](https://biggreenegg.com/product-category/temperature-control/)";
      } else if (
        lowerMessage.includes("pizza stone") ||
        lowerMessage.includes("baking stone")
      ) {
        accessoryInfo =
          "# Pizza & Baking Stone\n\n" +
          "The Pizza & Baking Stone is essential for perfect pizzas and baked goods:\n\n" +
          "- **Perfect Crust**: Absorbs moisture for perfectly crispy pizza crusts\n" +
          "- **Even Heat Distribution**: Eliminates hot spots for consistent cooking\n" +
          "- **Versatile**: Great for pizzas, breads, cookies and more\n" +
          "- **Thermal Stability**: Withstands extreme temperature changes\n\n" +
          "Made from cordierite ceramic, our baking stone retains heat extremely well. For best results, preheat it for at least 30 minutes before cooking your pizza. Use with a pizza peel for easy handling.\n\n" +
          "[View the Pizza & Baking Stone](https://biggreenegg.com/product-category/pizza-tools-accessories/)";
      } else if (
        lowerMessage.includes("brisket knife") ||
        lowerMessage.includes("knife")
      ) {
        accessoryInfo =
          '# Brisket Knife 12" Stainless Steel\n\n' +
          "Our premium Brisket Knife is designed specifically for perfect slices of barbecue:\n\n" +
          "- **Long 12-inch Blade**: Allows for full slices across large cuts of meat in a single stroke\n" +
          "- **Granton Edge**: The scalloped indentations create air pockets that prevent meat from sticking to the blade\n" +
          "- **Ergonomic Handle**: Comfortable grip for precision cutting\n" +
          "- **Premium Steel**: High-carbon stainless steel holds its edge and resists corrosion\n\n" +
          "This knife is perfect for slicing brisket, turkey, ham, and other large cuts of meat with clean, precise cuts that help preserve juices and presentation. A must-have tool for any serious barbecue enthusiast!\n\n" +
          "[View the Brisket Knife](https://biggreenegg.com/product-category/cookware-tools/)";
      } else if (
        lowerMessage.includes("stainless steel grid") ||
        lowerMessage.includes("grid")
      ) {
        accessoryInfo =
          "# Stainless Steel Grid\n\n" +
          "The Stainless Steel Grid is a durable, high-performance cooking surface for your EGG:\n\n" +
          "- **Superior Heat Retention**: Stainless steel holds heat for consistent cooking temperatures\n" +
          "- **Perfect Grill Marks**: Optimized spacing for those perfect sear marks\n" +
          "- **Easy Cleaning**: More durable and easier to clean than standard grids\n" +
          "- **Long-lasting**: Resists corrosion and withstands high temperatures\n\n" +
          "This grid is a direct replacement for your original grid and offers improved performance. It's a simple upgrade that enhances your cooking experience and lasts for years.\n\n" +
          "[View the Stainless Steel Grid](https://biggreenegg.com/product-category/ceramic-stainless-grids-heat-diffusers/)";
      } else if (
        lowerMessage.includes("whiskey") ||
        lowerMessage.includes("smoking chips") ||
        lowerMessage.includes("wood chips")
      ) {
        accessoryInfo =
          "# Premium Whiskey Barrel Smoking Chips\n\n" +
          "Our unique Whiskey Barrel Smoking Chips add an extraordinary flavor dimension to your cooking:\n\n" +
          "- **Unique Flavor Profile**: Combines oak wood with whiskey notes for a distinctive taste\n" +
          "- **Authentic Source**: Made from genuine aged whiskey barrels\n" +
          "- **Versatile Use**: Perfect for beef, pork, poultry, and even some desserts\n" +
          "- **Premium Quality**: Kiln-dried to the perfect moisture content for optimal smoke\n\n" +
          "To use: Soak chips in water for about 30 minutes, then sprinkle a handful directly on hot coals just before cooking. These chips produce a moderate smoke that adds complex flavor without overpowering your food.\n\n" +
          "[View the Premium Whiskey Barrel Smoking Chips](https://biggreenegg.com/product-category/charcoal-wood-starters/)";
      } else if (
        lowerMessage.includes("table") ||
        lowerMessage.includes("acacia")
      ) {
        accessoryInfo =
          "# Acacia Hardwood Table\n\n" +
          "The Acacia Hardwood Table is the perfect home for your Big Green Egg:\n\n" +
          "- **Ample Workspace**: Provides plenty of preparation and serving space\n" +
          "- **Beautiful Design**: Rich, warm acacia wood with a premium finish\n" +
          "- **Weather Resistant**: Acacia wood is naturally resistant to weather and wear\n" +
          "- **Storage Space**: Includes storage shelf underneath for accessories and supplies\n" +
          "- **Custom Fit**: Designed specifically to house your EGG at the perfect height\n\n" +
          "Assembly is required, but the table comes with detailed instructions. For best longevity, we recommend using a cover and occasionally treating the wood with food-safe oil to maintain its beauty.\n\n" +
          "[View the Acacia Hardwood Table](https://biggreenegg.com/product-category/tables-nests-handlers-carts/)";
      } else if (
        lowerMessage.includes("conveggtor") ||
        lowerMessage.includes("plate setter")
      ) {
        accessoryInfo =
          "# ConvEGGtor / Plate Setter\n\n" +
          "The ConvEGGtor is perhaps the most versatile accessory for your EGG:\n\n" +
          "- **Indirect Cooking**: Creates a barrier between food and direct flame\n" +
          "- **Convection Cooking**: Transforms your EGG into a true convection oven\n" +
          "- **Temperature Control**: Ideal for low & slow cooking at precise temperatures\n" +
          "- **Even Heat**: Eliminates hot spots for consistent cooking throughout\n\n" +
          "This ceramic heat deflector is essential for smoking, baking, roasting and any cooking method that requires indirect heat. Use it for smoking brisket, baking pizzas, roasting chicken, and much more.\n\n" +
          "It's easy to use - just place it inside your EGG with the legs facing up before adding your cooking grid.\n\n" +
          "[View the ConvEGGtor](https://biggreenegg.com/product-category/conveggtors-plate-setters/)";
      } else if (
        lowerMessage.includes("carrier") ||
        lowerMessage.includes("egg carrier")
      ) {
        accessoryInfo =
          "# MiniMax EGG Carrier\n\n" +
          "The MiniMax EGG Carrier makes your portable EGG even more convenient:\n\n" +
          "- **Enhanced Portability**: Built-in handles for easy transportation\n" +
          "- **Sturdy Design**: Durable construction with reinforced bands\n" +
          "- **Perfect for Travel**: Take your EGG camping, tailgating, or to the beach\n" +
          "- **Protective**: Adds an extra layer of protection for your EGG\n\n" +
          "This carrier is specifically designed for the MiniMax EGG, allowing you to safely and easily take your cooking adventures anywhere. The ergonomic handles make carrying comfortable, and the sturdy construction ensures your EGG stays secure.\n\n" +
          "[View the MiniMax EGG Carrier](https://biggreenegg.com/product-category/tables-nests-handlers-carts/)";
      } else if (lowerMessage.includes("cast iron grid")) {
        accessoryInfo =
          "# Cast Iron Grid\n\n" +
          "The Cast Iron Grid elevates your grilling experience with superior heat retention:\n\n" +
          "- **Exceptional Searing**: Creates restaurant-quality sear marks on steaks and chops\n" +
          "- **Superior Heat Retention**: Maintains consistent cooking temperature\n" +
          "- **Even Cooking**: Distributes heat evenly across the cooking surface\n" +
          "- **Durable Construction**: Pre-seasoned cast iron built to last for years\n\n" +
          "The heavy-duty cast iron retains heat even when you're adding cold food to the grill, resulting in better sear marks and more consistent cooking. It's ideal for steaks, burgers, chops, and any foods where you want distinctive grill marks.\n\n" +
          "Care tip: Clean with a grill brush while warm and occasionally re-season with vegetable oil to maintain the non-stick surface and prevent rust.\n\n" +
          "[View the Cast Iron Grid](https://biggreenegg.com/product-category/ceramic-stainless-grids-heat-diffusers/)";
      } else if (lowerMessage.includes("cover")) {
        accessoryInfo =
          "# EGG Cover\n\n" +
          "Protect your investment with our premium EGG Covers:\n\n" +
          "- **Weather Protection**: Shields your EGG from rain, snow, UV rays, and other elements\n" +
          "- **Ventilated Design**: Allows air circulation to prevent moisture buildup\n" +
          "- **Custom Fit**: Designed specifically for your EGG model for a perfect fit\n" +
          "- **Premium Materials**: Made from heavy-duty, weather-resistant fabric\n" +
          "- **Easy to Use**: Simple to put on and remove as needed\n\n" +
          "Our covers are an essential accessory for protecting your EGG and extending its life, particularly if it's stored outdoors. Each cover is tailored to fit specific EGG sizes and configurations.\n\n" +
          "[View our EGG Covers Collection](https://biggreenegg.com/product-category/covers-cleaning/)";
      } else if (
        lowerMessage.includes("pizza oven wedge") ||
        lowerMessage.includes("wedge")
      ) {
        accessoryInfo =
          "# Pizza Oven Wedge\n\n" +
          "The Pizza Oven Wedge turns your EGG into a high-performance pizza oven:\n\n" +
          "- **Perfect Pizza Environment**: Creates ideal cooking conditions for professional-quality pizzas\n" +
          "- **Enhanced Heat Flow**: The wedge shape directs heat for faster, more even cooking\n" +
          "- **Higher Cooking Temperature**: Achieves and maintains the high temps needed for perfect pizza\n" +
          "- **Easy to Use**: Simply place inside your EGG with a baking stone\n\n" +
          "This specialty accessory works by reflecting heat from the dome down onto the top of your pizza, giving you that perfect balance of crispy crust and beautifully melted toppings. It mimics the environment of a professional brick pizza oven.\n\n" +
          "For best results, use with a Pizza & Baking Stone and preheat your EGG to 600-700°F before cooking.\n\n" +
          "[View the Pizza Oven Wedge](https://biggreenegg.com/product-category/pizza-tools-accessories/)";
      } else {
        // Generic response for other accessories
        accessoryInfo =
          "I'd be happy to tell you more about that accessory. Would you like information about a specific feature, or would you prefer to see more accessories that complement your cooking style?";
      }

      // Return the specific accessory information
      return NextResponse.json({
        messages: [createMessage("assistant", accessoryInfo)],
        category: "product",
      });
    }

    // SPECIAL CASE: Direct handler for cooking capacity queries
    // Check this before any other processing to ensure it works reliably
    const cookText = lastMessage.content.toLowerCase();
    if (cookText.includes("cook for") || cookText.includes("cooking for")) {
      // Extract number of people using a simple regex
      const peopleMatch = cookText.match(/(\d+)\s*people/i);
      if (peopleMatch && peopleMatch[1]) {
        const peopleCount = parseInt(peopleMatch[1], 10);
        console.log(`DIRECT MATCH: Cooking for ${peopleCount} people`);

        // Determine egg size based on number of people
        let size, eggName, eggDescription;

        if (peopleCount >= 15) {
          size = "2XL";
          eggName = "2XL Big Green Egg";
          eggDescription =
            "The 2XL Big Green Egg is our largest size, perfect for commercial settings, restaurants, or cooking for very large gatherings. It can cook up to 20 steaks at once and provides ample space for multiple dishes.";
        } else if (peopleCount >= 8) {
          size = "XL";
          eggName = "XL Big Green Egg";
          eggDescription =
            "The XL Big Green Egg is ideal for larger families and those who entertain frequently. It can cook two 20-pound turkeys at once and is perfect for feeding 8-15 people.";
        } else if (peopleCount >= 4) {
          size = "Large";
          eggName = "Large Big Green Egg";
          eggDescription =
            "The Large Big Green Egg is our most popular size, perfect for most families. It offers versatility for cooking everything from appetizers to entrees for 4-8 people.";
        } else if (peopleCount >= 2) {
          size = "Medium";
          eggName = "Medium Big Green Egg";
          eggDescription =
            "The Medium Big Green Egg is perfect for smaller families (2-4 people) or limited spaces. It still provides plenty of cooking area while taking up less room.";
        } else {
          size = "Small";
          eggName = "Small Big Green Egg";
          eggDescription =
            "The Small Big Green Egg is great for individuals, couples, or small spaces like balconies and small patios.";
        }

        const response = `Based on your needs cooking for ${peopleCount} people, I recommend the **[${eggName}](https://biggreenegg.com/collections/all-eggs-egg-packages)**.\n\n${eggDescription}\n\nWould you like to see some accessories that work well with this size?`;

        return NextResponse.json({
          messages: [createMessage("assistant", response)],
          category: "product_recommendation",
        });
      }
    }

    // Initialize OpenAI client
    const openai = new OpenAI({
      apiKey: OPENAI_API_KEY,
    });

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

          // Check if the response status is ok before attempting to parse JSON
          if (!response.ok) {
            console.error(
              `Shopify API error: ${response.status} ${response.statusText}`
            );

            let errorMessage =
              "I apologize, but I encountered an issue while checking your order status. ";

            if (response.status === 403) {
              errorMessage +=
                "There seems to be an authorization issue. Please try again later or contact customer service.";
            } else {
              errorMessage +=
                "Please try again later or contact our customer service for assistance.";
            }

            return NextResponse.json({
              messages: [createMessage("assistant", errorMessage)],
            });
          }

          // Safely handle JSON parsing
          let data;
          try {
            const responseText = await response.text();
            if (!responseText || responseText.trim() === "") {
              throw new Error("Empty response from server");
            }
            data = JSON.parse(responseText);
          } catch (parseError) {
            console.error("Error parsing JSON response:", parseError);
            return NextResponse.json({
              messages: [
                createMessage(
                  "assistant",
                  "I apologize, but I encountered an issue while processing your order information. Please try again later or contact our customer service for assistance."
                ),
              ],
            });
          }

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
  <div class="order-header">
    <h3>Order Details</h3>
    <div class="order-badge ${order.fulfillment_status}">${
            order.fulfillment_status
          }</div>
  </div>
  
  <div class="order-grid">
    <div class="order-column">
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
        <span class="label">Payment Status:</span>
        <span class="value payment-${order.financial_status}">${
            order.financial_status
          }</span>
      </div>
    </div>
    
    <div class="order-column">
      <div class="status-item">
        <span class="label">Total Price:</span>
        <span class="value price">${order.total_price}</span>
      </div>
      
      ${
        order.tracking_number
          ? `
        <div class="status-item">
          <span class="label">Tracking:</span>
          <div class="tracking-container">
            <a href="${order.tracking_url}" target="_blank" class="tracking-link">${order.tracking_number}</a>
          </div>
        </div>
      `
          : ""
      }
      
      ${
        order.estimated_delivery
          ? `
        <div class="status-item">
          <span class="label">Estimated Delivery:</span>
          <span class="value delivery-date">${new Date(
            order.estimated_delivery
          ).toLocaleDateString()}</span>
        </div>
      `
          : ""
      }
    </div>
  </div>
  
  <div class="items-section">
    <h4>Order Items</h4>
    <div class="items-list">
      ${order.line_items
        .map(
          (item) => `
          <div class="item">
            <div class="item-info">
              <span class="item-quantity">${item.quantity}x</span>
              <span class="item-name">${item.name}</span>
            </div>
            <span class="item-price">USD: $${item.price}</span>
          </div>
        `
        )
        .join("")}
    </div>
  </div>
  
  <style>
    .order-details {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      border-radius: 8px;
      overflow: hidden;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
      border: 1px solid #e2e8f0;
    }
    .order-header {
      background-color: #f8f9fa;
      padding: 16px;
      border-bottom: 1px solid #e2e8f0;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .order-header h3 {
      margin: 0;
      color: #1a202c;
      font-size: 18px;
      font-weight: 600;
    }
    .order-badge {
      padding: 4px 10px;
      border-radius: 30px;
      font-size: 12px;
      font-weight: 500;
      text-transform: capitalize;
    }
    .order-badge.fulfilled {
      background-color: #d1fae5;
      color: #065f46;
    }
    .order-badge.partial {
      background-color: #fef3c7;
      color: #92400e;
    }
    .order-badge.unfulfilled {
      background-color: #fee2e2;
      color: #b91c1c;
    }
    .order-grid {
      display: flex;
      flex-wrap: wrap;
      padding: 16px;
      gap: 24px;
      background-color: white;
    }
    .order-column {
      flex: 1;
      min-width: 250px;
    }
    .status-item {
      margin-bottom: 12px;
      display: flex;
      flex-direction: column;
    }
    .label {
      font-size: 12px;
      color: #64748b;
      margin-bottom: 4px;
    }
    .value {
      font-size: 14px;
      color: #1e293b;
      font-weight: 500;
    }
    .value.price {
      color: #0f766e;
      font-weight: 600;
    }
    .payment-paid {
      color: #047857;
    }
    .payment-pending {
      color: #b45309;
    }
    .payment-refunded {
      color: #6b7280;
    }
    .tracking-container {
      margin-top: 2px;
    }
    .tracking-link {
      color: #2563eb;
      text-decoration: none;
      font-size: 14px;
      font-weight: 500;
    }
    .tracking-link:hover {
      text-decoration: underline;
    }
    .delivery-date {
      color: #4b5563;
    }
    .items-section {
      padding: 16px;
      border-top: 1px solid #e2e8f0;
      background-color: white;
    }
    .items-section h4 {
      margin: 0 0 12px 0;
      font-size: 16px;
      color: #1a202c;
    }
    .items-list {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }
    .item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 8px 12px;
      background-color: #f8fafc;
      border-radius: 6px;
    }
    .item-info {
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .item-quantity {
      color: #4b5563;
      font-weight: 600;
      font-size: 14px;
    }
    .item-name {
      color: #1e293b;
      font-size: 14px;
    }
    .item-price {
      color: #0f766e;
      font-weight: 500;
      font-size: 14px;
    }
  </style>
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

    // Check for recipe requests
    // This should come before product recommendations and other features
    const recipeContent = lastMessage.content.toLowerCase().trim();

    // Enhanced recipe detection with more specific patterns
    const isRecipeQuery =
      // Direct requests like "X recipe" or "recipe for X"
      /(\w+\s+)+recipe/.test(recipeContent) ||
      /recipe\s+for\s+(\w+\s+)+/.test(recipeContent) ||
      // "I want" requests
      /i\s+want\s+(?:a|an|the)?\s+(\w+\s+)+recipe/.test(recipeContent) ||
      // Standard keyword checks
      recipeContent.includes("recipe") ||
      recipeContent.includes("how to cook") ||
      recipeContent.includes("how to make") ||
      recipeContent.includes("how do i make") ||
      recipeContent.includes("cooking") ||
      (recipeContent.includes("grill") && recipeContent.includes("on")) ||
      (recipeContent.includes("smoke") && recipeContent.includes("on")) ||
      (recipeContent.includes("bake") && recipeContent.includes("on"));

    if (isRecipeQuery) {
      console.log("Detected recipe request, handling with recipe handler");
      try {
        // Log the detected recipe query to help with debugging
        console.log("Recipe query detected:", lastMessage.content);

        const recipeResponse = await handleRecipeRequest(
          openai,
          lastMessage.content,
          messages
        );
        return NextResponse.json(recipeResponse);
      } catch (error) {
        console.error("Error handling recipe request:", error);
        // If there's an error in recipe handling, continue with the next checks
      }
    }

    // Check for product category inquiries
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

        // If they just say "yes", use the size from the previous recommendation
        if (lowerMessage === "yes" || lowerMessage === "y") {
          // Look back through messages to find the last egg size recommendation
          let recommendedSize = "Large"; // Default to Large
          for (let i = messages.length - 2; i >= 0; i--) {
            const msg = messages[i];
            if (msg.role === "assistant" && msg.content) {
              if (msg.content.includes("2XL Big Green Egg")) {
                recommendedSize = "2XL";
                break;
              } else if (msg.content.includes("XL Big Green Egg")) {
                recommendedSize = "XL";
                break;
              } else if (msg.content.includes("Large Big Green Egg")) {
                recommendedSize = "Large";
                break;
              } else if (msg.content.includes("Medium Big Green Egg")) {
                recommendedSize = "Medium";
                break;
              } else if (msg.content.includes("Small Big Green Egg")) {
                recommendedSize = "Small";
                break;
              } else if (msg.content.includes("MiniMax Big Green Egg")) {
                recommendedSize = "MiniMax";
                break;
              } else if (msg.content.includes("Mini Big Green Egg")) {
                recommendedSize = "Mini";
                break;
              }
            }
          }

          // Generate accessory recommendations based on the recommended size
          let accessoryMessage = `Here are some essential accessories that work perfectly with your ${recommendedSize} Big Green Egg:\n\n`;

          if (recommendedSize === "2XL" || recommendedSize === "XL") {
            accessoryMessage +=
              "1. **[5-Piece EGGspander Kit for XL](https://biggreenegg.com/product-category/eggspander-system/)** ($349.99) - This versatile system allows you to cook multiple dishes at different temperatures simultaneously.\n\n" +
              "2. **[Stainless Steel Fire Bowl](https://biggreenegg.com/product-category/ceramic-stainless-grids-heat-diffusers/)** ($84.99) - Improves airflow and makes cleanup easier, extending the life of your ceramic fire box.\n\n" +
              "3. **[EGG Genius Temperature Controller](https://biggreenegg.com/product-category/temperature-control/)** ($249.99) - Monitor and adjust your EGG's temperature remotely for perfect results every time.\n\n" +
              "4. **[Acacia Hardwood Table](https://biggreenegg.com/product-category/tables-nests-handlers-carts/)** - A beautiful, durable option that provides ample workspace for your EGG.\n\n" +
              "5. **[Pizza & Baking Stone](https://biggreenegg.com/product-category/pizza-tools-accessories/)** ($69.99) - For perfect pizzas with crispy crusts.\n\n" +
              "6. **[Stainless Steel Grid](https://biggreenegg.com/product-category/ceramic-stainless-grids-heat-diffusers/)** ($41.99) - Durable stainless steel grid provides excellent heat retention.\n\n" +
              "7. **[Premium Whiskey Barrel Smoking Chips](https://biggreenegg.com/product-category/charcoal-wood-starters/)** ($14.99) - Add delicious smoky flavor to your foods.\n\n" +
              '8. **[Brisket Knife 12" Stainless Steel](https://biggreenegg.com/product-category/cookware-tools/)** ($29.99) - Perfect for slicing through your smoked meats with precision.\n\n' +
              "Would you like more specific information about any of these accessories?";
          } else if (recommendedSize === "Large") {
            accessoryMessage +=
              "1. **[5-Piece EGGspander Kit for Large](https://biggreenegg.com/product-category/eggspander-system/)** ($329.99) - This versatile system allows you to cook multiple dishes at different temperatures simultaneously.\n\n" +
              "2. **[Stainless Steel Fire Bowl](https://biggreenegg.com/product-category/ceramic-stainless-grids-heat-diffusers/)** ($84.99) - Improves airflow and makes cleanup easier, extending the life of your ceramic fire box.\n\n" +
              "3. **[EGG Genius Temperature Controller](https://biggreenegg.com/product-category/temperature-control/)** ($249.99) - Monitor and adjust your EGG's temperature remotely for perfect results every time.\n\n" +
              "4. **[Acacia Hardwood Table for Large EGG](https://biggreenegg.com/product-category/tables-nests-handlers-carts/)** ($659.99) - A beautiful, durable option that provides ample workspace.\n\n" +
              "5. **[Pizza Oven Wedge for Large EGG](https://biggreenegg.com/product-category/pizza-tools-accessories/)** ($119.99) - Creates the perfect environment for cooking pizzas with crispy crusts.\n\n" +
              "6. **[Stainless Steel Grid](https://biggreenegg.com/product-category/ceramic-stainless-grids-heat-diffusers/)** ($41.99) - Durable stainless steel grid provides excellent heat retention.\n\n" +
              "7. **[Premium Whiskey Barrel Smoking Chips](https://biggreenegg.com/product-category/charcoal-wood-starters/)** ($14.99) - Add delicious smoky flavor to your foods.\n\n" +
              '8. **[Brisket Knife 12" Stainless Steel](https://biggreenegg.com/product-category/cookware-tools/)** ($29.99) - Perfect for slicing through your smoked meats with precision.\n\n' +
              "Would you like more specific information about any of these accessories?";
          } else if (
            recommendedSize === "Medium" ||
            recommendedSize === "Small"
          ) {
            accessoryMessage +=
              "1. **[Stainless Steel Grid](https://biggreenegg.com/product-category/ceramic-stainless-grids-heat-diffusers/)** ($41.99) - Durable stainless steel grid provides excellent heat retention.\n\n" +
              "2. **[Stainless Steel Fire Bowl](https://biggreenegg.com/product-category/ceramic-stainless-grids-heat-diffusers/)** ($84.99) - Improves airflow and makes cleanup easier, extending the life of your ceramic fire box.\n\n" +
              "3. **[EGG Genius Temperature Controller](https://biggreenegg.com/product-category/temperature-control/)** ($249.99) - Monitor and adjust your EGG's temperature remotely for perfect results every time.\n\n" +
              "4. **[Pizza & Baking Stone](https://biggreenegg.com/product-category/pizza-tools-accessories/)** ($69.99) - For perfect pizzas with crispy crusts.\n\n" +
              "5. **[Premium Whiskey Barrel Smoking Chips](https://biggreenegg.com/product-category/charcoal-wood-starters/)** ($14.99) - Add delicious smoky flavor to your foods.\n\n" +
              '6. **[Brisket Knife 12" Stainless Steel](https://biggreenegg.com/product-category/cookware-tools/)** ($29.99) - Perfect for slicing through your smoked meats with precision.\n\n' +
              "Would you like more specific information about any of these accessories?";
          } else if (
            recommendedSize === "MiniMax" ||
            recommendedSize === "Mini"
          ) {
            accessoryMessage +=
              "1. **[ConvEGGtor for MiniMax EGG](https://biggreenegg.com/product-category/conveggtors-plate-setters/)** ($64.99) - Transforms your EGG into a convection oven for indirect cooking and baking.\n\n" +
              "2. **[MiniMax EGG Carrier](https://biggreenegg.com/product-category/tables-nests-handlers-carts/)** ($139.99) - Perfect for taking your portable EGG on the go for camping or tailgating.\n\n" +
              "3. **[Pizza & Baking Stone for MiniMax](https://biggreenegg.com/product-category/pizza-tools-accessories/)** ($49.99) - For perfect pizzas with crispy crusts, sized to fit your MiniMax or Mini EGG.\n\n" +
              "4. **[Premium Whiskey Barrel Smoking Chips](https://biggreenegg.com/product-category/charcoal-wood-starters/)** ($14.99) - Add delicious smoky flavor to your foods.\n\n" +
              "5. **[Cast Iron Grid for MiniMax](https://biggreenegg.com/product-category/ceramic-stainless-grids-heat-diffusers/)** ($49.99) - For perfect sear marks and excellent heat retention.\n\n" +
              "6. **[Cover G - Fits MX and MN with or without a carrier](https://biggreenegg.com/product-category/covers-cleaning/)** ($42.99) - Keep your EGG protected when not in use.\n\n" +
              "Would you like more specific information about any of these accessories?";
          }

          return NextResponse.json({
            messages: [createMessage("assistant", accessoryMessage)],
            category: "product_recommendation",
          });
        }

        // Determine which size EGG they mentioned
        const eggSize = parseEggSize(lastMessage.content);
        console.log("Detected EGG size for accessories:", eggSize);

        // Generate accessory recommendations based on the size
        let accessoryMessage = `Here are some essential accessories that work perfectly with your ${eggSize} Big Green Egg:\n\n`;

        if (eggSize === "2XL" || eggSize === "XL") {
          accessoryMessage +=
            "1. **[5-Piece EGGspander Kit for XL](https://biggreenegg.com/product-category/eggspander-system/)** ($349.99) - This versatile system allows you to cook multiple dishes at different temperatures simultaneously.\n\n" +
            "2. **[Stainless Steel Fire Bowl](https://biggreenegg.com/product-category/ceramic-stainless-grids-heat-diffusers/)** ($84.99) - Improves airflow and makes cleanup easier, extending the life of your ceramic fire box.\n\n" +
            "3. **[EGG Genius Temperature Controller](https://biggreenegg.com/product-category/temperature-control/)** ($249.99) - Monitor and adjust your EGG's temperature remotely for perfect results every time.\n\n" +
            "4. **[Acacia Hardwood Table](https://biggreenegg.com/product-category/tables-nests-handlers-carts/)** - A beautiful, durable option that provides ample workspace for your EGG.\n\n" +
            "5. **[Pizza & Baking Stone](https://biggreenegg.com/product-category/pizza-tools-accessories/)** ($69.99) - For perfect pizzas with crispy crusts.\n\n" +
            "6. **[Stainless Steel Grid](https://biggreenegg.com/product-category/ceramic-stainless-grids-heat-diffusers/)** ($41.99) - Durable stainless steel grid provides excellent heat retention.\n\n" +
            "7. **[Premium Whiskey Barrel Smoking Chips](https://biggreenegg.com/product-category/charcoal-wood-starters/)** ($14.99) - Add delicious smoky flavor to your foods.\n\n" +
            '8. **[Brisket Knife 12" Stainless Steel](https://biggreenegg.com/product-category/cookware-tools/)** ($29.99) - Perfect for slicing through your smoked meats with precision.\n\n' +
            "Would you like more specific information about any of these accessories?";
        } else if (eggSize === "Large") {
          accessoryMessage +=
            "1. **[5-Piece EGGspander Kit for Large](https://biggreenegg.com/product-category/eggspander-system/)** ($329.99) - This versatile system allows you to cook multiple dishes at different temperatures simultaneously.\n\n" +
            "2. **[Stainless Steel Fire Bowl](https://biggreenegg.com/product-category/ceramic-stainless-grids-heat-diffusers/)** ($84.99) - Improves airflow and makes cleanup easier, extending the life of your ceramic fire box.\n\n" +
            "3. **[EGG Genius Temperature Controller](https://biggreenegg.com/product-category/temperature-control/)** ($249.99) - Monitor and adjust your EGG's temperature remotely for perfect results every time.\n\n" +
            "4. **[Acacia Hardwood Table for Large EGG](https://biggreenegg.com/product-category/tables-nests-handlers-carts/)** ($659.99) - A beautiful, durable option that provides ample workspace.\n\n" +
            "5. **[Pizza Oven Wedge for Large EGG](https://biggreenegg.com/product-category/pizza-tools-accessories/)** ($119.99) - Creates the perfect environment for cooking pizzas with crispy crusts.\n\n" +
            "6. **[Stainless Steel Grid](https://biggreenegg.com/product-category/ceramic-stainless-grids-heat-diffusers/)** ($41.99) - Durable stainless steel grid provides excellent heat retention.\n\n" +
            "7. **[Premium Whiskey Barrel Smoking Chips](https://biggreenegg.com/product-category/charcoal-wood-starters/)** ($14.99) - Add delicious smoky flavor to your foods.\n\n" +
            '8. **[Brisket Knife 12" Stainless Steel](https://biggreenegg.com/product-category/cookware-tools/)** ($29.99) - Perfect for slicing through your smoked meats with precision.\n\n' +
            "Would you like more specific information about any of these accessories?";
        } else if (eggSize === "Medium" || eggSize === "Small") {
          accessoryMessage +=
            "1. **[Stainless Steel Grid](https://biggreenegg.com/product-category/ceramic-stainless-grids-heat-diffusers/)** ($41.99) - Durable stainless steel grid provides excellent heat retention.\n\n" +
            "2. **[Stainless Steel Fire Bowl](https://biggreenegg.com/product-category/ceramic-stainless-grids-heat-diffusers/)** ($84.99) - Improves airflow and makes cleanup easier, extending the life of your ceramic fire box.\n\n" +
            "3. **[EGG Genius Temperature Controller](https://biggreenegg.com/product-category/temperature-control/)** ($249.99) - Monitor and adjust your EGG's temperature remotely for perfect results every time.\n\n" +
            "4. **[Pizza & Baking Stone](https://biggreenegg.com/product-category/pizza-tools-accessories/)** ($69.99) - For perfect pizzas with crispy crusts.\n\n" +
            "5. **[Premium Whiskey Barrel Smoking Chips](https://biggreenegg.com/product-category/charcoal-wood-starters/)** ($14.99) - Add delicious smoky flavor to your foods.\n\n" +
            '6. **[Brisket Knife 12" Stainless Steel](https://biggreenegg.com/product-category/cookware-tools/)** ($29.99) - Perfect for slicing through your smoked meats with precision.\n\n' +
            "Would you like more specific information about any of these accessories?";
        } else if (eggSize === "MiniMax" || eggSize === "Mini") {
          accessoryMessage +=
            "1. **[ConvEGGtor for MiniMax EGG](https://biggreenegg.com/product-category/conveggtors-plate-setters/)** ($64.99) - Transforms your EGG into a convection oven for indirect cooking and baking.\n\n" +
            "2. **[MiniMax EGG Carrier](https://biggreenegg.com/product-category/tables-nests-handlers-carts/)** ($139.99) - Perfect for taking your portable EGG on the go for camping or tailgating.\n\n" +
            "3. **[Pizza & Baking Stone for MiniMax](https://biggreenegg.com/product-category/pizza-tools-accessories/)** ($49.99) - For perfect pizzas with crispy crusts, sized to fit your MiniMax or Mini EGG.\n\n" +
            "4. **[Premium Whiskey Barrel Smoking Chips](https://biggreenegg.com/product-category/charcoal-wood-starters/)** ($14.99) - Add delicious smoky flavor to your foods.\n\n" +
            "5. **[Cast Iron Grid for MiniMax](https://biggreenegg.com/product-category/ceramic-stainless-grids-heat-diffusers/)** ($49.99) - For perfect sear marks and excellent heat retention.\n\n" +
            "6. **[Cover G - Fits MX and MN with or without a carrier](https://biggreenegg.com/product-category/covers-cleaning/)** ($42.99) - Keep your EGG protected when not in use.\n\n" +
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
        // Check if user is directly mentioning a specific egg size in their response
        const userSpecifiedSize = parseEggSize(lastMessage.content);
        console.log("User mentioned egg size in response:", userSpecifiedSize);

        // If they specifically mentioned a size, recommend that size directly
        if (
          userSpecifiedSize !== "Large" ||
          lastMessage.content.toLowerCase().includes("large")
        ) {
          console.log(
            "User directly specified a size, providing recommendation for:",
            userSpecifiedSize
          );

          // Map the size string to the appropriate recommendation key
          let recommendationKey;
          if (userSpecifiedSize === "2XL") {
            recommendationKey = "COMMERCIAL";
          } else if (userSpecifiedSize === "XL") {
            recommendationKey = "LARGE-FAMILY";
          } else if (userSpecifiedSize === "Large") {
            recommendationKey = "AVERAGE-FAMILY";
          } else if (
            userSpecifiedSize === "Medium" ||
            userSpecifiedSize === "Small"
          ) {
            recommendationKey = "SMALL-FAMILY";
          } else if (
            userSpecifiedSize === "MiniMax" ||
            userSpecifiedSize === "Mini"
          ) {
            recommendationKey = "SINGLE-PERSON";
          } else {
            recommendationKey = "AVERAGE-FAMILY"; // Default
          }

          // Generate the recommendation message based on the egg size
          let responseMessage;
          if (userSpecifiedSize === "2XL") {
            responseMessage = generateEggSizeRecommendationMessage(
              eggSizeRecommendations["COMMERCIAL"]
            );
          } else if (userSpecifiedSize === "XL") {
            responseMessage = generateEggSizeRecommendationMessage(
              eggSizeRecommendations["LARGE-FAMILY"]
            );
          } else if (userSpecifiedSize === "Large") {
            responseMessage = generateEggSizeRecommendationMessage(
              eggSizeRecommendations["AVERAGE-FAMILY"]
            );
          } else if (
            userSpecifiedSize === "Medium" ||
            userSpecifiedSize === "Small"
          ) {
            responseMessage = generateEggSizeRecommendationMessage(
              eggSizeRecommendations["SMALL-FAMILY"]
            );
          } else if (
            userSpecifiedSize === "MiniMax" ||
            userSpecifiedSize === "Mini"
          ) {
            responseMessage = generateEggSizeRecommendationMessage(
              eggSizeRecommendations["SINGLE-PERSON"]
            );
          } else {
            responseMessage = generateEggSizeRecommendationMessage(
              eggSizeRecommendations["AVERAGE-FAMILY"]
            );
          }

          return NextResponse.json({
            messages: [createMessage("assistant", responseMessage)],
            category: "product_recommendation",
          });
        }

        // Check if the user is asking for accessories instead of answering the size questions
        if (
          lowerMessage.includes("accessories") ||
          lowerMessage.includes("accessory") ||
          lowerMessage === "i want accessories" ||
          lowerMessage === "accessories" ||
          lowerMessage.includes("show me accessories") ||
          lowerMessage.includes("what accessories") ||
          lowerMessage.includes("need accessories") ||
          lowerMessage.includes("looking for accessories") ||
          lowerMessage === "yes"
        ) {
          console.log(
            "User is asking for accessories instead of answering size questions"
          );

          // Get the recommended size from the previous recommendation
          let recommendedSize = "Large"; // Default to Large
          const sizeRecommendation = recommendEggSize(lastMessage.content);
          if (sizeRecommendation) {
            recommendedSize = sizeRecommendation; // Now using the updated function that returns a string
          }

          // Generate accessory recommendations based on the recommended size
          let accessoryMessage = `Here are some essential accessories that work perfectly with your ${recommendedSize} Big Green Egg:\n\n`;

          if (recommendedSize === "2XL" || recommendedSize === "XL") {
            accessoryMessage +=
              "1. **[5-Piece EGGspander Kit for XL](https://biggreenegg.com/product-category/eggspander-system/)** ($349.99) - This versatile system allows you to cook multiple dishes at different temperatures simultaneously.\n\n" +
              "2. **[Stainless Steel Fire Bowl](https://biggreenegg.com/product-category/ceramic-stainless-grids-heat-diffusers/)** ($84.99) - Improves airflow and makes cleanup easier, extending the life of your ceramic fire box.\n\n" +
              "3. **[EGG Genius Temperature Controller](https://biggreenegg.com/product-category/temperature-control/)** ($249.99) - Monitor and adjust your EGG's temperature remotely for perfect results every time.\n\n" +
              "4. **[Acacia Hardwood Table](https://biggreenegg.com/product-category/tables-nests-handlers-carts/)** - A beautiful, durable option that provides ample workspace for your EGG.\n\n" +
              "5. **[Pizza & Baking Stone](https://biggreenegg.com/product-category/pizza-tools-accessories/)** ($69.99) - For perfect pizzas with crispy crusts.\n\n" +
              "6. **[Stainless Steel Grid](https://biggreenegg.com/product-category/ceramic-stainless-grids-heat-diffusers/)** ($41.99) - Durable stainless steel grid provides excellent heat retention.\n\n" +
              "7. **[Premium Whiskey Barrel Smoking Chips](https://biggreenegg.com/product-category/charcoal-wood-starters/)** ($14.99) - Add delicious smoky flavor to your foods.\n\n" +
              '8. **[Brisket Knife 12" Stainless Steel](https://biggreenegg.com/product-category/cookware-tools/)** ($29.99) - Perfect for slicing through your smoked meats with precision.\n\n' +
              "Would you like more specific information about any of these accessories?";
          } else if (recommendedSize === "Large") {
            accessoryMessage +=
              "1. **[5-Piece EGGspander Kit for Large](https://biggreenegg.com/product-category/eggspander-system/)** ($329.99) - This versatile system allows you to cook multiple dishes at different temperatures simultaneously.\n\n" +
              "2. **[Stainless Steel Fire Bowl](https://biggreenegg.com/product-category/ceramic-stainless-grids-heat-diffusers/)** ($84.99) - Improves airflow and makes cleanup easier, extending the life of your ceramic fire box.\n\n" +
              "3. **[EGG Genius Temperature Controller](https://biggreenegg.com/product-category/temperature-control/)** ($249.99) - Monitor and adjust your EGG's temperature remotely for perfect results every time.\n\n" +
              "4. **[Acacia Hardwood Table for Large EGG](https://biggreenegg.com/product-category/tables-nests-handlers-carts/)** ($659.99) - A beautiful, durable option that provides ample workspace.\n\n" +
              "5. **[Pizza Oven Wedge for Large EGG](https://biggreenegg.com/product-category/pizza-tools-accessories/)** ($119.99) - Creates the perfect environment for cooking pizzas with crispy crusts.\n\n" +
              "6. **[Stainless Steel Grid](https://biggreenegg.com/product-category/ceramic-stainless-grids-heat-diffusers/)** ($41.99) - Durable stainless steel grid provides excellent heat retention.\n\n" +
              "7. **[Premium Whiskey Barrel Smoking Chips](https://biggreenegg.com/product-category/charcoal-wood-starters/)** ($14.99) - Add delicious smoky flavor to your foods.\n\n" +
              '8. **[Brisket Knife 12" Stainless Steel](https://biggreenegg.com/product-category/cookware-tools/)** ($29.99) - Perfect for slicing through your smoked meats with precision.\n\n' +
              "Would you like more specific information about any of these accessories?";
          } else if (
            recommendedSize === "Medium" ||
            recommendedSize === "Small"
          ) {
            accessoryMessage +=
              "1. **[Stainless Steel Grid](https://biggreenegg.com/product-category/ceramic-stainless-grids-heat-diffusers/)** ($41.99) - Durable stainless steel grid provides excellent heat retention.\n\n" +
              "2. **[Stainless Steel Fire Bowl](https://biggreenegg.com/product-category/ceramic-stainless-grids-heat-diffusers/)** ($84.99) - Improves airflow and makes cleanup easier, extending the life of your ceramic fire box.\n\n" +
              "3. **[EGG Genius Temperature Controller](https://biggreenegg.com/product-category/temperature-control/)** ($249.99) - Monitor and adjust your EGG's temperature remotely for perfect results every time.\n\n" +
              "4. **[Pizza & Baking Stone](https://biggreenegg.com/product-category/pizza-tools-accessories/)** ($69.99) - For perfect pizzas with crispy crusts.\n\n" +
              "5. **[Premium Whiskey Barrel Smoking Chips](https://biggreenegg.com/product-category/charcoal-wood-starters/)** ($14.99) - Add delicious smoky flavor to your foods.\n\n" +
              '6. **[Brisket Knife 12" Stainless Steel](https://biggreenegg.com/product-category/cookware-tools/)** ($29.99) - Perfect for slicing through your smoked meats with precision.\n\n' +
              "Would you like more specific information about any of these accessories?";
          } else if (
            recommendedSize === "MiniMax" ||
            recommendedSize === "Mini"
          ) {
            accessoryMessage +=
              "1. **[ConvEGGtor for MiniMax EGG](https://biggreenegg.com/product-category/conveggtors-plate-setters/)** ($64.99) - Transforms your EGG into a convection oven for indirect cooking and baking.\n\n" +
              "2. **[MiniMax EGG Carrier](https://biggreenegg.com/product-category/tables-nests-handlers-carts/)** ($139.99) - Perfect for taking your portable EGG on the go for camping or tailgating.\n\n" +
              "3. **[Pizza & Baking Stone for MiniMax](https://biggreenegg.com/product-category/pizza-tools-accessories/)** ($49.99) - For perfect pizzas with crispy crusts, sized to fit your MiniMax or Mini EGG.\n\n" +
              "4. **[Premium Whiskey Barrel Smoking Chips](https://biggreenegg.com/product-category/charcoal-wood-starters/)** ($14.99) - Add delicious smoky flavor to your foods.\n\n" +
              "5. **[Cast Iron Grid for MiniMax](https://biggreenegg.com/product-category/ceramic-stainless-grids-heat-diffusers/)** ($49.99) - For perfect sear marks and excellent heat retention.\n\n" +
              "6. **[Cover G - Fits MX and MN with or without a carrier](https://biggreenegg.com/product-category/covers-cleaning/)** ($42.99) - Keep your EGG protected when not in use.\n\n" +
              "Would you like more specific information about any of these accessories?";
          }

          return NextResponse.json({
            messages: [createMessage("assistant", accessoryMessage)],
            category: "product_recommendation",
          });
        }

        // This is a response to our egg size questions, so let's recommend a product
        let recommendationKey = "AVERAGE-FAMILY"; // Default to average family

        // Log the user's response for debugging
        console.log("User response to size question:", lastMessage.content);

        // Use the recommendEggSize function to get the proper recommendation
        const sizeRecommendation = recommendEggSize(lastMessage.content);
        if (sizeRecommendation) {
          // Map the recommendation to the correct key
          if (sizeRecommendation.size.includes("2XL")) {
            recommendationKey = "COMMERCIAL";
          } else if (sizeRecommendation.size.includes("XL")) {
            recommendationKey = "LARGE-FAMILY";
          } else if (sizeRecommendation.size.includes("Large")) {
            recommendationKey = "AVERAGE-FAMILY";
          } else if (
            sizeRecommendation.size.includes("Medium") ||
            sizeRecommendation.size.includes("Small")
          ) {
            recommendationKey = "SMALL-FAMILY";
          } else if (sizeRecommendation.size.includes("Mini")) {
            recommendationKey = "SINGLE-PERSON";
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
      console.log("Product recommendation request detected");

      // Check if this is a guided product selection query
      if (isGuidedSelectionQuery(lastMessage.content)) {
        // Generate a guided selection message to ask questions first
        console.log("Using guided product selection flow");
        const guidedMessage = generateGuidedSelectionMessage();

        return NextResponse.json({
          messages: [createMessage("assistant", guidedMessage)],
          category: "product_recommendation",
        });
      }

      // Always use guided selection for generic product recommendations
      if (
        lastMessage.content.toLowerCase().includes("recommend") &&
        !lastMessage.content.toLowerCase().includes("egg size") &&
        !lastMessage.content.toLowerCase().includes("specific product")
      ) {
        console.log(
          "Generic product recommendation - using guided selection flow"
        );
        const guidedMessage = generateGuidedSelectionMessage();

        return NextResponse.json({
          messages: [createMessage("assistant", guidedMessage)],
          category: "product_recommendation",
        });
      }

      // If the message asks about egg size specifically
      if (isProductSelectionQuery(lastMessage.content)) {
        console.log("Egg size recommendation requested");

        // Generate an initial question to help determine the right size
        const sizeQuestionMessage =
          "To help you find the perfect Big Green Egg size, I need to understand your needs better. Could you tell me:\n\n" +
          "• How many people do you typically cook for?\n\n" +
          "• Do you entertain frequently with larger groups?\n\n" +
          "• How much outdoor space do you have available?\n\n" +
          "• Do you need portability or will this be in a fixed location?";

        return NextResponse.json({
          messages: [createMessage("assistant", sizeQuestionMessage)],
          category: "product_recommendation",
        });
      }

      // Continue with the existing product recommendation logic for specific product queries
      // ... existing code ...

      // Special case for "Cover for a large acacia" type queries
      const lowerMessageContent = lastMessage.content.toLowerCase();
      if (
        (lowerMessageContent.includes("cover") &&
          lowerMessageContent.includes("large") &&
          lowerMessageContent.includes("acacia")) ||
        (lowerMessageContent.includes("cover") &&
          lowerMessageContent.includes("large") &&
          lowerMessageContent.includes("table"))
      ) {
        const tableRecommendations = [products["TABLE-COVER-LARGE"]];
        const tableMessage =
          "Based on your Large EGG in a table configuration, I recommend the following cover:\n\n" +
          `• **[${products["TABLE-COVER-LARGE"].name}](${products["TABLE-COVER-LARGE"].url})** - ${products["TABLE-COVER-LARGE"].price}\n` +
          `  ${products["TABLE-COVER-LARGE"].description}\n\n` +
          "This cover is specially designed to protect your EGG and table from weather elements like rain, sun, and dust. Would you like information about any other accessories for your Big Green Egg?";

        return NextResponse.json({
          messages: [createMessage("assistant", tableMessage)],
          category: "product_recommendation",
        });
      } else if (
        (lowerMessageContent.includes("cover") &&
          lowerMessageContent.includes("large") &&
          lowerMessageContent.includes("nest")) ||
        (lowerMessageContent.includes("cover") &&
          lowerMessageContent.includes("large") &&
          lowerMessageContent.includes("stand"))
      ) {
        const nestRecommendations = [products["NEST-COVER-LARGE"]];
        const nestMessage =
          "Based on your Large EGG with a nest stand configuration, I recommend the following cover:\n\n" +
          `• **[${products["NEST-COVER-LARGE"].name}](${products["NEST-COVER-LARGE"].url})** - ${products["NEST-COVER-LARGE"].price}\n` +
          `  ${products["NEST-COVER-LARGE"].description}\n\n` +
          "This cover is specially designed to protect your EGG on the nest stand from weather elements like rain, sun, and dust. Would you like information about any other accessories for your Big Green Egg?";

        return NextResponse.json({
          messages: [createMessage("assistant", nestMessage)],
          category: "product_recommendation",
        });
      } else if (
        (lowerMessageContent.includes("cover") &&
          lowerMessageContent.includes("xl") &&
          lowerMessageContent.includes("nest")) ||
        (lowerMessageContent.includes("cover") &&
          lowerMessageContent.includes("xl") &&
          lowerMessageContent.includes("stand"))
      ) {
        const nestRecommendations = [products["NEST-COVER-XL"]];
        const nestMessage =
          "Based on your XL EGG with a nest stand configuration, I recommend the following cover:\n\n" +
          `• **[${products["NEST-COVER-XL"].name}](${products["NEST-COVER-XL"].url})** - ${products["NEST-COVER-XL"].price}\n` +
          `  ${products["NEST-COVER-XL"].description}\n\n` +
          "This cover is specially designed to protect your EGG on the nest stand from weather elements like rain, sun, and dust. Would you like information about any other accessories for your Big Green Egg?";

        return NextResponse.json({
          messages: [createMessage("assistant", nestMessage)],
          category: "product_recommendation",
        });
      } else if (
        (lowerMessageContent.includes("cover") &&
          lowerMessageContent.includes("2xl") &&
          lowerMessageContent.includes("nest")) ||
        (lowerMessageContent.includes("cover") &&
          lowerMessageContent.includes("2xl") &&
          lowerMessageContent.includes("stand"))
      ) {
        const nestRecommendations = [products["NEST-COVER-2XL"]];
        const nestMessage =
          "Based on your 2XL EGG with a nest stand configuration, I recommend the following cover:\n\n" +
          `• **[${products["NEST-COVER-2XL"].name}](${products["NEST-COVER-2XL"].url})** - ${products["NEST-COVER-2XL"].price}\n` +
          `  ${products["NEST-COVER-2XL"].description}\n\n` +
          "This cover is specially designed to protect your EGG on the nest stand from weather elements like rain, sun, and dust. Would you like information about any other accessories for your Big Green Egg?";

        return NextResponse.json({
          messages: [createMessage("assistant", nestMessage)],
          category: "product_recommendation",
        });
      }

      // Check if the user is asking about EGG covers
      if (isEggCoverQuery(lastMessage.content)) {
        console.log("User is asking about EGG covers");

        // Initialize variables to track EGG size and configuration
        let eggSize = "";
        let configuration = "";

        // Check the message for size information
        const lowerMessageContent = lastMessage.content.toLowerCase();
        if (
          lowerMessageContent.includes("minimax") ||
          lowerMessageContent.includes("mini max") ||
          lowerMessageContent.includes("mini-max")
        ) {
          eggSize = "MiniMax";
        } else if (lowerMessageContent.includes("mini")) {
          eggSize = "Mini";
        } else if (lowerMessageContent.includes("small")) {
          eggSize = "Small";
        } else if (lowerMessageContent.includes("medium")) {
          eggSize = "Medium";
        } else if (lowerMessageContent.includes("large")) {
          eggSize = "Large";
        } else if (
          lowerMessageContent.includes("xl") ||
          lowerMessageContent.includes("extra large")
        ) {
          eggSize = "XL";
        } else if (
          lowerMessageContent.includes("2xl") ||
          lowerMessageContent.includes("xxl") ||
          lowerMessageContent.includes("2x")
        ) {
          eggSize = "2XL";
        }

        // Check the message for configuration information
        if (
          lowerMessageContent.includes("table") ||
          lowerMessageContent.includes("acacia")
        ) {
          configuration = "table";
        } else if (
          lowerMessageContent.includes("nest") ||
          lowerMessageContent.includes("stand")
        ) {
          configuration = "nest stand";
        } else if (
          lowerMessageContent.includes("standalone") ||
          lowerMessageContent.includes("alone")
        ) {
          configuration = "standalone";
        }

        // If we have size and configuration, provide recommendation
        if (eggSize && configuration) {
          const coverRecommendations = recommendEggCover(
            eggSize,
            configuration
          );
          const coverMessage = generateEggCoverRecommendationMessage(
            coverRecommendations,
            eggSize,
            configuration
          );

          return NextResponse.json({
            messages: [createMessage("assistant", coverMessage)],
            category: "product_recommendation",
          });
        }

        // If we're missing information, ask follow-up questions
        if (!eggSize && !configuration) {
          const coverInquiryMessage =
            "I'd be happy to help you find the perfect cover for your Big Green Egg! To recommend the right cover, I need to know:\n\n" +
            "1. What size is your EGG? (Mini, MiniMax, Small, Medium, Large, XL, or 2XL)\n\n" +
            "2. How is your EGG set up?\n" +
            "   • In an Acacia or other table\n" +
            "   • On a nest stand\n" +
            "   • Standalone\n\n" +
            "This will help me recommend the perfect cover to protect your investment from the elements.";

          return NextResponse.json({
            messages: [createMessage("assistant", coverInquiryMessage)],
            category: "product_recommendation",
          });
        } else if (!eggSize) {
          const sizeInquiryMessage =
            `I'd be happy to help you find the perfect cover for your Big Green Egg in a ${configuration} setup! To recommend the right cover, I just need to know what size your EGG is:\n\n` +
            "• Mini\n" +
            "• MiniMax\n" +
            "• Small\n" +
            "• Medium\n" +
            "• Large\n" +
            "• XL\n" +
            "• 2XL\n\n" +
            "Once I know the size, I can recommend the perfect cover for your setup.";

          return NextResponse.json({
            messages: [createMessage("assistant", sizeInquiryMessage)],
            category: "product_recommendation",
          });
        } else if (!configuration) {
          const configInquiryMessage =
            `I'd be happy to help you find the perfect cover for your ${eggSize} Big Green Egg! To recommend the right cover, I just need to know how your EGG is set up:\n\n` +
            "• In an Acacia or other table\n" +
            "• On a nest stand\n" +
            "• Standalone\n\n" +
            "This will help me recommend the perfect cover to protect your investment from the elements.";

          return NextResponse.json({
            messages: [createMessage("assistant", configInquiryMessage)],
            category: "product_recommendation",
          });
        }
      }

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
        lowerMessage.includes("egg genius") ||
        // Check if this is a "yes" response to the accessories question
        ((lowerMessage === "yes" ||
          lowerMessage === "yes i want accessories" ||
          lowerMessage === "yes please" ||
          lowerMessage === "sure" ||
          lowerMessage === "yeah" ||
          lowerMessage === "y" ||
          lowerMessage === "ok" ||
          lowerMessage === "okay" ||
          (lowerMessage.includes("yes") &&
            lowerMessage.includes("accessories"))) &&
          messages.length >= 2 &&
          messages[messages.length - 2].role === "assistant" &&
          messages[messages.length - 2].content &&
          messages[messages.length - 2].content.includes(
            "Would you like to see some accessories that work well with this size?"
          ))
      ) {
        console.log("User is asking specifically about accessories");

        // Check if we previously recommended an egg size
        let recommendedSize = null;
        for (let i = messages.length - 2; i >= 0; i--) {
          const msg = messages[i];
          if (msg.role === "assistant" && msg.content) {
            if (msg.content.includes("Based on your needs, I recommend the")) {
              // Extract the recommended size
              if (msg.content.includes("2XL Big Green Egg")) {
                recommendedSize = "2XL";
                break;
              } else if (msg.content.includes("XL Big Green Egg")) {
                recommendedSize = "XL";
                break;
              } else if (msg.content.includes("Large Big Green Egg")) {
                recommendedSize = "Large";
                break;
              } else if (msg.content.includes("Medium Big Green Egg")) {
                recommendedSize = "Medium";
                break;
              } else if (msg.content.includes("Small Big Green Egg")) {
                recommendedSize = "Small";
                break;
              } else if (msg.content.includes("MiniMax Big Green Egg")) {
                recommendedSize = "MiniMax";
                break;
              } else if (msg.content.includes("Mini Big Green Egg")) {
                recommendedSize = "Mini";
                break;
              }
            }
          }
        }

        // If we found a previously recommended size, use it
        if (recommendedSize) {
          console.log("Found previously recommended size:", recommendedSize);

          // Generate accessory recommendations based on the recommended size
          let accessoryMessage = `Here are some essential accessories that work perfectly with your ${recommendedSize} Big Green Egg:\n\n`;

          if (recommendedSize === "2XL" || recommendedSize === "XL") {
            accessoryMessage +=
              "1. **[5-Piece EGGspander Kit for XL](https://biggreenegg.com/product-category/eggspander-system/)** ($349.99) - This versatile system allows you to cook multiple dishes at different temperatures simultaneously.\n\n" +
              "2. **[Stainless Steel Fire Bowl](https://biggreenegg.com/product-category/ceramic-stainless-grids-heat-diffusers/)** ($84.99) - Improves airflow and makes cleanup easier, extending the life of your ceramic fire box.\n\n" +
              "3. **[EGG Genius Temperature Controller](https://biggreenegg.com/product-category/temperature-control/)** ($249.99) - Monitor and adjust your EGG's temperature remotely for perfect results every time.\n\n" +
              "4. **[Acacia Hardwood Table](https://biggreenegg.com/product-category/tables-nests-handlers-carts/)** - A beautiful, durable option that provides ample workspace for your EGG.\n\n" +
              "5. **[Pizza & Baking Stone](https://biggreenegg.com/product-category/pizza-tools-accessories/)** ($69.99) - For perfect pizzas with crispy crusts.\n\n" +
              "6. **[Stainless Steel Grid](https://biggreenegg.com/product-category/ceramic-stainless-grids-heat-diffusers/)** ($41.99) - Durable stainless steel grid provides excellent heat retention.\n\n" +
              "7. **[Premium Whiskey Barrel Smoking Chips](https://biggreenegg.com/product-category/charcoal-wood-starters/)** ($14.99) - Add delicious smoky flavor to your foods.\n\n" +
              '8. **[Brisket Knife 12" Stainless Steel](https://biggreenegg.com/product-category/cookware-tools/)** ($29.99) - Perfect for slicing through your smoked meats with precision.\n\n' +
              "Would you like more specific information about any of these accessories?";
          } else if (recommendedSize === "Large") {
            accessoryMessage +=
              "1. **[5-Piece EGGspander Kit for Large](https://biggreenegg.com/product-category/eggspander-system/)** ($329.99) - This versatile system allows you to cook multiple dishes at different temperatures simultaneously.\n\n" +
              "2. **[Stainless Steel Fire Bowl](https://biggreenegg.com/product-category/ceramic-stainless-grids-heat-diffusers/)** ($84.99) - Improves airflow and makes cleanup easier, extending the life of your ceramic fire box.\n\n" +
              "3. **[EGG Genius Temperature Controller](https://biggreenegg.com/product-category/temperature-control/)** ($249.99) - Monitor and adjust your EGG's temperature remotely for perfect results every time.\n\n" +
              "4. **[Acacia Hardwood Table for Large EGG](https://biggreenegg.com/product-category/tables-nests-handlers-carts/)** ($659.99) - A beautiful, durable option that provides ample workspace.\n\n" +
              "5. **[Pizza Oven Wedge for Large EGG](https://biggreenegg.com/product-category/pizza-tools-accessories/)** ($119.99) - Creates the perfect environment for cooking pizzas with crispy crusts.\n\n" +
              "6. **[Stainless Steel Grid](https://biggreenegg.com/product-category/ceramic-stainless-grids-heat-diffusers/)** ($41.99) - Durable stainless steel grid provides excellent heat retention.\n\n" +
              "7. **[Premium Whiskey Barrel Smoking Chips](https://biggreenegg.com/product-category/charcoal-wood-starters/)** ($14.99) - Add delicious smoky flavor to your foods.\n\n" +
              '8. **[Brisket Knife 12" Stainless Steel](https://biggreenegg.com/product-category/cookware-tools/)** ($29.99) - Perfect for slicing through your smoked meats with precision.\n\n' +
              "Would you like more specific information about any of these accessories?";
          } else if (
            recommendedSize === "Medium" ||
            recommendedSize === "Small"
          ) {
            accessoryMessage +=
              "1. **[Stainless Steel Grid](https://biggreenegg.com/product-category/ceramic-stainless-grids-heat-diffusers/)** ($41.99) - Durable stainless steel grid provides excellent heat retention.\n\n" +
              "2. **[Stainless Steel Fire Bowl](https://biggreenegg.com/product-category/ceramic-stainless-grids-heat-diffusers/)** ($84.99) - Improves airflow and makes cleanup easier, extending the life of your ceramic fire box.\n\n" +
              "3. **[EGG Genius Temperature Controller](https://biggreenegg.com/product-category/temperature-control/)** ($249.99) - Monitor and adjust your EGG's temperature remotely for perfect results every time.\n\n" +
              "4. **[Pizza & Baking Stone](https://biggreenegg.com/product-category/pizza-tools-accessories/)** ($69.99) - For perfect pizzas with crispy crusts.\n\n" +
              "5. **[Premium Whiskey Barrel Smoking Chips](https://biggreenegg.com/product-category/charcoal-wood-starters/)** ($14.99) - Add delicious smoky flavor to your foods.\n\n" +
              '6. **[Brisket Knife 12" Stainless Steel](https://biggreenegg.com/product-category/cookware-tools/)** ($29.99) - Perfect for slicing through your smoked meats with precision.\n\n' +
              "Would you like more specific information about any of these accessories?";
          } else if (
            recommendedSize === "MiniMax" ||
            recommendedSize === "Mini"
          ) {
            accessoryMessage +=
              "1. **[ConvEGGtor for MiniMax EGG](https://biggreenegg.com/product-category/conveggtors-plate-setters/)** ($64.99) - Transforms your EGG into a convection oven for indirect cooking and baking.\n\n" +
              "2. **[MiniMax EGG Carrier](https://biggreenegg.com/product-category/tables-nests-handlers-carts/)** ($139.99) - Perfect for taking your portable EGG on the go for camping or tailgating.\n\n" +
              "3. **[Pizza & Baking Stone for MiniMax](https://biggreenegg.com/product-category/pizza-tools-accessories/)** ($49.99) - For perfect pizzas with crispy crusts, sized to fit your MiniMax or Mini EGG.\n\n" +
              "4. **[Premium Whiskey Barrel Smoking Chips](https://biggreenegg.com/product-category/charcoal-wood-starters/)** ($14.99) - Add delicious smoky flavor to your foods.\n\n" +
              "5. **[Cast Iron Grid for MiniMax](https://biggreenegg.com/product-category/ceramic-stainless-grids-heat-diffusers/)** ($49.99) - For perfect sear marks and excellent heat retention.\n\n" +
              "6. **[Cover G - Fits MX and MN with or without a carrier](https://biggreenegg.com/product-category/covers-cleaning/)** ($42.99) - Keep your EGG protected when not in use.\n\n" +
              "Would you like more specific information about any of these accessories?";
          }

          return NextResponse.json({
            messages: [createMessage("assistant", accessoryMessage)],
            category: "product_recommendation",
          });
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
            "• [Egg Packages](https://biggreenegg.com/collections/all-eggs-egg-packages)\n\n" +
            "• [Modular Systems, Tables & Stands](https://biggreenegg.com/collections/all-modular-system-tables-stands)\n\n" +
            "• [Accessories](https://biggreenegg.com/collections/accessories)\n\n" +
            "• [Cookware & Tools](https://biggreenegg.com/collections/cookware-tools)\n\n" +
            "• [Lifestyle & Gear](https://biggreenegg.com/collections/all-lifestyle-gear-1)\n\n" +
            "• [Spices & Sauces](https://biggreenegg.com/collections/spices-sauces)\n\n" +
            "• [Covers & Cleaning](https://biggreenegg.com/collections/covers-cleaning)\n\n" +
            "• [Charcoal, Woods & Starters](https://biggreenegg.com/collections/charcoal-wood-starters)\n\n" +
            "• [Replacement Parts](https://biggreenegg.com/collections/replacement-parts)\n\n" +
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
          lowerMessage.includes("accessories") ||
          lowerMessage === "yes" ||
          lowerMessage === "yes accessories" ||
          lowerMessage === "yes please" ||
          lowerMessage === "yes show me accessories" ||
          lowerMessage === "sure" ||
          lowerMessage === "show me"
        ) {
          try {
            console.log("Detected accessory request:", lowerMessage);

            // Check if the previous message was recommending an egg size and asking if they want to see accessories
            let showSpecificAccessories = false;
            let eggSize = "Large"; // Default

            // Make sure we have previous messages to check
            if (messages.length >= 2) {
              console.log("Checking previous message for context");
              const previousMessage = messages[messages.length - 2];

              console.log("Previous message role:", previousMessage.role);
              console.log(
                "Previous message content:",
                previousMessage.content
                  ? previousMessage.content.substring(0, 100) + "..."
                  : "none"
              );

              // Check if the previous message was an egg size recommendation asking about accessories
              if (
                previousMessage.role === "assistant" &&
                previousMessage.content &&
                (previousMessage.content.includes(
                  "Would you like to see some accessories that work well with this size?"
                ) ||
                  previousMessage.content.includes(
                    "Would you like to see accessories"
                  ))
              ) {
                showSpecificAccessories = true;
                console.log("Previous message was asking about accessories");

                // Extract the egg size from the previous recommendation
                if (previousMessage.content.includes("2XL Big Green Egg")) {
                  eggSize = "2XL";
                } else if (
                  previousMessage.content.includes("XL Big Green Egg")
                ) {
                  eggSize = "XL";
                } else if (
                  previousMessage.content.includes("Large Big Green Egg")
                ) {
                  eggSize = "Large";
                } else if (
                  previousMessage.content.includes("Medium Big Green Egg")
                ) {
                  eggSize = "Medium";
                } else if (
                  previousMessage.content.includes("Small Big Green Egg")
                ) {
                  eggSize = "Small";
                } else if (
                  previousMessage.content.includes("MiniMax Big Green Egg")
                ) {
                  eggSize = "MiniMax";
                } else if (
                  previousMessage.content.includes("Mini Big Green Egg")
                ) {
                  eggSize = "Mini";
                }

                console.log(
                  `Detected egg size from previous message: ${eggSize}`
                );
              }
            }

            if (showSpecificAccessories) {
              console.log(`Generating accessories for ${eggSize} egg`);
              // Generate specific accessory recommendations based on the egg size
              let accessoryMessage = `Here are some essential accessories that work perfectly with your ${eggSize} Big Green Egg:\n\n`;

              if (eggSize === "2XL" || eggSize === "XL") {
                accessoryMessage +=
                  "1. **[5-Piece EGGspander Kit for XL](https://biggreenegg.com/product-category/eggspander-system/)** ($349.99) - This versatile system allows you to cook multiple dishes at different temperatures simultaneously.\n\n" +
                  "2. **[Stainless Steel Fire Bowl](https://biggreenegg.com/product-category/ceramic-stainless-grids-heat-diffusers/)** ($84.99) - Improves airflow and makes cleanup easier, extending the life of your ceramic fire box.\n\n" +
                  "3. **[EGG Genius Temperature Controller](https://biggreenegg.com/product-category/temperature-control/)** ($249.99) - Monitor and adjust your EGG's temperature remotely for perfect results every time.\n\n" +
                  "4. **[Acacia Hardwood Table](https://biggreenegg.com/product-category/tables-nests-handlers-carts/)** - A beautiful, durable option that provides ample workspace for your EGG.\n\n" +
                  "5. **[Pizza & Baking Stone](https://biggreenegg.com/product-category/pizza-tools-accessories/)** ($69.99) - For perfect pizzas with crispy crusts.\n\n" +
                  "6. **[Stainless Steel Grid](https://biggreenegg.com/product-category/ceramic-stainless-grids-heat-diffusers/)** ($41.99) - Durable stainless steel grid provides excellent heat retention.\n\n" +
                  "7. **[Premium Whiskey Barrel Smoking Chips](https://biggreenegg.com/product-category/charcoal-wood-starters/)** ($14.99) - Add delicious smoky flavor to your foods.\n\n" +
                  '8. **[Brisket Knife 12" Stainless Steel](https://biggreenegg.com/product-category/cookware-tools/)** ($29.99) - Perfect for slicing through your smoked meats with precision.\n\n' +
                  "Would you like more specific information about any of these accessories?";
              } else if (eggSize === "Large") {
                accessoryMessage +=
                  "1. **[5-Piece EGGspander Kit for Large](https://biggreenegg.com/product-category/eggspander-system/)** ($329.99) - This versatile system allows you to cook multiple dishes at different temperatures simultaneously.\n\n" +
                  "2. **[Stainless Steel Fire Bowl](https://biggreenegg.com/product-category/ceramic-stainless-grids-heat-diffusers/)** ($84.99) - Improves airflow and makes cleanup easier, extending the life of your ceramic fire box.\n\n" +
                  "3. **[EGG Genius Temperature Controller](https://biggreenegg.com/product-category/temperature-control/)** ($249.99) - Monitor and adjust your EGG's temperature remotely for perfect results every time.\n\n" +
                  "4. **[Acacia Hardwood Table for Large EGG](https://biggreenegg.com/product-category/tables-nests-handlers-carts/)** ($659.99) - A beautiful, durable option that provides ample workspace.\n\n" +
                  "5. **[Pizza Oven Wedge for Large EGG](https://biggreenegg.com/product-category/pizza-tools-accessories/)** ($119.99) - Creates the perfect environment for cooking pizzas with crispy crusts.\n\n" +
                  "6. **[Stainless Steel Grid](https://biggreenegg.com/product-category/ceramic-stainless-grids-heat-diffusers/)** ($41.99) - Durable stainless steel grid provides excellent heat retention.\n\n" +
                  "7. **[Premium Whiskey Barrel Smoking Chips](https://biggreenegg.com/product-category/charcoal-wood-starters/)** ($14.99) - Add delicious smoky flavor to your foods.\n\n" +
                  '8. **[Brisket Knife 12" Stainless Steel](https://biggreenegg.com/product-category/cookware-tools/)** ($29.99) - Perfect for slicing through your smoked meats with precision.\n\n' +
                  "Would you like more specific information about any of these accessories?";
              } else if (eggSize === "Medium" || eggSize === "Small") {
                accessoryMessage +=
                  "1. **[Stainless Steel Grid](https://biggreenegg.com/product-category/ceramic-stainless-grids-heat-diffusers/)** ($41.99) - Durable stainless steel grid provides excellent heat retention.\n\n" +
                  "2. **[Stainless Steel Fire Bowl](https://biggreenegg.com/product-category/ceramic-stainless-grids-heat-diffusers/)** ($84.99) - Improves airflow and makes cleanup easier, extending the life of your ceramic fire box.\n\n" +
                  "3. **[EGG Genius Temperature Controller](https://biggreenegg.com/product-category/temperature-control/)** ($249.99) - Monitor and adjust your EGG's temperature remotely for perfect results every time.\n\n" +
                  "4. **[Pizza & Baking Stone](https://biggreenegg.com/product-category/pizza-tools-accessories/)** ($69.99) - For perfect pizzas with crispy crusts.\n\n" +
                  "5. **[Premium Whiskey Barrel Smoking Chips](https://biggreenegg.com/product-category/charcoal-wood-starters/)** ($14.99) - Add delicious smoky flavor to your foods.\n\n" +
                  '6. **[Brisket Knife 12" Stainless Steel](https://biggreenegg.com/product-category/cookware-tools/)** ($29.99) - Perfect for slicing through your smoked meats with precision.\n\n' +
                  "Would you like more specific information about any of these accessories?";
              } else if (eggSize === "MiniMax" || eggSize === "Mini") {
                accessoryMessage +=
                  "1. **[ConvEGGtor for MiniMax EGG](https://biggreenegg.com/product-category/conveggtors-plate-setters/)** ($64.99) - Transforms your EGG into a convection oven for indirect cooking and baking.\n\n" +
                  "2. **[MiniMax EGG Carrier](https://biggreenegg.com/product-category/tables-nests-handlers-carts/)** ($139.99) - Perfect for taking your portable EGG on the go for camping or tailgating.\n\n" +
                  "3. **[Pizza & Baking Stone for MiniMax](https://biggreenegg.com/product-category/pizza-tools-accessories/)** ($49.99) - For perfect pizzas with crispy crusts, sized to fit your MiniMax or Mini EGG.\n\n" +
                  "4. **[Premium Whiskey Barrel Smoking Chips](https://biggreenegg.com/product-category/charcoal-wood-starters/)** ($14.99) - Add delicious smoky flavor to your foods.\n\n" +
                  "5. **[Cast Iron Grid for MiniMax](https://biggreenegg.com/product-category/ceramic-stainless-grids-heat-diffusers/)** ($49.99) - For perfect sear marks and excellent heat retention.\n\n" +
                  "6. **[Cover G - Fits MX and MN with or without a carrier](https://biggreenegg.com/product-category/covers-cleaning/)** ($42.99) - Keep your EGG protected when not in use.\n\n" +
                  "Would you like more specific information about any of these accessories?";
              }

              return NextResponse.json({
                messages: [createMessage("assistant", accessoryMessage)],
                category: "product_recommendation",
              });
            } else {
              // If it's a general accessory request (not following a recommendation)
              productMessage =
                "Check out our accessories at [Big Green Egg Accessories](https://biggreenegg.com/collections/accessories). We have everything you need to enhance your cooking experience!";
              isProductInquiry = true;
            }
          } catch (error) {
            console.error("Error processing accessory request:", error);
            // Return a specific error for accessory requests
            return NextResponse.json({
              messages: [
                createMessage(
                  "assistant",
                  "I'm sorry, there was an issue with retrieving accessory recommendations. Please try asking in a different way or check out our accessories at [Big Green Egg Accessories](https://biggreenegg.com/collections/accessories)."
                ),
              ],
              category: "error",
            });
          }
        }
        // Handle specific accessory information requests
        else if (messages.length >= 2) {
          const previousMessage = messages[messages.length - 2];
          // Check if previous message was asking if they want more info about accessories
          if (
            previousMessage.role === "assistant" &&
            previousMessage.content &&
            previousMessage.content.includes(
              "Would you like more specific information about any of these accessories?"
            )
          ) {
            console.log(
              "Detected request for specific accessory info:",
              lowerMessage
            );

            // Determine which accessory they're asking about
            let accessoryInfo = "";

            if (
              lowerMessage.includes("eggspander") ||
              lowerMessage.includes("expander") ||
              lowerMessage.includes("5-piece") ||
              lowerMessage.includes("5 piece")
            ) {
              accessoryInfo =
                "# 5-Piece EGGspander Kit\n\n" +
                "The EGGspander Kit is one of our most versatile accessories, dramatically increasing your cooking options:\n\n" +
                "- **Multi-Level Cooking**: Cook different foods at different temperatures simultaneously\n" +
                "- **Increased Capacity**: Nearly doubles your cooking surface area\n" +
                "- **Indirect Cooking**: Perfect for slow cooking, smoking, and baking\n" +
                "- **Direct High-Heat Cooking**: Get those perfect sear marks on steaks\n\n" +
                "The kit includes a multi-level rack, 2 half-moon stainless steel cooking grids, a stainless steel mesh basket, and a 5-in-1 multi-tool for easy handling.\n\n" +
                "It's compatible with the ConvEGGtor for even more cooking options. This is truly the ultimate accessory to maximize your EGG's versatility!\n\n" +
                "[View the 5-Piece EGGspander Kit](https://biggreenegg.com/product-category/eggspander-system/)";
            } else if (
              lowerMessage.includes("fire bowl") ||
              lowerMessage.includes("stainless steel bowl")
            ) {
              accessoryInfo =
                "# Stainless Steel Fire Bowl\n\n" +
                "The Stainless Steel Fire Bowl is an excellent upgrade for your EGG:\n\n" +
                "- **Enhanced Airflow**: Improves air circulation for more efficient burning and temperature control\n" +
                "- **Easy Cleaning**: Simply lift it out to remove ash, much easier than cleaning the ceramic fire box\n" +
                "- **Extended Lifespan**: Reduces stress on your ceramic components, extending their life\n" +
                "- **Premium Construction**: Made from heavy-duty stainless steel that withstands high temperatures\n\n" +
                "This is one of our most popular accessories because it makes maintenance so much easier while improving performance. Many EGG owners consider this an essential upgrade!\n\n" +
                "[View the Stainless Steel Fire Bowl](https://biggreenegg.com/product-category/ceramic-stainless-grids-heat-diffusers/)";
            } else if (
              lowerMessage.includes("genius") ||
              lowerMessage.includes("temperature controller") ||
              lowerMessage.includes("temp controller")
            ) {
              accessoryInfo =
                "# EGG Genius Temperature Controller\n\n" +
                "The EGG Genius is your ultimate cooking partner for perfect results every time:\n\n" +
                "- **Smart Monitoring**: Track your cook from anywhere using the EGG Genius app on your phone\n" +
                "- **Precision Control**: Automatically maintains your target temperature within a few degrees\n" +
                "- **Multiple Probes**: Monitor both ambient EGG temperature and food temperature simultaneously\n" +
                "- **Perfect for Long Cooks**: Set it and forget it - ideal for overnight briskets or long smoking sessions\n" +
                "- **Alerts & Notifications**: Get notified when your food reaches target temperature\n\n" +
                "Works with Wi-Fi and includes cloud connectivity, making it perfect for those who want the convenience of remote monitoring and precise temperature control.\n\n" +
                "[View the EGG Genius Temperature Controller](https://biggreenegg.com/product-category/temperature-control/)";
            } else if (
              lowerMessage.includes("pizza stone") ||
              lowerMessage.includes("baking stone")
            ) {
              accessoryInfo =
                "# Pizza & Baking Stone\n\n" +
                "The Pizza & Baking Stone is essential for perfect pizzas and baked goods:\n\n" +
                "- **Perfect Crust**: Absorbs moisture for perfectly crispy pizza crusts\n" +
                "- **Even Heat Distribution**: Eliminates hot spots for consistent cooking\n" +
                "- **Versatile**: Great for pizzas, breads, cookies and more\n" +
                "- **Thermal Stability**: Withstands extreme temperature changes\n\n" +
                "Made from cordierite ceramic, our baking stone retains heat extremely well. For best results, preheat it for at least 30 minutes before cooking your pizza. Use with a pizza peel for easy handling.\n\n" +
                "[View the Pizza & Baking Stone](https://biggreenegg.com/product-category/pizza-tools-accessories/)";
            } else if (
              lowerMessage.includes("brisket knife") ||
              lowerMessage.includes("knife")
            ) {
              accessoryInfo =
                '# Brisket Knife 12" Stainless Steel\n\n' +
                "Our premium Brisket Knife is designed specifically for perfect slices of barbecue:\n\n" +
                "- **Long 12-inch Blade**: Allows for full slices across large cuts of meat in a single stroke\n" +
                "- **Granton Edge**: The scalloped indentations create air pockets that prevent meat from sticking to the blade\n" +
                "- **Ergonomic Handle**: Comfortable grip for precision cutting\n" +
                "- **Premium Steel**: High-carbon stainless steel holds its edge and resists corrosion\n\n" +
                "This knife is perfect for slicing brisket, turkey, ham, and other large cuts of meat with clean, precise cuts that help preserve juices and presentation. A must-have tool for any serious barbecue enthusiast!\n\n" +
                "[View the Brisket Knife](https://biggreenegg.com/product-category/cookware-tools/)";
            } else if (
              lowerMessage.includes("stainless steel grid") ||
              lowerMessage.includes("grid")
            ) {
              accessoryInfo =
                "# Stainless Steel Grid\n\n" +
                "The Stainless Steel Grid is a durable, high-performance cooking surface for your EGG:\n\n" +
                "- **Superior Heat Retention**: Stainless steel holds heat for consistent cooking temperatures\n" +
                "- **Perfect Grill Marks**: Optimized spacing for those perfect sear marks\n" +
                "- **Easy Cleaning**: More durable and easier to clean than standard grids\n" +
                "- **Long-lasting**: Resists corrosion and withstands high temperatures\n\n" +
                "This grid is a direct replacement for your original grid and offers improved performance. It's a simple upgrade that enhances your cooking experience and lasts for years.\n\n" +
                "[View the Stainless Steel Grid](https://biggreenegg.com/product-category/ceramic-stainless-grids-heat-diffusers/)";
            } else if (
              lowerMessage.includes("whiskey") ||
              lowerMessage.includes("smoking chips") ||
              lowerMessage.includes("wood chips")
            ) {
              accessoryInfo =
                "# Premium Whiskey Barrel Smoking Chips\n\n" +
                "Our unique Whiskey Barrel Smoking Chips add an extraordinary flavor dimension to your cooking:\n\n" +
                "- **Unique Flavor Profile**: Combines oak wood with whiskey notes for a distinctive taste\n" +
                "- **Authentic Source**: Made from genuine aged whiskey barrels\n" +
                "- **Versatile Use**: Perfect for beef, pork, poultry, and even some desserts\n" +
                "- **Premium Quality**: Kiln-dried to the perfect moisture content for optimal smoke\n\n" +
                "To use: Soak chips in water for about 30 minutes, then sprinkle a handful directly on hot coals just before cooking. These chips produce a moderate smoke that adds complex flavor without overpowering your food.\n\n" +
                "[View the Premium Whiskey Barrel Smoking Chips](https://biggreenegg.com/product-category/charcoal-wood-starters/)";
            } else if (
              lowerMessage.includes("table") ||
              lowerMessage.includes("acacia")
            ) {
              accessoryInfo =
                "# Acacia Hardwood Table\n\n" +
                "The Acacia Hardwood Table is the perfect home for your Big Green Egg:\n\n" +
                "- **Ample Workspace**: Provides plenty of preparation and serving space\n" +
                "- **Beautiful Design**: Rich, warm acacia wood with a premium finish\n" +
                "- **Weather Resistant**: Acacia wood is naturally resistant to weather and wear\n" +
                "- **Storage Space**: Includes storage shelf underneath for accessories and supplies\n" +
                "- **Custom Fit**: Designed specifically to house your EGG at the perfect height\n\n" +
                "Assembly is required, but the table comes with detailed instructions. For best longevity, we recommend using a cover and occasionally treating the wood with food-safe oil to maintain its beauty.\n\n" +
                "[View the Acacia Hardwood Table](https://biggreenegg.com/product-category/tables-nests-handlers-carts/)";
            } else if (
              lowerMessage.includes("conveggtor") ||
              lowerMessage.includes("plate setter")
            ) {
              accessoryInfo =
                "# ConvEGGtor / Plate Setter\n\n" +
                "The ConvEGGtor is perhaps the most versatile accessory for your EGG:\n\n" +
                "- **Indirect Cooking**: Creates a barrier between food and direct flame\n" +
                "- **Convection Cooking**: Transforms your EGG into a true convection oven\n" +
                "- **Temperature Control**: Ideal for low & slow cooking at precise temperatures\n" +
                "- **Even Heat**: Eliminates hot spots for consistent cooking throughout\n\n" +
                "This ceramic heat deflector is essential for smoking, baking, roasting and any cooking method that requires indirect heat. Use it for smoking brisket, baking pizzas, roasting chicken, and much more.\n\n" +
                "It's easy to use - just place it inside your EGG with the legs facing up before adding your cooking grid.\n\n" +
                "[View the ConvEGGtor](https://biggreenegg.com/product-category/conveggtors-plate-setters/)";
            } else if (
              lowerMessage.includes("minimax carrier") ||
              lowerMessage.includes("carrier") ||
              lowerMessage.includes("egg carrier")
            ) {
              accessoryInfo =
                "# MiniMax EGG Carrier\n\n" +
                "The MiniMax EGG Carrier makes your portable EGG even more convenient:\n\n" +
                "- **Enhanced Portability**: Built-in handles for easy transportation\n" +
                "- **Sturdy Design**: Durable construction with reinforced bands\n" +
                "- **Perfect for Travel**: Take your EGG camping, tailgating, or to the beach\n" +
                "- **Protective**: Adds an extra layer of protection for your EGG\n\n" +
                "This carrier is specifically designed for the MiniMax EGG, allowing you to safely and easily take your cooking adventures anywhere. The ergonomic handles make carrying comfortable, and the sturdy construction ensures your EGG stays secure.\n\n" +
                "[View the MiniMax EGG Carrier](https://biggreenegg.com/product-category/tables-nests-handlers-carts/)";
            } else if (lowerMessage.includes("cast iron grid")) {
              accessoryInfo =
                "# Cast Iron Grid\n\n" +
                "The Cast Iron Grid elevates your grilling experience with superior heat retention:\n\n" +
                "- **Exceptional Searing**: Creates restaurant-quality sear marks on steaks and chops\n" +
                "- **Superior Heat Retention**: Maintains consistent cooking temperature\n" +
                "- **Even Cooking**: Distributes heat evenly across the cooking surface\n" +
                "- **Durable Construction**: Pre-seasoned cast iron built to last for years\n\n" +
                "The heavy-duty cast iron retains heat even when you're adding cold food to the grill, resulting in better sear marks and more consistent cooking. It's ideal for steaks, burgers, chops, and any foods where you want distinctive grill marks.\n\n" +
                "Care tip: Clean with a grill brush while warm and occasionally re-season with vegetable oil to maintain the non-stick surface and prevent rust.\n\n" +
                "[View the Cast Iron Grid](https://biggreenegg.com/product-category/ceramic-stainless-grids-heat-diffusers/)";
            } else if (lowerMessage.includes("cover")) {
              accessoryInfo =
                "# EGG Cover\n\n" +
                "Protect your investment with our premium EGG Covers:\n\n" +
                "- **Weather Protection**: Shields your EGG from rain, snow, UV rays, and other elements\n" +
                "- **Ventilated Design**: Allows air circulation to prevent moisture buildup\n" +
                "- **Custom Fit**: Designed specifically for your EGG model for a perfect fit\n" +
                "- **Premium Materials**: Made from heavy-duty, weather-resistant fabric\n" +
                "- **Easy to Use**: Simple to put on and remove as needed\n\n" +
                "Our covers are an essential accessory for protecting your EGG and extending its life, particularly if it's stored outdoors. Each cover is tailored to fit specific EGG sizes and configurations.\n\n" +
                "[View our EGG Covers Collection](https://biggreenegg.com/product-category/covers-cleaning/)";
            } else if (
              lowerMessage.includes("pizza oven wedge") ||
              lowerMessage.includes("wedge")
            ) {
              accessoryInfo =
                "# Pizza Oven Wedge\n\n" +
                "The Pizza Oven Wedge turns your EGG into a high-performance pizza oven:\n\n" +
                "- **Perfect Pizza Environment**: Creates ideal cooking conditions for professional-quality pizzas\n" +
                "- **Enhanced Heat Flow**: The wedge shape directs heat for faster, more even cooking\n" +
                "- **Higher Cooking Temperature**: Achieves and maintains the high temps needed for perfect pizza\n" +
                "- **Easy to Use**: Simply place inside your EGG with a baking stone\n\n" +
                "This specialty accessory works by reflecting heat from the dome down onto the top of your pizza, giving you that perfect balance of crispy crust and beautifully melted toppings. It mimics the environment of a professional brick pizza oven.\n\n" +
                "For best results, use with a Pizza & Baking Stone and preheat your EGG to 600-700°F before cooking.\n\n" +
                "[View the Pizza Oven Wedge](https://biggreenegg.com/product-category/pizza-tools-accessories/)";
            } else {
              // Generic response for other accessories
              const genericMessage =
                "I'd be happy to tell you more about that accessory. Would you like information about a specific feature, or would you prefer to see more accessories that complement your cooking style?";

              return NextResponse.json({
                messages: [createMessage("assistant", genericMessage)],
                category: "product",
              });
            }

            // Return the specific accessory information
            if (accessoryInfo) {
              return NextResponse.json({
                messages: [createMessage("assistant", accessoryInfo)],
                category: "product",
              });
            }
          }
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

    // Pre-check for weight and specification queries to ensure they go to product search
    const queryLowerMessage = lastMessage.content.toLowerCase();
    const isWeightOrSpecQuery =
      (queryLowerMessage.includes("weight") ||
        queryLowerMessage.includes("weigh") ||
        queryLowerMessage.includes("how heavy") ||
        queryLowerMessage.includes("how much does") ||
        queryLowerMessage.includes("pounds") ||
        queryLowerMessage.includes("lbs") ||
        queryLowerMessage.includes("specifications") ||
        queryLowerMessage.includes("specs") ||
        queryLowerMessage.includes("dimensions") ||
        queryLowerMessage.includes("cooking area") ||
        queryLowerMessage.includes("size of") ||
        (queryLowerMessage.includes("how big") &&
          queryLowerMessage.includes("egg"))) &&
      (queryLowerMessage.includes("egg") || containsEggSize(queryLowerMessage));

    // Check for specialized accessory queries
    const isSpecializedAccessoryQuery =
      queryLowerMessage.includes("accessories") &&
      (queryLowerMessage.includes("for smoking") ||
        queryLowerMessage.includes("smoking") ||
        queryLowerMessage.includes("smoke") ||
        queryLowerMessage.includes("for pizza") ||
        queryLowerMessage.includes("pizza") ||
        queryLowerMessage.includes("for grilling") ||
        queryLowerMessage.includes("grilling") ||
        queryLowerMessage.includes("for baking") ||
        queryLowerMessage.includes("baking"));

    if (isSpecializedAccessoryQuery) {
      console.log("Detected specialized accessory query:", lastMessage.content);

      // Determine which size EGG they mentioned
      const eggSize = parseEggSize(lastMessage.content);
      console.log("Detected EGG size for specialized accessories:", eggSize);

      // Determine cooking type
      const isSmoking =
        queryLowerMessage.includes("smoking") ||
        queryLowerMessage.includes("smoke");
      const isPizza = queryLowerMessage.includes("pizza");
      const isGrilling =
        queryLowerMessage.includes("grilling") ||
        queryLowerMessage.includes("grill");
      const isBaking =
        queryLowerMessage.includes("baking") ||
        queryLowerMessage.includes("bake");

      let accessoryMessage = `Here are specialized accessories for ${
        isSmoking
          ? "smoking"
          : isPizza
          ? "pizza making"
          : isGrilling
          ? "grilling"
          : "baking"
      } with your ${eggSize} Big Green Egg:\n\n`;

      if (isSmoking) {
        accessoryMessage +=
          "1. **[ConvEGGtor / Plate Setter](https://biggreenegg.com/collections/ceramics-grids/products/conveggtor)** ($99.99) - Essential for indirect cooking and smoking, creates the perfect environment for low & slow cooking.\n\n" +
          "2. **[EGG Genius Temperature Controller](https://biggreenegg.com/collections/temperature-control/products/egg-genius-temperature-controller)** ($249.99) - Monitor and adjust your EGG's temperature remotely, perfect for long smoking sessions.\n\n" +
          "3. **[Premium Whiskey Barrel Smoking Chips](https://biggreenegg.com/collections/charcoal-wood-starters/products/premium-whiskey-barrel-smoking-chips-2-9-l-180-cu-in)** ($14.99) - Add delicious smoky flavor to your foods.\n\n" +
          "4. **[Apple Smoking Chips](https://biggreenegg.com/collections/charcoal-wood-starters/products/apple-smoking-chips-2-9-l-180-cu-in)** ($14.99) - Mild, sweet smoking chips perfect for poultry and pork.\n\n" +
          "5. **[Hickory Smoking Chips](https://biggreenegg.com/collections/charcoal-wood-starters/products/hickory-smoking-chips-2-9-l-180-cu-in)** ($14.99) - Classic smoking flavor, perfect for traditional BBQ.\n\n" +
          "6. **[Dual-Probe Remote Thermometer](https://biggreenegg.com/collections/temperature-control)** - Monitor both meat and ambient temperature for perfect results.\n\n" +
          '7. **[Brisket Knife 12" Stainless Steel](https://biggreenegg.com/products/brisket-knife-12-stainless-steel)** ($29.99) - Perfect for slicing through your smoked meats with precision.\n\n' +
          "Would you like more specific information about any of these smoking accessories?";
      } else if (isPizza) {
        accessoryMessage +=
          "1. **[Pizza & Baking Stone](https://biggreenegg.com/collections/pizza/products/pizza-baking-stone)** ($69.99) - Produces perfectly crisp crusts for restaurant-quality pizzas.\n\n" +
          "2. **[Pizza Oven Wedge](https://biggreenegg.com/collections/pizza/products/pizza-oven-wedge-for-large-egg)** ($119.99) - Creates the perfect environment for cooking pizzas with crispy crusts and perfectly melted toppings.\n\n" +
          "3. **[Aluminum Pizza Peel](https://biggreenegg.com/collections/pizza/products/aluminum-pizza-peel)** ($39.99) - Essential tool for sliding pizzas in and out of your EGG.\n\n" +
          "4. **[Pizza Cutter Wheel](https://biggreenegg.com/collections/pizza/products/pizza-cutter-wheel)** ($24.99) - Stainless steel wheel for clean, precise cuts through your pizza.\n\n" +
          "5. **[Complete Pizza Making Bundle](https://biggreenegg.com)** ($239.99) - Everything you need for making perfect pizzas, includes stone, peel, cutter, and more.\n\n" +
          "Would you like more specific information about any of these pizza accessories?";
      } else if (isGrilling) {
        accessoryMessage +=
          "1. **[Cast Iron Cooking Grid](https://biggreenegg.com/collections/ceramics-grids)** - For perfect sear marks and excellent heat retention on your grilled foods.\n\n" +
          "2. **[Stainless Steel Grid](https://biggreenegg.com/collections/ceramics-grids/products/stainless-steel-grid)** ($41.99) - Durable cooking surface perfect for traditional grilling.\n\n" +
          "3. **[Cast Iron Plancha Griddle](https://biggreenegg.com/collections/cookware-tools)** - Ideal for grilling smaller items, vegetables, and seafood without them falling through the grates.\n\n" +
          "4. **[Grill Tongs](https://biggreenegg.com/collections/cookware-tools)** - Precision tools for turning and handling food on the grill.\n\n" +
          "5. **[Instant Read Thermometer](https://biggreenegg.com/collections/temperature-control)** - Ensures your grilled foods are cooked to perfection.\n\n" +
          "Would you like more specific information about any of these grilling accessories?";
      } else {
        accessoryMessage +=
          "1. **[Pizza & Baking Stone](https://biggreenegg.com/collections/pizza/products/pizza-baking-stone)** ($69.99) - Perfect for baking breads, cookies, and other baked goods.\n\n" +
          "2. **[ConvEGGtor / Plate Setter](https://biggreenegg.com/collections/ceramics-grids/products/conveggtor)** ($99.99) - Essential for indirect cooking and baking, creates a convection oven-like environment.\n\n" +
          "3. **[Cast Iron Dutch Oven](https://biggreenegg.com/collections/cookware-tools)** - Ideal for baking breads, cobblers, and other desserts in your EGG.\n\n" +
          "4. **[Ceramic Baking Dishes](https://biggreenegg.com/collections/cookware-tools)** - Perfect for baking casseroles and side dishes.\n\n" +
          "5. **[EGG Genius Temperature Controller](https://biggreenegg.com/collections/temperature-control/products/egg-genius-temperature-controller)** ($249.99) - Maintain precise temperatures for consistent baking results.\n\n" +
          "Would you like more specific information about any of these baking accessories?";
      }

      return NextResponse.json({
        messages: [createMessage("assistant", accessoryMessage)],
        category: "product_recommendation",
      });
    }

    // For weight and spec queries, directly check product search first
    if (isWeightOrSpecQuery) {
      console.log("Detected weight/specification query:", lastMessage.content);
      console.log("Terms detected:");

      if (queryLowerMessage.includes("weight")) console.log("- 'weight' found");
      if (queryLowerMessage.includes("weigh")) console.log("- 'weigh' found");
      if (queryLowerMessage.includes("how heavy"))
        console.log("- 'how heavy' found");
      if (queryLowerMessage.includes("how much does"))
        console.log("- 'how much does' found");
      if (
        queryLowerMessage.includes("pounds") ||
        queryLowerMessage.includes("lbs")
      )
        console.log("- weight units found");
      if (queryLowerMessage.includes("egg")) console.log("- 'egg' found");
      if (containsEggSize(queryLowerMessage)) console.log("- egg size found");

      // Search for matching products
      const matchingProducts = searchProducts(lastMessage.content, 10); // Increase max results for better matching
      console.log(
        `Search returned ${matchingProducts.length} products for weight/spec query`
      );

      // If we found matches, generate a response
      if (matchingProducts.length > 0) {
        console.log(
          "Matching products:",
          matchingProducts.map((p) => p.id)
        );
        const productResponse = generateProductResponse(matchingProducts);

        return NextResponse.json({
          messages: [createMessage("assistant", productResponse)],
          category: "product",
        });
      }

      // If no matches, continue to standard flow
      console.log(
        "No product matches found for weight/spec query, continuing to standard flow"
      );
    }

    // Standard query processing order
    // Check for FAQ queries
    if (isFAQQuery(lastMessage.content)) {
      console.log("Detected FAQ query:", lastMessage.content);

      // Search for matching FAQs
      const matchingFAQs = searchFAQs(lastMessage.content);

      // If we found matches, generate a response
      if (matchingFAQs.length > 0) {
        const faqResponse = generateFAQResponse(matchingFAQs);

        return NextResponse.json({
          messages: [createMessage("assistant", faqResponse)],
          category: "faq",
        });
      }

      // If no matches, continue to OpenAI
      console.log("No FAQ matches found, continuing to general response");
    }

    // Check for product search queries - prioritize this over accessory recommendations
    if (isProductSearchQuery(lastMessage.content)) {
      console.log("Detected product search query:", lastMessage.content);

      // Log if this is a weight or specification query
      const searchLowerMessage = lastMessage.content.toLowerCase();
      if (
        searchLowerMessage.includes("weight") ||
        searchLowerMessage.includes("heavy") ||
        searchLowerMessage.includes("how much does") ||
        searchLowerMessage.includes("pounds") ||
        searchLowerMessage.includes("lbs") ||
        searchLowerMessage.includes("specifications") ||
        searchLowerMessage.includes("specs") ||
        searchLowerMessage.includes("dimensions")
      ) {
        console.log("This appears to be a weight/specification query");
      }

      // Check for egg size
      if (containsEggSize(searchLowerMessage)) {
        console.log("Query contains egg size reference");
      }

      // Search for matching products
      const matchingProducts = searchProducts(lastMessage.content);

      console.log(`Search returned ${matchingProducts.length} products`);
      if (matchingProducts.length > 0) {
        console.log(
          "Matching products:",
          matchingProducts.map((p) => p.id)
        );
      }

      // If we found matches, generate a response
      if (matchingProducts.length > 0) {
        console.log(`Found ${matchingProducts.length} matching products`);
        const productResponse = generateProductResponse(matchingProducts);

        return NextResponse.json({
          messages: [createMessage("assistant", productResponse)],
          category: "product",
        });
      }

      // If no matches, continue to OpenAI
      console.log("No product matches found, continuing to general response");
    }

    // Add after the product search section (around line 1480)
    // Check for product recommendation queries that should use guided selection
    if (isProductRecommendation(lastMessage.content)) {
      console.log("Product recommendation request detected");

      // Direct handler for specific cooking capacity queries
      const cookingCapacityPattern = /(?:i|we)?\s*cook(?:ing)?\s+for\s+(\d+)/i;
      const cookingMatch = lastMessage.content.match(cookingCapacityPattern);

      if (cookingMatch && cookingMatch[1]) {
        try {
          const peopleCount = parseInt(cookingMatch[1], 10);
          console.log(`Detected cooking for ${peopleCount} people query`);

          // Get the appropriate recommendation
          let recommendedSize;
          let recommendedName;

          if (peopleCount >= 15) {
            recommendedSize = "2XL";
            recommendedName = "2XL Big Green Egg";
          } else if (peopleCount >= 8) {
            recommendedSize = "XL";
            recommendedName = "XL Big Green Egg";
          } else if (peopleCount >= 4) {
            recommendedSize = "Large";
            recommendedName = "Large Big Green Egg";
          } else if (peopleCount >= 2) {
            recommendedSize = "Medium";
            recommendedName = "Medium Big Green Egg";
          } else {
            recommendedSize = "Small";
            recommendedName = "Small Big Green Egg";
          }

          console.log(
            `Recommending ${recommendedSize} for ${peopleCount} people`
          );

          // Create direct response without dependencies on other functions
          const responseMessage =
            `Based on your needs cooking for ${peopleCount} people, I recommend the **[${recommendedName}](https://biggreenegg.com/collections/all-eggs-egg-packages)**.\n\n` +
            (peopleCount >= 15
              ? "The 2XL Big Green Egg is our largest size, perfect for commercial settings, restaurants, or cooking for very large gatherings. It can cook up to 20 steaks at once and provides ample space for multiple dishes."
              : peopleCount >= 8
              ? "The XL Big Green Egg is ideal for larger families and those who entertain frequently. It can cook two 20-pound turkeys at once and is perfect for feeding 8-15 people."
              : peopleCount >= 4
              ? "The Large Big Green Egg is our most popular size, perfect for most families. It offers versatility for cooking everything from appetizers to entrees for 4-8 people."
              : peopleCount >= 2
              ? "The Medium Big Green Egg is perfect for smaller families (2-4 people) or limited spaces. It still provides plenty of cooking area while taking up less room."
              : "The Small Big Green Egg is great for individuals, couples, or small spaces like balconies and small patios.") +
            "\n\nWould you like to see some accessories that work well with this size?";

          return NextResponse.json({
            messages: [createMessage("assistant", responseMessage)],
            category: "product_recommendation",
          });
        } catch (error) {
          console.error("Error processing cooking capacity query:", error);
        }
      }

      // Check if it's a general product recommendation request (not asking for a specific product)
      const isGeneralRecommendationRequest =
        (lastMessage.content.toLowerCase().includes("recommend") ||
          lastMessage.content.toLowerCase().includes("suggest")) &&
        !lastMessage.content.toLowerCase().includes("specific product") &&
        !lastMessage.content.toLowerCase().includes("egg size") &&
        !lastMessage.content.toLowerCase().includes("egg genius") &&
        !lastMessage.content.toLowerCase().includes("pizza stone") &&
        !lastMessage.content.toLowerCase().includes("eggspander") &&
        !lastMessage.content.toLowerCase().includes("fire bowl");

      // Use guided selection for general product recommendations
      if (
        isGeneralRecommendationRequest ||
        isGuidedSelectionQuery(lastMessage.content)
      ) {
        console.log("Using guided product selection flow");
        const guidedMessage = generateGuidedSelectionMessage();

        return NextResponse.json({
          messages: [createMessage("assistant", guidedMessage)],
          category: "product_recommendation",
        });
      }

      // If asking specifically about egg sizes
      if (isProductSelectionQuery(lastMessage.content)) {
        console.log("Egg size recommendation requested");

        // Generate an initial question to help determine the right size
        const sizeQuestionMessage =
          "To help you find the perfect Big Green Egg size, I need to understand your needs better. Could you tell me:\n\n" +
          "• How many people do you typically cook for?\n\n" +
          "• Do you entertain frequently with larger groups?\n\n" +
          "• How much outdoor space do you have available?\n\n" +
          "• Do you need portability or will this be in a fixed location?";

        return NextResponse.json({
          messages: [createMessage("assistant", sizeQuestionMessage)],
          category: "product_recommendation",
        });
      }
    }

    // If we got here, continue with OpenAI

    // If the user's question is specifically about products but we didn't find matches,
    // use the guided product selection rather than generic AI
    if (isProductRecommendation(lastMessage.content)) {
      console.log("No specific product matches found, using guided selection");
      const guidedMessage = generateGuidedSelectionMessage();

      return NextResponse.json({
        messages: [createMessage("assistant", guidedMessage)],
        category: "product_recommendation",
      });
    }

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

    // Authentication errors and API errors (ensure 200 response)
    return NextResponse.json(
      {
        messages: [
          createMessage(
            "assistant",
            "Failed to process chat request. Please try again."
          ),
        ],
      },
      { status: 200 }
    );
  }
}

// Helper function to check if a message is asking for product recommendations
function isProductRecommendation(message: string): boolean {
  const lowerMessage = message.toLowerCase();

  // First check for specific product searches that should be handled by product search
  // rather than accessory recommendation flow
  if (
    lowerMessage.includes("egg genius") ||
    lowerMessage.includes("temperature controller") ||
    lowerMessage.includes("pizza stone") ||
    lowerMessage.includes("pizza oven") ||
    lowerMessage.includes("eggspander") ||
    lowerMessage.includes("fire bowl") ||
    (lowerMessage.includes("buy") &&
      (lowerMessage.includes("egg genius") ||
        lowerMessage.includes("pizza stone") ||
        lowerMessage.includes("eggspander")))
  ) {
    // These should be handled by product search instead
    return false;
  }

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

// Add this function near the other detection functions (around line 1500)
function isFAQQuery(message: string): boolean {
  const lowerMessage = message.toLowerCase();

  // Skip FAQ classification if this is a weight or specification query
  if (
    (lowerMessage.includes("weight") ||
      lowerMessage.includes("weigh") ||
      lowerMessage.includes("how heavy") ||
      lowerMessage.includes("how much does") ||
      lowerMessage.includes("pounds") ||
      lowerMessage.includes("lbs") ||
      lowerMessage.includes("specifications") ||
      lowerMessage.includes("specs") ||
      lowerMessage.includes("dimensions") ||
      lowerMessage.includes("cooking area") ||
      lowerMessage.includes("size of") ||
      (lowerMessage.includes("how big") && lowerMessage.includes("egg"))) &&
    (lowerMessage.includes("egg") || containsEggSize(lowerMessage))
  ) {
    console.log("Skipping FAQ classification for weight/specification query");
    return false;
  }

  // Check for question patterns
  if (
    lowerMessage.startsWith("what") ||
    lowerMessage.startsWith("how") ||
    lowerMessage.startsWith("why") ||
    lowerMessage.startsWith("can") ||
    lowerMessage.startsWith("is") ||
    lowerMessage.startsWith("are") ||
    lowerMessage.startsWith("do") ||
    lowerMessage.startsWith("does") ||
    lowerMessage.includes("?")
  ) {
    // Check for ceramic cooker and Big Green Egg related terms
    return (
      lowerMessage.includes("ceramic") ||
      lowerMessage.includes("kamado") ||
      lowerMessage.includes("egg") ||
      lowerMessage.includes("bge") ||
      lowerMessage.includes("big green") ||
      lowerMessage.includes("cooker") ||
      lowerMessage.includes("grill") ||
      lowerMessage.includes("smoker") ||
      lowerMessage.includes("charcoal") ||
      lowerMessage.includes("temperature") ||
      lowerMessage.includes("smoking") ||
      lowerMessage.includes("cooking") ||
      lowerMessage.includes("heat") ||
      lowerMessage.includes("fire") ||
      lowerMessage.includes("hot") ||
      lowerMessage.includes("ash") ||
      lowerMessage.includes("clean")
    );
  }

  return false;
}

// Helper function to check if message contains any egg size variation
function containsEggSize(message: string): boolean {
  const lowerMessage = message.toLowerCase();
  const eggSizeVariations = [
    [
      "2xl",
      "2-xl",
      "2 xl",
      "xxl",
      "xx-large",
      "xxlarge",
      "2x large",
      "2xlarge",
      "2-extra large",
      "2-extra-large",
      "double extra large",
    ],
    [
      "xl",
      "x-large",
      "x large",
      "xlarge",
      "x-l",
      "extra large",
      "extra-large",
      "extralarge",
      "xtra large",
      "xtra-large",
    ],
    ["large", "lg", "l"],
    ["medium", "med", "m"],
    ["small", "sm", "s"],
    ["minimax", "mini max", "mini-max"],
    ["mini"],
  ];

  for (const variations of eggSizeVariations) {
    if (variations.some((v) => lowerMessage.includes(v))) {
      return true;
    }
  }

  return false;
}

// Add this function near the other detection functions (around line 1500)
function isProductSearchQuery(message: string): boolean {
  const lowerMessage = message.toLowerCase();

  // Check for weight-related queries about eggs
  if (
    (lowerMessage.includes("weight") ||
      lowerMessage.includes("how heavy") ||
      lowerMessage.includes("how much does") ||
      lowerMessage.includes("pounds") ||
      lowerMessage.includes("lbs")) &&
    (lowerMessage.includes("egg") || containsEggSize(lowerMessage))
  ) {
    return true;
  }

  // First check for specific product mentions that should always trigger product search
  if (
    lowerMessage.includes("egg genius") ||
    lowerMessage.includes("temperature controller") ||
    lowerMessage.includes("pizza stone") ||
    lowerMessage.includes("pizza oven") ||
    lowerMessage.includes("eggspander") ||
    lowerMessage.includes("fire bowl") ||
    (lowerMessage.includes("buy") &&
      (lowerMessage.includes("egg genius") ||
        lowerMessage.includes("pizza stone") ||
        lowerMessage.includes("eggspander") ||
        lowerMessage.includes("specific product")))
  ) {
    return true;
  }

  // Check for product search patterns
  const productSearchPatterns = [
    /where can i (find|buy|get|purchase)/i,
    /how much (is|does|costs?)/i,
    /price of/i,
    /looking for/i,
    /do you (have|sell|offer)/i,
    /show me/i,
    /tell me about/i,
    /information (on|about)/i,
    /search for/i,
    /find me/i,
    /i need/i,
    /i want/i,
    /i'm interested in/i,
    /can i get/i,
    // Add patterns for weight and specification queries
    /how (heavy|much) (is|does|weighs)/i,
    /weight of/i,
    /specifications (of|for)/i,
    /what are the (specs|specifications|dimensions|measurements)/i,
  ];

  // Check if any product search pattern matches
  const isSearchPattern = productSearchPatterns.some((pattern) =>
    pattern.test(lowerMessage)
  );

  // Check for product category terms
  const containsProductTerms = [
    "egg",
    "grill",
    "cooker",
    "kamado",
    "table",
    "stand",
    "nest",
    "accessory",
    "accessories",
    "cover",
    "grid",
    "charcoal",
    "wood chips",
    "smoking",
    "pizza",
    "stone",
    "thermometer",
    "temperature",
    "controller",
    "eggspander",
    "conveggtor",
    "plate setter",
    "fire bowl",
    "firebox",
    "gasket",
    "replacement",
    "part",
    "parts",
    "shirt",
    "apparel",
    "hoodie",
    "t-shirt",
    "tshirt",
    "package",
    "modular",
    "acacia",
    "hardwood",
    "insert",
    "handler",
    "mates",
    "shelves",
    "fire ring",
    "dome",
    "base",
    "ceramic",
    // Add weight and specification related terms
    "weight",
    "heavy",
    "pounds",
    "lbs",
    "kg",
    "specifications",
    "specs",
    "dimensions",
    "size",
    "measurements",
    "cooking area",
    "capacity",
  ].some((term) => lowerMessage.includes(term));

  // Return true if it matches a search pattern AND contains product terms
  // OR if it explicitly mentions "product" or "buy"
  return (
    (isSearchPattern && containsProductTerms) ||
    lowerMessage.includes("product") ||
    lowerMessage.includes("buy")
  );
}
