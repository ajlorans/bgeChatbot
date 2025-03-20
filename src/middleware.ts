import { NextRequest, NextResponse } from "next/server";

// Debug helper to inspect cookies
function debugCookies(req: NextRequest, context: string) {
  const agentToken = req.cookies.get("agent_token");
  console.log(`🍪 [Middleware] ${context} - Cookies:`, {
    hasAgentToken: !!agentToken,
    tokenLength: agentToken?.value?.length,
    tokenPrefix: agentToken?.value?.substring(0, 12) + "...",
    path: req.nextUrl.pathname,
    url: req.url,
  });
  return !!agentToken;
}

export function middleware(req: NextRequest) {
  // Skip for all API routes
  if (req.nextUrl.pathname.startsWith("/api/")) {
    return NextResponse.next();
  }

  // Skip for static files and public assets
  if (
    req.nextUrl.pathname.startsWith("/_next/") ||
    req.nextUrl.pathname.includes(".") ||
    req.nextUrl.pathname === "/favicon.ico"
  ) {
    return NextResponse.next();
  }

  // Skip for login page and bypass page
  if (
    req.nextUrl.pathname === "/agent-login" ||
    req.nextUrl.pathname === "/agent-login/" ||
    req.nextUrl.pathname === "/agent-bypass" ||
    req.nextUrl.pathname === "/agent-bypass/"
  ) {
    debugCookies(req, "Skipping auth page");
    return NextResponse.next();
  }

  // Only check agent dashboard access
  if (req.nextUrl.pathname.startsWith("/agent-dashboard")) {
    console.log(`🔒 [Middleware] Checking access to: ${req.nextUrl.pathname}`);

    // Check for test mode
    const isTestMode =
      process.env.NODE_ENV !== "production" ||
      process.env.DEBUG_MODE === "true" ||
      process.env.ALLOW_DEBUG_LOGIN === "true";

    // Check if agent token cookie exists
    const hasAgentToken = debugCookies(req, "Agent dashboard access");

    // Special case - test mode with a bypass token
    if (isTestMode && hasAgentToken) {
      const token = req.cookies.get("agent_token");
      if (token?.value?.startsWith("BYPASS_TOKEN_")) {
        console.log("🧪 [Middleware] Allowing access with bypass token");
        return NextResponse.next();
      }
    }

    if (!hasAgentToken) {
      console.log("🔒 [Middleware] No agent token, redirecting to login");
      return NextResponse.redirect(new URL("/agent-login", req.url));
    }

    // For simplicity, just check token presence, not validity
    // The API routes will validate the token properly
    return NextResponse.next();
  }

  // All other routes proceed normally
  return NextResponse.next();
}

// Match specific paths
export const config = {
  matcher: [
    // Paths that need protection
    "/agent-dashboard/:path*",

    // Login paths (to check but not protect)
    "/agent-login",
    "/agent-login/",
    "/agent-bypass",
    "/agent-bypass/",

    // Catch-all for any non-static routes
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\.).*)",
  ],
};
