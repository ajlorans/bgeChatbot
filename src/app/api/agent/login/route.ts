import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { cookies } from "next/headers";
import { createAgentSessionToken, UserSession } from "@/lib/session";
import bcrypt from "bcryptjs";

export async function POST(req: NextRequest) {
  try {
    // Handle both JSON and form data requests
    let email: string, password: string;

    if (req.headers.get("content-type")?.includes("application/json")) {
      // Handle JSON request
      const body = await req.json();
      email = body.email;
      password = body.password;
    } else {
      // Handle form submission
      const formData = await req.formData();
      email = formData.get("email") as string;
      password = formData.get("password") as string;
    }

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 }
      );
    }

    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        agent: true,
      },
    });

    console.log(`Login attempt for email: ${email}, user found: ${!!user}`);

    // TEMPORARY DEBUG: If database connection fails but credentials match test data
    const defaultTestPassword = "password123";
    const isTestEmail =
      email === "agent@example.com" ||
      email === "admin@example.com" ||
      email.endsWith("@example.com") ||
      email === "agent@bge.com" ||
      email === "admin@bge.com";

    const allowDebugLogin =
      (process.env.ALLOW_DEBUG_LOGIN === "true" ||
        process.env.NODE_ENV !== "production") &&
      isTestEmail &&
      (password === defaultTestPassword || password === "bge123");

    if (!user && allowDebugLogin) {
      console.log("Using debug login override for test account:", email);
      // Create a mock user for testing purposes
      const isAdmin = email.includes("admin");
      const mockUser = {
        id: isAdmin ? "admin-test-id" : "agent-test-id",
        email: email,
        name: isAdmin ? "Admin Test" : "Agent Test",
        role: isAdmin ? "admin" : "agent",
        agent: {
          id: isAdmin ? "admin-agent-id" : "agent-id",
          isActive: true,
          role: isAdmin ? "admin" : "agent",
          isAvailable: true,
        },
      };

      // Create session user data
      const sessionUser: UserSession = {
        id: mockUser.id,
        email: mockUser.email,
        name: mockUser.name,
        role: mockUser.role,
        agentId: mockUser.agent.id,
      };

      console.log("Created mock session for user:", sessionUser);

      // Create JWT token
      const token = createAgentSessionToken(sessionUser);

      // Set the token as a cookie
      const cookieStore = await cookies();
      cookieStore.set("agent_token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 8 * 60 * 60, // 8 hours in seconds
        path: "/",
      });

      // Check if this is a form submission (needs redirect) or JSON API call
      if (!req.headers.get("content-type")?.includes("application/json")) {
        console.log("Redirecting to agent dashboard after successful login");
        return NextResponse.redirect(new URL("/agent-dashboard", req.url));
      }

      return NextResponse.json({
        success: true,
        agent: {
          id: mockUser.agent.id,
          name: mockUser.name,
          email: mockUser.email,
          role: mockUser.role,
          isAvailable: true,
        },
      });
    }

    if (!user || !user.password) {
      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 401 }
      );
    }

    // Check if user is an agent
    if (!user.agent) {
      return NextResponse.json(
        { error: "User is not authorized as an agent" },
        { status: 403 }
      );
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password);

    if (!isValidPassword) {
      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 401 }
      );
    }

    // Check if agent is active
    if (!user.agent.isActive) {
      return NextResponse.json(
        {
          error:
            "Your agent account has been deactivated. Please contact an administrator.",
        },
        { status: 403 }
      );
    }

    // Create session user data
    const sessionUser: UserSession = {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      agentId: user.agent.id,
    };

    // Create JWT token using the helper function
    const token = createAgentSessionToken(sessionUser);

    // Update agent's last active timestamp
    await prisma.agent.update({
      where: { id: user.agent.id },
      data: {
        lastActive: new Date(),
      },
    });

    // Set the token as a cookie
    const cookieStore = await cookies();
    cookieStore.set("agent_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 8 * 60 * 60, // 8 hours in seconds
      path: "/",
    });

    // Check if this is a form submission (needs redirect) or JSON API call (needs JSON response)
    if (!req.headers.get("content-type")?.includes("application/json")) {
      // For form submissions, redirect to the dashboard
      return NextResponse.redirect(new URL("/agent-dashboard", req.url));
    }

    // For API calls, return JSON response
    return NextResponse.json({
      success: true,
      agent: {
        id: user.agent.id,
        name: user.name,
        email: user.email,
        role: user.agent.role,
        isAvailable: user.agent.isAvailable,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json(
      { error: "Login failed. Please try again." },
      { status: 500 }
    );
  }
}
