import type { SymbolData } from "@/types";

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

export function withSimDefaults(unit: SymbolData): SymbolData {
  return {
    ...unit,
    strength: typeof unit.strength === "number" ? unit.strength : 100,
    speedKmPerTurn:
      typeof unit.speedKmPerTurn === "number"
        ? unit.speedKmPerTurn
        : speedKmPerTurnForEchelon(unit.symbolEchelon),
  };
}

export function isFriendly(identity?: string): boolean {
  return identity === "Friend" || identity === "Assumed Friend";
}

export function isHostile(identity?: string): boolean {
  return identity === "Hostile" || identity === "Suspect";
}

export function unitLabel(unit: SymbolData): string {
  return unit.aiLabel || unit.symbolSet || "Unit";
}

export function countForces(units: SymbolData[]) {
  return {
    friend: units.filter((unit) => isFriendly(unit.symbolStandardIdentity))
      .length,
    hostile: units.filter((unit) => isHostile(unit.symbolStandardIdentity))
      .length,
  };
}
