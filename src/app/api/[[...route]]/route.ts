import { NextRequest, NextResponse } from "next/server";

// Mark as dynamic to prevent static generation
export const dynamic = "force-dynamic";
export const dynamicParams = true;
export const revalidate = 0;
export const fetchCache = "force-no-store";

// Handle all API routes that don't have specific handlers
export async function GET(
  request: NextRequest,
  { params }: { params: { route: string[] } }
) {
  return NextResponse.json(
    {
      message: "API route handler",
      path: params.route?.join("/") || "",
    },
    { status: 200 }
  );
}

export async function POST(
  request: NextRequest,
  { params }: { params: { route: string[] } }
) {
  return NextResponse.json(
    {
      message: "API route handler",
      path: params.route?.join("/") || "",
    },
    { status: 200 }
  );
}
