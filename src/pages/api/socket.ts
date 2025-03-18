import { NextApiRequest } from "next";
import {
  initSocketServer,
  NextApiResponseWithSocket,
} from "@/lib/socketService";

export default function handler(
  req: NextApiRequest,
  res: NextApiResponseWithSocket
) {
  // Initialize the socket server
  initSocketServer(req, res);

  // Return a response to acknowledge the socket initialization
  res.status(200).json({ message: "Socket server initialized" });
}

// Configure Next.js to handle WebSockets
export const config = {
  api: {
    bodyParser: false,
  },
};
