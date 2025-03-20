"use client";

import { useRouter } from "next/navigation";

interface Agent {
  id: string;
  name?: string;
  email?: string;
  role: string;
  isActive: boolean;
  isAvailable: boolean;
  activeSessions: number;
  waitingSessions: number;
}

interface AgentDashboardLayoutProps {
  agent: Agent;
  isConnected: boolean;
  isFallbackMode?: boolean;
}

export function AgentDashboardLayout({
  agent,
  isConnected,
  isFallbackMode = false,
}: AgentDashboardLayoutProps) {
  const router = useRouter();

  const handleLogout = () => {
    // Clear cookies and redirect
    document.cookie =
      "agent_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
    router.push("/login/agent?logout=true");
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-800">Agent Dashboard</h1>

          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-sm text-gray-600">Logged in as</p>
              <p className="font-medium">
                {agent.name || agent.email || "Agent"}
              </p>
              {!isConnected && (
                <span className="inline-block px-2 py-1 text-xs bg-amber-100 text-amber-800 rounded">
                  Offline Mode
                </span>
              )}
              {isFallbackMode && (
                <span className="inline-block px-2 py-1 text-xs bg-yellow-100 text-yellow-800 rounded">
                  Debug Mode
                </span>
              )}
            </div>

            <button
              onClick={handleLogout}
              className="px-4 py-2 text-sm font-medium text-white bg-primary rounded-md hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {isFallbackMode && (
          <div className="mb-6 p-4 text-amber-700 bg-amber-100 rounded-md">
            Running in debug mode. Some features may be limited.
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

          <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-green-50 p-4 rounded-md">
              <h3 className="font-medium text-green-800">Waiting Chats</h3>
              <p className="text-2xl font-bold">{agent.waitingSessions}</p>
            </div>

            <div className="bg-blue-50 p-4 rounded-md">
              <h3 className="font-medium text-blue-800">Active Chats</h3>
              <p className="text-2xl font-bold">{agent.activeSessions}</p>
            </div>

            <div
              className={`p-4 rounded-md ${
                agent.isAvailable ? "bg-green-50" : "bg-gray-50"
              }`}
            >
              <h3 className="font-medium text-gray-800">Status</h3>
              <p className="text-lg font-bold">
                {agent.isAvailable ? (
                  <span className="text-green-600">Available</span>
                ) : (
                  <span className="text-gray-600">Unavailable</span>
                )}
              </p>
              <button className="mt-2 text-sm px-3 py-1 rounded bg-white border border-gray-200 hover:bg-gray-50">
                Toggle Status
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
