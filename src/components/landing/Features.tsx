"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Map, Radio, BrainCircuit } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function Features() {
  return (
    <section className="w-full py-16 md:py-24 border-b border-primary/15">
      <div className="container px-4 md:px-6">
        <div className="flex flex-col items-center justify-center space-y-4 text-center">
          <div className="font-mono text-[10px] tracking-[0.32em] text-primary uppercase border border-primary/30 px-3 py-1">
            Capabilities
          </div>
          <h2 className="text-3xl font-display font-bold tracking-[0.08em] uppercase md:text-4xl">
            Command picture
          </h2>
          <p className="max-w-[720px] text-muted-foreground font-mono text-sm">
            Place both sides, issue orders, and fight a simultaneous turn on a
            live map.
          </p>
        </div>
        <div className="mx-auto grid max-w-5xl grid-cols-1 gap-px py-12 md:grid-cols-3 bg-primary/20 border border-primary/20">
          <Card className="border-0 shadow-none rounded-none bg-background">
            <CardHeader>
              <Map className="h-8 w-8 text-primary mb-2" />
              <CardTitle className="font-display tracking-wide text-base">
                Terrain board
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Satellite, tactical, and terrain styles for a shared theater of
                operations.
              </p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-none rounded-none bg-background">
            <CardHeader>
              <Radio className="h-8 w-8 text-primary mb-2" />
              <CardTitle className="font-display tracking-wide text-base">
                WEGO turns
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Queue moves for every unit, then resolve one simultaneous turn.
                Contact within range becomes attrition.
              </p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-none rounded-none bg-background">
            <CardHeader>
              <BrainCircuit className="h-8 w-8 text-primary mb-2" />
              <CardTitle className="font-display tracking-wide text-base">
                Uplink
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Natural language still deploys units and queues move orders
                without teleporting.
              </p>
            </CardContent>
          </Card>
        </div>
        <div className="flex items-center justify-center">
          <Button asChild size="lg" variant="secondary" className="font-mono tracking-[0.18em]">
            <Link href="/planner">
              ENTER CIC
              <span className="ml-2 inline-block">→</span>
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
