"use client";

import { useState, useEffect } from "react";

interface AnalyticsData {
  metrics: {
    sessions: {
      today: number;
      yesterday: number;
      week: number;
      month: number;
      total: number;
    };
    resolutionRate: number;
    avgResponseTime: number;
    sessionsByDay: Array<{ day: string; count: number }>;
    sessionsByHour: Array<{ hour: number; count: number }>;
    peakHour: number | null;
  };
}

export default function AnalyticsPage() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [dateRange, setDateRange] = useState("month");

  useEffect(() => {
    async function fetchAnalytics() {
      try {
        setLoading(true);
        const response = await fetch(`/api/agent/analytics?range=${dateRange}`);

        if (!response.ok) {
          throw new Error("Failed to fetch analytics data");
        }

        const analyticsData = await response.json();
        setData(analyticsData);
      } catch (err) {
        console.error("Error fetching analytics:", err);
        setError("Failed to load analytics data");
      } finally {
        setLoading(false);
      }
    }

    fetchAnalytics();
  }, [dateRange]);

  const formatTime = (seconds: number): string => {
    if (seconds < 60) {
      return `${seconds} sec`;
    } else if (seconds < 3600) {
      const minutes = Math.floor(seconds / 60);
      const remainingSeconds = seconds % 60;
      return `${minutes}m ${remainingSeconds}s`;
    } else {
      const hours = Math.floor(seconds / 3600);
      const minutes = Math.floor((seconds % 3600) / 60);
      return `${hours}h ${minutes}m`;
    }
  };

  // Format hour for display (e.g., "3 PM", "12 AM")
  const formatHour = (hour: number): string => {
    if (hour === 0) return "12 AM";
    if (hour === 12) return "12 PM";
    return hour < 12 ? `${hour} AM` : `${hour - 12} PM`;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg
                className="h-5 w-5 text-red-500"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
        <button
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Retry
        </button>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="p-6">
        <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg
                className="h-5 w-5 text-yellow-500"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-yellow-700">
                No analytics data available.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const { metrics } = data;

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">
          Agent Performance Analytics
        </h1>
        <div className="inline-flex rounded-md shadow-sm">
          <button
            type="button"
            onClick={() => setDateRange("week")}
            className={`px-4 py-2 text-sm font-medium rounded-l-md ${
              dateRange === "week"
                ? "bg-blue-600 text-white"
                : "bg-white text-gray-700 hover:bg-gray-50"
            } border border-gray-300`}
          >
            This Week
          </button>
          <button
            type="button"
            onClick={() => setDateRange("month")}
            className={`px-4 py-2 text-sm font-medium ${
              dateRange === "month"
                ? "bg-blue-600 text-white"
                : "bg-white text-gray-700 hover:bg-gray-50"
            } border-t border-b border-gray-300`}
          >
            This Month
          </button>
          <button
            type="button"
            onClick={() => setDateRange("all")}
            className={`px-4 py-2 text-sm font-medium rounded-r-md ${
              dateRange === "all"
                ? "bg-blue-600 text-white"
                : "bg-white text-gray-700 hover:bg-gray-50"
            } border border-gray-300`}
          >
            All Time
          </button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-6">
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <dt className="text-sm font-medium text-gray-500 truncate">
              Chat Sessions Today
            </dt>
            <dd className="mt-1 text-3xl font-semibold text-gray-900">
              {metrics.sessions.today}
            </dd>
          </div>
          <div className="bg-gray-50 px-4 py-3">
            <div className="text-sm">
              <span className="text-gray-500">vs Yesterday: </span>
              <span
                className={
                  metrics.sessions.today >= metrics.sessions.yesterday
                    ? "text-green-600"
                    : "text-red-600"
                }
              >
                {metrics.sessions.yesterday > 0
                  ? `${Math.round(
                      (metrics.sessions.today / metrics.sessions.yesterday) *
                        100 -
                        100
                    )}%`
                  : "N/A"}
              </span>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <dt className="text-sm font-medium text-gray-500 truncate">
              Resolution Rate
            </dt>
            <dd className="mt-1 text-3xl font-semibold text-gray-900">
              {metrics.resolutionRate}%
            </dd>
          </div>
          <div className="bg-gray-50 px-4 py-3">
            <div className="text-sm">
              <span className="text-gray-500">Resolved Sessions: </span>
              <span className="text-gray-900">
                {metrics.sessions.total > 0
                  ? `${
                      metrics.sessions.total -
                      (metrics.sessions.total *
                        (100 - metrics.resolutionRate)) /
                        100
                    } of ${metrics.sessions.total}`
                  : "0 of 0"}
              </span>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <dt className="text-sm font-medium text-gray-500 truncate">
              Average Response Time
            </dt>
            <dd className="mt-1 text-3xl font-semibold text-gray-900">
              {formatTime(metrics.avgResponseTime)}
            </dd>
          </div>
          <div className="bg-gray-50 px-4 py-3">
            <div className="text-sm">
              <span className="text-gray-500">Target: </span>
              <span
                className={
                  metrics.avgResponseTime <= 60
                    ? "text-green-600"
                    : "text-red-600"
                }
              >
                {metrics.avgResponseTime <= 60
                  ? "Meeting target"
                  : "Above target"}
              </span>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <dt className="text-sm font-medium text-gray-500 truncate">
              Total Chat Sessions
            </dt>
            <dd className="mt-1 text-3xl font-semibold text-gray-900">
              {metrics.sessions.month}
            </dd>
          </div>
          <div className="bg-gray-50 px-4 py-3">
            <div className="text-sm">
              <span className="text-gray-500">Last 30 days</span>
            </div>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2 mb-6">
        {/* Sessions by Day */}
        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            Busiest Days
          </h3>
          <div className="h-64">
            {metrics.sessionsByDay.length > 0 ? (
              <div className="space-y-4">
                {metrics.sessionsByDay.map((dayData) => (
                  <div key={dayData.day} className="relative">
                    <div className="flex items-center">
                      <div className="w-24 text-sm font-medium text-gray-600">
                        {dayData.day}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center">
                          <div
                            className="bg-blue-500 h-5 rounded-md"
                            style={{
                              width: `${
                                (dayData.count /
                                  metrics.sessionsByDay[0].count) *
                                100
                              }%`,
                              minWidth: "8px",
                            }}
                          ></div>
                          <span className="ml-3 text-sm font-medium text-gray-900">
                            {dayData.count}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex items-center justify-center h-full text-gray-500">
                No day data available
              </div>
            )}
          </div>
        </div>

        {/* Sessions by Hour */}
        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            Peak Hours
            {metrics.peakHour !== null && (
              <span className="text-sm font-normal text-gray-500 ml-2">
                (Busiest: {formatHour(metrics.peakHour)})
              </span>
            )}
          </h3>
          <div className="h-64">
            {metrics.sessionsByHour.length > 0 ? (
              <div className="space-y-4">
                {metrics.sessionsByHour.slice(0, 5).map((hourData) => (
                  <div key={hourData.hour} className="relative">
                    <div className="flex items-center">
                      <div className="w-24 text-sm font-medium text-gray-600">
                        {formatHour(hourData.hour)}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center">
                          <div
                            className="bg-indigo-500 h-5 rounded-md"
                            style={{
                              width: `${
                                (hourData.count /
                                  metrics.sessionsByHour[0].count) *
                                100
                              }%`,
                              minWidth: "8px",
                            }}
                          ></div>
                          <span className="ml-3 text-sm font-medium text-gray-900">
                            {hourData.count}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex items-center justify-center h-full text-gray-500">
                No hour data available
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Tips and Recommendations */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">
            Performance Insights
          </h3>
        </div>
        <div className="px-4 py-3 sm:px-6">
          <div className="space-y-4">
            {metrics.avgResponseTime > 60 && (
              <div className="flex items-start">
                <div className="flex-shrink-0 mt-0.5">
                  <svg
                    className="h-5 w-5 text-yellow-500"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <div className="ml-3">
                  <h4 className="text-sm font-medium text-gray-900">
                    Response Time Needs Improvement
                  </h4>
                  <p className="mt-1 text-sm text-gray-600">
                    Your average response time is{" "}
                    {formatTime(metrics.avgResponseTime)}, which is above the
                    target of 1 minute. Consider using quick reply templates for
                    common questions.
                  </p>
                </div>
              </div>
            )}

            {metrics.resolutionRate < 80 && (
              <div className="flex items-start">
                <div className="flex-shrink-0 mt-0.5">
                  <svg
                    className="h-5 w-5 text-yellow-500"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <div className="ml-3">
                  <h4 className="text-sm font-medium text-gray-900">
                    Resolution Rate Can Be Improved
                  </h4>
                  <p className="mt-1 text-sm text-gray-600">
                    Your resolution rate is {metrics.resolutionRate}%, which is
                    below the target of 80%. Review unresolved chats to identify
                    common issues that could be addressed more effectively.
                  </p>
                </div>
              </div>
            )}

            {metrics.peakHour !== null && (
              <div className="flex items-start">
                <div className="flex-shrink-0 mt-0.5">
                  <svg
                    className="h-5 w-5 text-blue-500"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 01-1-1V9a1 1 0 012 0v4a1 1 0 01-1 1z"
                      clipRule="evenodd"
                    />
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm0-2a6 6 0 110-12 6 6 0 010 12z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <div className="ml-3">
                  <h4 className="text-sm font-medium text-gray-900">
                    Peak Hour Awareness
                  </h4>
                  <p className="mt-1 text-sm text-gray-600">
                    Your busiest hour is {formatHour(metrics.peakHour)}.
                    Consider adjusting your availability to ensure coverage
                    during this peak time for better customer service.
                  </p>
                </div>
              </div>
            )}

            {metrics.sessionsByDay.length > 0 && (
              <div className="flex items-start">
                <div className="flex-shrink-0 mt-0.5">
                  <svg
                    className="h-5 w-5 text-blue-500"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <div className="ml-3">
                  <h4 className="text-sm font-medium text-gray-900">
                    Busiest Day Planning
                  </h4>
                  <p className="mt-1 text-sm text-gray-600">
                    {metrics.sessionsByDay[0].day} is your busiest day with{" "}
                    {metrics.sessionsByDay[0].count} chats. Ensure you&apos;re
                    well-prepared for this day to maximize efficiency.
                  </p>
                </div>
              </div>
            )}

            {metrics.avgResponseTime <= 30 && metrics.resolutionRate >= 90 && (
              <div className="flex items-start">
                <div className="flex-shrink-0 mt-0.5">
                  <svg
                    className="h-5 w-5 text-green-500"
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
                </div>
                <div className="ml-3">
                  <h4 className="text-sm font-medium text-gray-900">
                    Excellent Performance!
                  </h4>
                  <p className="mt-1 text-sm text-gray-600">
                    You&apos;re maintaining an excellent response time and
                    resolution rate. Keep up the great work!
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
