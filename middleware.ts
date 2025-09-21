import { NextRequest, NextResponse } from "next/server";

export function middleware(request: NextRequest) {
  // Clone the request headers
  const requestHeaders = new Headers(request.headers);

  // For API routes, ensure no-cache headers in requests
  if (request.nextUrl.pathname.startsWith("/api/")) {
    requestHeaders.set("Cache-Control", "no-cache, no-store, must-revalidate");
    requestHeaders.set("Pragma", "no-cache");
    requestHeaders.set("Expires", "0");
  }

  // Create response
  const response = NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });

  // For API routes, set no-cache headers in responses
  if (request.nextUrl.pathname.startsWith("/api/")) {
    response.headers.set(
      "Cache-Control",
      "no-cache, no-store, must-revalidate"
    );
    response.headers.set("Pragma", "no-cache");
    response.headers.set("Expires", "0");
    response.headers.set("Last-Modified", new Date().toUTCString());

    // Prevent browser caching
    response.headers.set("Vary", "Cache-Control");

    // console.log("API Route No-Cache Headers Set:", request.nextUrl.pathname);
  }

  return response;
}

export const config = {
  matcher: [
    // Match all API routes
    "/api/:path*",
    // Match all dashboard routes to ensure fresh data
    "/dashboard/:path*",
  ],
};
