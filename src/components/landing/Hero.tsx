"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Target, Bot, FilePenLine, Globe } from "lucide-react";

export default function Hero() {
  return (
    <section className="w-full pt-12 md:pt-24 lg:pt-32 border-b border-border">
      <div className="container px-4 md:px-6 space-y-8 xl:space-y-12">
        {/* Quick stats */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 justify-between max-w-screen-xl mx-auto px-4 md:px-6">
          <div className="flex items-center gap-4">
            <div className="px-3 py-1 rounded bg-primary/10 text-primary text-xs font-semibold">
              WEGO theater sim
            </div>
            <div className="px-3 py-1 rounded bg-muted/60 text-muted-foreground text-xs">
              MIL-STD-2525D units
            </div>
          </div>
          <div className="text-sm text-muted-foreground">
            Place forces · Queue orders · Resolve the turn
          </div>
        </div>

        <div className="grid max-w-screen-xl gap-6 px-4 mx-auto md:grid-cols-2 md:px-6">
          <div className="flex flex-col justify-center space-y-4">
            <div className="inline-flex px-4 py-1 mb-2 text-xs font-semibold tracking-widest text-primary uppercase rounded-full bg-primary/10 border border-primary/20">
              ARMY SIMULATOR
            </div>
            <div className="space-y-2">
              <h1 className="text-3xl font-display font-bold tracking-tighter uppercase sm:text-4xl md:text-5xl xl:text-6xl">
                Command a theater.
                <br />
                Resolve the turn.
              </h1>
              <p className="max-w-[620px] text-muted-foreground md:text-xl">
                Place friendly and hostile forces on a live map, issue move
                orders in plain language or by clicking, then resolve a
                simultaneous WEGO turn with simple combat.
              </p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Button asChild size="lg" className="font-mono">
                <Link href="/planner">
                  ENTER SIMULATOR
                  <Target className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button
                asChild
                size="lg"
                variant="secondary"
                className="font-mono"
              >
                <Link href="/user-manual">READ THE MANUAL</Link>
              </Button>
            </div>
          </div>

          <div className="flex items-center justify-center">
            <div className="relative w-full max-w-xl">
              <div className="absolute inset-0 bg-tactical-grid bg-[size:10px_10px] border border-primary/30 rounded-md shadow-tactical-glow"></div>
              <div className="relative overflow-hidden rounded-md border border-primary/50 shadow-tactical">
                <div className="aspect-video bg-muted flex items-center justify-center">
                  <div className="text-xl text-center p-8 font-mono animate-tactical-pulse">
                    THEATER VIEW
                    <div className="text-sm mt-2 text-muted-foreground">
                      Place forces. Queue orders. Resolve.
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* How it works */}
        <div className="max-w-screen-xl mx-auto px-4 md:px-6">
          <h3 className="text-lg font-semibold text-primary mb-4">
            How it works
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-card/70 rounded border border-primary/20">
              <div className="flex items-center gap-3 mb-2">
                <Bot className="h-6 w-6 text-primary" />
                <h4 className="font-semibold">Deploy forces</h4>
              </div>
              <p className="text-sm text-muted-foreground">
                Place Friend and Hostile units with the map, the editor, or a
                natural-language command.
              </p>
            </div>
            <div className="p-4 bg-card/70 rounded border border-primary/20">
              <div className="flex items-center gap-3 mb-2">
                <FilePenLine className="h-6 w-6 text-primary" />
                <h4 className="font-semibold">Queue orders</h4>
              </div>
              <p className="text-sm text-muted-foreground">
                Select a unit and click a destination, or type “Move Raptors to
                Kabul”. Orders wait until you resolve.
              </p>
            </div>
            <div className="p-4 bg-card/70 rounded border border-primary/20">
              <div className="flex items-center gap-3 mb-2">
                <Globe className="h-6 w-6 text-primary" />
                <h4 className="font-semibold">Resolve the turn</h4>
              </div>
              <p className="text-sm text-muted-foreground">
                All units move at once. Opposing forces within range fight and
                take attrition.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
