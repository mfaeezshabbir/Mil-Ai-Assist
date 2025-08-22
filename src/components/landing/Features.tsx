"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Map, Radio, BrainCircuit } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function Features() {
  return (
    <section className="w-full py-12 md:py-24 lg:py-32">
      <div className="container px-4 md:px-6">
        <div className="flex flex-col items-center justify-center space-y-4 text-center">
          <div className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border-primary bg-primary/10 text-primary">
            CAPABILITIES
          </div>
          <h2 className="text-3xl font-display font-bold tracking-tighter uppercase md:text-4xl/tight">
            Command and Control Capabilities
          </h2>
          <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
            Our advanced military planning system provides comprehensive tools
            for mission success
          </p>
        </div>
        <div className="mx-auto grid max-w-5xl grid-cols-1 gap-6 py-12 md:grid-cols-3">
          <Card className="border-tactical border-primary/20 shadow-tactical bg-card/80">
            <CardHeader>
              <Map className="h-10 w-10 text-primary mb-2" />
              <CardTitle className="font-display tracking-wide">
                TERRAIN ANALYSIS
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Advanced mapping capabilities with real-time terrain
                visualization and analysis for optimal tactical positioning.
              </p>
            </CardContent>
          </Card>

          <Card className="border-tactical border-primary/20 shadow-tactical bg-card/80">
            <CardHeader>
              <Radio className="h-10 w-10 text-primary mb-2" />
              <CardTitle className="font-display tracking-wide">
                COMMS INTEGRATION
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Secure communication channels with integrated messaging and
                real-time updates across all command levels.
              </p>
            </CardContent>
          </Card>

          <Card className="border-tactical border-primary/20 shadow-tactical bg-card/80">
            <CardHeader>
              <BrainCircuit className="h-10 w-10 text-primary mb-2" />
              <CardTitle className="font-display tracking-wide">
                AI ASSISTANCE
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Natural language processing converts commands to standard
                military symbology with unprecedented speed and accuracy.
              </p>
            </CardContent>
          </Card>
        </div>
        <div className="flex items-center justify-center">
          <Button asChild size="lg" variant="secondary" className="font-mono">
            <Link href="/planner">
              ACCESS TACTICAL INTERFACE
              <span className="ml-2 inline-block">→</span>
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
