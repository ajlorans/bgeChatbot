"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AgentDashboardLayout } from "@/components/AgentDashboardLayout";
import { useToast } from "@/components/ui/use-toast";
import { useSocket } from "@/contexts/SocketContext";

interface AgentData {
  id: string;
  name?: string;
  email?: string;
  role: string;
  isActive: boolean;
  isAvailable: boolean;
  activeSessions: number;
  waitingSessions: number;
  debugFallback?: boolean;
}

export default function AgentDashboardPage() {
  const { toast } = useToast();
  const router = useRouter();
  const socketContext = useSocket();
  const isConnected = socketContext?.isConnected || false;

  const [agent, setAgent] = useState<AgentData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const [useDebugMode, setUseDebugMode] = useState(false);

  // Function to fetch agent data with retry logic
  async function fetchAgentData() {
    try {
      setLoading(true);
      setError(null);

      console.log("Fetching agent data...");
      const res = await fetch("/api/agent/me", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include", // Include cookies
      });

      if (!res.ok) {
        // If the response is not OK, try to parse the error message
        const errorData = await res
          .json()
          .catch(() => ({ error: "Unknown error" }));
        console.error("Failed to fetch agent data:", errorData);

        if (res.status === 401) {
          console.log("Not authenticated, redirecting to login");
          throw new Error("Not authenticated");
        } else {
          throw new Error(errorData.error || `Server error: ${res.status}`);
        }
      }

      const data = await res.json();
      console.log("Agent data:", data);
      setAgent(data);
      setLoading(false);
      // Reset retry count on success
      setRetryCount(0);
    } catch (err: any) {
      setLoading(false);
      setError(err.message || "Failed to load agent data");

      // If we reach max retries, try debug mode
      if (retryCount >= 2 && !useDebugMode) {
        console.log("Maximum retries reached, enabling debug mode");
        setUseDebugMode(true);
      } else if (!useDebugMode) {
        // Increment retry count and try again shortly
        setRetryCount((prev) => prev + 1);
        console.log(`Retry attempt ${retryCount + 1}/3 in 2 seconds...`);
        setTimeout(fetchAgentData, 2000);
      }
    }
  }

  // When the component mounts, fetch agent data
  useEffect(() => {
    fetchAgentData();
  }, []);

  // If in debug mode, provide a fallback experience
  useEffect(() => {
    if (useDebugMode) {
      console.log("Using debug mode fallback");
      setAgent({
        id: "debug-agent-id",
        name: "Debug Agent",
        email: "agent@example.com",
        role: "agent",
        isActive: true,
        isAvailable: true,
        debugFallback: true,
      });
      setLoading(false);
      setError(null);
    }
  }, [useDebugMode]);

  // Handle authentication failure
  useEffect(() => {
    if (error === "Not authenticated") {
      console.log("Redirecting to login page due to authentication error");
      setTimeout(() => {
        router.push("/agent-login");
      }, 1000);
    }
  }, [error, router]);

  // Check socket connection
  useEffect(() => {
    if (!isConnected && !loading && !error) {
      toast({
        title: "Socket Connection Issue",
        description:
          "Not connected to real-time service. Some features may be limited.",
        variant: "destructive",
        duration: 5000,
      });
    }
  }, [isConnected, loading, error, toast]);

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Loading agent dashboard...</p>
        </div>
      </div>
    );
  }

  if (error && !useDebugMode) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="text-center max-w-md p-6 bg-destructive/10 rounded-lg">
          <h2 className="text-xl font-bold mb-2">Error Loading Dashboard</h2>
          <p className="mb-4">{error}</p>
          <p className="text-sm text-muted-foreground mb-4">
            {retryCount < 3
              ? `Retrying automatically (${retryCount}/3)...`
              : "We're having trouble connecting to the server."}
          </p>
          <button
            onClick={fetchAgentData}
            className="px-4 py-2 bg-primary text-white rounded-md"
          >
            Try Again
          </button>
          {retryCount >= 2 && (
            <button
              onClick={() => setUseDebugMode(true)}
              className="ml-4 px-4 py-2 bg-blue-600 text-white rounded-md"
            >
              Use Debug Mode
            </button>
          )}
        </div>
      </div>
    );
  }

  if (!agent) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="text-center max-w-md p-6 bg-destructive/10 rounded-lg">
          <h2 className="text-xl font-bold mb-2">No Agent Data Available</h2>
          <p className="mb-4">Unable to retrieve agent information.</p>
          <button
            onClick={() => router.push("/agent-login")}
            className="px-4 py-2 bg-primary text-white rounded-md"
          >
            Return to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <AgentDashboardLayout
      agent={agent}
      isConnected={isConnected}
      isFallbackMode={agent?.debugFallback || false}
    />
  );
}
