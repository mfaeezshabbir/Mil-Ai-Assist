"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Radio, Map, Target } from "lucide-react";

export default function UseCases() {
  return (
    <section className="w-full py-12 md:py-20">
      <div className="container mx-auto px-4 md:px-6">
        <h2 className="text-2xl font-display font-bold mb-4">
          How to play
        </h2>
        <p className="text-muted-foreground mb-6 max-w-2xl">
          Same-machine WEGO: you place both sides, queue orders, then resolve
          one simultaneous turn.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="bg-card/80 border-tactical border-primary/20 shadow-tactical">
            <CardHeader>
              <Target className="h-8 w-8 text-primary mb-2" />
              <CardTitle className="font-display">Deploy</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Drop Friend and Hostile units. Double-click the map or use
                natural language.
              </p>
            </CardContent>
          </Card>

          <Card className="bg-card/80 border-tactical border-primary/20 shadow-tactical">
            <CardHeader>
              <Map className="h-8 w-8 text-primary mb-2" />
              <CardTitle className="font-display">Order</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Select a unit and click a destination. A dashed line is the
                queued move, not an instant teleport.
              </p>
            </CardContent>
          </Card>

          <Card className="bg-card/80 border-tactical border-primary/20 shadow-tactical">
            <CardHeader>
              <Radio className="h-8 w-8 text-primary mb-2" />
              <CardTitle className="font-display">Resolve</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Hit Resolve Turn. Units advance by speed, then fight if they
                close within range.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
}
