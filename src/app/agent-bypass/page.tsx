"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function AgentBypass() {
  const router = useRouter();

  useEffect(() => {
    // Create a mock agent token
    const mockUser = {
      user: {
        id: "agent-test-id",
        email: "agent@example.com",
        name: "Agent Test",
        role: "agent",
        agentId: "agent-id",
      },
      expiresAt: Date.now() + 24 * 60 * 60 * 1000, // 24 hours
    };

    // Set cookie directly in browser
    document.cookie = `agent_token=BYPASS_TOKEN_${Date.now()}; path=/; max-age=${
      8 * 60 * 60
    }; SameSite=Lax`;

    // Add a small delay to ensure cookie is set
    setTimeout(() => {
      router.push("/agent-dashboard");
    }, 500);
  }, [router]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center">
      <h1 className="text-2xl font-bold mb-4">Agent Bypass</h1>
      <p>Setting debug token and redirecting to dashboard...</p>
    </div>
  );
}
