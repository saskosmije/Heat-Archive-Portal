import { Logo } from "./logo";

export function Footer() {
  return (
    <footer className="border-t border-border-subtle py-12 mt-auto">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <Logo size="sm" />
          <p className="text-xs text-muted">
            Participation involves risk. Projected outcomes are estimates, not guarantees.
            Review all disclosures before contributing.
          </p>
          <p className="text-xs text-muted">
            &copy; {new Date().getFullYear()} Heat Archive
          </p>
        </div>
      </div>
    </footer>
  );
}
