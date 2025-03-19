"use client";

import { useState, useEffect } from "react";
import { useSocket } from "@/contexts/SocketContext";

interface Agent {
  id: string;
  userId: string;
  name: string;
  email: string;
  isActive: boolean;
  isAvailable: boolean;
  isLoggedIn: boolean;
  role: string;
  activeSessions: number;
  lastActive: string;
}

export default function AgentsPage() {
  const socketContext = useSocket();
  const socket = socketContext?.socket;
  const isConnected = socketContext?.isConnected || false;

  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshInterval, setRefreshInterval] = useState(10); // 10 seconds

  // Fetch active agents
  useEffect(() => {
    const fetchAgents = async () => {
      try {
        setLoading(true);
        const cacheBuster = `${Date.now()}-${Math.random()}`;
        const response = await fetch(`/api/agent/team?_=${cacheBuster}`, {
          headers: {
            "Cache-Control": "no-cache, no-store, must-revalidate",
            Pragma: "no-cache",
            Expires: "0",
          },
        });

        if (!response.ok) {
          throw new Error("Failed to fetch agents");
        }

        const data = await response.json();
        setAgents(data.agents);
      } catch (err) {
        console.error("Error fetching agents:", err);
        setError("Failed to load agent data");
      } finally {
        setLoading(false);
      }
    };

    // Initial fetch
    fetchAgents();

    // Set up polling
    const intervalId = setInterval(fetchAgents, refreshInterval * 1000);

    // Clean up on unmount
    return () => clearInterval(intervalId);
  }, [refreshInterval]);

  // Listen for socket events related to agent status changes
  useEffect(() => {
    if (!socket || !isConnected) return;

    // Handle agent status changes
    const handleAgentStatusChange = (data: { agentId: string; status: string }) => {
      setAgents((prevAgents) => {
        return prevAgents.map((agent) => {
          if (agent.id === data.agentId) {
            return {
              ...agent,
              isAvailable: data.status === "available",
              lastActive: new Date().toISOString(),
            };
          }
          return agent;
        });
      });
    };

    // Use type assertion for custom events
    socket.on("agentStatusChange", handleAgentStatusChange);

    // Clean up on unmount
    return () => {
      socket.off("agentStatusChange", handleAgentStatusChange);
    };
  }, [socket, isConnected]);

  // Format last active time
  const formatLastActive = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleString();
  };

  // Get status color
  const getStatusColor = (agent: Agent) => {
    if (agent.isLoggedIn && agent.isActive) {
      // Logged in and active
      return agent.isAvailable 
        ? "bg-green-100 text-green-800"  // Available
        : "bg-yellow-100 text-yellow-800"; // Busy/Away
    } else if (agent.isActive && !agent.isLoggedIn) {
      // Was active recently but not logged in
      return "bg-blue-100 text-blue-700";
    } else {
      // Offline
      return "bg-gray-200 text-gray-700";
    }
  };

  // Get status text
  const getStatusText = (agent: Agent) => {
    if (agent.isLoggedIn && agent.isActive) {
      return agent.isAvailable ? "Available" : "Busy";
    } else if (agent.isActive && !agent.isLoggedIn) {
      return "Recently Active";
    }
    return "Offline";
  };

  // Get load level class
  const getLoadClass = (sessionCount: number) => {
    if (sessionCount === 0) return "bg-gray-100 text-gray-700";
    if (sessionCount < 3) return "bg-green-100 text-green-800";
    if (sessionCount < 5) return "bg-yellow-100 text-yellow-800";
    return "bg-red-100 text-red-800";
  };

  return (
    <div className="container mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-800">Agent Team</h1>
        <p className="text-sm text-gray-500">
          Monitor active agents and their current workload
        </p>
      </div>

      {/* Refresh controls */}
      <div className="mb-4 flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-700">Refresh every:</span>
          <select
            value={refreshInterval}
            onChange={(e) => setRefreshInterval(Number(e.target.value))}
            className="text-sm border rounded p-1 text-gray-700 bg-white"
          >
            <option value={5}>5 seconds</option>
            <option value={10}>10 seconds</option>
            <option value={30}>30 seconds</option>
            <option value={60}>1 minute</option>
          </select>
        </div>

        <span className="text-sm text-gray-700">
          {agents.filter((a) => a.isActive).length} active agents
        </span>
      </div>

      {/* Error message */}
      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">
          {error}
          <button onClick={() => setError(null)} className="ml-2 font-bold">
            ×
          </button>
        </div>
      )}

      {/* Agents list */}
      {loading && agents.length === 0 ? (
        <div className="flex justify-center items-center p-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-blue-500 border-t-transparent"></div>
          <span className="ml-2">Loading agents...</span>
        </div>
      ) : agents.length === 0 ? (
        <div className="bg-white p-8 rounded-lg shadow text-center">
          <svg
            className="mx-auto h-12 w-12 text-gray-500"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
            />
          </svg>
          <h3 className="mt-4 text-lg font-medium text-gray-900">
            No agents found
          </h3>
          <p className="mt-1 text-gray-500">
            There are no agents currently set up in the system.
          </p>
        </div>
      ) : (
        <div className="bg-white shadow-md rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Agent
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Status
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Active Chats
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Role
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Last Active
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {agents.map((agent) => (
                  <tr key={agent.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className={`flex-shrink-0 h-10 w-10 rounded-full flex items-center justify-center ${agent.isLoggedIn ? 'bg-green-100' : 'bg-gray-100'}`}>
                          <span className={`${agent.isLoggedIn ? 'text-green-600' : 'text-gray-600'} font-medium`}>
                            {agent.name?.charAt(0) || "A"}
                          </span>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {agent.name}
                            {agent.isLoggedIn && (
                              <span className="ml-2 px-1.5 py-0.5 text-xs bg-green-100 text-green-800 rounded">
                                Logged In
                              </span>
                            )}
                          </div>
                          <div className="text-sm text-gray-500">{agent.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(
                          agent
                        )}`}
                      >
                        {getStatusText(agent)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getLoadClass(
                          agent.activeSessions
                        )}`}
                      >
                        {agent.activeSessions} {agent.activeSessions === 1 ? "chat" : "chats"}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 capitalize">{agent.role}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatLastActive(agent.lastActive)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
} 