import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Serve uploads with cache headers
  if (pathname.startsWith("/uploads/")) {
    const response = NextResponse.next();
    response.headers.set("Cache-Control", "public, max-age=2592000, immutable");
    return response;
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/uploads/:path*"],
};
