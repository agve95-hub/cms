import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Security: block direct access to data directory
  if (pathname.startsWith("/data/") || pathname.startsWith("/backups/")) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  // Serve uploads with cache headers
  if (pathname.startsWith("/uploads/")) {
    const response = NextResponse.next();
    response.headers.set("Cache-Control", "public, max-age=2592000, immutable");
    return response;
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/data/:path*", "/backups/:path*", "/uploads/:path*"],
};
