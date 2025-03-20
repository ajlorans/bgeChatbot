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

// Configure Next.js to handle WebSockets
export const config = {
  api: {
    bodyParser: false,
    externalResolver: true,
    responseLimit: false,
  },
};
