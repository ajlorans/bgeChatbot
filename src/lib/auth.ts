import jwt from "jsonwebtoken";

// JWT Secret key - use environment variable with fallback for development
const JWT_SECRET =
  process.env.JWT_SECRET || "development_secret_key_not_for_production";

// User session interface
export interface UserSession {
  id: string;
  name?: string;
  role: string;
  [key: string]: string | number | boolean | Date | undefined; // Specify types for additional properties
}

interface TokenData {
  id: string;
  email: string;
  role: string;
  agentId: string;
  iat?: number;
  exp?: number;
}

/**
 * Generate a JWT token for a user session
 * @param payload User data to encode in the token
 * @param expiresIn Token expiration time (e.g., "8h", "7d")
 * @returns JWT token string
 */
export function generateToken(
  payload: UserSession,
  expiresIn: string = "8h"
): string {
  try {
    // Ensure we have a JWT secret
    if (!JWT_SECRET) {
      console.error("JWT_SECRET is not defined");
      throw new Error("JWT_SECRET is not defined");
    }

    // Convert secret to Buffer to solve TypeScript issues
    const secretBuffer = Buffer.from(JWT_SECRET, "utf-8");

    // Create and sign token with the buffer
    const token = jwt.sign(payload, secretBuffer, { expiresIn });
    return token;
  } catch (error) {
    console.error("Failed to generate token:", error);
    throw error;
  }
}

/**
 * Verify and decode a JWT token
 * @param token The JWT token to verify
 * @returns The decoded token data or null if invalid
 */
export function verifyToken(token: string): TokenData | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as TokenData;
    return decoded;
  } catch (error) {
    console.error("Token verification failed:", error);
    return null;
  }
}

/**
 * Get user session from request cookie
 * @param cookieValue Token cookie value
 * @returns User session or null if invalid
 */
export function getUserFromToken(cookieValue: string): UserSession | null {
  try {
    return verifyToken(cookieValue) as UserSession;
  } catch (error) {
    console.error("Failed to get user from token:", error);
    return null;
  }
}

/**
 * Create a JWT token for an agent
 * @param data The data to encode in the token
 * @returns The JWT token
 */
export function createAgentToken(data: Omit<TokenData, "iat" | "exp">): string {
  return jwt.sign(data, JWT_SECRET, { expiresIn: "7d" });
}

/**
 * Get the agent token from the request cookies
 * @param cookies The request cookies
 * @returns The token value or undefined if not found
 */
export function getAgentTokenFromCookies(cookies: {
  get: (name: string) => { value: string } | undefined;
}): string | undefined {
  return cookies.get("agent_token")?.value;
}
