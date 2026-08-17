import type { SymbolData } from "@/types";
import { BOARD } from "./catalog";
import { haversineKm } from "./movement";
import {
  isCombatUnit,
  isFriendly,
  isHostile,
  withSimDefaults,
} from "./units";
import { trackClass } from "./track-style";

export type CombatRole =
  | "infantry"
  | "armor"
  | "artillery"
  | "recon"
  | "aviation"
  | "air-defence"
  | "engineer"
  | "hq"
  | "sof"
  | "other";

export const RULES = {
  hqCommandKm: 8,
  hqAttackBonus: 1,
  oosAttackPenalty: 2,
  oosSpeedFactor: 0.75,
  holdTurnsToWin: 2,
  contactKm: 3.5,
  sofCaptureWeight: 1.5,
  aviationCaptureWeight: 0.35,
  hqCaptureWeight: 0.5,
  reconSpotKm: 8,
  reconArtilleryBonus: 2,
  fobHeal: 14,
  dumpHeal: 8,
} as const;

export function distanceKm(a: SymbolData, b: SymbolData): number {
  return haversineKm(a.latitude, a.longitude, b.latitude, b.longitude);
}

export function combatRole(unit: SymbolData): CombatRole {
  const id = unit.catalogId || trackClass(unit);
  if (
    id === "infantry" ||
    id === "armor" ||
    id === "artillery" ||
    id === "recon" ||
    id === "aviation" ||
    id === "air-defence" ||
    id === "engineer" ||
    id === "hq" ||
    id === "sof"
  ) {
    return id;
  }
  return "other";
}

export function sameSide(a: SymbolData, b: SymbolData): boolean {
  if (isFriendly(a.symbolStandardIdentity) && isFriendly(b.symbolStandardIdentity)) {
    return true;
  }
  if (isHostile(a.symbolStandardIdentity) && isHostile(b.symbolStandardIdentity)) {
    return true;
  }
  return false;
}

export function areEnemies(a: SymbolData, b: SymbolData): boolean {
  if (a.id === b.id) return false;
  if (isFriendly(a.symbolStandardIdentity)) {
    return isHostile(b.symbolStandardIdentity);
  }
  if (isHostile(a.symbolStandardIdentity)) {
    return isFriendly(b.symbolStandardIdentity);
  }
  return false;
}

export function isAviationRole(role: CombatRole): boolean {
  return role === "aviation";
}

export function friendlyHqs(unit: SymbolData, units: SymbolData[]): SymbolData[] {
  return units.filter(
    (other) =>
      isCombatUnit(other) &&
      sameSide(unit, other) &&
      combatRole(other) === "hq"
  );
}

export function underCommand(unit: SymbolData, units: SymbolData[]): boolean {
  if (!isCombatUnit(unit)) return false;
  if (combatRole(unit) === "hq") return true;
  return friendlyHqs(unit, units).some(
    (hq) => distanceKm(unit, hq) <= RULES.hqCommandKm
  );
}

export function supplySources(unit: SymbolData, units: SymbolData[]): SymbolData[] {
  return units.filter(
    (other) =>
      (other.pieceKind === "supply" || other.pieceKind === "fob") &&
      sameSide(unit, other)
  );
}

export function isOutOfSupply(unit: SymbolData, units: SymbolData[]): boolean {
  if (!isCombatUnit(unit)) return false;
  const role = combatRole(unit);
  if (role === "aviation" || role === "sof" || role === "recon") return false;
  const sources = supplySources(unit, units);
  if (sources.length === 0) return false;
  return !sources.some((source) => distanceKm(unit, source) <= BOARD.supplyKm);
}

export function inContact(unit: SymbolData, units: SymbolData[]): boolean {
  if (!isCombatUnit(unit)) return false;
  return units.some(
    (other) =>
      isCombatUnit(other) &&
      areEnemies(unit, other) &&
      distanceKm(unit, other) <= RULES.contactKm
  );
}

export function reconSpots(
  attacker: SymbolData,
  target: SymbolData,
  units: SymbolData[]
): boolean {
  return units.some(
    (other) =>
      isCombatUnit(other) &&
      sameSide(attacker, other) &&
      combatRole(other) === "recon" &&
      distanceKm(other, target) <= RULES.reconSpotKm
  );
}

