import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// This function can be marked `async` if using `await` inside
export function middleware(request: NextRequest) {
  console.log("Middleware running for path:", request.nextUrl.pathname);

  // Check if the request is for the agent dashboard
  if (request.nextUrl.pathname.startsWith("/agent-dashboard")) {
    const token = request.cookies.get("agent_token");

    // If there's no token, redirect to login
    if (!token) {
      console.log("No agent token found, redirecting to login");
      return NextResponse.redirect(new URL("/agent-login", request.url));
    }

    // If token exists, allow the request to proceed
    console.log("Agent token found, allowing access to dashboard");
    return NextResponse.next();
  }

  // Default case: continue with the request
  return NextResponse.next();
}

// See "Matching Paths" below to learn more
export const config = {
  matcher: ["/agent-dashboard", "/agent-dashboard/:path*"],
};
