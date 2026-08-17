"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Radio, Map, Target } from "lucide-react";

export default function UseCases() {
  return (
    <section className="w-full py-16 md:py-20 border-b border-primary/15">
      <div className="container mx-auto px-4 md:px-6">
        <div className="font-mono text-[10px] tracking-[0.32em] text-primary uppercase mb-3">
          Procedure
        </div>
        <h2 className="text-2xl font-display font-bold tracking-[0.08em] uppercase mb-3">
          How to play
        </h2>
        <p className="text-muted-foreground mb-8 max-w-2xl font-mono text-sm">
          Same-machine WEGO: you place both sides, queue orders, then resolve
          one simultaneous turn.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-px bg-primary/20 border border-primary/20">
          <Card className="border-0 shadow-none rounded-none bg-background">
            <CardHeader>
              <Target className="h-7 w-7 text-primary mb-2" />
              <CardTitle className="font-display text-base">Deploy</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Drop Friend and Hostile units. Double-click the map or use
                natural language.
              </p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-none rounded-none bg-background">
            <CardHeader>
              <Map className="h-7 w-7 text-primary mb-2" />
              <CardTitle className="font-display text-base">Order</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Select a unit and click a destination. A dashed cyan line is the
                queued move, not an instant teleport.
              </p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-none rounded-none bg-background">
            <CardHeader>
              <Radio className="h-7 w-7 text-secondary mb-2" />
              <CardTitle className="font-display text-base">Resolve</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Hit Resolve. Units advance by speed, then fight if they close
                within range.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
}
