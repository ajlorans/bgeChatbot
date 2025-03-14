import { NextRequest, NextResponse } from "next/server";

// Shopify credentials - used in the POST function below
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const SHOPIFY_STORE_URL = process.env.SHOPIFY_STORE_URL || "";
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const SHOPIFY_ACCESS_TOKEN = process.env.SHOPIFY_ACCESS_TOKEN || "";

// Removed unused Shopify API version constant

interface ShopifyOrder {
  id: string;
  name: string;
  order_number?: string | number;
  status?: string;
  fulfillment_status: string;
  financial_status: string;
  created_at: string;
  total_price: string;
  currency: string;
  line_items: Array<{
    name: string;
    quantity: number;
    price: string;
  }>;
  tracking_number?: string;
  tracking_url?: string;
  estimated_delivery?: string;
}

interface GraphQLOrderEdge {
  node: {
    name: string;
    createdAt: string;
    displayFinancialStatus: string;
  };
}

interface GraphQLLineItemEdge {
  node: {
    name: string;
    quantity: number;
    originalUnitPriceSet: {
      shopMoney: {
        amount: string;
        currencyCode: string;
      };
    };
  };
}

// Comment out unused function
/*
async function getShopifyOrder(orderId: string) {
  try {
    // Remove any non-numeric characters from the order ID
    const cleanOrderId = orderId.replace(/\D/g, "");

    console.log("Attempting to fetch order with:", {
      url: SHOPIFY_STORE_URL,
      cleanOrderId,
      apiVersion: SHOPIFY_API_VERSION,
    });

    // Search for orders with the given order number
    const response = await fetch(
      `https://${SHOPIFY_STORE_URL}/admin/api/${SHOPIFY_API_VERSION}/orders.json?status=any&name=${cleanOrderId}`,
      {
        headers: {
          "X-Shopify-Access-Token": SHOPIFY_ACCESS_TOKEN,
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Shopify API error response:", {
        status: response.status,
        statusText: response.statusText,
        body: errorText,
        url: response.url,
      });
      throw new Error(`Shopify API error: ${response.status}`);
    }

    const data = await response.json();
    console.log("Shopify API raw response:", data);

    // Find the order with matching name (display number) or order_number
    const matchingOrder = data.orders?.find(
      (order: ShopifyOrder) =>
        order.name === `#${cleanOrderId}` ||
        (order.order_number && order.order_number.toString() === cleanOrderId)
    );

    if (matchingOrder) {
      console.log("Found order:", matchingOrder);
      return matchingOrder;
    }

    console.log("No order found with ID:", cleanOrderId);
    throw new Error("Order not found");
  } catch (error) {
    console.error("Error fetching Shopify order:", error);
    throw error;
  }
}
*/

