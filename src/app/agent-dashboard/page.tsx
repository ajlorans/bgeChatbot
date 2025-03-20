"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function AgentDashboard() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [agent, setAgent] = useState<any>(null);
  const [error, setError] = useState("");
  const [manualOverride, setManualOverride] = useState(false);

  useEffect(() => {
    // Check if there's a bypass cookie
    const cookies = document.cookie.split(";").map((c) => c.trim());
    const hasToken = cookies.some((c) => c.startsWith("agent_token="));
    const hasBypassToken = cookies.some((c) =>
      c.startsWith("agent_token=BYPASS_TOKEN_")
    );

    // If no token at all, redirect to login
    if (!hasToken) {
      router.push("/agent-login");
      return;
    }

    // For bypass tokens, create a mock agent
    if (hasBypassToken) {
      console.log("Using bypass token for dashboard");
      // Create a mock agent for development/testing
      setAgent({
        id: "agent-test-id",
        name: "Test Agent",
        email: "agent@example.com",
        role: "agent",
        status: "active",
        agentId: "agent-id",
      });
      setLoading(false);
      setManualOverride(true);
      return;
    }

    // Try to fetch the agent data but don't block on failure
    fetch("/api/agent/me")
      .then(async (res) => {
        if (!res.ok) {
          if (res.status === 401) {
            // Unauthorized - redirect to login
            router.push("/agent-login");
            throw new Error("Not authenticated");
          }
          throw new Error(`API error: ${res.status}`);
        }
        return res.json();
      })
      .then((data) => {
        if (data.authenticated && data.user) {
          setAgent(data.user);
        } else {
          throw new Error("Invalid response");
        }
      })
      .catch((err) => {
        console.error("Error fetching agent data:", err);
        setError("Failed to load agent data. Using debug mode.");

        // In development, create a mock agent as fallback
        if (
          window.location.hostname.includes("vercel.app") ||
          window.location.hostname === "localhost"
        ) {
          setAgent({
            id: "agent-fallback-id",
            name: "Fallback Agent",
            email: "agent@example.com",
            role: "agent",
            status: "active",
            agentId: "agent-id",
          });
          setManualOverride(true);
        }
      })
      .finally(() => {
        setLoading(false);
      });
  }, [router]);

  const handleLogout = () => {
    // Clear cookies and redirect
    document.cookie =
      "agent_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
    router.push("/agent-login?logout=true");
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="p-8 bg-white rounded-lg shadow-md">
          <h1 className="text-2xl font-bold mb-4">Loading...</h1>
          <p>Setting up your dashboard</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-800">Agent Dashboard</h1>

          <div className="flex items-center gap-4">
            {agent && (
              <div className="text-right">
                <p className="text-sm text-gray-600">Logged in as</p>
                <p className="font-medium">{agent.name || agent.email}</p>
                {manualOverride && (
                  <span className="inline-block px-2 py-1 text-xs bg-yellow-100 text-yellow-800 rounded">
                    Debug Mode
                  </span>
                )}
              </div>
            )}

            <button
              onClick={handleLogout}
              className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {error && (
          <div className="mb-6 p-4 text-amber-700 bg-amber-100 rounded-md">
            {error}
          </div>
        )}

        <div className="bg-white overflow-hidden shadow rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">
            Welcome to the Agent Dashboard
          </h2>
          <p className="mb-4">
            This dashboard allows you to manage customer conversations and
            support tickets.
          </p>

          {manualOverride ? (
            <div className="mt-4 p-4 bg-yellow-50 rounded-md">
              <h3 className="font-medium text-yellow-800">Debug Mode Active</h3>
              <p className="text-sm text-yellow-700 mt-1">
                You're seeing this dashboard in debug mode. Some features may be
                limited.
              </p>
            </div>
          ) : (
            <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-green-50 p-4 rounded-md">
                <h3 className="font-medium text-green-800">Available Chats</h3>
                <p className="text-2xl font-bold">0</p>
              </div>

              <div className="bg-blue-50 p-4 rounded-md">
                <h3 className="font-medium text-blue-800">Active Chats</h3>
                <p className="text-2xl font-bold">0</p>
              </div>

              <div className="bg-purple-50 p-4 rounded-md">
                <h3 className="font-medium text-purple-800">Completed Today</h3>
                <p className="text-2xl font-bold">0</p>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
