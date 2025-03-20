import { NextApiRequest } from "next";
import {
  initSocketServer,
  NextApiResponseWithSocket,
} from "@/lib/socketService";

export default function handler(
  req: NextApiRequest,
  res: NextApiResponseWithSocket
) {
  console.log("🔌 Socket handler called, initializing socket server...");
  console.log("🌐 Request origin:", req.headers.origin);
  console.log("🕒 Request time:", new Date().toISOString());

  try {
    // Add CORS headers for socket communication with more permissive settings
    const allowedOrigins =
      process.env.CORS_ALLOW_ALL === "true" ||
      process.env.NODE_ENV !== "production"
        ? "*"
        : process.env.ALLOWED_ORIGINS?.split(",") || [
            "https://bge-chatbot.vercel.app",
            "http://localhost:3000",
          ];

    const origin = req.headers.origin || "";
    console.log("🌐 Request from origin:", origin);
    console.log("✅ Allowed origins:", allowedOrigins);

    // Set CORS headers
    if (allowedOrigins === "*") {
      res.setHeader("Access-Control-Allow-Origin", "*");
      console.log("🌐 Setting CORS allow all origins");
    } else if (
      Array.isArray(allowedOrigins) &&
      (allowedOrigins.includes(origin) || origin === "")
    ) {
      res.setHeader("Access-Control-Allow-Origin", origin || "*");
      console.log(`🌐 Setting CORS for specific origin: ${origin || "*"}`);
    } else {
      // If origin not in allowed list but we need to respond, use * for development
      res.setHeader("Access-Control-Allow-Origin", "*");
      console.log(`⚠️ Origin not in allowed list, using fallback CORS "*"`);
    }

    res.setHeader("Access-Control-Allow-Credentials", "true");
    res.setHeader(
      "Access-Control-Allow-Methods",
      "GET, POST, OPTIONS, PUT, DELETE"
    );
    res.setHeader(
      "Access-Control-Allow-Headers",
      "X-Requested-With, Content-Type, Accept, Authorization, Cache-Control"
    );

    // Increase timeout for the response
    res.setHeader("Connection", "keep-alive");
    res.setHeader("Keep-Alive", "timeout=120");

    // Handle preflight requests
    if (req.method === "OPTIONS") {
      console.log("🔄 Handling OPTIONS preflight request");
      res.status(200).end();
      return;
    }

    console.log(`🔄 Socket request method: ${req.method}`);
    console.log("🔑 Auth header present:", !!req.headers.authorization);
    console.log("🍪 Cookie header present:", !!req.headers.cookie);

    // Initialize the socket server with debug mode for more visibility
    console.log("🔌 Initializing socket server...");
    initSocketServer(req, res);
    console.log("✅ Socket server initialization called");

    // For non-WebSocket requests, return a quick response to avoid timeout
    if (!res.socket?.destroyed) {
      console.log("📤 Sending socket initialization confirmation");
      res.status(200).json({
        message: "Socket server initialized",
        success: true,
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV,
        debug: true,
      });
    }
  } catch (error) {
    console.error("❌ Error initializing socket server:", error);
    if (!res.socket?.destroyed) {
      res.status(500).json({
        message: "Failed to initialize socket server",
        error: String(error),
        timestamp: new Date().toISOString(),
      });
    }
  }
}

// Configure Next.js to handle WebSockets with longer timeouts
export const config = {
  api: {
    bodyParser: false,
    externalResolver: true, // This tells Next.js that this route is handled by an external resolver
    responseLimit: false, // Remove response size limit
  },
};
