"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

export default function CallToAction() {
  return (
    <section className="w-full py-12 md:py-16">
      <div className="container mx-auto px-4 md:px-6 text-center">
        <h2 className="text-2xl font-display font-bold mb-3">
          Ready to accelerate planning?
        </h2>
        <p className="text-muted-foreground mb-6">
          Start a trial deployment or request an evaluation for your unit.
        </p>
        <div className="flex items-center justify-center gap-4">
          <Button asChild size="lg" className="font-mono">
            <Link href="/planner">Launch Tactical Interface</Link>
          </Button>
          <Button asChild size="lg" variant="secondary" className="font-mono">
            <Link href="/security-policy">
              Security & Compliance <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
