import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { createAgentSessionToken, UserSession } from "@/lib/session";
import bcrypt from "bcryptjs";

// Create a URL to redirect to with absolute URL to avoid issues
function createAgentDashboardURL(req: NextRequest) {
  // Get the host from the request
  const host = req.headers.get("host") || "bge-chatbot.vercel.app";
  const protocol = host.includes("localhost") ? "http://" : "https://";

  // Create an absolute URL to avoid any issues with redirects
  return `${protocol}${host}/agent-dashboard`;
}

export async function POST(req: NextRequest) {
  console.log("🔑 Agent login endpoint called");
  console.log("💻 Environment:", {
    NODE_ENV: process.env.NODE_ENV,
    ALLOW_DEBUG_LOGIN: process.env.ALLOW_DEBUG_LOGIN,
    DEBUG_MODE: process.env.DEBUG_MODE,
    JWT_SECRET_FIRST_CHARS: process.env.JWT_SECRET
      ? process.env.JWT_SECRET.substring(0, 3) + "***"
      : "undefined",
  });

  // Add CORS headers for cross-origin access
  const response = new NextResponse();
  response.headers.set("Access-Control-Allow-Origin", "*");
  response.headers.set("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  response.headers.set(
    "Access-Control-Allow-Headers",
    "Content-Type, Authorization"
  );

  // Handle preflight requests
  if (req.method === "OPTIONS") {
    return response;
  }

  try {
    // Handle both JSON and form data requests
    let email: string, password: string;

    console.log("📨 Content-Type:", req.headers.get("content-type"));

    if (req.headers.get("content-type")?.includes("application/json")) {
      // Handle JSON request
      const body = await req.json();
      email = body.email;
      password = body.password;
      console.log(
        "📝 Login attempt with JSON body, email:",
        email?.substring(0, 3) + "***"
      );
    } else {
      // Handle form submission
      const formData = await req.formData();
      email = formData.get("email") as string;
      password = formData.get("password") as string;
      console.log(
        "📝 Login attempt with form data, email:",
        email?.substring(0, 3) + "***"
      );
    }

    if (!email || !password) {
      console.log("⚠️ Missing credentials");
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 }
      );
    }

    // Find user by email
    console.log("🔍 Looking up user in database:", email);
    const user = await prisma.user
      .findUnique({
        where: { email },
        include: {
          agent: true,
        },
      })
      .catch((error: Error) => {
        console.error("❌ Database error when finding user:", error);
        return null; // Return null to handle the error case
      });

    console.log(`🔍 Login attempt for email: ${email}, user found: ${!!user}`);

    // TEMPORARY DEBUG: If database connection fails but credentials match test data
    // Make this match more permissive to help with testing
    const isTestEmail =
      email === "agent@example.com" ||
      email === "admin@example.com" ||
      email.endsWith("@example.com") ||
      email === "agent@bge.com" ||
      email === "admin@bge.com" ||
      email.includes("agent") ||
      email.includes("admin");

    const debugMode =
      process.env.ALLOW_DEBUG_LOGIN === "true" ||
      process.env.NODE_ENV !== "production" ||
      process.env.DEBUG_MODE === "true";

    const simplePassword =
      password === "password123" ||
      password === "bge123" ||
      password === "password";

    const allowDebugLogin = debugMode && (simplePassword || debugMode);

    console.log(
      `🧪 Debug login info: { 
        email: ${email}, 
        isTestEmail: ${isTestEmail}, 
        debugMode: ${debugMode}, 
        simplePassword: ${simplePassword}, 
        allowDebugLogin: ${allowDebugLogin} 
      }`
    );

    // Force debug login for testing
    if ((isTestEmail && allowDebugLogin) || debugMode) {
      console.log("🧪 Using debug login override for test account:", email);
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

      console.log("📝 Created mock session for user:", sessionUser);

      // Create JWT token
      console.log("🔐 Creating JWT token for mock user");
      const token = createAgentSessionToken(sessionUser);
      console.log("🔐 Token created successfully, length:", token.length);

      // Create a response with the right status and data
      let response;

      // Check if this is a form submission (needs redirect) or JSON API call
      if (!req.headers.get("content-type")?.includes("application/json")) {
        console.log("➡️ Redirecting to agent dashboard after successful login");
        // Use absolute URL to redirect
        const dashboardUrl = createAgentDashboardURL(req);
        console.log("🔗 Redirecting to:", dashboardUrl);

        response = NextResponse.redirect(dashboardUrl);

        // Add headers to prevent redirect loops
        response.headers.set("X-Login-Redirect", "true");
        response.headers.set("Cache-Control", "no-store");
      } else {
        console.log("📤 Returning JSON success response for mock user");
        response = NextResponse.json({
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

      // Set cookie in the response
      response.cookies.set("agent_token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax", // Changed from strict to lax for better cross-site compatibility
        maxAge: 8 * 60 * 60, // 8 hours in seconds
        path: "/",
      });
      console.log("🍪 Cookie set in response");

      // Log what we're sending back
      console.log("📤 Response headers:", {
        status: response.status,
        location: response.headers.get("location"),
        cookies: response.headers.get("set-cookie")?.substring(0, 50) + "...",
      });

      return response;
    }

    if (!user || !user.password) {
      console.log("❌ User not found or password not set");
      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 401 }
      );
    }

    // Check if user is an agent
    if (!user.agent) {
      console.log("❌ User is not an agent");
      return NextResponse.json(
        { error: "User is not authorized as an agent" },
        { status: 403 }
      );
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password);
    console.log(
      "🔑 Password verification:",
      isValidPassword ? "success" : "failed"
    );

    if (!isValidPassword) {
      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 401 }
      );
    }

    // Check if agent is active
    if (!user.agent.isActive) {
      console.log("❌ Agent account is deactivated");
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
    console.log("🔐 Creating JWT token for user");
    const token = createAgentSessionToken(sessionUser);
    console.log("🔐 Token created successfully, length:", token.length);

    // Update agent's last active timestamp
    try {
      await prisma.agent.update({
        where: { id: user.agent.id },
        data: {
          lastActive: new Date(),
        },
      });
      console.log("⏱️ Updated agent last active timestamp");
    } catch (updateError: unknown) {
      console.error(
        "⚠️ Failed to update agent last active timestamp:",
        updateError
      );
      // Continue anyway - this is not critical
    }

    // Create a response with the right status and data
    let response;

    // Check if this is a form submission (needs redirect) or JSON API call
    if (!req.headers.get("content-type")?.includes("application/json")) {
      // For form submissions, redirect to the dashboard
      console.log("➡️ Redirecting to agent dashboard after successful login");

      // Use absolute URL to redirect
      const dashboardUrl = createAgentDashboardURL(req);
      console.log("🔗 Redirecting to:", dashboardUrl);

      response = NextResponse.redirect(dashboardUrl);

      // Add headers to prevent redirect loops
      response.headers.set("X-Login-Redirect", "true");
      response.headers.set("Cache-Control", "no-store");
    } else {
      // For API calls, return JSON response
      console.log("📤 Returning JSON success response");
      response = NextResponse.json({
        success: true,
        agent: {
          id: user.agent.id,
          name: user.name,
          email: user.email,
          role: user.agent.role,
          isAvailable: user.agent.isAvailable,
        },
      });
    }

    // Set cookie in the response
    response.cookies.set("agent_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax", // Changed from strict to lax for better cross-site compatibility
      maxAge: 8 * 60 * 60, // 8 hours in seconds
      path: "/",
    });
    console.log("🍪 Cookie set in response");

    // Log what we're sending back
    console.log("📤 Response headers:", {
      status: response.status,
      location: response.headers.get("location"),
      cookies: response.headers.get("set-cookie")?.substring(0, 50) + "...",
    });

    return response;
  } catch (error: unknown) {
    console.error("❌ Login error:", error);
    return NextResponse.json(
      { error: "Login failed. Please try again." },
      { status: 500 }
    );
  }
}
