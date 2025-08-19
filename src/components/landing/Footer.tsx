"use client";

import Link from "next/link";

export default function LandingFooter() {
  return (
    <footer className="w-full border-t border-primary/20 bg-gradient-to-t from-background/95 to-background/80 backdrop-blur-md shadow-tactical-inset">
      <div className="container mx-auto flex flex-col md:flex-row items-center justify-between py-8 px-4 gap-6">
        <div className="flex flex-col md:flex-row items-center gap-3">
          <span className="text-xs font-semibold tracking-widest text-primary uppercase">
            UNCLASSIFIED
          </span>
          <span className="hidden md:inline text-muted-foreground">|</span>
          <span className="text-xs font-semibold tracking-widest text-primary uppercase">
            MIL-STD-2525D COMPLIANT
          </span>
          <span className="hidden md:inline text-muted-foreground">|</span>
          <span className="text-xs font-mono text-muted-foreground">
            {new Date().getFullYear()}
          </span>
        </div>
        <nav className="flex items-center gap-6">
          <Link
            href="/security-policy"
            className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors duration-150"
          >
            Security Policy
          </Link>
          <Link
            href="/user-manual"
            className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors duration-150"
          >
            User Manual
          </Link>
        </nav>
      </div>
    </footer>
  );
}
