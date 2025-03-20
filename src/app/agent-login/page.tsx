"use client";

import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Image from "next/image";
import SimpleLogin from "./simple-login";

export const dynamic = "force-dynamic";

export default function AgentLogin() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const logoutParam = searchParams?.get("logout");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [showDevOptions, setShowDevOptions] = useState(false);
  const [usingFallback, setUsingFallback] = useState(false);

  // Handle direct bypass with a properly formatted bypass token
  const handleBypass = () => {
    try {
      // Create a simple JWT-like token format that our agent/me endpoint can recognize
      const mockToken = btoa(
        JSON.stringify({
          id: "debug-bypass-id",
          email: "agent@example.com",
          role: "agent",
          agentId: "debug-agent-id",
          exp: Math.floor(Date.now() / 1000) + 8 * 60 * 60, // 8 hours from now
        })
      );

      // Set cookie directly in browser
      document.cookie = `agent_token=${mockToken}; path=/; max-age=${
        8 * 60 * 60
      }; SameSite=Lax`;

      console.log("Debug bypass activated, redirecting to dashboard");

      // Redirect to dashboard
      window.location.href = "/agent-dashboard";
    } catch (error) {
      console.error("Error during bypass:", error);
      setError("Failed to activate debug mode. Try normal login instead.");
    }
  };

  // Handle login form submission with JSON
  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // Validate input
    if (!email || !password) {
      setError("Email and password are required");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/agent/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          password,
          redirectUrl: "/agent-dashboard",
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Login failed");
        setLoading(false);
        return;
      }

      // Successful login - redirect
      if (data.redirectTo) {
        router.push(data.redirectTo);
      } else {
        router.push("/agent-dashboard/");
      }
    } catch (err) {
      console.error("Login error:", err);
      setError("An error occurred during login. Please try again.");
      setLoading(false);
    }
  };

  // Try to detect JS loading errors and use fallback if needed
  useEffect(() => {
    try {
      // Check if we're in development mode
      const isDev =
        window.location.hostname === "localhost" ||
        window.location.hostname === "127.0.0.1" ||
        window.location.hostname.includes("vercel.app");

      setShowDevOptions(isDev);

      // Pre-fill test credentials in development
      if (isDev) {
        setEmail("agent@example.com");
        setPassword("password123");
      }
    } catch (error) {
      console.error("JS error detected, switching to fallback login:", error);
      setUsingFallback(true);
    }
  }, []);

  // Only handle logout when the URL has ?logout=true
  useEffect(() => {
    if (logoutParam === "true") {
      fetch("/api/agent/logout", { method: "POST" })
        .then((response) => {
          if (response.ok) {
            setSuccessMessage("You have been successfully logged out.");
            // Update URL without refreshing
            window.history.replaceState({}, "", "/agent-login");
          }
        })
        .catch((err) => console.error("Logout error:", err));
    }
  }, [logoutParam]);

  // If using fallback, show simple login
  if (usingFallback) {
    return <SimpleLogin />;
  }

  // Form with JavaScript-based submission for JSON data
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-lg shadow-md">
        <div className="text-center">
          <div className="flex justify-center mb-4">
            <Image
              src="/bge-logo.png"
              alt="Big Green Egg Logo"
              width={120}
              height={120}
              priority
            />
          </div>
          <h1 className="text-2xl font-bold text-gray-800">Agent Portal</h1>
          <p className="mt-2 text-gray-600">
            Sign in to access the customer support dashboard
          </p>
        </div>

        {successMessage && (
          <div className="p-3 text-sm text-green-700 bg-green-100 rounded">
            {successMessage}
          </div>
        )}

        {error && (
          <div className="p-3 text-sm text-red-700 bg-red-100 rounded">
            {error}
          </div>
        )}

        {/* Use JS-based form submission to ensure JSON format */}
        <form onSubmit={handleLogin} className="mt-8 space-y-6">
          <div className="space-y-4">
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700"
              >
                Email address
              </label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="block w-full px-3 py-2 mt-1 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500 text-gray-700"
                placeholder="agent@example.com"
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700"
              >
                Password
              </label>
              <input
                id="password"
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="block w-full px-3 py-2 mt-1 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500 text-gray-700"
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="flex justify-center w-full px-4 py-2 text-sm font-medium text-white bg-green-600 border border-transparent rounded-md shadow-sm hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:bg-green-300"
            >
              {loading ? "Signing in..." : "Sign in"}
            </button>
          </div>

          {showDevOptions && (
            <div className="mt-4 text-center">
              <p className="text-xs text-gray-500 mb-2">Development options:</p>
              <button
                type="button"
                onClick={handleBypass}
                className="text-xs text-blue-600 hover:underline"
              >
                Bypass login (development only)
              </button>
            </div>
          )}

          <div className="text-sm text-center text-gray-500">
            <p>For agent access, please contact your administrator</p>
          </div>
        </form>
      </div>
    </div>
  );
}
