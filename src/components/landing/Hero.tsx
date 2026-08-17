"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Target, Crosshair, Radio, Play } from "lucide-react";

export default function Hero() {
  return (
    <section className="w-full border-b border-primary/20">
      <div className="container px-4 md:px-6 py-16 md:py-24 space-y-12">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 justify-between max-w-screen-xl mx-auto">
          <div className="flex items-center gap-3 font-mono text-[10px] tracking-[0.22em] uppercase">
            <span className="px-2 py-1 border border-primary/40 text-primary">
              CIC // WEGO
            </span>
            <span className="px-2 py-1 border border-secondary/40 text-secondary">
              MIL-STD-2525D
            </span>
          </div>
          <div className="font-mono text-[11px] tracking-widest text-muted-foreground uppercase">
            Place · Order · Resolve
          </div>
        </div>

        <div className="grid max-w-screen-xl gap-10 mx-auto md:grid-cols-2">
          <div className="flex flex-col justify-center space-y-6">
            <div className="font-mono text-[11px] tracking-[0.32em] text-primary uppercase">
              Army simulator
            </div>
            <h1 className="text-4xl font-display font-bold tracking-[0.08em] uppercase sm:text-5xl xl:text-6xl leading-tight">
              Theater
              <br />
              command.
            </h1>
            <p className="max-w-[560px] text-muted-foreground md:text-lg font-mono text-sm leading-relaxed">
              Navy CIC glass over a live map. Deploy friend and hostile tracks,
              queue simultaneous orders, then resolve the turn.
            </p>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Button asChild size="lg" className="font-mono tracking-[0.18em]">
                <Link href="/planner">
                  ENTER CIC
                  <Target className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="font-mono tracking-[0.18em]"
              >
                <Link href="/user-manual">MANUAL</Link>
              </Button>
            </div>
          </div>

          <div className="flex items-center justify-center">
            <div className="relative w-full max-w-xl hud-panel p-3">
              <span className="hud-corner hud-corner-tl" />
              <span className="hud-corner hud-corner-tr" />
              <span className="hud-corner hud-corner-bl" />
              <span className="hud-corner hud-corner-br" />
              <div className="aspect-video bg-background/80 border border-primary/20 flex flex-col">
                <div className="flex items-center justify-between px-3 py-2 border-b border-primary/20 font-mono text-[10px] tracking-widest uppercase">
                  <span className="text-primary">TURN 01</span>
                  <span className="text-muted-foreground">PHASE ORDERS</span>
                  <span className="text-destructive">EXERCISE</span>
                </div>
                <div className="flex-1 bg-tactical-grid bg-[size:16px_16px] flex items-center justify-center">
                  <div className="text-center font-display tracking-[0.28em] text-primary/80 animate-tactical-pulse">
                    THEATER VIEW
                    <div className="mt-2 font-mono text-[10px] tracking-widest text-muted-foreground">
                      FRIEND — HOSTILE
                    </div>
                  </div>
                </div>
                <div className="px-3 py-2 border-t border-primary/20 font-mono text-[10px] text-secondary tracking-widest">
                  &gt; MOVE RAPTORS TO KABUL
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-screen-xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-px bg-primary/20 border border-primary/20">
          <div className="p-5 bg-background">
            <div className="flex items-center gap-3 mb-2">
              <Crosshair className="h-5 w-5 text-primary" />
              <h4 className="font-mono text-xs tracking-[0.2em] uppercase text-primary">
                01 Deploy
              </h4>
            </div>
            <p className="text-sm text-muted-foreground">
              Place Friend and Hostile units from the map, editor, or a spoken
              order.
            </p>
          </div>
          <div className="p-5 bg-background">
            <div className="flex items-center gap-3 mb-2">
              <Radio className="h-5 w-5 text-primary" />
              <h4 className="font-mono text-xs tracking-[0.2em] uppercase text-primary">
                02 Queue
              </h4>
            </div>
            <p className="text-sm text-muted-foreground">
              Select a track and click a waypoint. Orders wait until resolve.
            </p>
          </div>
          <div className="p-5 bg-background">
            <div className="flex items-center gap-3 mb-2">
              <Play className="h-5 w-5 text-secondary" />
              <h4 className="font-mono text-xs tracking-[0.2em] uppercase text-secondary">
                03 Resolve
              </h4>
            </div>
            <p className="text-sm text-muted-foreground">
              All units move at once. Contact within range becomes attrition.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
