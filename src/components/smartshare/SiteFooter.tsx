import { Link } from "@tanstack/react-router";

export function SiteFooter() {
  return (
    <footer className="border-t border-border bg-card/50 backdrop-blur">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-3 px-4 py-6 text-sm text-muted-foreground sm:flex-row sm:px-6">
        <p>© {new Date().getFullYear()} SmartShare. All rights reserved.</p>
        <nav className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2">
          <Link to="/privacy" className="hover:text-foreground transition-colors">
            Privacy Policy
          </Link>
          <Link to="/terms" className="hover:text-foreground transition-colors">
            Terms & Conditions
          </Link>
          <Link to="/contact" className="hover:text-foreground transition-colors">
            Contact Us
          </Link>
        </nav>
      </div>
    </footer>
  );
}
