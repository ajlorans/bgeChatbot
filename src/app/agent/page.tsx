"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function AgentDirectAccess() {
  const router = useRouter();

  useEffect(() => {
    // Set a bypass token
    document.cookie = `agent_token=BYPASS_TOKEN_${Date.now()}; path=/; max-age=${
      8 * 60 * 60
    }; SameSite=Lax`;

    // Redirect to the dashboard with a small delay
    setTimeout(() => {
      router.push("/agent-dashboard");
    }, 100);
  }, [router]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center">
      <h1 className="text-2xl font-bold mb-4">Direct Agent Access</h1>
      <p>Setting up agent access and redirecting...</p>
    </div>
  );
}
