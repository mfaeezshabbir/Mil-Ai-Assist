"use client";

import React from "react";
import { Geocoder } from "@/components/geocoder";
import FloatingCommand from "@/components/mil-layout/FloatingCommand";
import type { MapRef } from "react-map-gl";
import type { SymbolData } from "@/types";
import SymbolSizer from "../symbolSizer";
import { Button } from "@/components/ui/button";
import { MapPin } from "lucide-react";

type ControlsProps = {
  mapRef: React.RefObject<MapRef>;
  symbolSize?: "small" | "medium" | "large" | "xxl";
  onSymbolSizeChange?: (s: "small" | "medium" | "large" | "xxl") => void;
  symbols?: SymbolData[];
  formAction?: any;
  onAddSymbol?: () => void;
};

export default function Controls({
  mapRef,
  symbolSize,
  onSymbolSizeChange,
  symbols,
  formAction,
  onAddSymbol,
}: ControlsProps) {
  const [showSymbolSize, setShowSymbolSize] = React.useState(false);

  return (
    <>
      <div className="fixed right-3 top-20 flex flex-col gap-2">
        {/* Add Symbol Button */}
        <Button
          onClick={onAddSymbol}
          size="sm"
          variant="outline"
          className="bg-background/80 backdrop-blur-sm border-primary/20 hover:bg-primary/10 text-foreground"
          title="Add Symbol"
        >
          <MapPin className="h-4 w-4" />
        </Button>

        {symbols && symbols.length > 0 && (
          <SymbolSizer
            symbolSize={symbolSize}
            onSymbolSizeChange={onSymbolSizeChange}
          />
        )}
        <Geocoder
          mapboxAccessToken={process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN!}
          mapRef={mapRef}
        />

        <FloatingCommand inline formAction={formAction} />
      </div>
    </>
  );
}
