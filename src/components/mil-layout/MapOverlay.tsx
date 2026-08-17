"use client";

import React from "react";
import type { ViewState } from "react-map-gl";
import type { SymbolData } from "@/types";
import { TrackSymbol } from "@/components/track-symbol";
import { isBoardAsset, isCombatUnit, unitLabel } from "@/lib/sim/units";
import { trackClass, trackClassLabel } from "@/lib/sim/track-style";
import { RULES, inContact, isOutOfSupply, underCommand } from "@/lib/sim/rules";

type Props = {
  viewState: ViewState;
  formatCoordinate: (n: number) => string;
  formatScale: (z: number) => string;
  selectedUnit: SymbolData | null;
  units: SymbolData[];
  lastCombatLine: string | null;
  aar: string[];
  placing: boolean;
  pickingLocation?: boolean;
  onCancelPick?: () => void;
};

export default function MapOverlay({
  viewState,
  formatCoordinate,
  formatScale,
  selectedUnit,
  units,
  lastCombatLine,
  aar,
  placing,
  pickingLocation = false,
  onCancelPick,
}: Props) {
  const flags =
    selectedUnit && isCombatUnit(selectedUnit)
      ? [
          underCommand(selectedUnit, units) ? "C2" : null,
          isOutOfSupply(selectedUnit, units) ? "OOS" : null,
          inContact(selectedUnit, units) ? "CONTACT" : null,
        ].filter(Boolean)
      : [];

  return (
    <div className="absolute inset-0 pointer-events-none z-10 hud-viewport">
      <span className="hud-corner hud-corner-tl" />
      <span className="hud-corner hud-corner-tr" />
      <span className="hud-corner hud-corner-bl" />
      <span className="hud-corner hud-corner-br" />

      <div className="absolute top-4 left-4">
        <div className="hud-panel px-3 py-1.5 font-mono text-[10px] tracking-[0.22em] text-destructive">
          EXERCISE // NOT ACTUAL
        </div>
      </div>

      {selectedUnit && (
        <div className="absolute top-4 left-52 hud-panel pointer-events-auto max-w-sm px-3 py-2 flex gap-3 items-start">
          <TrackSymbol symbol={selectedUnit} size={56} selected />
          <div className="min-w-0">
            <div className="font-mono text-[10px] tracking-[0.2em] text-primary mb-1">
              {isBoardAsset(selectedUnit) ? "BOARD ASSET" : "SELECTED TRACK"}
            </div>
            <div className="font-display text-sm tracking-wide uppercase">
              {unitLabel(selectedUnit)}
            </div>
            {isCombatUnit(selectedUnit) ? (
              <>
                <div className="mt-1 font-mono text-[11px] text-muted-foreground">
                  ATK {selectedUnit.attack ?? 0} · DEF {selectedUnit.defense ?? 0}{" "}
                  · MOV {selectedUnit.speedKmPerTurn ?? 0} · RNG{" "}
                  {selectedUnit.rangeKm ?? 0} km
                </div>
                <div className="mt-1 font-mono text-[11px] text-muted-foreground">
                  STR {selectedUnit.strength ?? 100}
                  {" · "}
                  {trackClassLabel(trackClass(selectedUnit))}
                  {" · "}
                  {selectedUnit.order?.type === "move"
                    ? "MOVE QUEUED"
                    : "HOLD / FIRE"}
                </div>
                {flags.length > 0 && (
                  <div className="mt-1 font-mono text-[10px] tracking-widest text-secondary">
                    {flags.join(" · ")}
                  </div>
                )}
                <div className="mt-2 h-1 w-full bg-muted">
                  <div
                    className="h-full bg-secondary"
                    style={{ width: `${selectedUnit.strength ?? 100}%` }}
                  />
                </div>
                <div className="mt-1 font-mono text-[10px] text-primary/80">
                  Click map to set waypoint
                </div>
              </>
            ) : (
              <div className="mt-1 font-mono text-[11px] text-muted-foreground">
                {trackClassLabel(trackClass(selectedUnit))}
                {selectedUnit.pieceKind === "objective"
                  ? ` · HELD BY ${selectedUnit.controlledBy ?? "Neutral"} · HOLD ${selectedUnit.controlStreak ?? 0}/${RULES.holdTurnsToWin}`
                  : ""}
                {selectedUnit.rangeKm
                  ? ` · RADIUS ${selectedUnit.rangeKm} km`
                  : ""}
              </div>
            )}
          </div>
        </div>
      )}

      {pickingLocation && (
        <div className="absolute top-16 left-1/2 -translate-x-1/2 hud-panel pointer-events-auto px-4 py-2 flex items-center gap-4">
          <div className="font-mono text-[11px] tracking-[0.18em] uppercase text-secondary">
            Click map to set drop point
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
        <div className="absolute top-16 left-4 hud-panel px-3 py-1.5 font-mono text-[10px] tracking-[0.18em] text-secondary">
          PLACE MODE · CLICK MAP
        </div>
      )}

      <div className="absolute bottom-4 left-4 right-4 flex flex-wrap gap-2 items-end">
        <div className="hud-panel px-3 py-1.5 font-mono text-[11px] tracking-wider text-primary/80">
          {formatScale(viewState.zoom)}
          <span className="mx-2 text-muted-foreground">|</span>
          {formatCoordinate(viewState.latitude)}N{" "}
          {formatCoordinate(viewState.longitude)}E
        </div>
        {(aar.length > 0 || lastCombatLine) && (
          <div className="hud-panel px-3 py-1.5 font-mono text-[11px] text-secondary max-w-xl">
            <span className="text-[10px] tracking-[0.18em] mr-2 text-muted-foreground">
              AAR
            </span>
            {(aar.length > 0 ? aar : [lastCombatLine]).filter(Boolean).join(" · ")}
          </div>
        )}
      </div>
    </div>
  );
}
