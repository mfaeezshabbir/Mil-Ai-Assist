
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowRight, Bot, BrainCircuit, FilePenLine, Globe } from 'lucide-react';

export function LandingPage() {
  return (
    <div className="flex flex-col min-h-dvh bg-background text-foreground">
      <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur-sm">
        <div className="container mx-auto h-14 flex items-center px-4 md:px-6">
          <Link href="/" className="flex items-center gap-2 font-semibold" prefetch={false}>
            <Bot className="h-6 w-6 text-primary" />
            <span className="text-lg">MilAIAssist</span>
          </Link>
          <nav className="ml-auto flex items-center gap-4">
            <Link
              href="/planner"
              className="text-sm font-medium hover:underline underline-offset-4"
              prefetch={false}
            >
              Planner
            </Link>
            <Button asChild size="sm">
              <Link href="/planner">
                Launch App
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </nav>
        </div>
      </header>
      <main className="flex-1">
        <section className="w-full pt-12 md:pt-24 lg:pt-32 border-b">
          <div className="container px-4 md:px-6 space-y-10 xl:space-y-16">
            <div className="grid max-w-screen-xl gap-4 px-4 mx-auto md:grid-cols-2 md:px-6">
              <div className="flex flex-col justify-center space-y-4">
                <div className="space-y-2">
                  <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl xl:text-6xl/none">
                    Mission Planning, Reimagined
                  </h1>
                  <p className="max-w-[600px] text-muted-foreground md:text-xl">
                    Harness the power of AI to translate natural language commands into standard military symbology. Drastically accelerate your planning cycle and enhance situational awareness.
                  </p>
                </div>
                <div className="flex flex-col gap-2 min-[400px]:flex-row">
                  <Button asChild size="lg">
                    <Link href="/planner">
                      Launch Planner
                    </Link>
                  </Button>
                  <Button asChild variant="outline" size="lg">
                     <Link href="#features">
                        Learn More
                     </Link>
                  </Button>
                </div>
              </div>
              <Image
                src="https://images.unsplash.com/photo-1647606375715-ddb3a957cdce?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHwxOXx8d2FyJTIwYXJteSUyMHN0cmF0ZWd5fGVufDB8fHx8MTc1MTM3MjgzOXww&ixlib=rb-4.1.0&q=80&w=1080"
                width="600"
                height="400"
                alt="Hero"
                data-ai-hint="tactical team"
                className="mx-auto overflow-hidden rounded-xl object-cover"
              />
            </div>
          </div>
        </section>
        <section id="features" className="w-full py-12 md:py-24 lg:py-32 bg-muted/40">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <div className="inline-block rounded-lg bg-secondary px-3 py-1 text-sm">Core Features</div>
                <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl">Accelerate Your Planning Cycle</h2>
                <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  From simple voice commands to detailed symbol editing, MilAIAssist provides the tools you need for efficient and accurate mission planning.
                </p>
              </div>
            </div>
            <div className="mx-auto grid max-w-5xl items-start gap-8 sm:grid-cols-2 md:gap-12 lg:grid-cols-3 mt-12">
              <Card className="hover:shadow-lg transition-shadow bg-background/50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-3">
                    <BrainCircuit className="h-8 w-8 text-primary" />
                    AI-Powered Parsing
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Describe units and actions in plain English. The AI understands context, identities, and locations to plot symbols accurately.
                  </p>
                </CardContent>
              </Card>
              <Card className="hover:shadow-lg transition-shadow bg-background/50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-3">
                    <Globe className="h-8 w-8 text-primary" />
                    Interactive Map
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Visualize the operational picture on a dynamic map. Double-click to set coordinates and drag-and-drop symbols to adjust positions.
                  </p>
                </CardContent>
              </Card>
              <Card className="hover:shadow-lg transition-shadow bg-background/50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-3">
                    <FilePenLine className="h-8 w-8 text-primary" />
                    Compliant Symbolism
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Fine-tune every aspect of a symbol with a comprehensive editor, ensuring compliance with MIL-STD-2525D standards.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>
        <section className="w-full py-12 md:py-24 lg:py-32">
          <div className="container grid items-center justify-center gap-4 px-4 text-center md:px-6">
            <div className="space-y-3">
              <h2 className="text-3xl font-bold tracking-tighter md:text-4xl/tight">
                Ready to Revolutionize Your Planning?
              </h2>
              <p className="mx-auto max-w-[600px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                Jump into the planner and experience the future of mission coordination. No account required.
              </p>
            </div>
            <div className="mx-auto w-full max-w-sm space-y-2">
               <Button asChild size="lg" className="w-full">
                  <Link href="/planner">
                    Launch Planner
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
            </div>
          </div>
        </section>
      </main>
      <footer className="flex flex-col gap-2 sm:flex-row py-6 w-full shrink-0 items-center px-4 md:px-6 border-t">
        <div className="flex items-center gap-2">
            <Bot className="h-5 w-5 text-muted-foreground" />
            <p className="text-xs text-muted-foreground">&copy; 2024 MilAIAssist. All rights reserved.</p>
        </div>
        <nav className="sm:ml-auto flex gap-4 sm:gap-6">
          <Link href="#" className="text-xs hover:underline underline-offset-4" prefetch={false}>
            Terms of Service
          </Link>
          <Link href="#" className="text-xs hover:underline underline-offset-4" prefetch={false}>
            Privacy
          </Link>
        </nav>
      </footer>
    </div>
  );
}
