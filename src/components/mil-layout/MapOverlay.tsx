"use client";

import React from "react";
import type { ViewState } from "react-map-gl";
import type { SymbolData } from "@/types";

type Props = {
  viewState: ViewState;
  formatCoordinate: (n: number) => string;
  formatScale: (z: number) => string;
  lastCombatLine: string | null;
  aar: string[];
  placing: boolean;
  pickingLocation?: boolean;
  moving?: boolean;
  onCancelPick?: () => void;
  onCancelMove?: () => void;
};

export default function MapOverlay({
  viewState,
  formatCoordinate,
  formatScale,
  lastCombatLine,
  aar,
  placing,
  pickingLocation = false,
  moving = false,
  onCancelPick,
  onCancelMove,
}: Props) {
  return (
    <div className="absolute inset-0 pointer-events-none z-10 hud-viewport">
      <span className="hud-corner hud-corner-tl" />
      <span className="hud-corner hud-corner-tr" />
      <span className="hud-corner hud-corner-bl" />
      <span className="hud-corner hud-corner-br" />

      {pickingLocation && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 hud-panel pointer-events-auto px-4 py-2 flex items-center gap-4">
          <div className="font-mono text-[11px] tracking-[0.18em] uppercase text-secondary">
            Click the map to set the drop point
          </div>
          <button
            type="button"
            onClick={onCancelPick}
            className="font-mono text-[10px] tracking-widest uppercase border border-primary/40 px-2 py-1 text-muted-foreground hover:text-primary"
          >
            Cancel
          </button>
        </div>
      )}

      {placing && !pickingLocation && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 hud-panel px-3 py-1.5 font-mono text-[10px] tracking-[0.18em] text-secondary">
          Place mode · click map
        </div>
      )}

      {moving && !placing && !pickingLocation && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 hud-panel pointer-events-auto px-3 py-1.5 flex items-center gap-3">
          <div className="font-mono text-[10px] tracking-[0.18em] text-primary uppercase">
            Move · click a destination
          </div>
          <button
            type="button"
            onClick={onCancelMove}
            className="font-mono text-[10px] tracking-widest uppercase border border-primary/40 px-2 py-0.5 text-muted-foreground hover:text-primary"
          >
            Cancel
          </button>
        </div>
      )}

      <div className="absolute bottom-24 left-4 flex flex-wrap gap-2 items-end max-w-[min(36rem,calc(100%-8rem))]">
        <div className="hud-panel px-3 py-1.5 font-mono text-[11px] tracking-wider text-primary/80">
          {formatScale(viewState.zoom)}
          <span className="mx-2 text-muted-foreground">|</span>
          {formatCoordinate(viewState.latitude)}N{" "}
          {formatCoordinate(viewState.longitude)}E
        </div>
        {(aar.length > 0 || lastCombatLine) && (
          <div className="hud-panel px-3 py-1.5 font-mono text-[11px] text-secondary">
            <span className="text-[10px] tracking-[0.18em] mr-2 text-muted-foreground">
              Last turn
            </span>
            {(aar.length > 0 ? aar : [lastCombatLine]).filter(Boolean).join(" · ")}
          </div>
        )}
      </div>
    </div>
  );
}
