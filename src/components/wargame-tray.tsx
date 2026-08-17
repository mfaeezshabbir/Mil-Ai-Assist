"use client";

import { CATALOG, getCatalog, type CatalogId } from "@/lib/sim/catalog";
import type { ForceSide, SymbolData } from "@/types";
import { TrackSymbol } from "@/components/track-symbol";

type Props = {
  deployId: CatalogId | null;
  deploySide: ForceSide;
  onDeployId: (id: CatalogId | null) => void;
  onDeploySide: (side: ForceSide) => void;
  onLoadSample: () => void;
};

function preview(id: CatalogId, side: ForceSide): SymbolData {
  const entry = getCatalog(id)!;
  return {
    id: `preview-${id}`,
    displayType: "sidc",
    aiLabel: entry.name,
    context: "Reality",
    symbolStandardIdentity: side,
    status: "Present",
    hqtfd: "Not Applicable",
    symbolSet: entry.symbolSet,
    mainIconId: entry.mainIconId,
    modifier1: "00",
    modifier2: "00",
    symbolEchelon: entry.echelon,
    latitude: 0,
    longitude: 0,
    pieceKind: entry.pieceKind,
    catalogId: entry.id,
    controlledBy: entry.pieceKind === "objective" ? "Neutral" : side,
    attack: entry.attack,
    defense: entry.defense,
    rangeKm: entry.rangeKm,
    speedKmPerTurn: entry.speedKmPerTurn,
    strength: 100,
  };
}

export default function WargameTray({
  deployId,
  deploySide,
  onDeployId,
  onDeploySide,
  onLoadSample,
}: Props) {
  const combat = CATALOG.filter((entry) => entry.group === "combat");
  const board = CATALOG.filter((entry) => entry.group === "board");

  return (
    <div className="absolute left-3 top-24 z-20 pointer-events-auto w-[11.5rem] hud-panel p-2 max-h-[calc(100%-7rem)] overflow-y-auto">
      <div className="font-mono text-[10px] tracking-[0.22em] text-primary uppercase mb-2">
        Pieces
      </div>
      <div className="grid grid-cols-2 gap-1 mb-2">
        <button
          type="button"
          className={`font-mono text-[10px] tracking-widest py-1 border ${
            deploySide === "Friend"
              ? "border-primary bg-primary/15 text-primary"
              : "border-primary/20 text-muted-foreground"
          }`}
          onClick={() => onDeploySide("Friend")}
        >
          FRIEND
        </button>
        <button
          type="button"
          className={`font-mono text-[10px] tracking-widest py-1 border ${
            deploySide === "Hostile"
              ? "border-destructive bg-destructive/15 text-destructive"
              : "border-primary/20 text-muted-foreground"
          }`}
          onClick={() => onDeploySide("Hostile")}
        >
          HOSTILE
        </button>
      </div>
      <div className="grid grid-cols-3 gap-1">
        {combat.map((entry) => {
          const active = deployId === entry.id;
          return (
            <button
              key={entry.id}
              type="button"
              title={entry.name}
              onClick={() => onDeployId(active ? null : entry.id)}
              className={`flex flex-col items-center gap-0.5 p-1 border ${
                active
                  ? "border-primary bg-primary/15"
                  : "border-primary/15 hover:border-primary/40"
              }`}
            >
              <TrackSymbol
                symbol={preview(entry.id, deploySide)}
                size={28}
                selected={active}
              />
              <span className="font-mono text-[8px] tracking-wide uppercase text-muted-foreground leading-none">
                {entry.name.split(" ")[0]}
              </span>
            </button>
          );
        })}
      </div>
      <div className="font-mono text-[10px] tracking-[0.22em] text-secondary uppercase mt-3 mb-2">
        Board
      </div>
      <div className="grid grid-cols-3 gap-1">
        {board.map((entry) => {
          const active = deployId === entry.id;
          return (
            <button
              key={entry.id}
              type="button"
              title={entry.name}
              onClick={() => onDeployId(active ? null : entry.id)}
              className={`flex flex-col items-center gap-0.5 p-1 border ${
                active
                  ? "border-secondary bg-secondary/15"
                  : "border-primary/15 hover:border-primary/40"
              }`}
            >
              <TrackSymbol
                symbol={preview(entry.id, "Neutral")}
                size={28}
                selected={active}
              />
              <span className="font-mono text-[8px] tracking-wide uppercase text-muted-foreground leading-none">
                {entry.name.split(" ")[0]}
              </span>
            </button>
          );
        })}
      </div>
      <button
        type="button"
        onClick={onLoadSample}
        className="mt-3 w-full font-mono text-[10px] tracking-[0.18em] uppercase border border-primary/30 py-1.5 text-primary hover:bg-primary/10"
      >
        Sample battle
      </button>
      {deployId && (
        <div className="mt-2 font-mono text-[10px] text-secondary tracking-wide">
          Click map to place
        </div>
      )}
    </div>
  );
}
