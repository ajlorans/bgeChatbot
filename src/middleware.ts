import { NextRequest, NextResponse } from "next/server";

// Debug function to log cookie details
function debugCookies(req: NextRequest, message: string) {
  if (process.env.DEBUG_MODE === "true") {
    console.log(`[DEBUG][MIDDLEWARE] ${message}`);
    console.log(`Cookies: ${req.cookies.toString()}`);
    req.cookies.getAll().forEach((cookie) => {
      console.log(`Cookie ${cookie.name}: ${cookie.value}`);
    });
  }
}

export async function middleware(req: NextRequest) {
  // Debug logging for request URL
  if (process.env.DEBUG_MODE === "true") {
    console.log(
      `[MIDDLEWARE] Processing ${req.method} request to ${req.nextUrl.pathname}`
    );
  }

  // Skip middleware for API routes, static files, and agent login page
  if (
    req.nextUrl.pathname.startsWith("/api") ||
    req.nextUrl.pathname.startsWith("/_next") ||
    req.nextUrl.pathname.startsWith("/login/agent") ||
    req.nextUrl.pathname === "/agent-login" ||
    req.nextUrl.pathname === "/agent"
  ) {
    debugCookies(req, `Skipping middleware for ${req.nextUrl.pathname}`);
    return NextResponse.next();
  }

  // For agent dashboard paths, enforce authentication
  if (req.nextUrl.pathname.startsWith("/agent-dashboard")) {
    debugCookies(req, `Checking auth for ${req.nextUrl.pathname}`);
    const token = req.cookies.get("agent_token");

    // Handle agent dashboard access (must have agent_token)
    if (!token) {
      console.log("[MIDDLEWARE] No agent_token found, redirecting to login");
      return NextResponse.redirect(new URL("/login/agent", req.url));
    }

    // Agent is authenticated, proceed to dashboard
    debugCookies(req, "Agent authenticated, proceeding to dashboard");
    return NextResponse.next();
  }

  // Default: Allow access to all other routes
  return NextResponse.next();
}

// Specify routes that should be checked by middleware
export const config = {
  matcher: [
    /*
     * Match all request paths except for:
     * - api routes (handled separately by API logic)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (browser icon)
     */
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
};
