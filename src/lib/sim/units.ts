import type { ForceSide, PieceKind, SymbolData } from "@/types";
import { CATALOG, getCatalog } from "./catalog";
import { trackClass } from "./track-style";

const BOARD_KINDS: PieceKind[] = [
  "objective",
  "fob",
  "supply",
  "minefield",
  "obstacle",
];

export function isBoardAsset(unit: SymbolData): boolean {
  return BOARD_KINDS.includes(unit.pieceKind ?? "combat");
}

export function isCombatUnit(unit: SymbolData): boolean {
  return (unit.pieceKind ?? "combat") === "combat";
}

export function isFriendly(identity?: string): boolean {
  return identity === "Friend" || identity === "Assumed Friend";
}

export function isHostile(identity?: string): boolean {
  return identity === "Hostile" || identity === "Suspect";
}

export function unitSide(unit: SymbolData): ForceSide {
  if (unit.pieceKind === "objective") {
    return unit.controlledBy ?? "Neutral";
  }
  if (isFriendly(unit.symbolStandardIdentity)) return "Friend";
  if (isHostile(unit.symbolStandardIdentity)) return "Hostile";
  return "Neutral";
}

export function speedKmPerTurnForEchelon(echelon?: string): number {
  const table: Record<string, number> = {
    Team: 8,
    Squad: 10,
    Section: 12,
    Platoon: 13,
    Company: 15,
    Battalion: 20,
    Regiment: 22,
    Brigade: 25,
    Division: 25,
    Corps: 25,
    Army: 25,
  };
  return table[echelon ?? ""] ?? 15;
}

function catalogStats(unit: SymbolData) {
  const byId = getCatalog(unit.catalogId);
  if (byId) return byId;
  const kind = trackClass(unit);
  return CATALOG.find((entry) => entry.id === kind);
}

export function withSimDefaults(unit: SymbolData): SymbolData {
  const stats = catalogStats(unit);
  const pieceKind = unit.pieceKind ?? stats?.pieceKind ?? "combat";
  return {
    ...unit,
    pieceKind,
    catalogId: unit.catalogId ?? stats?.id,
    strength: typeof unit.strength === "number" ? unit.strength : 100,
    speedKmPerTurn:
      typeof unit.speedKmPerTurn === "number"
        ? unit.speedKmPerTurn
        : stats?.speedKmPerTurn ?? speedKmPerTurnForEchelon(unit.symbolEchelon),
    attack:
      typeof unit.attack === "number" ? unit.attack : (stats?.attack ?? 4),
    defense:
      typeof unit.defense === "number" ? unit.defense : (stats?.defense ?? 3),
    rangeKm:
      typeof unit.rangeKm === "number" ? unit.rangeKm : (stats?.rangeKm ?? 3),
    controlledBy:
      unit.controlledBy ??
      (pieceKind === "objective" ? "Neutral" : undefined),
    controlStreak:
      pieceKind === "objective" ? unit.controlStreak ?? 0 : unit.controlStreak,
  };
}

export function unitLabel(unit: SymbolData): string {
  return unit.aiLabel || unit.catalogId || unit.symbolSet || "Unit";
}

export function countForces(units: SymbolData[]) {
  const combat = units.filter(isCombatUnit);
  return {
    friend: combat.filter((unit) => isFriendly(unit.symbolStandardIdentity))
      .length,
    hostile: combat.filter((unit) => isHostile(unit.symbolStandardIdentity))
      .length,
  };
}

export function countObjectives(units: SymbolData[]) {
  const objectives = units.filter((unit) => unit.pieceKind === "objective");
  return {
    total: objectives.length,
    friend: objectives.filter((unit) => unit.controlledBy === "Friend").length,
    hostile: objectives.filter((unit) => unit.controlledBy === "Hostile")
      .length,
  };
}
