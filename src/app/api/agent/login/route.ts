import { prisma } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";
import { createAgentSessionToken } from "@/lib/session";

// Create a URL with trailing slash to prevent redirect loops
function createAgentDashboardURL(baseUrl: string): URL {
  const url = new URL("/agent-dashboard/", baseUrl);
  return url;
}

export async function POST(req: NextRequest) {
  console.log("[API] Agent login request received");
  try {
    // Set no-cache headers
    const headers = new Headers({
      "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
      Pragma: "no-cache",
      Expires: "0",
    });

    // Parse request body
    const body = await req.json();
    const { email, password, bypassLogin } = body;

    // Allow debug login in development
    if (process.env.ALLOW_DEBUG_LOGIN === "true" && bypassLogin) {
      console.log("[API] Using bypass login in development mode");

      // Create a token with admin permissions
      const adminToken = createAgentSessionToken({
        id: "admin-bypass",
        name: "Admin User",
        role: "admin",
        agentId: "admin-bypass",
        email: "admin@example.com",
      });

      // Set the token cookie
      const response = NextResponse.redirect(
        createAgentDashboardURL(req.url),
        303
      );

      // Set a longer cookie expiry for development
      response.cookies.set({
        name: "agent_token",
        value: adminToken,
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        maxAge: 60 * 60 * 12, // 12 hours
        path: "/",
        sameSite: "lax",
      });

      console.log("[API] Bypass login successful, redirecting to dashboard");
      for (const header of headers.entries()) {
        response.headers.set(header[0], header[1]);
      }
      return response;
    }

    if (!email || !password) {
      console.error("[API] Missing email or password");
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400, headers }
      );
    }

    try {
      // Find user by email with agent relationship
      const user = await prisma.user.findUnique({
        where: { email },
        include: { agent: true },
      });

      if (!user || !user.agent) {
        console.error(`[API] Agent not found: ${email}`);
        return NextResponse.json(
          { error: "Invalid credentials" },
          { status: 401, headers }
        );
      }

      // In a real system, we'd verify the password hash here
      // For now, check the raw password (DEMO ONLY)
      const isPasswordValid = password === user.password;

      if (!isPasswordValid) {
        console.error(`[API] Invalid password for ${email}`);
        return NextResponse.json(
          { error: "Invalid credentials" },
          { status: 401, headers }
        );
      }

      // Create session token
      const token = createAgentSessionToken({
        id: user.id,
        name: user.name,
        role: user.role,
        agentId: user.agent.id,
        email: user.email,
      });

      // Redirect to dashboard with token
      const response = NextResponse.redirect(
        createAgentDashboardURL(req.url),
        303
      );

      // Set token in cookie
      response.cookies.set({
        name: "agent_token",
        value: token,
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        maxAge: 60 * 60 * 8, // 8 hours
        path: "/",
        sameSite: "lax",
      });

      console.log(
        `[API] Login successful for ${email}, redirecting to dashboard`
      );
      for (const header of headers.entries()) {
        response.headers.set(header[0], header[1]);
      }
      return response;
    } catch (dbError: unknown) {
      console.error("[API] Database error during login:", dbError);
      return NextResponse.json(
        {
          error: "Internal server error during login",
          details:
            process.env.DEBUG_MODE === "true"
              ? {
                  message:
                    dbError instanceof Error
                      ? dbError.message
                      : String(dbError),
                }
              : undefined,
        },
        { status: 500, headers }
      );
    }
  } catch (error: unknown) {
    console.error("[API] Unexpected error in login route:", error);
    return NextResponse.json(
      {
        error: "Internal server error",
        details:
          process.env.DEBUG_MODE === "true"
            ? {
                message: error instanceof Error ? error.message : String(error),
              }
            : undefined,
      },
      { status: 500 }
    );
  }
}
