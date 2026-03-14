import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";

const ADMIN_ROLES = ["operator", "finance_admin", "compliance_support"];
const PORTAL_ROLES = ["participant", "vip_participant"];

export default auth((req) => {
  const { pathname } = req.nextUrl;
  const session = req.auth as { user?: { role?: string; status?: string } } | null;

  // Admin routes require admin role
  if (pathname.startsWith("/admin")) {
    if (!session?.user) {
      return NextResponse.redirect(new URL("/sign-in", req.url));
    }
    if (!ADMIN_ROLES.includes(session.user.role ?? "")) {
      return NextResponse.redirect(new URL("/", req.url));
    }
    return NextResponse.next();
  }

  // Portal routes require approved participant
  if (
    pathname.startsWith("/opportunities") ||
    pathname.startsWith("/dashboard") ||
    pathname.startsWith("/onboarding")
  ) {
    if (!session?.user) {
      return NextResponse.redirect(new URL("/sign-in", req.url));
    }
    // Onboarding is accessible to any authenticated user
    if (pathname.startsWith("/onboarding")) {
      return NextResponse.next();
    }
    // Other portal routes need approved status
    const isPortalRole = PORTAL_ROLES.includes(session.user.role ?? "");
    const isApproved = session.user.status === "approved";
    if (!isPortalRole || !isApproved) {
      return NextResponse.redirect(new URL("/onboarding", req.url));
    }
    return NextResponse.next();
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    "/admin/:path*",
    "/opportunities/:path*",
    "/dashboard/:path*",
    "/onboarding/:path*",
  ],
};
