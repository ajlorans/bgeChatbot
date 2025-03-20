import { cookies } from "next/headers";
import jwt from "jsonwebtoken";

// Define the JWT secret
const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";

// Define session types
export interface UserSession {
  id: string;
  email: string;
  name: string | null;
  role: string;
  agentId: string | null;
}

export interface SessionData {
  user: UserSession;
  expiresAt: number;
}

/**
 * Get the current server-side session
 */
export async function getServerSession(): Promise<SessionData | null> {
  try {
    // Get the token from cookies
    const cookieStore = await cookies();
    const token = await cookieStore.get("agent_token");

    if (!token) {
      return null;
    }

    // Verify and decode the token
    const decoded = jwt.verify(token.value, JWT_SECRET) as SessionData;

    // Check if the session has expired
    if (decoded.expiresAt < Date.now()) {
      return null;
    }

    // Make sure the user object is valid
    if (!decoded.user || !decoded.user.id) {
      console.error("Invalid session data: missing user ID");
      return null;
    }

    // Return the session data
    return decoded;
  } catch (error) {
    console.error("Error getting server session:", error);
    return null;
  }
}

/**
 * Create a session token for an agent
 */
export function createAgentSessionToken(user: UserSession): string {
  // Create session data
  const sessionData: SessionData = {
    user,
    expiresAt: Date.now() + 24 * 60 * 60 * 1000, // 24 hours
  };

  // Sign the token
  return jwt.sign(sessionData, JWT_SECRET);
}

/**
 * Clear the session
 */
export async function clearSession(): Promise<void> {
  const cookieStore = await cookies();
  await cookieStore.delete("agent_token");
}
