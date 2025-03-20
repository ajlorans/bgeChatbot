import { NextRequest, NextResponse } from "next/server";

// Debug helper to log cookies in production when needed
function debugCookies(req: NextRequest, prefix: string) {
  if (process.env.DEBUG_MODE === "true") {
    const cookies = req.cookies.getAll();
    console.log(
      `${prefix} Cookies:`,
      cookies
        .map(
          (c) =>
            `${c.name}=${c.value.substring(0, 15)}${
              c.value.length > 15 ? "..." : ""
            }`
        )
        .join(", ")
    );
    return cookies.some((c) => c.name === "agent_token");
  }
  return req.cookies.has("agent_token");
}

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Debug logs for troubleshooting
  if (process.env.DEBUG_MODE === "true") {
    console.log(`Middleware processing: ${pathname}`);
  }

  // Skip middleware for API routes to prevent loops
  if (pathname.startsWith("/api/")) {
    if (process.env.DEBUG_MODE === "true") {
      console.log(`Skipping middleware for API: ${pathname}`);
    }
    return NextResponse.next();
  }

  // Skip middleware for static assets
  if (
    pathname.includes("/_next/") ||
    pathname.includes("/favicon.ico") ||
    pathname.includes(".") // Skip files with extensions
  ) {
    return NextResponse.next();
  }

  // Skip middleware for the login page (prevent loops)
  if (pathname.startsWith("/login/")) {
    if (process.env.DEBUG_MODE === "true") {
      console.log(`Skipping middleware for login: ${pathname}`);
    }
    return NextResponse.next();
  }

  // Skip middleware for the direct agent access page
  if (pathname === "/agent") {
    if (process.env.DEBUG_MODE === "true") {
      console.log("Allowing direct agent access page");
    }
    return NextResponse.next();
  }

  // Check if user is trying to access agent dashboard
  if (pathname.startsWith("/agent-dashboard")) {
    // Check for agent token
    const hasAgentToken = debugCookies(req, "Agent dashboard");

    if (!hasAgentToken) {
      console.log("No agent token found, redirecting to login");
      // Redirect to login if no token
      return NextResponse.redirect(new URL("/login/agent", req.url));
    }

    if (process.env.DEBUG_MODE === "true") {
      console.log("Agent token found, allowing access to dashboard");
    }
  }

  return NextResponse.next();
}

// Match all routes except for API and static routes
export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
