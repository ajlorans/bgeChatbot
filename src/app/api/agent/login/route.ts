import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";
const COOKIE_NAME = "agent_token";
const MAX_AGE = 60 * 60 * 24 * 7; // 7 days

export async function POST(req: NextRequest) {
  try {
    console.log("[API] Login request received");

    // Get email and password from request body
    let body;
    try {
      body = await req.json();
    } catch (parseError) {
      console.error("[API] Error parsing request body:", parseError);
      return NextResponse.json(
        { error: "Invalid request format" },
        { status: 400 }
      );
    }

    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 }
      );
    }

    console.log(`[API] Login attempt for email: ${email}`);

    // Look up the user by email
    let user;
    try {
      user = await prisma.user.findUnique({
        where: { email },
        include: { agent: true },
      });
    } catch (dbError) {
      console.error("[API] Database error during login:", dbError);

      // If we're in debug mode and using mock data, proceed with hardcoded user
      if (
        process.env.DEBUG_MODE === "true" &&
        process.env.USE_MOCK_DB === "true"
      ) {
        // Check if this is one of our test accounts
        if (email === "agent@example.com" || email === "admin@example.com") {
          console.log(`[API] Using mock user data for ${email}`);

          // Create mock user and agent objects
          user = {
            id:
              email === "admin@example.com" ? "admin-test-id" : "agent-test-id",
            email: email,
            name: email === "admin@example.com" ? "Admin Test" : "Agent Test",
            role: email === "admin@example.com" ? "admin" : "agent",
            agent: {
              id: email === "admin@example.com" ? "admin-agent-id" : "agent-id",
              isActive: true,
              isAvailable: true,
            },
          };
        }
      } else {
        throw dbError; // Re-throw if not in debug mode
      }
    }

    // If user not found, return error
    if (!user) {
      console.log(`[API] Login failed: No user found with email ${email}`);
      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 401 }
      );
    }

    // If user doesn't have an agent profile, return error
    if (!user.agent) {
      console.log(
        `[API] Login failed: User ${email} doesn't have agent profile`
      );
      return NextResponse.json(
        { error: "This account is not an agent" },
        { status: 403 }
      );
    }

    // Check password - compare with the user's password field since we're using mock data
    let passwordValid = false;

    if (process.env.USE_MOCK_DB === "true") {
      // For mock DB, hardcoded check
      passwordValid = password === "password123";
      console.log(`[API] Mock DB password check: ${passwordValid}`);
    } else {
      // For real DB, use bcrypt
      try {
        passwordValid = await bcrypt.compare(password, user.password || "");
      } catch (bcryptError) {
        console.error("[API] Bcrypt error:", bcryptError);
        return NextResponse.json(
          { error: "Authentication error" },
          { status: 500 }
        );
      }
    }

    if (!passwordValid) {
      console.log(`[API] Login failed: Invalid password for user ${email}`);
      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 401 }
      );
    }

    // Generate JWT token with user information
    let token;
    try {
      token = jwt.sign(
        {
          id: user.id,
          email: user.email,
          role: user.role,
          agentId: user.agent.id,
        },
        JWT_SECRET,
        { expiresIn: "7d" }
      );
    } catch (jwtError) {
      console.error("[API] JWT signing error:", jwtError);
      return NextResponse.json(
        {
          error: "Authentication token generation failed",
          details:
            process.env.DEBUG_MODE === "true" ? String(jwtError) : undefined,
        },
        { status: 500 }
      );
    }

    // Prepare the response data
    const responseData = {
      success: true,
      message: "Login successful",
      redirectTo: "/agent-dashboard/", // Add trailing slash to be consistent with middleware
    };

    console.log(
      "[API] Login successful, response data:",
      JSON.stringify(responseData)
    );

    // Create the response object
    const response = NextResponse.json(responseData, { status: 200 });

    // Set the cookie in the response
    response.cookies.set({
      name: COOKIE_NAME,
      value: token,
      httpOnly: true,
      path: "/",
      secure: process.env.NODE_ENV === "production",
      maxAge: MAX_AGE,
      sameSite: "lax",
      // Don't set domain to ensure it works on different environments
    });

    // Debug logging for cookie
    console.log(`[API] Login successful for agent: ${email}`);
    console.log(
      `[API] Setting token cookie: name=${COOKIE_NAME}, httpOnly=true, path=/, secure=${
        process.env.NODE_ENV === "production"
      }`
    );
    console.log(`[API] Token length: ${token.length}`);

    return response;
  } catch (error: unknown) {
    console.error("[API] Login error:", error);
    return NextResponse.json(
      {
        error: "Server error during login",
        details:
          process.env.DEBUG_MODE === "true" && error instanceof Error
            ? error.message
            : "An unexpected error occurred",
      },
      { status: 500 }
    );
  }
}
