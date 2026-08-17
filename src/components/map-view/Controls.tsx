"use client";

import React from "react";
import { Geocoder } from "@/components/geocoder";
import type { MapRef } from "react-map-gl";
import type { SymbolData } from "@/types";
import SymbolSizer from "../symbolSizer";
import { MapPlus } from "lucide-react";

type ControlsProps = {
  mapRef: React.RefObject<MapRef | null>;
  symbolSize?: "small" | "medium" | "large" | "xxl";
  onSymbolSizeChange?: (s: "small" | "medium" | "large" | "xxl") => void;
  symbols?: SymbolData[];
  onOpenCreateEditor?: () => void;
};

export default function Controls({
  mapRef,
  symbolSize,
  onSymbolSizeChange,
  symbols,
  onOpenCreateEditor,
}: ControlsProps) {
  return (
    <div className="absolute right-3 top-3 flex flex-col gap-2 z-20 pointer-events-auto">
      <button
        type="button"
        onClick={onOpenCreateEditor}
        className="hud-rail-btn"
        title="Deploy unit"
      >
        <MapPlus className="h-4 w-4" />
      </button>

      {symbols && symbols.length > 0 && (
        <SymbolSizer
          symbolSize={symbolSize}
          onSymbolSizeChange={onSymbolSizeChange}
        />
      )}
      <Geocoder
        mapboxAccessToken={process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN ?? ""}
        mapRef={mapRef}
      />
    </div>
  );
}
