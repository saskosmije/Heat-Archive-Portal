"use client";

import { useState } from "react";
import { Logo } from "@/components/brand/logo";
import { Button } from "@/components/luxury-ui/button";

export default function SignInPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const { signIn } = await import("next-auth/react");
      await signIn("email", { email, redirect: false });
      setSent(true);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-6">
      <div className="w-full max-w-sm">
        <div className="text-center mb-10">
          <Logo size="lg" />
          <p className="text-muted-foreground text-sm mt-4">
            Sign in to access curated luxury opportunities
          </p>
        </div>

        {sent ? (
          <div className="bg-surface border border-border rounded-lg p-8 text-center">
            <h2 className="text-lg font-semibold mb-2">Check your email</h2>
            <p className="text-sm text-muted-foreground">
              A sign-in link has been sent to <span className="text-foreground">{email}</span>
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="bg-surface border border-border rounded-lg p-8 space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-muted-foreground mb-2">
                Email Address
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="you@example.com"
                className="w-full bg-surface-elevated border border-border rounded-md px-4 py-2.5 text-foreground placeholder:text-muted focus:outline-none focus:border-gold/50 focus:ring-1 focus:ring-gold/20 transition-colors"
              />
            </div>
            <Button type="submit" className="w-full" loading={loading}>
              Continue with Email
            </Button>
          </form>
        )}
      </div>
    </div>
  );
}
