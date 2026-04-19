import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function proxy(request: NextRequest) {
  const session = request.cookies.get("session")?.value;

  // No session cookie = not logged in → send to landing page
  if (!session) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  return NextResponse.next();
}

// Only run this middleware on /dashboard and any sub-routes under it
export const config = {
  matcher: ["/dashboard/:path*"],
};
