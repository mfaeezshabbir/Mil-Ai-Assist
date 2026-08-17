"use client";

import React from "react";
import { Target, MapPin, Info, AlertTriangle } from "lucide-react";
import type { ViewState } from "react-map-gl";
import type { SymbolData } from "@/types";
import { unitLabel } from "@/lib/sim/units";

type Props = {
  viewState: ViewState;
  formatCoordinate: (n: number) => string;
  formatScale: (z: number) => string;
  selectedUnit: SymbolData | null;
  lastCombatLine: string | null;
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
  selectedUnit,
  lastCombatLine,
}: Props) {
  return (
    <div className="absolute inset-0 pointer-events-none border-2 border-tactical border-primary/30 z-10">
      <div className="flex flex-wrap gap-2 absolute top-2 left-2 right-16 px-2 pointer-events-none">
        <OverlayBox className="text-destructive text-xs border-destructive/30 bg-destructive/20">
          <AlertTriangle className="h-3 w-3" />
          <span>EXERCISE // NOT ACTUAL</span>
        </OverlayBox>
        <OverlayBox className="text-primary border-primary/30 bg-primary/10">
          <Target className="h-3 w-3" />
          <span>PHASE: ORDERS</span>
        </OverlayBox>
        {selectedUnit && (
          <OverlayBox className="text-foreground border-primary/40">
            <span>
              {unitLabel(selectedUnit)}
              {selectedUnit.order?.type === "move"
                ? " · MOVE queued — click map to retarget"
                : " · click map to order MOVE"}
              {typeof selectedUnit.strength === "number"
                ? ` · STR ${selectedUnit.strength}`
                : ""}
            </span>
          </OverlayBox>
        )}
      </div>
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
        {lastCombatLine && (
          <OverlayBox className="text-accent-foreground border-accent/40 bg-accent/10">
            <span>{lastCombatLine}</span>
          </OverlayBox>
        )}
      </div>
    </div>
  );
}
