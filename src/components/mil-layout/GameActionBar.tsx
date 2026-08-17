"use client";

import type { ReactNode } from "react";
import { Move, Pause, Pencil, Play, Radio, X } from "lucide-react";
import type { SymbolData } from "@/types";
import { TrackSymbol } from "@/components/track-symbol";
import { isCombatUnit, isBoardAsset, unitLabel } from "@/lib/sim/units";
import { trackClass, trackClassLabel } from "@/lib/sim/track-style";
import { RULES } from "@/lib/sim/rules";

export type OrderMode = "move" | "hold" | null;

type Props = {
  selectedUnit: SymbolData | null;
  turn: number;
  queuedMoves: number;
  orderMode: OrderMode;
  onOrderMode: (mode: OrderMode) => void;
  onHold: () => void;
  onEdit: () => void;
  onOpenAi: () => void;
  onEndTurn: () => void;
  onClear: () => void;
  forceLine?: string;
};

export default function GameActionBar({
  selectedUnit,
  turn,
  queuedMoves,
  orderMode,
  onOrderMode,
  onHold,
  onEdit,
  onOpenAi,
  onEndTurn,
  onClear,
  forceLine,
}: Props) {
  const combat = selectedUnit ? isCombatUnit(selectedUnit) : false;
  const strength = selectedUnit?.strength ?? 100;

  return (
    <div className="absolute bottom-3 left-3 right-14 z-30 pointer-events-none">
      <div className="hud-panel pointer-events-auto flex items-stretch gap-0 overflow-hidden">
        <div className="flex items-center gap-3 px-3 py-2 min-w-0 flex-1">
          {selectedUnit ? (
            <>
              <TrackSymbol symbol={selectedUnit} size={64} selected />
              <div className="min-w-0 flex-1">
                <div className="flex items-start justify-between gap-2">
                  <div className="font-display text-base tracking-[0.12em] uppercase truncate">
                    {unitLabel(selectedUnit)}
                  </div>
                  <button
                    type="button"
                    onClick={onClear}
                    className="shrink-0 text-muted-foreground hover:text-foreground"
                    title="Deselect (Esc)"
                    aria-label="Deselect unit"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
                <div className="font-mono text-[10px] tracking-widest uppercase text-muted-foreground">
                  {trackClassLabel(trackClass(selectedUnit))}
                  {selectedUnit.symbolEchelon
                    ? ` · ${selectedUnit.symbolEchelon}`
                    : ""}
                  {isBoardAsset(selectedUnit) &&
                  selectedUnit.pieceKind === "objective"
                    ? ` · ${selectedUnit.controlledBy ?? "Neutral"} ${selectedUnit.controlStreak ?? 0}/${RULES.holdTurnsToWin}`
                    : ""}
                </div>
                {combat && (
                  <>
                    <div className="mt-1 h-1.5 w-40 max-w-full bg-muted">
                      <div
                        className="h-full bg-secondary"
                        style={{ width: `${strength}%` }}
                      />
                    </div>
                    <div className="mt-1 font-mono text-[10px] tracking-widest text-muted-foreground">
                      HP {strength} · ATK {selectedUnit.attack ?? 0} · DEF{" "}
                      {selectedUnit.defense ?? 0} · RNG {selectedUnit.rangeKm ?? 0}
                    </div>
                  </>
                )}
              </div>
            </>
          ) : (
            <div className="py-2">
              <div className="font-display text-sm tracking-[0.16em] uppercase text-muted-foreground">
                No unit selected
              </div>
              <div className="font-mono text-[10px] tracking-widest uppercase text-muted-foreground/80">
                Click a piece · or Help for the briefing
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center gap-1 px-2 border-l border-primary/20">
          <ActionBtn
            label="Move"
            icon={<Move className="h-4 w-4" />}
            active={orderMode === "move"}
            disabled={!combat}
            onClick={() => onOrderMode("move")}
          />
          <ActionBtn
            label="Hold"
            icon={<Pause className="h-4 w-4" />}
            active={orderMode === "hold" || selectedUnit?.order?.type === "hold"}
            disabled={!combat}
            onClick={onHold}
          />
          <ActionBtn
            label="Edit"
            icon={<Pencil className="h-4 w-4" />}
            disabled={!selectedUnit}
            onClick={onEdit}
          />
          <ActionBtn
            label="AI"
            icon={<Radio className="h-4 w-4" />}
            onClick={onOpenAi}
          />
        </div>

        <button
          type="button"
          onClick={onEndTurn}
          className="px-5 min-w-[8.5rem] bg-secondary text-secondary-foreground font-display tracking-[0.18em] uppercase text-sm hover:bg-secondary/90"
        >
          <div className="flex items-center justify-center gap-2">
            <Play className="h-4 w-4" />
            End turn
          </div>
          <div className="font-mono text-[9px] tracking-widest opacity-80">
            T{String(turn).padStart(2, "0")}
            {queuedMoves > 0 ? ` · ${queuedMoves} MOVE` : ""}
            {forceLine ? ` · ${forceLine}` : ""}
          </div>
        </button>
      </div>
    </div>
  );
}

function ActionBtn({
  label,
  icon,
  active,
  disabled,
  onClick,
}: {
  label: string;
  icon: ReactNode;
  active?: boolean;
  disabled?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className={`flex flex-col items-center justify-center w-14 h-14 border font-mono text-[9px] tracking-widest uppercase disabled:opacity-30 ${
        active
          ? "border-primary bg-primary/20 text-primary"
          : "border-primary/20 text-muted-foreground hover:border-primary/50 hover:text-foreground"
      }`}
    >
      {icon}
      {label}
    </button>
  );
}
