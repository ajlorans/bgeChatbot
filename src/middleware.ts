import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Disable console logging in middleware to reduce noise
console.log = () => {};
console.error = () => {};

// This function can be marked `async` if using `await` inside
export function middleware(request: NextRequest) {
  // You can add middleware logic here if needed
  return NextResponse.next();
}

// See "Matching Paths" below to learn more
export const config = {
  // Skip API routes and static files
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
}; 