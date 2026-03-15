import { db } from "@/lib/db";
import { users, sessions } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { randomUUID } from "crypto";

export async function POST(req: Request) {
  try {
    const { email } = await req.json();
    if (!email) {
      return NextResponse.json({ error: "Email required" }, { status: 400 });
    }

    // Only allow @demo.heat emails
    if (!email.endsWith("@demo.heat")) {
      return NextResponse.json({ error: "Only demo accounts allowed" }, { status: 403 });
    }

    const user = await db.query.users.findFirst({
      where: eq(users.email, email),
    });

    if (!user) {
      return NextResponse.json({ error: "User not found. Run db:push and seed:demo first." }, { status: 404 });
    }

    // Create a database session
    const sessionToken = randomUUID();
    const expires = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

    await db.insert(sessions).values({
      sessionToken,
      userId: user.id,
      expires,
    });

    // Set the session cookie (Auth.js uses this cookie name)
    const cookieStore = await cookies();
    const isSecure = process.env.NEXTAUTH_URL?.startsWith("https") ||
      process.env.VERCEL_URL !== undefined;

    const cookieName = isSecure
      ? "__Secure-authjs.session-token"
      : "authjs.session-token";

    cookieStore.set(cookieName, sessionToken, {
      httpOnly: true,
      secure: isSecure,
      sameSite: "lax",
      path: "/",
      expires,
    });

    // Determine redirect based on role
    const adminRoles = ["operator", "finance_admin", "compliance_support"];
    const portalRoles = ["participant", "vip_participant"];

    let redirect = "/onboarding";
    if (adminRoles.includes(user.role)) {
      redirect = "/admin/opportunities";
    } else if (portalRoles.includes(user.role) && user.status === "approved") {
      redirect = "/opportunities";
    }

    return NextResponse.json({ success: true, redirect, user: { email: user.email, role: user.role, status: user.status } });
  } catch (err) {
    console.error("[demo-signin] Error:", err);
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: `Sign in error: ${message}` }, { status: 500 });
  }
}
