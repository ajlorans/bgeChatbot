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

// Check if this request is in a redirect loop
function isInRedirectLoop(req: NextRequest): boolean {
  // Check for a redirect_count cookie that we'll set to track redirects
  const redirectCount = req.cookies.get("redirect_count");
  const count = redirectCount ? parseInt(redirectCount.value, 10) : 0;

  // If we've redirected more than 2 times, consider it a loop
  return count >= 2;
}

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  debugCookies(req, "Start");

  // TEMPORARY FIX: Completely disable auth checks in middleware to break the loop
  // Return NextResponse.next() for all routes to allow access without redirects
  return NextResponse.next();

  /* COMMENTED OUT UNTIL WE FIX THE COOKIE ISSUES
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

  // If in a redirect loop, break it by allowing access
  if (isInRedirectLoop(req)) {
    console.log("[Middleware] Breaking redirect loop, allowing access");
    const response = NextResponse.next();

    // Reset the redirect count cookie
    response.cookies.set({
      name: "redirect_count",
      value: "0",
      path: "/",
      maxAge: 60, // 1 minute expiry
    });

    return response;
  }

  // If trying to access the agent dashboard
  if (pathname.startsWith("/agent-dashboard")) {
    // Check if agent token exists
    const agentToken = req.cookies.get("agent_token");

    if (!agentToken) {
      console.log("[Middleware] No agent token found, redirecting to login");

      // Increment the redirect count
      const redirectCount = req.cookies.get("redirect_count");
      const count = redirectCount ? parseInt(redirectCount.value, 10) : 0;

      // Redirect to login page
      const url = new URL("/agent-login", req.url);
      const response = NextResponse.redirect(url);

      // Set a cookie to track redirect count
      response.cookies.set({
        name: "redirect_count",
        value: (count + 1).toString(),
        path: "/",
        maxAge: 60, // 1 minute expiry
      });

      return response;
    }

    // Allow access to agent dashboard if token exists
    console.log("[Middleware] Agent token found, allowing access to dashboard");
    const response = NextResponse.next();

    // Reset the redirect count on successful access
    response.cookies.set({
      name: "redirect_count",
      value: "0",
      path: "/",
      maxAge: 60,
    });

    return response;
  }

  // For all other routes, proceed
  return NextResponse.next();
  */
}

export const config = {
  matcher: [
    // Match all paths except for those starting with specified patterns
    "/((?!_next/static|_next/image|favicon.ico|public/).*)",
  ],
};
