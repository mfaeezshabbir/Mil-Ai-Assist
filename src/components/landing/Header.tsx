"use client";

import Link from "next/link";
import { Shield, ArrowRight, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import SysLogo from "../Logo";

export default function LandingHeader() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-tactical border-primary/50 bg-background/95 backdrop-blur-sm shadow-tactical">
      <div className="container mx-auto h-16 flex items-center px-4 md:px-6">
        <Link
          href="/"
          className="flex items-center gap-2 font-display font-bold tracking-wider"
          prefetch={false}
        >
          <SysLogo />
          <span className="text-lg uppercase">MilAIAssist</span>
          <span className="text-xs text-secondary rounded bg-muted px-1.5 py-0.5 font-mono">
            v1.0
          </span>
        </Link>
        <div className="h-4 w-px bg-border mx-4 hidden md:block"></div>
        <div className="text-xs font-mono text-muted-foreground hidden md:block">
          CLASSIFIED // FOR OFFICIAL USE ONLY
        </div>
        {/* Desktop nav */}
        <nav className="ml-auto items-center gap-4 hidden md:flex">
          <Link
            href="/planner"
            className="text-sm font-medium tracking-wide hover:text-primary transition-colors"
            prefetch={false}
          >
            MISSION PLANNER
          </Link>
          <Button
            asChild
            size="sm"
            variant="secondary"
            className="font-mono tracking-wide"
          >
            <Link href="/planner">
              LAUNCH TACTICAL VIEW
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </nav>
        {/* Mobile menu button */}
        <button
          className="ml-auto md:hidden p-2 rounded hover:bg-muted transition-colors"
          aria-label="Open menu"
          onClick={() => setMenuOpen((v) => !v)}
        >
          <Menu className="h-6 w-6" />
        </button>
      </div>
      {/* Mobile nav */}
      {menuOpen && (
        <div className="md:hidden bg-background border-t border-tactical shadow-tactical">
          <nav className="flex flex-col gap-2 px-4 py-2">
            <Link
              href="/planner"
              className="text-sm font-medium tracking-wide hover:text-primary transition-colors py-2"
              prefetch={false}
              onClick={() => setMenuOpen(false)}
            >
              MISSION PLANNER
            </Link>
            <Button
              asChild
              size="sm"
              variant="secondary"
              className="font-mono tracking-wide w-full"
              onClick={() => setMenuOpen(false)}
            >
              <Link href="/planner">
                LAUNCH TACTICAL VIEW
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </nav>
        </div>
      )}
    </header>
  );
}
