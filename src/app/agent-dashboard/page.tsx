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

  const [isLoading, setIsLoading] = useState(true);
  const [agentData, setAgentData] = useState<AgentData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [apiAttempts, setApiAttempts] = useState(0);
  const [isRetrying, setIsRetrying] = useState(false);

  // Fetch agent data from the API
  useEffect(() => {
    async function fetchAgentData() {
      try {
        console.log("Fetching agent data...");
        setIsLoading(true);

        const response = await fetch("/api/agent/me", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include", // Important for cookies
        });

        console.log("API Response status:", response.status);

        if (!response.ok) {
          // If unauthorized, redirect to login
          if (response.status === 401) {
            console.error("Not authenticated, redirecting to login");
            router.push("/login/agent");
            return;
          }

          // Try to get error details from response
          let errorMessage = "Failed to fetch agent data";
          try {
            const errorData = await response.json();
            errorMessage = errorData.error || errorMessage;
          } catch (_) {
            // Ignore JSON parse errors
          }

          setError(errorMessage);
          setApiAttempts((prev) => prev + 1);
          return;
        }

        const data = await response.json();
        console.log("Agent data loaded:", data);
        setAgentData(data);
        setError(null);
        setIsLoading(false);
      } catch (err) {
        console.error("Error fetching agent data:", err);
        setError("Network error while fetching agent data");
        setApiAttempts((prev) => prev + 1);
      } finally {
        setIsLoading(false);
        setIsRetrying(false);
      }
    }

    fetchAgentData();
  }, [router, isRetrying]);

  // Check socket connection
  useEffect(() => {
    if (!isConnected && !isLoading && !error) {
      toast({
        title: "Socket Connection Issue",
        description:
          "Not connected to real-time service. Some features may be limited.",
        variant: "destructive",
        duration: 5000,
      });
    }
  }, [isConnected, isLoading, error, toast]);

  // Add retry capability if API fails
  useEffect(() => {
    // If we've had errors but fewer than 3 attempts, retry after delay
    if (error && apiAttempts < 3 && !isRetrying) {
      const timer = setTimeout(() => {
        console.log(`Retrying API (attempt ${apiAttempts + 1} of 3)...`);
        setIsRetrying(true);
      }, 2000); // 2 second delay between retries

      return () => clearTimeout(timer);
    }
  }, [error, apiAttempts, isRetrying]);

  // Fall back to debug mode after multiple failures if appropriate
  useEffect(() => {
    if (error && apiAttempts >= 3) {
      console.log("Using debug fallback mode after multiple API failures");

      // Create a fallback agent for viewing the dashboard
      setAgentData({
        id: "fallback-agent",
        name: "Debug Agent",
        role: "agent",
        isActive: true,
        isAvailable: true,
        activeSessions: 0,
        waitingSessions: 0,
        debugFallback: true,
      });

      setError(null);
      toast({
        title: "Debug Mode Activated",
        description:
          "Using fallback mode due to API issues. Limited functionality available.",
        variant: "warning",
        duration: 5000,
      });
    }
  }, [apiAttempts, error, toast]);

  if (isLoading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Loading agent dashboard...</p>
        </div>
      </div>
    );
  }

  if (error && apiAttempts < 3) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="text-center max-w-md p-6 bg-destructive/10 rounded-lg">
          <h2 className="text-xl font-bold mb-2">Error Loading Dashboard</h2>
          <p className="mb-4">{error}</p>
          <p className="text-sm text-muted-foreground mb-4">
            Retrying automatically... ({apiAttempts}/3 attempts)
          </p>
          <button
            onClick={() => setIsRetrying(true)}
            className="px-4 py-2 bg-primary text-white rounded-md"
          >
            Retry Now
          </button>
        </div>
      </div>
    );
  }

  if (!agentData) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="text-center max-w-md p-6 bg-destructive/10 rounded-lg">
          <h2 className="text-xl font-bold mb-2">No Agent Data Available</h2>
          <p className="mb-4">Unable to retrieve agent information.</p>
          <button
            onClick={() => router.push("/login/agent")}
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
      agent={agentData}
      isConnected={isConnected}
      isFallbackMode={agentData?.debugFallback || false}
    />
  );
}
