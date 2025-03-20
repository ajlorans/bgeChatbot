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
    // Always allow all origins in development and when specified in env vars
    const allowAll =
      process.env.CORS_ALLOW_ALL === "true" ||
      process.env.NODE_ENV !== "production" ||
      process.env.DEBUG_MODE === "true";

    const allowedOrigins = allowAll
      ? "*"
      : process.env.ALLOWED_ORIGINS?.split(",") || [
          "https://bge-chatbot.vercel.app",
          "http://localhost:3000",
        ];

    const origin = req.headers.origin || "";
    console.log("🌐 Request from origin:", origin);
    console.log("✅ Allowed origins:", allowedOrigins);

    // Set CORS headers - always allow any origin for socket.io to work properly
    res.setHeader("Access-Control-Allow-Origin", "*");
    console.log(
      "🌐 Setting CORS allow all origins for Socket.IO compatibility"
    );

    res.setHeader("Access-Control-Allow-Credentials", "true");
    res.setHeader(
      "Access-Control-Allow-Methods",
      "GET, POST, OPTIONS, PUT, DELETE"
    );
    res.setHeader(
      "Access-Control-Allow-Headers",
      "X-Requested-With, Content-Type, Accept, Authorization, Cache-Control"
    );

    // Handle preflight requests (respond quickly to OPTIONS)
    if (req.method === "OPTIONS") {
      console.log("🔄 Handling OPTIONS preflight request");
      res.status(200).end();
      return;
    }

    console.log(`🔄 Socket request method: ${req.method}`);

    // For GET requests (which might be socket connections)
    // Initialize the socket server only if we haven't done so already
    if (res.socket.server.io) {
      console.log("✅ Socket.io already initialized, returning quickly");
      // Return a quick response for polling requests
      res.status(200).json({
        message: "Socket server already running",
        success: true,
        timestamp: new Date().toISOString(),
      });
      return;
    }

    // Initialize the socket server
    console.log("🔌 Initializing socket server...");
    initSocketServer(req, res);
    console.log("✅ Socket server initialization completed");

    // Return a quick response for the initial socket connection
    if (!res.socket?.destroyed) {
      console.log("📤 Sending socket initialization confirmation");
      res.status(200).json({
        message: "Socket server initialized",
        success: true,
        timestamp: new Date().toISOString(),
      });
    }
  } catch (error) {
    console.error("❌ Error in socket handler:", error);
    if (!res.socket?.destroyed) {
      res.status(500).json({
        message: "Failed to handle socket request",
        error: String(error),
        timestamp: new Date().toISOString(),
      });
    }
  }
}

// Configure Next.js to handle WebSockets with shorter timeout
export const config = {
  api: {
    bodyParser: false,
    externalResolver: true,
    responseLimit: false,
  },
  // Reduce function duration to avoid timeouts
  maxDuration: 10, // 10 seconds instead of default 60s
};
