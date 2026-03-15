"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Logo } from "@/components/brand/logo";
import { Button } from "@/components/luxury-ui/button";

const DEMO_USERS = [
  { email: "participant@demo.heat", label: "Participant", description: "Approved participant — browse & contribute" },
  { email: "vip@demo.heat", label: "VIP Participant", description: "VIP access — all opportunities" },
  { email: "operator@demo.heat", label: "Operator", description: "Admin — manage opportunities" },
  { email: "finance@demo.heat", label: "Finance Admin", description: "Admin — reconciliation & settlements" },
  { email: "compliance@demo.heat", label: "Compliance", description: "Admin — review & compliance" },
  { email: "pending@demo.heat", label: "Pending User", description: "Awaiting approval — onboarding flow" },
];

export default function SignInPage() {
  const router = useRouter();
  const [loading, setLoading] = useState("");
  const [error, setError] = useState("");

  async function handleDemoSignIn(email: string) {
    setLoading(email);
    setError("");
    try {
      const res = await fetch("/api/demo-signin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Sign in failed");
        return;
      }
      router.push(data.redirect);
      router.refresh();
    } catch {
      setError("Sign in failed");
    } finally {
      setLoading("");
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-6">
      <div className="w-full max-w-md">
        <div className="text-center mb-10">
          <Logo size="lg" />
          <p className="text-muted-foreground text-sm mt-4">
            Sign in to access curated luxury opportunities
          </p>
        </div>

        <div className="bg-surface border border-border rounded-lg p-8">
          <h2 className="text-lg font-semibold mb-1">Demo Sign In</h2>
          <p className="text-sm text-muted-foreground mb-6">
            Select a demo account to explore the portal
          </p>

          {error && (
            <p className="text-sm text-danger mb-4 bg-danger/10 rounded-md px-3 py-2">{error}</p>
          )}

          <div className="space-y-3">
            {DEMO_USERS.map((user) => (
              <button
                key={user.email}
                onClick={() => handleDemoSignIn(user.email)}
                disabled={!!loading}
                className="w-full text-left bg-surface-elevated hover:bg-surface-elevated/80 border border-border hover:border-gold/30 rounded-md px-4 py-3 transition-colors disabled:opacity-50"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-foreground">{user.label}</p>
                    <p className="text-xs text-muted-foreground">{user.description}</p>
                  </div>
                  {loading === user.email && (
                    <div className="w-4 h-4 border-2 border-gold border-t-transparent rounded-full animate-spin" />
                  )}
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