export async function POST(req: NextRequest) {
  try {
    const { action, orderId, email, requireBoth } = await req.json();

    // Check for required Shopify credentials
    const shopifyStoreUrl = process.env.SHOPIFY_STORE_URL;
    const shopifyAccessToken = process.env.SHOPIFY_ACCESS_TOKEN;

    if (!shopifyStoreUrl || !shopifyAccessToken) {
      return NextResponse.json({
        error: "Shopify credentials not configured",
      });
    }

    if (action === "getOrderStatus") {
      // If requireBoth flag is set, ensure both orderId and email are provided
      if (requireBoth && (!orderId || !email)) {
        return NextResponse.json({
          error: "Both order ID and email are required for security purposes",
        });
      }

      let query;

      if (orderId && email && requireBoth) {
        // Search by both order name/number and customer email for security
        query = `
          query {
            customers(first: 1, query: "email:${email}") {
              edges {
                node {
                  orders(first: 10, query: "name:${orderId}") {
                    edges {
                      node {
                        id
                        name
                        displayFulfillmentStatus
                        displayFinancialStatus
                        createdAt
                        totalPriceSet {
                          shopMoney {
                            amount
                            currencyCode
                          }
                        }
                        lineItems(first: 10) {
                          edges {
                            node {
                              name
                              quantity
                              originalUnitPriceSet {
                                shopMoney {
                                  amount
                                  currencyCode
                                }
                              }
                            }
                          }
                        }
                        fulfillments {
                          trackingInfo {
                            number
                            url
                          }
                          estimatedDeliveryAt
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        `;
      } else if (orderId) {
        // Search by order name/number
        query = `
          query {
            orders(first: 1, query: "name:${orderId}") {
              edges {
                node {
                  id
                  name
                  displayFulfillmentStatus
                  displayFinancialStatus
                  createdAt
                  totalPriceSet {
                    shopMoney {
                      amount
                      currencyCode
                    }
                  }
                  lineItems(first: 10) {
                    edges {
                      node {
                        name
                        quantity
                        originalUnitPriceSet {
                          shopMoney {
                            amount
                            currencyCode
                          }
                        }
                      }
                    }
                  }
                  fulfillments {
                    trackingInfo {
                      number
                      url
                    }
                    estimatedDeliveryAt
                  }
                }
              }
            }
          }
        `;
      } else if (email) {
        // Search by customer email
        query = `
          query {
            customers(first: 1, query: "email:${email}") {
              edges {
                node {
                  orders(first: 5) {
                    edges {
                      node {
                        id
                        name
                        displayFulfillmentStatus
                        displayFinancialStatus
                        createdAt
                        totalPriceSet {
                          shopMoney {
                            amount
                            currencyCode
                          }
                        }
                        lineItems(first: 10) {
                          edges {
                            node {
                              name
                              quantity
                              originalUnitPriceSet {
                                shopMoney {
                                  amount
                                  currencyCode
                                }
                              }
                            }
                          }
                        }
                        fulfillments {
                          trackingInfo {
                            number
                            url
                          }
                          estimatedDeliveryAt
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        `;
      } else {
        return NextResponse.json({
          error: "No order ID or email provided",
        });
      }

      // Add https:// to the store URL if it's not already there
      const fullShopifyUrl = shopifyStoreUrl.startsWith("http")
        ? shopifyStoreUrl
        : `https://${shopifyStoreUrl}`;

      // Create an AbortController to handle timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

      try {
        const response = await fetch(
          `${fullShopifyUrl}/admin/api/2024-01/graphql.json`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "X-Shopify-Access-Token": shopifyAccessToken,
            },
            body: JSON.stringify({ query }),
            signal: controller.signal,
          }
        );

        clearTimeout(timeoutId); // Clear the timeout if the request completes

        if (!response.ok) {
          console.error("Shopify API error:", await response.text());
          return NextResponse.json({
            error: "Failed to fetch order from Shopify",
          });
        }

        const result = await response.json();

        // Check if there are any errors in the GraphQL response
        if (result.errors) {
          console.error("GraphQL errors:", result.errors);
          return NextResponse.json({
            error: "Failed to fetch order from Shopify",
          });
        }

        // Handle email search results differently
        if (email && requireBoth) {
          const customerOrders =
            result.data?.customers?.edges[0]?.node?.orders?.edges || [];

          if (customerOrders.length === 0) {
            return NextResponse.json({
              error:
                "No orders found matching both the email address and order number",
            });
          }

          // For security, we only return a single order when both email and order number are provided
          const orderData = customerOrders[0].node;
          const transformedOrder: ShopifyOrder = {
            id: orderData.id,
            name: orderData.name,
            fulfillment_status:
              orderData.displayFulfillmentStatus?.toLowerCase() ||
              "unfulfilled",
            financial_status: orderData.displayFinancialStatus.toLowerCase(),
            created_at: orderData.createdAt,
            total_price: orderData.totalPriceSet.shopMoney.amount,
            currency: orderData.totalPriceSet.shopMoney.currencyCode,
            line_items: orderData.lineItems.edges.map(
              (edge: GraphQLLineItemEdge) => ({
                name: edge.node.name,
                quantity: edge.node.quantity,
                price: edge.node.originalUnitPriceSet.shopMoney.amount,
              })
            ),
          };

          // Add tracking info if available
          if (
            orderData.fulfillments &&
            orderData.fulfillments.length > 0 &&
            orderData.fulfillments[0].trackingInfo &&
            orderData.fulfillments[0].trackingInfo.length > 0
          ) {
            transformedOrder.tracking_number =
              orderData.fulfillments[0].trackingInfo[0].number;
            transformedOrder.tracking_url =
              orderData.fulfillments[0].trackingInfo[0].url;
            transformedOrder.estimated_delivery =
              orderData.fulfillments[0].estimatedDeliveryAt;
          }

          return NextResponse.json({
            order: transformedOrder,
          });
        } else if (email) {
          const customerOrders =
            result.data?.customers?.edges[0]?.node?.orders?.edges || [];

          if (customerOrders.length === 0) {
            return NextResponse.json({
              error: "No orders found for this email address",
            });
          }

          if (customerOrders.length > 1) {
            const orderList = customerOrders.map((edge: GraphQLOrderEdge) => ({
              name: edge.node.name,
              created_at: edge.node.createdAt,
              financial_status: edge.node.displayFinancialStatus.toLowerCase(),
            }));

            return NextResponse.json({
              orders: orderList,
            });
          }

          // Single order case
          const orderData = customerOrders[0].node;
          const transformedOrder: ShopifyOrder = {
            id: orderData.id,
            name: orderData.name,
            fulfillment_status:
              orderData.displayFulfillmentStatus?.toLowerCase() ||
              "unfulfilled",
            financial_status: orderData.displayFinancialStatus.toLowerCase(),
            created_at: orderData.createdAt,
            total_price: orderData.totalPriceSet.shopMoney.amount,
            currency: orderData.totalPriceSet.shopMoney.currencyCode,
            line_items: orderData.lineItems.edges.map(
              (edge: GraphQLLineItemEdge) => ({
                name: edge.node.name,
                quantity: edge.node.quantity,
                price: edge.node.originalUnitPriceSet.shopMoney.amount,
              })
            ),
          };

          if (orderData.fulfillments?.[0]?.trackingInfo?.[0]) {
            const tracking = orderData.fulfillments[0].trackingInfo[0];
            transformedOrder.tracking_number = tracking.number;
            transformedOrder.tracking_url = tracking.url;
            transformedOrder.estimated_delivery =
              orderData.fulfillments[0].estimatedDeliveryAt;
          }

          return NextResponse.json({
            order: transformedOrder,
          });
        }

        // Handle order number search results
        const orders = result.data?.orders?.edges || [];

        if (orders.length === 0) {
          return NextResponse.json({
            error: "Order not found",
          });
        }

        // Single order response
        const orderData = orders[0].node;
        const transformedOrder: ShopifyOrder = {
          id: orderData.id,
          name: orderData.name,
          fulfillment_status:
            orderData.displayFulfillmentStatus?.toLowerCase() || "unfulfilled",
          financial_status: orderData.displayFinancialStatus.toLowerCase(),
          created_at: orderData.createdAt,
          total_price: orderData.totalPriceSet.shopMoney.amount,
          currency: orderData.totalPriceSet.shopMoney.currencyCode,
          line_items: orderData.lineItems.edges.map(
            (edge: GraphQLLineItemEdge) => ({
              name: edge.node.name,
              quantity: edge.node.quantity,
              price: edge.node.originalUnitPriceSet.shopMoney.amount,
            })
          ),
        };

        // Add tracking information if available
        if (orderData.fulfillments?.[0]?.trackingInfo?.[0]) {
          const tracking = orderData.fulfillments[0].trackingInfo[0];
          transformedOrder.tracking_number = tracking.number;
          transformedOrder.tracking_url = tracking.url;
          transformedOrder.estimated_delivery =
            orderData.fulfillments[0].estimatedDeliveryAt;
        }

        return NextResponse.json({
          order: transformedOrder,
        });
      } catch (error) {
        clearTimeout(timeoutId); // Clear the timeout if there's an error
        console.error("Error fetching from Shopify API:", error);

        // Check if it's a timeout error
        if (error instanceof Error && error.name === "AbortError") {
          return NextResponse.json({
            error: "Request timed out. Please try again later.",
          });
        }

        return NextResponse.json({
          error: "Failed to fetch order from Shopify",
        });
      }
    }

    return NextResponse.json({
      error: "Invalid action",
    });
  } catch (error) {
    console.error("Error in Shopify API:", error);
    return NextResponse.json({
      error: "Failed to process request",
    });
  }
}

