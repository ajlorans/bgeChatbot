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
    // Initialize the socket server
    initSocketServer(req, res);

    // Return a response to acknowledge the socket initialization
    res
      .status(200)
      .json({ message: "Socket server initialized", success: true });
  } catch (error) {
    console.error("Error initializing socket server:", error);
    res
      .status(500)
      .json({
        message: "Failed to initialize socket server",
        error: String(error),
      });
  }
}

// Configure Next.js to handle WebSockets
export const config = {
  api: {
    bodyParser: false,
  },
};
