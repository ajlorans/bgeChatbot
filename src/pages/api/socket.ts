import { NextApiRequest } from "next";
import {
  initSocketServer,
  NextApiResponseWithSocket,
} from "@/lib/socketService";

export default function handler(
  req: NextApiRequest,
  res: NextApiResponseWithSocket
) {
  console.log("Socket handler called, initializing socket server...");
  try {
    // Add CORS headers for socket communication
    const allowedOrigins =
      process.env.CORS_ALLOW_ALL === "true"
        ? "*"
        : process.env.ALLOWED_ORIGINS?.split(",") || [
            "https://bge-chatbot.vercel.app",
          ];

    const origin = req.headers.origin || "";

    // Set CORS headers
    if (allowedOrigins === "*") {
      res.setHeader("Access-Control-Allow-Origin", "*");
    } else if (
      Array.isArray(allowedOrigins) &&
      allowedOrigins.includes(origin)
    ) {
      res.setHeader("Access-Control-Allow-Origin", origin);
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

    // Handle preflight requests
    if (req.method === "OPTIONS") {
      res.status(200).end();
      return;
    }

    console.log(`Socket request method: ${req.method}, headers:`, req.headers);

    // Initialize the socket server
    initSocketServer(req, res);

    // Return a response to acknowledge the socket initialization
    // Note: This line will only execute for non-WebSocket requests
    if (!res.socket?.destroyed) {
      res
        .status(200)
        .json({ message: "Socket server initialized", success: true });
    }
  } catch (error) {
    console.error("Error initializing socket server:", error);
    if (!res.socket?.destroyed) {
      res.status(500).json({
        message: "Failed to initialize socket server",
        error: String(error),
      });
    }
  }
}

// Configure Next.js to handle WebSockets
export const config = {
  api: {
    bodyParser: false,
  },
};