// Comment out unused mock functions
/*
function getMockOrderStatus(orderId: string) {
  const currentDate = new Date();
  const orderDate = new Date(currentDate);
  orderDate.setDate(currentDate.getDate() - 3); // Order placed 3 days ago

  const estimatedDelivery = new Date(currentDate);
  estimatedDelivery.setDate(currentDate.getDate() + 4); // Delivery in 4 days

  const mockOrder = {
    id: orderId,
    order_number: orderId,
    status: "processing",
    fulfillment_status: "in_transit",
    financial_status: "paid",
    created_at: orderDate.toISOString(),
    total_price: "1299.99",
    currency: "USD",
    line_items: [
      {
        name: "Big Green Egg Large",
        quantity: 1,
        price: "1199.99",
      },
      {
        name: "ConvEGGtor",
        quantity: 1,
        price: "99.99",
      },
    ],
    shipping_address: {
      address1: "123 Main St",
      city: "Springfield",
      province: "IL",
      country: "United States",
      zip: "62701",
    },
    fulfillments: [
      {
        tracking_number: "1Z999AA1234567890",
        tracking_url:
          "https://www.ups.com/track?loc=en_US&tracknum=1Z999AA1234567890",
        estimated_delivery_at: estimatedDelivery.toISOString(),
      },
    ],
  };

  return { order: mockOrder };
}

function getMockProductRecommendations(
  productType: string,
  preferences: string[]
) {
  const allProducts = [
    {
      id: "bge-mini",
      name: "Big Green Egg MiniMax",
      price: 599,
      description: "Perfect for balconies, tailgating, and camping.",
      imageUrl:
        "https://biggreenegg.com/wp-content/uploads/2019/02/minimax-700x700.png",
      features: ['13" cooking grid', "Portable", "Weighs 76 lbs"],
      bestFor: ["small spaces", "portability", "camping", "tailgating"],
    },
    {
      id: "bge-small",
      name: "Big Green Egg Small",
      price: 699,
      description: "Perfect for small families and limited spaces.",
      imageUrl:
        "https://biggreenegg.com/wp-content/uploads/2019/02/small-700x700.png",
      features: ['15" cooking grid', "Compact", "Weighs 80 lbs"],
      bestFor: ["small families", "limited space", "balconies", "apartments"],
    },
    {
      id: "bge-medium",
      name: "Big Green Egg Medium",
      price: 899,
      description: "The most popular size, perfect for most families.",
      imageUrl:
        "https://biggreenegg.com/wp-content/uploads/2019/02/medium-700x700.png",
      features: ['15" cooking grid', "Versatile", "Weighs 113 lbs"],
      bestFor: ["families", "regular cooking", "versatility"],
    },
    {
      id: "bge-large",
      name: "Big Green Egg Large",
      price: 1199,
      description: "The original and most versatile EGG size.",
      imageUrl:
        "https://biggreenegg.com/wp-content/uploads/2019/02/large-700x700.png",
      features: ['18.25" cooking grid', "Most popular", "Weighs 162 lbs"],
      bestFor: ["large families", "entertaining", "serious cooking"],
    },
    {
      id: "bge-xlarge",
      name: "Big Green Egg XLarge",
      price: 1699,
      description: "For large gatherings and serious entertainers.",
      imageUrl:
        "https://biggreenegg.com/wp-content/uploads/2019/02/xlarge-700x700.png",
      features: ['24" cooking grid', "Enormous capacity", "Weighs 219 lbs"],
      bestFor: ["large gatherings", "catering", "commercial use"],
    },
    {
      id: "conveggtor",
      name: "ConvEGGtor",
      price: 99,
      description: "Essential for indirect cooking and baking.",
      imageUrl:
        "https://biggreenegg.com/wp-content/uploads/2019/03/conveggtor-700x700.png",
      features: [
        "Ceramic heat shield",
        "Transforms your EGG into an outdoor oven",
      ],
      bestFor: ["indirect cooking", "baking", "smoking", "roasting"],
    },
    {
      id: "cast-iron-grid",
      name: "Cast Iron Cooking Grid",
      price: 129,
      description: "Perfect for searing steaks and creating grill marks.",
      imageUrl:
        "https://biggreenegg.com/wp-content/uploads/2019/03/cast-iron-grid-700x700.png",
      features: ["Excellent heat retention", "Creates perfect sear marks"],
      bestFor: ["steaks", "burgers", "searing", "high-heat cooking"],
    },
    {
      id: "charcoal",
      name: "Premium Organic Lump Charcoal",
      price: 29,
      description: "The highest quality charcoal for your EGG.",
      imageUrl:
        "https://biggreenegg.com/wp-content/uploads/2019/03/charcoal-700x700.png",
      features: ["100% organic", "No chemicals or fillers", "20 lb bag"],
      bestFor: ["all cooking", "long burns", "clean flavor"],
    },
  ];

  // Filter products based on type and preferences
  let filteredProducts = [...allProducts];

  if (productType) {
    if (
      productType.toLowerCase().includes("grill") ||
      productType.toLowerCase().includes("egg")
    ) {
      filteredProducts = filteredProducts.filter(
        (p) =>
          p.id.includes("bge-") &&
          !p.id.includes("conveggtor") &&
          !p.id.includes("grid") &&
          !p.id.includes("charcoal")
      );
    } else if (productType.toLowerCase().includes("accessory")) {
      filteredProducts = filteredProducts.filter(
        (p) =>
          p.id.includes("conveggtor") ||
          p.id.includes("grid") ||
          p.id.includes("charcoal")
      );
    }
  }

  if (preferences && preferences.length > 0) {
    // Score products based on how many preferences they match
    const scoredProducts = filteredProducts.map((product) => {
      let score = 0;

      // Check if any preference matches product features or bestFor
      preferences.forEach((pref) => {
        const prefLower = pref.toLowerCase();

        // Check product name and description
        if (
          product.name.toLowerCase().includes(prefLower) ||
          product.description.toLowerCase().includes(prefLower)
        ) {
          score += 2;
        }

        // Check features
        product.features.forEach((feature) => {
          if (feature.toLowerCase().includes(prefLower)) {
            score += 1;
          }
        });

        // Check bestFor if it exists
        if (product.bestFor) {
          product.bestFor.forEach((bf: string) => {
            if (bf.toLowerCase().includes(prefLower)) {
              score += 3; // Higher weight for bestFor matches
            }
          });
        }
      });

      return { ...product, score };
    });

    // Sort by score (highest first)
    scoredProducts.sort((a, b) => b.score - a.score);

    // Return top 3 products
    return { products: scoredProducts.slice(0, 3) };
  }

  // If no preferences, return random 3 products
  const shuffled = filteredProducts.sort(() => 0.5 - Math.random());
  return { products: shuffled.slice(0, 3) };
}
*/
