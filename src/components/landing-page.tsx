import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ArrowRight,
  Bot,
  BrainCircuit,
  FilePenLine,
  Globe,
  Shield,
  Target,
  Map,
  Radio,
  AlertTriangle,
} from "lucide-react";

export function LandingPage() {
  return (
    <div className="flex flex-col min-h-dvh bg-background text-foreground bg-tactical-grid bg-[size:20px_20px]">
      {/* Military-style header with tactical design */}
      <header className="sticky top-0 z-50 w-full border-b border-tactical border-primary/50 bg-background/95 backdrop-blur-sm shadow-tactical">
        <div className="container mx-auto h-16 flex items-center px-4 md:px-6">
          <Link
            href="/"
            className="flex items-center gap-2 font-display font-bold tracking-wider"
            prefetch={false}
          >
            <Shield className="h-6 w-6 text-primary" />
            <span className="text-lg uppercase">MilAIAssist</span>
            <span className="text-xs text-secondary rounded bg-muted px-1.5 py-0.5 font-mono">
              v1.0
            </span>
          </Link>
          <div className="h-4 w-px bg-border mx-4"></div>
          <div className="text-xs font-mono text-muted-foreground hidden md:block">
            CLASSIFIED // FOR OFFICIAL USE ONLY
          </div>
          <nav className="ml-auto flex items-center gap-4">
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
        </div>
      </header>
      <main className="flex-1">
        {/* Hero section with military theme */}
        <section className="w-full pt-12 md:pt-24 lg:pt-32 border-b border-border">
          <div className="container px-4 md:px-6 space-y-10 xl:space-y-16">
            <div className="grid max-w-screen-xl gap-4 px-4 mx-auto md:grid-cols-2 md:px-6">
              <div className="flex flex-col justify-center space-y-4">
                <div className="inline-flex px-4 py-1 mb-2 text-xs font-semibold tracking-widest text-primary uppercase rounded-full bg-primary/10 border border-primary/20">
                  TACTICAL DECISION SUPPORT SYSTEM
                </div>
                <div className="space-y-2">
                  <h1 className="text-3xl font-display font-bold tracking-tighter uppercase sm:text-4xl md:text-5xl xl:text-6xl/none">
                    Mission Planning,
                    <br />
                    Reimagined
                  </h1>
                  <p className="max-w-[600px] text-muted-foreground md:text-xl">
                    Harness the power of AI to translate natural language
                    commands into standard military symbology. Drastically
                    accelerate your planning cycle and enhance situational
                    awareness.
                  </p>
                </div>
                <div className="flex flex-col gap-2 min-[400px]:flex-row">
                  <Button asChild size="lg" className="font-mono">
                    <Link href="/planner">
                      LAUNCH MISSION PLANNER
                      <Target className="ml-2 h-5 w-5" />
                    </Link>
                  </Button>
                </div>
              </div>
              <div className="flex items-center justify-center">
                <div className="relative w-full max-w-xl">
                  <div className="absolute inset-0 bg-tactical-grid bg-[size:10px_10px] border border-primary/30 rounded-md shadow-tactical-glow"></div>
                  <div className="relative overflow-hidden rounded-md border border-primary/50 shadow-tactical">
                    <div className="aspect-video bg-muted flex items-center justify-center">
                      {/* Placeholder for tactical map image */}
                      <div className="text-xl text-center p-8 font-mono animate-tactical-pulse">
                        TACTICAL VISUALIZATION
                        <div className="text-sm mt-2 text-muted-foreground">
                          Secure Mission Planning Interface
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features section with military style cards */}
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
                Our advanced military planning system provides comprehensive
                tools for mission success
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
              <Button
                asChild
                size="lg"
                variant="secondary"
                className="font-mono"
              >
                <Link href="/planner">
                  ACCESS TACTICAL INTERFACE
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
        </section>
      </main>

      {/* Military-style footer */}
      <footer className="w-full border-t border-tactical border-primary/30 bg-background/95 backdrop-blur-sm shadow-tactical-inset">
        <div className="container flex flex-col items-center justify-center gap-4 py-6 md:flex-row md:py-4">
          <p className="text-center text-sm font-mono text-muted-foreground md:text-left">
            UNCLASSIFIED // MIL-STD-2525D COMPLIANT //{" "}
            {new Date().getFullYear()}
          </p>
          <div className="flex items-center gap-4 md:ml-auto">
            <Link
              href="#"
              className="text-sm font-medium text-muted-foreground hover:text-primary"
            >
              Security Policy
            </Link>
            <Link
              href="#"
              className="text-sm font-medium text-muted-foreground hover:text-primary"
            >
              User Manual
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
