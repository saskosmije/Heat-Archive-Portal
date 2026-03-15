import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * Lightweight middleware that checks for the session cookie only.
 * Authoritative role/status checks happen in server component layouts
 * (portal layout, admin layout) which have full Node.js runtime access.
 *
 * This avoids importing @/lib/auth (which pulls in Neon/Drizzle)
 * into the Edge Runtime where Node.js modules are unsupported.
 */
export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Check for Auth.js session cookie (database session strategy)
  const sessionCookie =
    req.cookies.get("authjs.session-token") ??
    req.cookies.get("__Secure-authjs.session-token");

  const isAuthenticated = !!sessionCookie?.value;

  // Protected routes: redirect to sign-in if no session cookie
  if (!isAuthenticated) {
    if (
      pathname.startsWith("/admin") ||
      pathname.startsWith("/opportunities") ||
      pathname.startsWith("/dashboard") ||
      pathname.startsWith("/onboarding")
    ) {
      const signInUrl = new URL("/sign-in", req.url);
      signInUrl.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(signInUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/admin/:path*",
    "/opportunities/:path*",
    "/dashboard/:path*",
    "/onboarding/:path*",
  ],
};
