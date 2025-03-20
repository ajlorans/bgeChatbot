"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

export default function SimpleLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  async function handleLogin(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      console.log("Attempting login with:", email);

      // Send login request
      const response = await fetch("/api/agent/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      // Log the response for debugging
      console.log("Login response:", response.status, data);

      if (!response.ok) {
        throw new Error(data.error || "Login failed");
      }

      if (data.success) {
        console.log("Login successful, redirecting to dashboard");

        // Use the redirect URL from the response or default to /agent-dashboard/
        const redirectUrl = data.redirectTo || "/agent-dashboard/";

        // Small delay to allow cookie to be set
        setTimeout(() => {
          router.push(redirectUrl);
        }, 500);
      } else {
        throw new Error("Login response didn't indicate success");
      }
    } catch (err: unknown) {
      console.error("Login error:", err);
      setError(
        err instanceof Error
          ? err.message
          : "Failed to login. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }

  // Functions to set test account credentials
  function setAgentAccount() {
    setEmail("agent@example.com");
    setPassword("password123");
  }

  function setAdminAccount() {
    setEmail("admin@example.com");
    setPassword("password123");
  }

  return (
    <div className="max-w-sm mx-auto p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-6 text-center">Agent Login</h2>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 rounded">
          {error}
        </div>
      )}

      <form onSubmit={handleLogin}>
        <div className="mb-4">
          <label htmlFor="email" className="block text-gray-700 mb-2">
            Email
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded"
            required
          />
        </div>

        <div className="mb-6">
          <label htmlFor="password" className="block text-gray-700 mb-2">
            Password
          </label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded"
            required
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className={`w-full p-2 text-white rounded ${
            loading ? "bg-blue-400" : "bg-blue-600 hover:bg-blue-700"
          }`}
        >
          {loading ? "Logging in..." : "Login"}
        </button>
      </form>

      {/* Test accounts section */}
      <div className="mt-8 pt-4 border-t border-gray-200">
        <p className="text-sm text-gray-500 mb-2">Test Accounts:</p>
        <div className="flex space-x-2">
          <button
            onClick={setAgentAccount}
            className="px-3 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded"
          >
            Use Agent Account
          </button>
          <button
            onClick={setAdminAccount}
            className="px-3 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded"
          >
            Use Admin Account
          </button>
        </div>
        <p className="text-xs text-gray-400 mt-2">
          Both test accounts use password: password123
        </p>
      </div>
    </div>
  );
}
