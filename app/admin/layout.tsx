import { ReactNode } from "react";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Nav } from "@/components/brand/nav";

const ADMIN_ROLES = ["operator", "finance_admin", "compliance_support"];

export default async function AdminLayout({ children }: { children: ReactNode }) {
  const session = await auth();

  if (!session?.user) {
    redirect("/sign-in");
  }

  if (!ADMIN_ROLES.includes(session.user.role ?? "")) {
    redirect("/");
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Nav variant="admin" user={session.user} />
      <main className="flex-1 max-w-7xl mx-auto w-full px-6 py-8">
        {children}
      </main>
    </div>
  );
}