export function movementFactor(unit: SymbolData, units: SymbolData[]): number {
  if (!isCombatUnit(unit)) return 1;
  const role = combatRole(unit);
  let factor = 1;
  if (isOutOfSupply(unit, units)) factor *= RULES.oosSpeedFactor;
  if (isAviationRole(role) || role === "engineer") return factor;

  const blocked = units.some(
    (asset) =>
      asset.pieceKind === "obstacle" &&
      distanceKm(unit, asset) <= BOARD.obstacleKm
  );
  if (blocked) {
    factor *= role === "armor" ? 0.7 : 0.5;
  }
  return factor;
}

export function mineDamageFor(unit: SymbolData): number {
  const role = combatRole(unit);
  if (isAviationRole(role)) return 0;
  if (role === "engineer" || role === "sof") {
    return Math.round(BOARD.mineDamage * 0.5);
  }
  if (role === "armor") return Math.round(BOARD.mineDamage * 0.75);
  return BOARD.mineDamage;
}

export function captureWeight(unit: SymbolData): number {
  const role = combatRole(unit);
  if (role === "sof") return RULES.sofCaptureWeight;
  if (role === "aviation") return RULES.aviationCaptureWeight;
  if (role === "hq") return RULES.hqCaptureWeight;
  if (role === "artillery") return 0.6;
  return 1;
}

export function attackProfile(
  attacker: SymbolData,
  defender: SymbolData,
  units: SymbolData[]
): { attack: number; notes: string[] } {
  const ready = withSimDefaults(attacker);
  const target = withSimDefaults(defender);
  const role = combatRole(ready);
  const foe = combatRole(target);
  const dist = distanceKm(ready, target);
  const notes: string[] = [];
  let attack = ready.attack ?? 4;

  if (underCommand(ready, units)) {
    attack += RULES.hqAttackBonus;
    notes.push("C2");
  }
  if (isOutOfSupply(ready, units)) {
    attack = Math.max(1, attack - RULES.oosAttackPenalty);
    notes.push("OOS");
  }

  if (role === "armor" && foe === "infantry") {
    attack += 2;
    notes.push("overrun");
  }
  if (role === "infantry" && foe === "armor" && dist <= 2) {
    attack += 2;
    notes.push("AT");
  }
  if (role === "air-defence" && foe === "aviation") {
    attack += 4;
    notes.push("ADA");
  }
  if (role === "aviation" && foe === "air-defence") {
    attack -= 2;
    notes.push("SAM");
  }
  if (role === "aviation" && (foe === "armor" || foe === "artillery")) {
    attack += 2;
    notes.push("CAS");
  }
  if (role === "sof" && foe === "hq") {
    attack += 3;
    notes.push("raid");
  }
  if (role === "artillery" && reconSpots(ready, target, units)) {
    attack += RULES.reconArtilleryBonus;
    notes.push("spotted");
  }
  if (target.pieceKind === "fob" || target.pieceKind === "supply") {
    attack += 1;
    notes.push("depot");
  }

  const str = (ready.strength ?? 100) / 100;
  return { attack: Math.max(1, attack) * str, notes };
}

export function pickTarget(
  attacker: SymbolData,
  candidates: SymbolData[]
): { unit: SymbolData; distance: number } | null {
  const range = attacker.rangeKm ?? 3;
  const role = combatRole(attacker);
  const inRange = candidates
    .map((unit) => ({ unit, distance: distanceKm(attacker, unit) }))
    .filter((entry) => entry.distance <= range);
  if (inRange.length === 0) return null;

  const score = (entry: { unit: SymbolData; distance: number }) => {
    const foe = combatRole(entry.unit);
    let value = 10 - entry.distance;
    if (entry.unit.pieceKind === "fob") value += 4;
    if (entry.unit.pieceKind === "supply") value += 3;
    if (role === "air-defence" && foe === "aviation") value += 12;
    if (role === "aviation" && foe === "air-defence") value -= 6;
    if (role === "aviation" && (foe === "armor" || foe === "artillery")) {
      value += 6;
    }
    if (role === "sof" && foe === "hq") value += 10;
    if (role === "artillery" && (foe === "armor" || foe === "hq")) value += 5;
    if (role === "armor" && foe === "infantry") value += 3;
    return value;
  };

  return inRange.sort((a, b) => score(b) - score(a))[0] ?? null;
}

export function canReturnFire(
  defender: SymbolData,
  attacker: SymbolData,
  distance: number
): boolean {
  if (!isCombatUnit(defender) || !isCombatUnit(attacker)) return false;
  return (defender.rangeKm ?? 3) >= distance;
}
