"use client";

import Link from "next/link";
import { Logo } from "./logo";
import { Button } from "@/components/luxury-ui/button";

interface NavProps {
  variant: "marketing" | "portal" | "admin";
  user?: { name?: string | null; email?: string | null; role?: string };
}

export function Nav({ variant, user }: NavProps) {
  return (
    <header className="sticky top-0 z-50 border-b border-border-subtle bg-background/80 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        <Link href={variant === "admin" ? "/admin" : "/"} className="flex items-center gap-3">
          <Logo size="sm" />
          {variant === "admin" && (
            <span className="text-xs text-muted-foreground uppercase tracking-wider border-l border-border pl-3 ml-1">
              Admin
            </span>
          )}
        </Link>

        <nav className="hidden md:flex items-center gap-8">
          {variant === "marketing" && (
            <>
              <Link href="/#about" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                About
              </Link>
              <Link href="/sign-in">
                <Button variant="secondary" size="sm">Sign In</Button>
              </Link>
            </>
          )}

          {variant === "portal" && (
            <>
              <Link href="/opportunities" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Opportunities
              </Link>
              <Link href="/dashboard" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Dashboard
              </Link>
              <div className="flex items-center gap-3">
                <span className="text-xs text-muted">{user?.email}</span>
                <form action="/api/auth/signout" method="POST">
                  <Button variant="ghost" size="sm" type="submit">Sign Out</Button>
                </form>
              </div>
            </>
          )}

          {variant === "admin" && (
            <>
              <Link href="/admin/opportunities" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Opportunities
              </Link>
              <Link href="/admin/participants" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Participants
              </Link>
              <Link href="/admin/finance/settlements" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Finance
              </Link>
              <span className="text-xs text-muted">{user?.role}</span>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
