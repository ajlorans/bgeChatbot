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

    // Extract email first
    const emailMatch = lastMessage.content.match(
      /([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9._-]+)/i
    );
    const email = emailMatch ? emailMatch[1] : null;

    // Look for order number
    const orderNumber = lastMessage.content.match(
      /(?:order[:#\s]*)?#?(\d{5,})/i
    )?.[1];

    // If we have an order number or email, process it immediately
    if (orderNumber || email) {
      try {
        // Use the current request URL to determine the correct port
        const currentUrl = new URL(req.url);
        const baseUrl = `${currentUrl.protocol}//${currentUrl.host}`;

        const response = await fetch(`${baseUrl}/api/shopify`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            action: "getOrderStatus",
            orderId: orderNumber,
            email: email,
          }),
        });

        const data = await response.json();

        if (data.error) {
          let errorMessage =
            "I apologize, but I couldn't find any information. ";
          if (orderNumber) {
            errorMessage += `Please verify your order number (#${orderNumber}) and try again, or you can try searching with your email address instead.`;
          } else if (email) {
            errorMessage += `I couldn't find any orders associated with the email address ${email}. Please verify your email address and try again, or you can try searching with your order number instead.`;
          }
          return NextResponse.json({
            messages: [createMessage("assistant", errorMessage)],
          });
        }

        // If email search returned multiple orders
        if (
          data.orders &&
          Array.isArray(data.orders) &&
          data.orders.length > 0
        ) {
          const orderList = data.orders
            .map(
              (order: ShopifyOrder) =>
                `• Order ${order.name} - ${new Date(
                  order.created_at
                ).toLocaleDateString()} - ${order.financial_status}`
            )
            .join("\n");

          const message = `I found the following orders associated with your email address:\n\n${orderList}\n\nTo get detailed information about a specific order, please provide the order number you'd like to check.`;

          return NextResponse.json({
            messages: [createMessage("assistant", message)],
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
        console.error("Error fetching order status:", error);
        return NextResponse.json({
          messages: [
            createMessage(
              "assistant",
              "I apologize, but I encountered an error while checking your order status. Please try again later."
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
