"use client";

import Link from "next/link";
import { Shield, ArrowRight, Menu, User, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { useSession, signOut } from "next-auth/react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import SysLogo from "../Logo";

export default function LandingHeader() {
  const [menuOpen, setMenuOpen] = useState(false);
  const { data: session } = useSession();

  const handleSignOut = () => {
    signOut();
  };

  return (
    <header className="sticky top-0 z-50 w-full hud-scan hud-panel border-x-0 border-t-0">
      <div className="container mx-auto h-16 flex items-center px-4 md:px-6">
        <Link
          href="/"
          className="flex items-center gap-2 font-display font-bold tracking-wider"
          prefetch={false}
        >
          <SysLogo />
          <span className="text-sm uppercase tracking-[0.2em] text-primary">
            MilAIAssist
          </span>
          <span className="hidden sm:inline text-[10px] text-secondary border border-secondary/40 px-1.5 py-0.5 font-mono tracking-widest">
            CIC
          </span>
        </Link>
        <div className="h-4 w-px bg-primary/30 mx-4 hidden md:block" />
        <div className="text-[10px] font-mono tracking-[0.2em] text-muted-foreground hidden md:block uppercase">
          Theater command // exercise
        </div>
        <nav className="ml-auto items-center gap-4 hidden md:flex">
          {session ? (
            <div className="flex items-center gap-3">
              <Button
                asChild
                size="sm"
                variant="secondary"
                className="font-mono tracking-[0.16em]"
              >
                <Link href="/planner">
                  ENTER CIC
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex items-center gap-2"
                  >
                    <User className="h-4 w-4" />
                    <span className="font-mono text-xs">
                      {session.user?.name}
                    </span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuLabel className="font-mono text-xs">
                    {session.user?.email}
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={handleSignOut}
                    className="cursor-pointer"
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          ) : (
            <Button
              asChild
              size="sm"
              variant="secondary"
              className="font-mono tracking-[0.16em]"
            >
              <Link href="/auth/signin">
                <Shield className="mr-2 h-4 w-4" />
                AUTHENTICATE
              </Link>
            </Button>
          )}
        </nav>
        <button
          type="button"
          className="ml-auto md:hidden p-2 hover:bg-muted transition-colors"
          aria-label="Open menu"
          onClick={() => setMenuOpen((v) => !v)}
        >
          <Menu className="h-6 w-6" />
        </button>
      </div>
      {menuOpen && (
        <div className="md:hidden bg-background border-t border-primary/20 z-50 relative">
          <nav className="flex flex-col gap-2 px-4 py-2">
            {session ? (
              <>
                <div className="text-xs font-mono text-muted-foreground py-1">
                  {session.user?.name}
                </div>
                <Button
                  asChild
                  size="sm"
                  variant="secondary"
                  className="font-mono tracking-wide w-full"
                  onClick={() => setMenuOpen(false)}
                >
                  <Link href="/planner">
                    ENTER CIC
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
                <Button
                  onClick={() => {
                    handleSignOut();
                    setMenuOpen(false);
                  }}
                  size="sm"
                  variant="outline"
                  className="font-mono tracking-wide w-full"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  SIGN OUT
                </Button>
              </>
            ) : (
              <Button
                asChild
                size="sm"
                variant="secondary"
                onClick={() => setMenuOpen(false)}
              >
                <Link href="/auth/signin">
                  <Shield className="mr-2 h-4 w-4" />
                  AUTHENTICATE
                </Link>
              </Button>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}
