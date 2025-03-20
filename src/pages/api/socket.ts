import { NextApiRequest } from "next";
import {
  initSocketServer,
  NextApiResponseWithSocket,
} from "@/lib/socketService";

export default function handler(
  req: NextApiRequest,
  res: NextApiResponseWithSocket
) {
  console.log("🔌 Socket handler called");

  try {
    // Handle preflight requests (respond immediately to OPTIONS)
    if (req.method === "OPTIONS") {
      console.log("🔄 Handling OPTIONS preflight request");

      // Set CORS headers
      res.setHeader("Access-Control-Allow-Origin", "*");
      res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
      res.setHeader(
        "Access-Control-Allow-Headers",
        "Content-Type, Authorization"
      );
      res.setHeader("Access-Control-Allow-Credentials", "true");

      res.status(200).end();
      return;
    }

    // For GET requests (socket connections)
    // If Socket.io server is already initialized, return quickly
    if (res.socket.server.io) {
      console.log("✅ Socket.io already initialized");

      res.status(200).json({
        success: true,
        timestamp: Date.now(),
      });
      return;
    }

    // Initialize the socket server
    console.log("🔌 Initializing socket server...");
    initSocketServer(req, res);

    // Return quick response
    res.status(200).json({
      success: true,
      timestamp: Date.now(),
    });
  } catch (error) {
    console.error("❌ Socket handler error:", error);

    if (!res.socket?.destroyed) {
      res.status(500).json({
        error: true,
        message: String(error),
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
  // Short duration to avoid timeouts
  maxDuration: 3,
};
