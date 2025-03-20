import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const DEBUG_MODE = process.env.DEBUG_MODE === "true";

// Debug function to inspect cookies
function debugCookies(req: NextRequest, context: string) {
  if (!DEBUG_MODE) return;

  console.log(`[Middleware Debug ${context}]`);
  console.log(`  URL: ${req.nextUrl.pathname}`);
  console.log(`  Cookies: ${req.cookies.toString()}`);

  const agentToken = req.cookies.get("agent_token");
  console.log(`  Agent Token: ${agentToken ? "Present" : "Not present"}`);

  if (agentToken) {
    console.log(`  Token Value: ${agentToken.value.substring(0, 15)}...`);
  }
}

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  debugCookies(req, "Start");

  // Skip middleware for API routes to prevent API access issues
  if (pathname.startsWith("/api/")) {
    console.log("[Middleware] Skipping API route:", pathname);
    return NextResponse.next();
  }

  // Skip middleware for static files and favicon
  if (
    pathname.match(/\.(jpg|jpeg|png|gif|ico|svg|webp|css|js|woff|woff2)$/) ||
    pathname === "/favicon.ico"
  ) {
    return NextResponse.next();
  }

  // Skip middleware for the login page to prevent redirect loops
  if (pathname === "/agent-login" || pathname === "/login/agent") {
    console.log("[Middleware] Allowing access to login page");
    return NextResponse.next();
  }

  // If trying to access the agent dashboard
  if (pathname.startsWith("/agent-dashboard")) {
    // Check if agent token exists
    const agentToken = req.cookies.get("agent_token");

    if (!agentToken) {
      console.log("[Middleware] No agent token found, redirecting to login");

      // Redirect to login page
      const url = new URL("/agent-login", req.url);
      return NextResponse.redirect(url);
    }

    // Allow access to agent dashboard if token exists
    console.log("[Middleware] Agent token found, allowing access to dashboard");
    return NextResponse.next();
  }

  // For all other routes, proceed
  return NextResponse.next();
}

export const config = {
  matcher: [
    // Match all paths except for those starting with specified patterns
    "/((?!_next/static|_next/image|favicon.ico|public/).*)",
  ],
};
