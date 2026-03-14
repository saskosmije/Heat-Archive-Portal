import { Logo } from "@/components/brand/logo";
import Link from "next/link";
import { Button } from "@/components/luxury-ui/button";

export default function CheckEmailPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-6">
      <div className="w-full max-w-sm text-center">
        <Logo size="lg" className="mb-10 block" />
        <div className="bg-surface border border-border rounded-lg p-8">
          <div className="w-12 h-12 rounded-full bg-gold/10 flex items-center justify-center mx-auto mb-4">
            <svg className="w-6 h-6 text-gold" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>
          <h2 className="text-lg font-semibold mb-2">Check your email</h2>
          <p className="text-sm text-muted-foreground mb-6">
            A sign-in link has been sent to your email address. Click the link to continue.
          </p>
          <Link href="/sign-in">
            <Button variant="secondary" size="sm">Back to Sign In</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
