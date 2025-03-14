import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import { createMessage, defaultSystemPrompt } from "@/lib/utils";
import { Message } from "@/lib/types";

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

    // Check for product registration request
    if (
      lastMessage.content.toLowerCase().includes("register") &&
      (lastMessage.content.toLowerCase().includes("product") ||
        lastMessage.content.toLowerCase().includes("warranty") ||
        lastMessage.content.toLowerCase().includes("egg"))
    ) {
      const registrationMessage =
        "To register your Big Green Egg product for warranty purposes, please visit our official website at [Big Green Egg Warranty Registration](https://biggreenegg.com/pages/warranty) and follow the instructions provided. If you encounter any difficulties, feel free to reach out to our customer service team for assistance.";

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

    // Check for general customer support request
    if (
      lowerMessage.includes("customer support assistance") ||
      (lowerMessage.includes("customer support") &&
        !lowerMessage.includes("assembly"))
    ) {
      const supportMessage =
        "I'd be happy to help with customer support. What specific assistance do you need today? I can help with:\n\n" +
        "• Assembly and setup questions\n" +
        "• Product troubleshooting\n" +
        "• Warranty information\n" +
        "• Replacement parts\n" +
        "• Cooking techniques\n" +
        "• Maintenance and cleaning\n\n" +
        "Please let me know what you need help with, and I'll provide the relevant information.";

      return NextResponse.json({
        messages: [createMessage("assistant", supportMessage)],
        category: "customer_support",
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

    // Check for cooking-related queries
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

        return NextResponse.json({
          messages: [createMessage("assistant", pizzaMessage)],
          category: "tips_and_tricks",
        });
      }

      // General cooking query
      const cookingMessage =
        "I'd be happy to help with cooking tips! What specific dish or cooking technique would you like to learn about? I can provide guidance on:\n\n" +
        "• Grilling techniques (direct/indirect heat)\n" +
        "• Smoking methods and wood choices\n" +
        "• Temperature control tips\n" +
        "• Specific recipes (pizza, brisket, ribs, etc.)\n" +
        "• Baking in your EGG\n" +
        "• Roasting techniques\n\n" +
        "Let me know what you'd like to cook, and I'll provide specific instructions!";

      return NextResponse.json({
        messages: [createMessage("assistant", cookingMessage)],
        category: "tips_and_tricks",
      });
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
        lowerMessage.includes("browse"))
    ) {
      // Temperature controllers
      if (
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
        if (lowerMessage.includes("large") && lowerMessage.includes("table")) {
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
        (lowerMessage.includes("product") || lowerMessage.includes("browse")) &&
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

    // Check for order status inquiry with keywords
    if (
      lastMessage.content.toLowerCase().includes("order") &&
      (lastMessage.content.toLowerCase().includes("status") ||
        lastMessage.content.toLowerCase().includes("track") ||
        lastMessage.content.toLowerCase().includes("where") ||
        lastMessage.content.toLowerCase().includes("check"))
    ) {
      // Check if both email and order number are provided
      const emailMatch = lastMessage.content.match(
        /([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9._-]+)/i
      );
      const orderNumberMatch = lastMessage.content.match(
        /(?:order[:#\s]*)?#?(\d{5,})/i
      );

      const email = emailMatch ? emailMatch[1] : null;
      const orderNumber = orderNumberMatch ? orderNumberMatch[1] : null;

      // If both email and order number are not provided, ask for both
      if (!email || !orderNumber) {
        const orderStatusMessage =
          "For security purposes, please provide both your order number (e.g., #123456) and the email address associated with the order to check your order status.";

        return NextResponse.json({
          messages: [createMessage("assistant", orderStatusMessage)],
          category: "order_status",
        });
      }

      // If both email and order number are provided, proceed with order lookup
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

    // Initialize OpenAI client
    const openai = new OpenAI({
      apiKey: OPENAI_API_KEY,
    });

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
