"use client";

import { Badge } from "@/components/ui/badge";

export default function Integrations() {
  return (
    <section className="w-full py-12 bg-muted/10">
      <div className="container mx-auto px-4 md:px-6">
        <h2 className="text-2xl font-display font-bold mb-4">Integrations</h2>
        <p className="text-muted-foreground mb-6 max-w-2xl">
          MilAIAssist is designed to fit into existing toolchains and can
          exchange data via standard formats.
        </p>
        <div className="flex flex-wrap items-center gap-3">
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
