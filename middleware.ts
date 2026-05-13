import { NextResponse, type NextRequest } from "next/server";
import { jwtVerify } from "jose";
import { sessionCookieName } from "@/lib/session-constants";
import { sessionSecret } from "@/lib/session-secret";

export async function middleware(request: NextRequest) {
  const token = request.cookies.get(sessionCookieName)?.value;
  const isAppRoute = request.nextUrl.pathname.startsWith("/app");
  const isLoginRoute = request.nextUrl.pathname === "/login";

  if (!token && isAppRoute) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  if (token) {
    try {
      await jwtVerify(token, sessionSecret());
      if (isLoginRoute) return NextResponse.redirect(new URL("/app", request.url));
    } catch {
      if (isAppRoute) return NextResponse.redirect(new URL("/login", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/app/:path*", "/login"]
};
