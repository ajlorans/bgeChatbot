import { NextResponse } from "next/server";

const DEBUG = false; // Set to false to disable debug logging

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getSession();
    
    if (!session || !session.user?.agentId) {
      return NextResponse.json(
        { error: "Unauthorized - Agent access required" },
        { status: 401 }
      );
    }

    if (DEBUG) console.log(`Agent ${session.user.agentId} attempting to claim session ${params.id}`);
    
    // Rest of the function...
  } catch (error) {
    if (DEBUG) console.error("Error claiming chat session:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
} 