import { NextResponse } from "next/server";

// This function can be marked `async` if using `await` inside
export function middleware() {
  // You can add middleware logic here if needed
  return NextResponse.next();
}

// See "Matching Paths" below to learn more
export const config = {
  // Skip API routes and static files
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
