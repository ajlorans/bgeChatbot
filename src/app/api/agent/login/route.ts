import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";
const COOKIE_NAME = "agent_token";
const MAX_AGE = 60 * 60 * 24 * 7; // 7 days

export async function POST(req: NextRequest) {
  try {
    // Get email and password from request body
    const body = await req.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 }
      );
    }

    // Look up the user by email
    const user = await prisma.user.findUnique({
      where: { email },
      include: { agent: true },
    });

    // If user not found, return error
    if (!user) {
      console.log(`Login failed: No user found with email ${email}`);
      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 401 }
      );
    }

    // If user doesn't have an agent profile, return error
    if (!user.agent) {
      console.log(`Login failed: User ${email} doesn't have agent profile`);
      return NextResponse.json(
        { error: "This account is not an agent" },
        { status: 403 }
      );
    }

    // Check password - compare with the user's password field since we're using mock data
    const passwordValid =
      process.env.USE_MOCK_DB === "true"
        ? password === "password123" // For mock DB, hardcoded check
        : await bcrypt.compare(password, user.password || "");

    if (!passwordValid) {
      console.log(`Login failed: Invalid password for user ${email}`);
      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 401 }
      );
    }

    // Generate JWT token with user information
    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
        role: user.role,
        agentId: user.agent.id,
      },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    // Return success response with redirection and cookie
    const response = NextResponse.json(
      {
        success: true,
        message: "Login successful",
        redirectTo: "/agent-dashboard/", // Add trailing slash to be consistent with middleware
      },
      { status: 200 }
    );

    // Set the cookie in the response
    response.cookies.set({
      name: COOKIE_NAME,
      value: token,
      httpOnly: true,
      path: "/",
      secure: process.env.NODE_ENV === "production",
      maxAge: MAX_AGE,
      sameSite: "lax",
    });

    console.log(`Login successful for agent: ${email}`);
    return response;
  } catch (error: unknown) {
    console.error("Login error:", error);
    return NextResponse.json(
      {
        error: "Server error during login",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
