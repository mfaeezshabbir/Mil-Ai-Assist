"use client";

import React from "react";
import { Target, MapPin, Info, AlertTriangle } from "lucide-react";

type Props = {
  viewState: any;
  formatCoordinate: (n: number) => string;
  formatScale: (z: number) => string;
};

export default function MapOverlay({
  viewState,
  formatCoordinate,
  formatScale,
}: Props) {
  return (
    <div className="absolute inset-0 pointer-events-none border-2 border-tactical border-primary/30 z-10">
      <div className="absolute top-2 left-2 bg-background/80 backdrop-blur-sm px-2 py-1 text-xs font-mono text-primary/70 rounded-sm border border-primary/20">
        <div className="flex items-center gap-1">
          <Target className="h-3 w-3" />
          <span>GRID: 31TDF08269735</span>
        </div>
      </div>
      <div className="absolute top-2 right-2 bg-background/80 backdrop-blur-sm px-2 py-1 text-xs font-mono text-primary/70 rounded-sm border border-primary/20">
        <div className="flex items-center gap-1">
          <MapPin className="h-3 w-3" />
          <span>
            {formatCoordinate(viewState.latitude)}°N,{" "}
            {formatCoordinate(viewState.longitude)}°E
          </span>
        </div>
      </div>
      <div className="absolute bottom-2 left-2 bg-background/80 backdrop-blur-sm px-2 py-1 text-xs font-mono text-primary/70 rounded-sm border border-primary/20">
        <div className="flex items-center gap-1">
          <Info className="h-3 w-3" />
          <span>SCALE: {formatScale(viewState.zoom)}</span>
        </div>
      </div>
      <div className="absolute bottom-2 right-12 bg-destructive/20 backdrop-blur-sm px-2 py-1 text-xs font-mono text-destructive rounded-sm border border-destructive/30">
        <div className="flex items-center gap-1">
          <AlertTriangle className="h-3 w-3" />
          <span>EXERCISE // NOT ACTUAL</span>
        </div>
      </div>
    </div>
  );
}
