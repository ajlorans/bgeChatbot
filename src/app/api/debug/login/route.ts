import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";

// Only enable in non-production environments
const DEBUG_ENABLED =
  process.env.NODE_ENV !== "production" || process.env.DEBUG_MODE === "true";
const JWT_SECRET =
  process.env.JWT_SECRET || "fallback-secret-do-not-use-in-production";

export async function GET(request: NextRequest) {
  // Security check - only allow in non-production
  if (!DEBUG_ENABLED) {
    return NextResponse.json(
      { error: "Debug endpoints disabled in production" },
      { status: 403 }
    );
  }

  try {
    // Get current cookies
    const cookieData: Record<string, string> = {};
    request.cookies.getAll().forEach((cookie) => {
      cookieData[cookie.name] = cookie.value.substring(0, 20) + "...";
    });

    // Create a debug response
    return NextResponse.json({
      message: "Debug login info",
      environment: process.env.NODE_ENV,
      debug_mode: process.env.DEBUG_MODE,
      cookies: cookieData,
      has_agent_token: !!request.cookies.get("agent_token"),
    });
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  // Security check - only allow in non-production
  if (!DEBUG_ENABLED) {
    return NextResponse.json(
      { error: "Debug endpoints disabled in production" },
      { status: 403 }
    );
  }

  try {
    // Create a debug token
    const token = jwt.sign(
      {
        id: "debug-user-id",
        email: "debug@example.com",
        role: "agent",
        agentId: "debug-agent-id",
      },
      JWT_SECRET,
      { expiresIn: "1h" }
    );

    // Create response with the token
    const response = NextResponse.json({
      success: true,
      message: "Debug token created",
      token_preview: token.substring(0, 30) + "...",
    });

    // Set the token cookie
    response.cookies.set({
      name: "agent_token",
      value: token,
      httpOnly: true,
      path: "/",
      secure: false, // Allow insecure for testing
      maxAge: 60 * 60, // 1 hour
      sameSite: "lax",
    });

    return response;
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
