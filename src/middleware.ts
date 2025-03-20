import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// This function can be marked `async` if using `await` inside
export function middleware(request: NextRequest) {
  console.log("Middleware running for path:", request.nextUrl.pathname);

  const token = request.cookies.get("agent_token");
  const isAgentDashboard =
    request.nextUrl.pathname.startsWith("/agent-dashboard");
  const isAgentLogin = request.nextUrl.pathname.startsWith("/agent-login");

  // If this is the dashboard and no token, redirect to login
  if (isAgentDashboard && !token) {
    console.log("No agent token found, redirecting to login");
    return NextResponse.redirect(new URL("/agent-login", request.url));
  }

  // If this is the login page and token exists, redirect to dashboard
  // This prevents redirect loops when accessing the dashboard directly
  if (isAgentLogin && token) {
    console.log("Agent token found on login page, redirecting to dashboard");
    return NextResponse.redirect(new URL("/agent-dashboard", request.url));
  }

  // Default case: continue with the request
  return NextResponse.next();
}

// See "Matching Paths" below to learn more
export const config = {
  matcher: ["/agent-dashboard", "/agent-dashboard/:path*", "/agent-login"],
};
