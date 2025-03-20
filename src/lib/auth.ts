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
 * @param token JWT token to verify
 * @returns Decoded token payload or null if invalid
 */
export function verifyToken(token: string): UserSession | null {
  try {
    // Ensure we have a JWT secret
    if (!JWT_SECRET) {
      console.error("JWT_SECRET is not defined");
      return null;
    }

    // Convert secret to Buffer to solve TypeScript issues
    const secretBuffer = Buffer.from(JWT_SECRET, "utf-8");

    // Verify and decode token
    const decoded = jwt.verify(token, secretBuffer) as UserSession;
    return decoded;
  } catch (error) {
    console.error("Invalid token:", error);
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
    return verifyToken(cookieValue);
  } catch (error) {
    console.error("Failed to get user from token:", error);
    return null;
  }
}
