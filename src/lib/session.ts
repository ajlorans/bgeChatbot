import { cookies } from "next/headers";
import jwt from "jsonwebtoken";

// Define the JWT secret with more robust fallback
const JWT_SECRET =
  process.env.JWT_SECRET ||
  (process.env.NODE_ENV === "production"
    ? (console.error("⚠️ JWT_SECRET is not set in production environment!"),
      "temporary-fallback-jwt-key-for-debugging")
    : "development-only-jwt-secret-key");

console.log(
  `JWT Secret initialized. Using environment variable: ${!!process.env
    .JWT_SECRET}`
);

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
      console.log("No agent_token cookie found");
      return null;
    }

    console.log("Token found, attempting to verify...");

    // Verify and decode the token
    try {
      const decoded = jwt.verify(token.value, JWT_SECRET) as SessionData;

      // Check if the session has expired
      if (decoded.expiresAt < Date.now()) {
        console.log("Session has expired");
        return null;
      }

      // Make sure the user object is valid
      if (!decoded.user || !decoded.user.id) {
        console.error("Invalid session data: missing user ID");
        return null;
      }

      console.log(`Valid session found for user: ${decoded.user.email}`);

      // Return the session data
      return decoded;
    } catch (jwtError) {
      console.error("JWT verification error:", jwtError);

      // Special handling for test/debugging environment
      if (
        process.env.DEBUG_MODE === "true" ||
        process.env.ALLOW_DEBUG_LOGIN === "true"
      ) {
        console.log("DEBUG MODE: Creating fallback session");
        try {
          // Try to decode without verification for debugging
          const decoded = jwt.decode(token.value) as SessionData;
          if (decoded && decoded.user) {
            console.log("DEBUG MODE: Using decoded but unverified session");
            return decoded;
          }
        } catch (decodeError) {
          console.error("Failed to decode token:", decodeError);
        }
      }

      return null;
    }
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

  console.log(
    `Creating token for user: ${
      user.email
    }, using JWT_SECRET: ${JWT_SECRET.substring(0, 5)}...`
  );

  // Sign the token
  try {
    const token = jwt.sign(sessionData, JWT_SECRET, {
      expiresIn: "24h",
      algorithm: "HS256",
    });
    console.log("Token created successfully");
    return token;
  } catch (error) {
    console.error("Error creating token:", error);
    throw error;
  }
}

/**
 * Clear the session
 */
export async function clearSession(): Promise<void> {
  const cookieStore = await cookies();
  await cookieStore.delete("agent_token");
}
