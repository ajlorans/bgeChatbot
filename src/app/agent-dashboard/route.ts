import { NextResponse } from "next/server";

// This file ensures the route is properly handled by Next.js

export async function GET() {
  console.log("GET request to /agent-dashboard route handler");

  // Simply pass through to the page component
  return NextResponse.next();
}

// Allow direct navigation to this route
export const dynamic = "force-dynamic";
