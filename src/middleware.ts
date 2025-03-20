import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// This function can be marked `async` if using `await` inside
export function middleware(request: NextRequest) {
  // Only protect agent-dashboard paths
  if (request.nextUrl.pathname.startsWith("/agent-dashboard")) {
    console.log("👮 Middleware checking auth for agent dashboard");

    // Get the token
    const token = request.cookies.get("agent_token");

    // If no token, redirect to login
    if (!token) {
      console.log("🔒 No agent token, redirecting to login");
      return NextResponse.redirect(new URL("/agent-login", request.url));
    }

    // Token exists, allow access
    console.log("✅ Agent token found, allowing access");
  }

  // For all other paths, just proceed
  return NextResponse.next();
}

// Only match agent-dashboard paths, NOT login
export const config = {
  matcher: ["/agent-dashboard", "/agent-dashboard/:path*"],
};
