"use client";

import React from "react";
import { Target, MapPin, Info, AlertTriangle } from "lucide-react";

type Props = {
  viewState: any;
  formatCoordinate: (n: number) => string;
  formatScale: (z: number) => string;
};

const OverlayBox = ({
  children,
  className = "",
}: React.PropsWithChildren<{ className?: string }>) => (
  <div
    className={`bg-background/80 backdrop-blur-sm px-2 py-1 text-xs sm:text-sm font-mono rounded-sm border pointer-events-auto w-fit ${className}`}
  >
    <div className="flex items-center gap-1">{children}</div>
  </div>
);

export default function MapOverlay({
  viewState,
  formatCoordinate,
  formatScale,
}: Props) {
  return (
    <div className="absolute inset-0 pointer-events-none border-2 border-tactical border-primary/30 z-10">
      {/* Top overlays */}
      <div className="flex flex-wrap gap-2 absolute top-2 left-2 right-2 px-2 pointer-events-none">
        <OverlayBox className="text-destructive text-xs border-destructive/30 bg-destructive/20">
          <AlertTriangle className="h-3 w-3" />
          <span>EXERCISE // NOT ACTUAL</span>
        </OverlayBox>
      </div>
      {/* Bottom overlays */}
      <div className="flex flex-wrap gap-2 absolute bottom-2 left-2 right-2 px-2 pointer-events-none">
        <OverlayBox className="text-primary/70 border-primary/20">
          <Info className="h-3 w-3" />
          <span>SCALE: {formatScale(viewState.zoom)}</span>
        </OverlayBox>
        <OverlayBox className="text-primary/70 border-primary/20">
          <MapPin className="h-3 w-3" />
          <span>
            {formatCoordinate(viewState.latitude)}°N,{" "}
            {formatCoordinate(viewState.longitude)}°E
          </span>
        </OverlayBox>
      </div>
    </div>
  );
}
