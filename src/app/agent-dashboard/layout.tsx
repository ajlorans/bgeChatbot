"use client";

import { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { useUser } from "@/components/UserProvider";
import { useSocket } from "@/contexts/SocketContext";

export default function AgentDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, loading, logout } = useUser();
  const { socket, isConnected } = useSocket();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Check authentication status
  useEffect(() => {
    if (!loading && !user) {
      router.push("/agent-login");
    }
  }, [user, loading, router]);

  // Handle logout
  const handleLogout = async () => {
    await logout();
    router.push("/agent-login?logout=true");
  };

  // Update agent status via socket
  const updateStatus = (status: string) => {
    if (socket && isConnected) {
      socket.emit("updateStatus", { status });
    }
  };

  // Get status color
  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-500";
      case "away":
        return "bg-yellow-500";
      case "offline":
        return "bg-gray-500";
      default:
        return "bg-gray-300";
    }
  };

  // Show loading state while checking auth
  if (loading || !user) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-blue-500 border-t-transparent"></div>
          <p className="mt-2 text-gray-500">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      {/* Top Navigation */}
      <header className="bg-white shadow-sm">
        <div className="mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              {/* Mobile menu button */}
              <button
                type="button"
                className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 md:hidden hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500"
                onClick={() => setSidebarOpen(!sidebarOpen)}
              >
                <span className="sr-only">Open sidebar</span>
                <svg
                  className="block h-6 w-6"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                </svg>
              </button>

              {/* Logo */}
              <div className="flex-shrink-0 flex items-center">
                <Link href="/agent-dashboard">
                  <Image
                    className="block h-8 w-auto"
                    src="/logo.png"
                    alt="Logo"
                    width={32}
                    height={32}
                  />
                </Link>
                <span className="ml-2 text-xl font-semibold">Agent Portal</span>
              </div>
            </div>

            {/* User menu */}
            <div className="flex items-center">
              {/* Status indicator */}
              <div className="mr-4">
                <div className="relative">
                  <button
                    type="button"
                    className="flex items-center text-sm rounded-full focus:outline-none"
                  >
                    <span
                      className={`h-3 w-3 rounded-full ${getStatusColor(
                        user.status || "active"
                      )} mr-2`}
                    ></span>
                    <span className="capitalize text-gray-900">
                      {user.status || "active"}
                    </span>
                  </button>
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-10 hidden">
                    <div className="py-1">
                      <button
                        onClick={() => updateStatus("active")}
                        className="block w-full text-left px-4 py-2 text-sm text-gray-900 hover:bg-gray-100"
                      >
                        <span className="h-2 w-2 rounded-full bg-green-500 inline-block mr-2"></span>
                        Active
                      </button>
                      <button
                        onClick={() => updateStatus("away")}
                        className="block w-full text-left px-4 py-2 text-sm text-gray-900 hover:bg-gray-100"
                      >
                        <span className="h-2 w-2 rounded-full bg-yellow-500 inline-block mr-2"></span>
                        Away
                      </button>
                      <button
                        onClick={() => updateStatus("offline")}
                        className="block w-full text-left px-4 py-2 text-sm text-gray-900 hover:bg-gray-100"
                      >
                        <span className="h-2 w-2 rounded-full bg-gray-500 inline-block mr-2"></span>
                        Offline
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* User info */}
              <div className="flex items-center">
                <span className="text-sm font-medium text-gray-900 mr-2">
                  {user.name || user.email}
                </span>
                <div className="h-8 w-8 rounded-full bg-blue-500 flex items-center justify-center text-white">
                  {user.name ? user.name.charAt(0).toUpperCase() : "U"}
                </div>
              </div>

              {/* Logout button */}
              <button
                onClick={handleLogout}
                className="ml-4 px-3 py-1 text-sm bg-gray-200 hover:bg-gray-300 rounded text-gray-900"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar for navigation */}
        <aside
          className={`bg-white shadow-md w-64 fixed inset-y-0 pt-16 transform ${
            sidebarOpen ? "translate-x-0" : "-translate-x-full"
          } md:translate-x-0 transition duration-200 ease-in-out z-10`}
        >
          {/* Close button for mobile */}
          <button
            type="button"
            className="absolute top-4 right-4 md:hidden text-gray-400 hover:text-gray-500"
            onClick={() => setSidebarOpen(false)}
          >
            <span className="sr-only">Close sidebar</span>
            <svg
              className="h-6 w-6"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
          <div className="h-full flex flex-col mt-5 overflow-y-auto">
            <nav className="flex-1 px-2 space-y-1">
              {/* Dashboard */}
              <Link
                href="/agent-dashboard"
                className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md ${
                  pathname === "/agent-dashboard"
                    ? "bg-blue-100 text-blue-700"
                    : "text-gray-600 hover:bg-gray-50"
                }`}
              >
                <svg
                  className={`mr-3 h-5 w-5 ${
                    pathname === "/agent-dashboard"
                      ? "text-blue-500"
                      : "text-gray-400 group-hover:text-gray-500"
                  }`}
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                  />
                </svg>
                Dashboard
              </Link>

              {/* Active Chats */}
              <Link
                href="/agent-dashboard/active-chats"
                className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md ${
                  pathname?.includes("/active-chats")
                    ? "bg-blue-100 text-blue-700"
                    : "text-gray-600 hover:bg-gray-50"
                }`}
              >
                <svg
                  className={`mr-3 h-5 w-5 ${
                    pathname?.includes("/active-chats")
                      ? "text-blue-500"
                      : "text-gray-400 group-hover:text-gray-500"
                  }`}
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                  />
                </svg>
                Active Chats
              </Link>

              {/* Waiting Chats */}
              <Link
                href="/agent-dashboard/waiting-chats"
                className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md ${
                  pathname?.includes("/waiting-chats")
                    ? "bg-blue-100 text-blue-700"
                    : "text-gray-600 hover:bg-gray-50"
                }`}
              >
                <svg
                  className={`mr-3 h-5 w-5 ${
                    pathname?.includes("/waiting-chats")
                      ? "text-blue-500"
                      : "text-gray-400 group-hover:text-gray-500"
                  }`}
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                Waiting Chats
              </Link>

              {/* Agents Page */}
              <Link
                href="/agent-dashboard/agents"
                className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md ${
                  pathname?.includes("/agents") && !pathname?.includes("/settings")
                    ? "bg-blue-100 text-blue-700"
                    : "text-gray-600 hover:bg-gray-50"
                }`}
              >
                <svg
                  className={`mr-3 h-5 w-5 ${
                    pathname?.includes("/agents") && !pathname?.includes("/settings")
                      ? "text-blue-500"
                      : "text-gray-400 group-hover:text-gray-500"
                  }`}
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
                  />
                </svg>
                Agents
              </Link>

              {/* Chat History */}
              <Link
                href="/agent-dashboard/history"
                className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md ${
                  pathname?.includes("/history")
                    ? "bg-blue-100 text-blue-700"
                    : "text-gray-600 hover:bg-gray-50"
                }`}
              >
                <svg
                  className={`mr-3 h-5 w-5 ${
                    pathname?.includes("/history")
                      ? "text-blue-500"
                      : "text-gray-400 group-hover:text-gray-500"
                  }`}
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                  />
                </svg>
                History
              </Link>

              {/* Settings (Admin/Supervisor only) */}
              {(user.role === "admin" || user.role === "supervisor") && (
                <Link
                  href="/agent-dashboard/settings"
                  className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md ${
                    pathname?.includes("/settings")
                      ? "bg-blue-100 text-blue-700"
                      : "text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  <svg
                    className={`mr-3 h-5 w-5 ${
                      pathname?.includes("/settings")
                        ? "text-blue-500"
                        : "text-gray-400 group-hover:text-gray-500"
                    }`}
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                  </svg>
                  Settings
                </Link>
              )}
            </nav>
          </div>
        </aside>

        {/* Main content */}
        <main className="flex-grow overflow-auto md:ml-64 h-[calc(100vh-7rem)]">
          <div className="container mx-auto py-6 px-4 sm:px-6 lg:px-8">
            {children}
          </div>
        </main>
      </div>

      {/* Footer with connection status */}
      <footer className="bg-white border-t border-gray-200 py-2 px-4">
        <div className="flex items-center text-sm text-gray-500">
          <span
            className={`h-2 w-2 rounded-full mr-2 ${
              isConnected ? "bg-green-500" : "bg-red-500"
            }`}
          ></span>
          {isConnected ? "Connected" : "Disconnected"}
        </div>
      </footer>

      {/* Overlay for mobile menu */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-gray-600 bg-opacity-75 z-0 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
}
