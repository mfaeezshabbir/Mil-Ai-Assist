"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Globe, Radio, Map, Target } from "lucide-react";

export default function UseCases() {
  return (
    <section className="w-full py-12 md:py-20">
      <div className="container mx-auto px-4 md:px-6">
        <h2 className="text-2xl font-display font-bold mb-4">
          Typical Use Cases
        </h2>
        <p className="text-muted-foreground mb-6 max-w-2xl">
          MilAIAssist accelerates planning across the mission lifecycle. Common
          use cases include rapid symbolization, rehearsal, and joint-force
          coordination.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="bg-card/80 border-tactical border-primary/20 shadow-tactical">
            <CardHeader>
              <Target className="h-8 w-8 text-primary mb-2" />
              <CardTitle className="font-display">Tactical Planning</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Create, position and update unit symbology rapidly for mission
                briefs and maneuver planning.
              </p>
            </CardContent>
          </Card>

          <Card className="bg-card/80 border-tactical border-primary/20 shadow-tactical">
            <CardHeader>
              <Map className="h-8 w-8 text-primary mb-2" />
              <CardTitle className="font-display">Terrain & Routes</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Analyze terrain, plan routes, and overlay restricted areas for
                safer operations.
              </p>
            </CardContent>
          </Card>

          <Card className="bg-card/80 border-tactical border-primary/20 shadow-tactical">
            <CardHeader>
              <Radio className="h-8 w-8 text-primary mb-2" />
              <CardTitle className="font-display">
                Communications & Coordination
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Share standardized plans across command and control systems and
                maintain a single source of truth.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
}
