import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";

// The JWT secret environment variable or a fallback
const JWT_SECRET =
  process.env.JWT_SECRET ||
  (process.env.NODE_ENV === "production"
    ? "temporary-fallback-jwt-key-for-debugging"
    : "development-only-jwt-secret-key");

// Session interfaces copied from session.ts to avoid async imports
interface UserSession {
  id: string;
  email: string;
  name: string | null;
  role: string;
  agentId: string | null;
}

interface SessionData {
  user: UserSession;
  expiresAt: number;
}

// Middleware-compatible version of getServerSession that works synchronously
function getMiddlewareSession(req: NextRequest): SessionData["user"] | null {
  try {
    // Get the token from cookies
    const token = req.cookies.get("agent_token");

    if (!token) {
      console.log("[Middleware] No agent_token cookie found");
      return null;
    }

    // Verify and decode the token
    try {
      const decoded = jwt.verify(token.value, JWT_SECRET) as SessionData;

      // Check if the session has expired
      if (decoded.expiresAt < Date.now()) {
        console.log("[Middleware] Session has expired");
        return null;
      }

      // Make sure the user object is valid
      if (!decoded.user || !decoded.user.id) {
        console.error("[Middleware] Invalid session data: missing user ID");
        return null;
      }

      console.log(`[Middleware] Valid session for user: ${decoded.user.email}`);

      // Return just the user part
      return decoded.user;
    } catch (jwtError) {
      console.error("[Middleware] JWT verification error:", jwtError);

      // Special handling for test/debugging environment
      if (
        process.env.DEBUG_MODE === "true" ||
        process.env.ALLOW_DEBUG_LOGIN === "true"
      ) {
        console.log("[Middleware] DEBUG MODE: Creating fallback session");
        try {
          // Try to decode without verification for debugging
          const decoded = jwt.decode(token.value) as SessionData;
          if (decoded && decoded.user) {
            console.log(
              "[Middleware] DEBUG MODE: Using decoded but unverified session"
            );
            return decoded.user;
          }
        } catch (decodeError) {
          console.error("[Middleware] Failed to decode token:", decodeError);
        }
      }

      return null;
    }
  } catch (error) {
    console.error("[Middleware] Error getting session:", error);
    return null;
  }
}

// Debug helper to inspect cookies
function debugCookies(req: NextRequest, context: string) {
  const agentToken = req.cookies.get("agent_token");
  console.log(`🍪 [Middleware] ${context} - Cookies:`, {
    hasAgentToken: !!agentToken,
    tokenLength: agentToken?.value?.length,
    path: req.nextUrl.pathname,
    url: req.url,
  });
  return !!agentToken;
}

export function middleware(req: NextRequest) {
  // Skip for API routes
  if (req.nextUrl.pathname.startsWith("/api")) {
    return NextResponse.next();
  }

  // Skip for login page to avoid loops
  if (
    req.nextUrl.pathname === "/agent-login" ||
    req.nextUrl.pathname === "/agent-login/"
  ) {
    debugCookies(req, "Skipping login page");
    return NextResponse.next();
  }

  // Debug agent dashboard access
  if (req.nextUrl.pathname.startsWith("/agent-dashboard")) {
    console.log(
      "🔒 [Middleware] Agent dashboard access attempt:",
      req.nextUrl.pathname
    );

    // Check for redirect loop by looking at referrer
    const referer = req.headers.get("referer") || "";
    const isComingFromLogin = referer.includes("/agent-login");
    const redirectCount = req.headers.get("x-redirect-count");

    // Additional logging to debug redirect loop
    console.log("🔄 Redirect debug:", {
      referer,
      isComingFromLogin,
      redirectCount,
      hasLoginRedirectHeader: req.headers.has("x-login-redirect"),
    });

    // Skip check if this is a redirect coming directly from login success
    // This is a safety mechanism to break potential redirect loops
    if (req.headers.has("x-login-redirect") || isComingFromLogin) {
      console.log(
        "⏩ [Middleware] Skipping auth check for redirect from login"
      );
      return NextResponse.next();
    }

    // Check if agent token cookie exists
    const hasAgentToken = debugCookies(req, "Agent dashboard access");

    if (!hasAgentToken) {
      console.log("🔒 [Middleware] No agent token found, redirecting to login");

      // Add a distinctive header to help with debugging
      const response = NextResponse.redirect(new URL("/agent-login", req.url));
      response.headers.set("X-Middleware-Redirect", "true");
      return response;
    }

    // Token exists, validate it (basic validation here; full validation in API)
    try {
      // Use the middleware-compatible version of getServerSession
      const user = getMiddlewareSession(req);

      if (!user) {
        console.log("🔒 [Middleware] Invalid session, redirecting to login");
        // Invalid token - clear it and redirect to login
        const response = NextResponse.redirect(
          new URL("/agent-login", req.url)
        );
        response.cookies.delete("agent_token");
        response.headers.set("X-Middleware-Redirect", "invalid-token");
        return response;
      }

      console.log("✅ [Middleware] Valid agent session:", {
        id: user.id.substring(0, 4) + "...",
        role: user.role,
      });

      return NextResponse.next();
    } catch (error) {
      console.error("❌ [Middleware] Session error:", error);
      // Error validating token - clear it and redirect to login
      const response = NextResponse.redirect(new URL("/agent-login", req.url));
      response.cookies.delete("agent_token");
      response.headers.set("X-Middleware-Redirect", "token-error");
      return response;
    }
  }

  // All other routes proceed normally
  return NextResponse.next();
}

// Match specific paths to avoid applying middleware to static files
export const config = {
  matcher: [
    // Apply to agent dashboard and login routes
    "/agent-dashboard/:path*",
    "/agent-login",
    "/agent-login/",

    // Exclude static files
    "/((?!_next/static|_next/image|favicon.ico|.*\\.).*)",
  ],
};
