"use client";

import Link from "next/link";

export default function LandingFooter() {
  return (
    <footer className="w-full border-t border-primary/25 bg-card/40">
      <div className="container mx-auto flex flex-col md:flex-row items-center justify-between py-6 px-4 gap-4">
        <div className="flex flex-col md:flex-row items-center gap-3 font-mono text-[10px] tracking-[0.2em] uppercase text-muted-foreground">
          <span className="text-primary">Exercise</span>
          <span className="hidden md:inline text-primary/30">|</span>
          <span>MIL-STD-2525D</span>
          <span className="hidden md:inline text-primary/30">|</span>
          <span>{new Date().getFullYear()}</span>
        </div>
        <nav className="flex items-center gap-6">
          <Link
            href="/security-policy"
            className="text-[11px] font-mono tracking-widest uppercase text-muted-foreground hover:text-primary transition-colors"
          >
            Security
          </Link>
          <Link
            href="/user-manual"
            className="text-[11px] font-mono tracking-widest uppercase text-muted-foreground hover:text-primary transition-colors"
          >
            Manual
          </Link>
        </nav>
      </div>
    </footer>
  );
}
