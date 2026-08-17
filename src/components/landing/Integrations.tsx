"use client";

import { Badge } from "@/components/ui/badge";

export default function Integrations() {
  return (
    <section className="w-full py-12 border-b border-primary/15">
      <div className="container mx-auto px-4 md:px-6">
        <div className="font-mono text-[10px] tracking-[0.32em] text-primary uppercase mb-3">
          Stack
        </div>
        <h2 className="text-2xl font-display font-bold tracking-[0.08em] uppercase mb-3">
          Integrations
        </h2>
        <p className="text-muted-foreground mb-6 max-w-2xl font-mono text-sm">
          Built to sit on a live map and exchange standard geospatial formats.
        </p>
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="outline">Mapbox</Badge>
          <Badge variant="outline">GeoJSON</Badge>
          <Badge variant="outline">SAML</Badge>
          <Badge variant="outline">OAuth</Badge>
          <Badge variant="outline">REST API</Badge>
        </div>
      </div>
    </section>
  );
}
