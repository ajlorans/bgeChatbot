"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function SimpleLogin() {
  const router = useRouter();
  const [email, setEmail] = useState("agent@example.com");
  const [password, setPassword] = useState("password123");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/agent/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      if (response.ok) {
        // Successfully logged in, redirect to dashboard
        router.push("/agent-dashboard");
      } else {
        const data = await response.json();
        setError(data.error || "Login failed");
      }
    } catch (err) {
      console.error("Login error:", err);
      setError("Network error. Try using the bypass link below.");
    } finally {
      setLoading(false);
    }
  };

  const handleBypass = () => {
    // Set cookie directly in browser
    document.cookie = `agent_token=BYPASS_TOKEN_${Date.now()}; path=/; max-age=${
      8 * 60 * 60
    }; SameSite=Lax`;

    // Redirect to dashboard
    router.push("/agent-dashboard");
  };

  return (
    <div className="flex min-h-screen bg-gray-100 items-center justify-center">
      <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-lg shadow-md">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-800">Agent Login</h1>
          <p className="mt-2 text-gray-600">Simple login page</p>
        </div>

        {error && (
          <div className="p-3 text-sm text-red-700 bg-red-100 rounded">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="mt-8 space-y-6">
          <div className="space-y-4">
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700"
              >
                Email
              </label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="block w-full px-3 py-2 mt-1 border border-gray-300 rounded-md"
                required
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
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="block w-full px-3 py-2 mt-1 border border-gray-300 rounded-md"
                required
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="w-full px-4 py-2 text-white bg-green-600 rounded-md hover:bg-green-700"
            >
              {loading ? "Signing in..." : "Sign in"}
            </button>
          </div>
        </form>

        <div className="mt-4 text-center">
          <button
            onClick={handleBypass}
            className="text-blue-600 hover:underline"
          >
            Bypass Login (Debug Mode)
          </button>
        </div>
      </div>
    </div>
  );
}
