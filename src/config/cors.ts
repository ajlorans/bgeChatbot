// Environment-based allowed origins
export const getAllowedOrigins = () => {
  // TEMPORARY FIX: Always return wildcard during debugging
  return ["*"];

  /* Original implementation to be restored after debugging
  const env = process.env.NODE_ENV || "development";

  if (env === "production") {
    // Get origins from environment variable
    const allowedOriginsFromEnv = process.env.ALLOWED_ORIGINS || "";
    const originsArray = allowedOriginsFromEnv.split(",").filter(Boolean);

    // Always include Vercel URL if available
    const vercelUrl = process.env.VERCEL_URL;
    if (vercelUrl && !originsArray.includes(`https://${vercelUrl}`)) {
      originsArray.push(`https://${vercelUrl}`);
    }

    // Include Shopify store URL
    const shopifyStoreUrl = process.env.SHOPIFY_STORE_URL;
    if (
      shopifyStoreUrl &&
      !originsArray.includes(`https://${shopifyStoreUrl}`)
    ) {
      originsArray.push(`https://${shopifyStoreUrl}`);
    }

    // If no origins are configured, use a safe default
    if (originsArray.length === 0) {
      return [
        "https://66ad5a-5c.myshopify.com",
        "https://your-project.vercel.app",
      ];
    }

    return originsArray;
  }

  return [
    "http://localhost:3000",
    "http://localhost:3001",
    "http://127.0.0.1:3000",
    "http://127.0.0.1:3001",
    "*", // Add wildcard to support all local development scenarios
  ];
  */
};

// CORS configuration
export const corsConfig = {
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
  allowedHeaders: [
    "Content-Type",
    "Authorization",
    "Origin",
    "X-Requested-With",
    "Accept",
    "X-CSRF-Token",
    "Cache-Control",
    "X-Auth-Token",
    "X-Socket-ID",
    "Cookie",
  ],
  maxAge: 86400, // 24 hours
  credentials: true,
};
