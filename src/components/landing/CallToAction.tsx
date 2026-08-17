"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

export default function CallToAction() {
  return (
    <section className="w-full py-16 md:py-20">
      <div className="container mx-auto px-4 md:px-6">
        <div className="hud-panel p-8 md:p-12 text-center relative overflow-hidden hud-scan">
          <div className="font-mono text-[10px] tracking-[0.32em] text-primary uppercase mb-3">
            Ready
          </div>
          <h2 className="text-2xl md:text-3xl font-display font-bold tracking-[0.08em] uppercase mb-3">
            Take the chair
          </h2>
          <p className="text-muted-foreground mb-8 font-mono text-sm">
            Place forces, issue orders, and resolve the turn.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Button asChild size="lg" className="font-mono tracking-[0.18em]">
              <Link href="/planner">ENTER CIC</Link>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="font-mono tracking-[0.18em]"
            >
              <Link href="/security-policy">
                SECURITY
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
