"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useSocket } from "@/contexts/SocketContext";
import { useUser } from "@/components/UserProvider";

interface DashboardStats {
  activeSessions: number;
  waitingSessions: number;
  totalSessionsToday: number;
  avgResponseTime: number;
  resolvedSessions: number;
}

interface ActivityItem {
  type: string;
  content: string;
  timestamp: string;
  sessionId?: string;
}

export default function AgentDashboardPage() {
  const { user } = useUser();
  const { isConnected } = useSocket();
  const [stats, setStats] = useState<DashboardStats>({
    activeSessions: 0,
    waitingSessions: 0,
    totalSessionsToday: 0,
    avgResponseTime: 0,
    resolvedSessions: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [recentActivity, setRecentActivity] = useState<ActivityItem[]>([]);

  // Fetch dashboard stats
  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const response = await fetch("/api/agent/me", {
          credentials: "include",
        });

        if (!response.ok) {
          throw new Error("Failed to fetch agent data");
        }

        const data = await response.json();

        if (!data.authenticated) {
          throw new Error("Not authenticated");
        }

        // Update stats with real data
        setStats((prevStats) => ({
          ...prevStats,
          activeSessions: data.stats.activeSessions,
          waitingSessions: data.stats.waitingSessions,
        }));

        // Fetch additional stats
        const statsResponse = await fetch("/api/agent/dashboard-stats", {
          credentials: "include",
        });
        if (statsResponse.ok) {
          const statsData = await statsResponse.json();
          setStats((prevStats) => ({
            ...prevStats,
            totalSessionsToday: statsData.totalSessionsToday || 0,
            avgResponseTime: statsData.avgResponseTime || 0,
            resolvedSessions: statsData.resolvedSessions || 0,
          }));
        }

        // Fetch recent activity
        const activityResponse = await fetch("/api/agent/recent-activity", {
          credentials: "include",
        });
        if (activityResponse.ok) {
          const activityData = await activityResponse.json();
          setRecentActivity(activityData.activities || []);
        }

        setLoading(false);
      } catch (err) {
        console.error("Error fetching dashboard data:", err);
        setError("Failed to load dashboard data");
        setLoading(false);
      }
    };

    // Initial fetch
    fetchStats();

    // Set up refresh interval (every 10 seconds to check for new waiting chats)
    const intervalId = setInterval(fetchStats, 10000);

    // Also set up a faster refresh just for waiting chats
    const waitingChatsIntervalId = setInterval(async () => {
      try {
        const response = await fetch("/api/agent/me", {
          credentials: "include",
        });

        if (response.ok) {
          const data = await response.json();
          if (data.authenticated) {
            setStats((prevStats) => ({
              ...prevStats,
              waitingSessions: data.stats.waitingSessions,
            }));
          }
        }
      } catch (error) {
        console.error("Error refreshing waiting chats count:", error);
      }
    }, 5000);

    return () => {
      clearInterval(intervalId);
      clearInterval(waitingChatsIntervalId);
    };
  }, []);

  // Note: We've removed the socket event listeners due to type compatibility issues.
  // In a production environment, you would properly type these events.

  const getFormattedTime = (minutes: number) => {
    if (minutes < 1) return "< 1 min";
    if (minutes < 60) return `${Math.round(minutes)} min`;
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = Math.round(minutes % 60);
    return `${hours}h ${remainingMinutes}m`;
  };

  // Determine if waiting sessions need attention (more than 2 waiting)
  const waitingSessionsNeedAttention = stats.waitingSessions > 2;

  return (
    <div className="container mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-800">
          Welcome, {user?.name || "Agent"}
        </h1>
        <p className="text-sm text-gray-500">
          Here&apos;s an overview of your live chat activity
        </p>
      </div>

      {/* Error message */}
      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">
          {error}
          <button onClick={() => setError("")} className="ml-2 font-bold">
            ×
          </button>
        </div>
      )}

      {/* Connection status */}
      <div className="mb-4">
        <span
          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
            isConnected
              ? "bg-green-100 text-green-800"
              : "bg-red-100 text-red-800"
          }`}
        >
          <span
            className={`h-2 w-2 mr-1 rounded-full ${
              isConnected ? "bg-green-400" : "bg-red-400"
            }`}
          />
          {isConnected ? "Connected" : "Disconnected"}
        </span>
      </div>

      {/* Stats cards */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {[...Array(5)].map((_, i) => (
            <div
              key={i}
              className="bg-white rounded-lg shadow p-6 h-32 animate-pulse"
            >
              <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
              <div className="h-8 bg-gray-200 rounded w-1/4 mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Active chats */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm text-gray-500 mb-1">Active Chats</p>
                <h2 className="text-3xl font-bold text-gray-800">
                  {stats.activeSessions}
                </h2>
                <p className="text-xs text-gray-500 mt-1">
                  {stats.activeSessions === 0
                    ? "No active chats"
                    : stats.activeSessions === 1
                    ? "1 conversation"
                    : `${stats.activeSessions} conversations`}
                </p>
              </div>
              <span className="rounded-full bg-blue-100 p-2">
                <svg
                  className="w-5 h-5 text-blue-600"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path d="M2 5a2 2 0 012-2h7a2 2 0 012 2v4a2 2 0 01-2 2H9l-3 3v-3H4a2 2 0 01-2-2V5z" />
                  <path d="M15 7v2a4 4 0 01-4 4H9.828l-1.766 1.767c.28.149.599.233.938.233h2l3 3v-3h2a2 2 0 002-2V9a2 2 0 00-2-2h-1z" />
                </svg>
              </span>
            </div>
            {stats.activeSessions > 0 && (
              <div className="mt-4">
                <Link
                  href="/agent-dashboard/active-chats"
                  className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                >
                  View active chats →
                </Link>
              </div>
            )}
          </div>

          {/* Waiting chats */}
          <div
            className={`bg-white rounded-lg shadow p-6 ${
              waitingSessionsNeedAttention ? "border-l-4 border-yellow-500" : ""
            }`}
          >
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm text-gray-500 mb-1">Waiting Customers</p>
                <h2 className="text-3xl font-bold text-gray-800">
                  {stats.waitingSessions}
                </h2>
                <p className="text-xs text-gray-500 mt-1">
                  {waitingSessionsNeedAttention ? (
                    <span className="text-yellow-600 font-medium">
                      Requires attention
                    </span>
                  ) : (
                    "No immediate action needed"
                  )}
                </p>
              </div>
              <span
                className={`rounded-full ${
                  waitingSessionsNeedAttention
                    ? "bg-yellow-100"
                    : "bg-green-100"
                } p-2`}
              >
                <svg
                  className={`w-5 h-5 ${
                    waitingSessionsNeedAttention
                      ? "text-yellow-600"
                      : "text-green-600"
                  }`}
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z"
                    clipRule="evenodd"
                  />
                </svg>
              </span>
            </div>
            {stats.waitingSessions > 0 && (
              <div className="mt-4">
                <Link
                  href="/agent-dashboard/waiting-chats"
                  className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                >
                  View waiting customers →
                </Link>
              </div>
            )}
          </div>

          {/* Resolved today */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm text-gray-500 mb-1">Resolved Today</p>
                <h2 className="text-3xl font-bold text-gray-800">
                  {stats.resolvedSessions}
                </h2>
                <p className="text-xs text-gray-500 mt-1">
                  {stats.totalSessionsToday > 0
                    ? `${Math.round(
                        (stats.resolvedSessions / stats.totalSessionsToday) *
                          100
                      )}% resolution rate`
                    : "No sessions today"}
                </p>
              </div>
              <span className="rounded-full bg-green-100 p-2">
                <svg
                  className="w-5 h-5 text-green-600"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
              </span>
            </div>
          </div>

          {/* Avg Response Time */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm text-gray-500 mb-1">Avg Response Time</p>
                <h2 className="text-3xl font-bold text-gray-800">
                  {getFormattedTime(stats.avgResponseTime)}
                </h2>
                <p className="text-xs text-gray-500 mt-1">
                  {stats.avgResponseTime <= 2
                    ? "Excellent"
                    : stats.avgResponseTime <= 5
                    ? "Good"
                    : "Needs improvement"}
                </p>
              </div>
              <span className="rounded-full bg-purple-100 p-2">
                <svg
                  className="w-5 h-5 text-purple-600"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z"
                    clipRule="evenodd"
                  />
                </svg>
              </span>
            </div>
          </div>

          {/* Total Sessions Today */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm text-gray-500 mb-1">
                  Total Sessions Today
                </p>
                <h2 className="text-3xl font-bold text-gray-800">
                  {stats.totalSessionsToday}
                </h2>
                <p className="text-xs text-gray-500 mt-1">
                  Including active, waiting, and resolved
                </p>
              </div>
              <span className="rounded-full bg-indigo-100 p-2">
                <svg
                  className="w-5 h-5 text-indigo-600"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z" />
                </svg>
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Quick actions */}
      <div className="mb-8">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">
          Quick Actions
        </h2>
        <div className="flex flex-wrap gap-4">
          <Link
            href="/agent-dashboard/active-chats"
            className="flex items-center px-4 py-2 bg-blue-50 text-blue-700 rounded-md hover:bg-blue-100 transition-colors"
          >
            <svg
              className="w-5 h-5 mr-2"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path d="M2 5a2 2 0 012-2h7a2 2 0 012 2v4a2 2 0 01-2 2H9l-3 3v-3H4a2 2 0 01-2-2V5z" />
              <path d="M15 7v2a4 4 0 01-4 4H9.828l-1.766 1.767c.28.149.599.233.938.233h2l3 3v-3h2a2 2 0 002-2V9a2 2 0 00-2-2h-1z" />
            </svg>
            View Active Chats
          </Link>
          <Link
            href="/agent-dashboard/waiting-chats"
            className={`flex items-center px-4 py-2 ${
              waitingSessionsNeedAttention
                ? "bg-yellow-50 text-yellow-700"
                : "bg-green-50 text-green-700"
            } rounded-md hover:bg-opacity-80 transition-colors`}
          >
            <svg
              className="w-5 h-5 mr-2"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z"
                clipRule="evenodd"
              />
            </svg>
            {waitingSessionsNeedAttention
              ? "Assist Waiting Customers"
              : "Check Waiting Queue"}
          </Link>
          <Link
            href="/agent-dashboard/history"
            className="flex items-center px-4 py-2 bg-purple-50 text-purple-700 rounded-md hover:bg-purple-100 transition-colors"
          >
            <svg
              className="w-5 h-5 mr-2"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M4 2a2 2 0 00-2 2v11a3 3 0 106 0V4a2 2 0 00-2-2H4zm1 14a1 1 0 100-2 1 1 0 000 2zm5-1.757l4.9-4.9a2 2 0 000-2.828L13.485 5.1a2 2 0 00-2.828 0L10 5.757v8.486zM16 18H9.071l6-6H16a2 2 0 012 2v2a2 2 0 01-2 2z"
                clipRule="evenodd"
              />
            </svg>
            View Chat History
          </Link>
        </div>
      </div>

      {/* Recent activity */}
      <div>
        <h2 className="text-lg font-semibold text-gray-800 mb-4">
          Recent Activity
        </h2>
        {loading ? (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="animate-pulse p-4 space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="flex space-x-4">
                  <div className="rounded-full bg-gray-200 h-10 w-10"></div>
                  <div className="flex-1 space-y-2 py-1">
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                    <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : recentActivity.length > 0 ? (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <ul className="divide-y divide-gray-200">
              {recentActivity.map((activity, index) => (
                <li
                  key={index}
                  className="p-4 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-start">
                    <div
                      className={`rounded-full p-2 ${
                        activity.type === "new_session"
                          ? "bg-green-100 text-green-600"
                          : activity.type === "message"
                          ? "bg-blue-100 text-blue-600"
                          : activity.type === "session_closed"
                          ? "bg-red-100 text-red-600"
                          : "bg-gray-100 text-gray-600"
                      } mr-3`}
                    >
                      {activity.type === "new_session" && (
                        <svg
                          className="w-5 h-5"
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                        >
                          <path d="M2 5a2 2 0 012-2h7a2 2 0 012 2v4a2 2 0 01-2 2H9l-3 3v-3H4a2 2 0 01-2-2V5z" />
                          <path d="M15 7v2a4 4 0 01-4 4H9.828l-1.766 1.767c.28.149.599.233.938.233h2l3 3v-3h2a2 2 0 002-2V9a2 2 0 00-2-2h-1z" />
                        </svg>
                      )}
                      {activity.type === "message" && (
                        <svg
                          className="w-5 h-5"
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                        >
                          <path
                            fillRule="evenodd"
                            d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z"
                            clipRule="evenodd"
                          />
                        </svg>
                      )}
                      {activity.type === "session_closed" && (
                        <svg
                          className="w-5 h-5"
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                        >
                          <path
                            fillRule="evenodd"
                            d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                            clipRule="evenodd"
                          />
                        </svg>
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-gray-800">
                        {activity.content}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        {activity.timestamp}
                      </p>
                    </div>
                    {activity.sessionId && (
                      <Link
                        href={`/agent-dashboard/sessions/${activity.sessionId}`}
                        className="text-xs text-blue-600 hover:text-blue-800"
                      >
                        View →
                      </Link>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow p-6 text-center">
            <svg
              className="mx-auto h-12 w-12 text-gray-500"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <h3 className="mt-4 text-lg font-medium text-gray-900">
              No recent activity
            </h3>
            <p className="mt-1 text-gray-500">
              Your recent chat activity will appear here
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
