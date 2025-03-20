"use client";

import React from "react";
import { usePathname } from "next/navigation";
import { shouldConnectSocket } from "@/lib/socketService.client";

// Wrapper to conditionally initialize services
export default function Providers({ children }: { children: React.ReactNode }) {
  const pathname = usePathname() || "";

  // Only initialize socket connections on appropriate pages
  const enableSockets = shouldConnectSocket(pathname);

  // Log connection status
  React.useEffect(() => {
    if (enableSockets) {
      console.log(`Socket connections enabled for path: ${pathname}`);
    } else {
      console.log(`Socket connections disabled for path: ${pathname}`);
    }
  }, [pathname, enableSockets]);

  return <>{children}</>;
}
