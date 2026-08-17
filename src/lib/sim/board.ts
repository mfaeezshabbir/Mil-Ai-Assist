import type { ForceSide, SymbolData } from "@/types";
import { BOARD } from "./catalog";
import {
  RULES,
  captureWeight,
  combatRole,
  distanceKm,
  inContact,
  isAviationRole,
  mineDamageFor,
  sameSide,
} from "./rules";
import { isCombatUnit, isFriendly, isHostile, unitLabel, withSimDefaults } from "./units";

function clampStrength(value: number): number {
  return Math.max(0, Math.min(100, Math.round(value)));
}

export function applyMinefields(units: SymbolData[]): {
  units: SymbolData[];
  log: string[];
} {
  const next = units.map(withSimDefaults);
  const mines = next.filter((unit) => unit.pieceKind === "minefield");
  const log: string[] = [];
  const surviving = next
    .map((unit) => {
      if (!isCombatUnit(unit)) return unit;
      if (isAviationRole(combatRole(unit))) return unit;
      let strength = unit.strength ?? 100;
      for (const mine of mines) {
        if (distanceKm(unit, mine) > BOARD.mineKm) continue;
        const hit = mineDamageFor(unit);
        if (hit <= 0) continue;
        strength = clampStrength(strength - hit);
        log.push(`${unitLabel(unit)} hits mines (−${hit}, STR ${strength})`);
      }
      return { ...unit, strength };
    })
    .filter((unit) => {
      if (!isCombatUnit(unit)) return true;
      if ((unit.strength ?? 0) > 0) return true;
      log.push(`${unitLabel(unit)} destroyed by mines`);
      return false;
    });

  return { units: surviving, log };
}

export function applySupply(units: SymbolData[]): {
  units: SymbolData[];
  log: string[];
} {
  const next = units.map(withSimDefaults);
  const sources = next.filter(
    (unit) => unit.pieceKind === "supply" || unit.pieceKind === "fob"
  );
  const log: string[] = [];

  const healed = next.map((unit) => {
    if (!isCombatUnit(unit)) return unit;
    if (inContact(unit, next)) return unit;
    const match = sources.find(
      (source) =>
        sameSide(unit, source) && distanceKm(unit, source) <= BOARD.supplyKm
    );
    if (!match) return unit;
    const before = unit.strength ?? 100;
    const heal = match.pieceKind === "fob" ? RULES.fobHeal : RULES.dumpHeal;
    const strength = clampStrength(before + heal);
    if (strength > before) {
      log.push(
        `${unitLabel(unit)} resupplies at ${unitLabel(match)} (${before}→${strength})`
      );
    }
    return { ...unit, strength, status: strength >= 70 ? "Present" : unit.status };
  });

  return { units: healed, log };
}

export function engineersClearHazards(units: SymbolData[]): {
  units: SymbolData[];
  log: string[];
} {
  const next = units.map(withSimDefaults);
  const engineers = next.filter(
    (unit) => isCombatUnit(unit) && combatRole(unit) === "engineer"
  );
  const log: string[] = [];
  const removed = new Set<string>();

  for (const engineer of engineers) {
    const hazards = next
      .filter(
        (hazard) =>
          (hazard.pieceKind === "minefield" || hazard.pieceKind === "obstacle") &&
          !removed.has(hazard.id) &&
          distanceKm(engineer, hazard) <= BOARD.engineerClearKm
      )
      .sort((a, b) => distanceKm(engineer, a) - distanceKm(engineer, b));
    const target = hazards[0];
    if (!target) continue;
    removed.add(target.id);
    log.push(`${unitLabel(engineer)} clears ${unitLabel(target)}`);
  }

  return {
    units: next.filter((unit) => !removed.has(unit.id)),
    log,
  };
}

export function captureObjectives(units: SymbolData[]): {
  units: SymbolData[];
  log: string[];
} {
  const next = units.map(withSimDefaults);
  const fighters = next.filter(isCombatUnit);
  const log: string[] = [];

  const captured = next.map((unit) => {
    if (unit.pieceKind !== "objective") return unit;

    let friendWeight = 0;
    let hostileWeight = 0;
    for (const fighter of fighters) {
      if (distanceKm(unit, fighter) > BOARD.captureKm) continue;
      const weight = captureWeight(fighter);
      if (isFriendly(fighter.symbolStandardIdentity)) friendWeight += weight;
      if (isHostile(fighter.symbolStandardIdentity)) hostileWeight += weight;
    }

    const previous = unit.controlledBy ?? "Neutral";
    let controlledBy: ForceSide = previous;
    let contested = false;
    if (friendWeight > 0 && hostileWeight === 0) controlledBy = "Friend";
    else if (hostileWeight > 0 && friendWeight === 0) controlledBy = "Hostile";
    else if (friendWeight > 0 && hostileWeight > 0) contested = true;

    let controlStreak = unit.controlStreak ?? 0;
    if (contested) {
      controlStreak = 0;
      log.push(`${unitLabel(unit)} contested`);
    } else if (controlledBy === "Neutral") {
      controlStreak = 0;
    } else if (controlledBy === previous) {
      controlStreak += 1;
    } else {
      controlStreak = 1;
      log.push(`${unitLabel(unit)} captured by ${controlledBy}`);
    }

    return {
      ...unit,
      controlledBy: contested ? previous : controlledBy,
      controlStreak,
      symbolStandardIdentity: contested
        ? previous === "Neutral"
          ? "Neutral"
          : previous
        : controlledBy,
    };
  });

  return { units: captured, log };
}
