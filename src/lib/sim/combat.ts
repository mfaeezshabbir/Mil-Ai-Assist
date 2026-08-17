import type { SymbolData } from "@/types";
import {
  areEnemies,
  attackProfile,
  combatRole,
  pickTarget,
} from "./rules";
import { isCombatUnit, unitLabel, withSimDefaults } from "./units";

export type CombatLogEntry = string;

function clampStrength(value: number): number {
  return Math.max(0, Math.min(100, Math.round(value)));
}

function shotDamage(attacker: SymbolData, defender: SymbolData, units: SymbolData[]): {
  damage: number;
  notes: string[];
} {
  const profile = attackProfile(attacker, defender, units);
  const def = withSimDefaults(defender).defense ?? 3;
  const raw = profile.attack * 5.2 - def * 0.85;
  return {
    damage: Math.max(4, Math.round(raw)),
    notes: profile.notes,
  };
}

function fireTargets(units: SymbolData[], attacker: SymbolData): SymbolData[] {
  return units.filter((unit) => {
    if (unit.id === attacker.id) return false;
    if (isCombatUnit(unit) && areEnemies(attacker, unit)) return true;
    if (
      (unit.pieceKind === "fob" || unit.pieceKind === "supply") &&
      areEnemies(attacker, unit)
    ) {
      return true;
    }
    return false;
  });
}

export function resolveCombat(
  units: SymbolData[],
  movedIds: Set<string> = new Set()
): {
  units: SymbolData[];
  log: CombatLogEntry[];
} {
  const next = units.map(withSimDefaults);
  const log: CombatLogEntry[] = [];
  const incoming = new Map<string, number>();

  const fire = (attacker: SymbolData, defender: SymbolData) => {
    const { damage, notes } = shotDamage(attacker, defender, next);
    incoming.set(defender.id, (incoming.get(defender.id) ?? 0) + damage);
    const tag = notes.length ? ` [${notes.join("+")}]` : "";
    log.push(
      `${unitLabel(attacker)} fires on ${unitLabel(defender)} for ${damage}${tag}`
    );
  };

  for (const attacker of next.filter(isCombatUnit)) {
    if (combatRole(attacker) === "artillery" && movedIds.has(attacker.id)) {
      log.push(`${unitLabel(attacker)} moved — no fire this turn`);
      continue;
    }
    const target = pickTarget(attacker, fireTargets(next, attacker));
    if (!target) continue;
    fire(attacker, target.unit);
  }

  const surviving = next
    .map((unit) => {
      const hit = incoming.get(unit.id);
      if (!hit) return unit;
      const strength = clampStrength((unit.strength ?? 100) - hit);
      const status =
        strength <= 0
          ? "Destroyed"
          : strength < 45
            ? "Damaged"
            : unit.status;
      return { ...unit, strength, status };
    })
    .filter((unit) => {
      const destroyable =
        isCombatUnit(unit) ||
        unit.pieceKind === "fob" ||
        unit.pieceKind === "supply";
      if (!destroyable) return true;
      if ((unit.strength ?? 0) > 0) return true;
      log.push(`${unitLabel(unit)} destroyed`);
      return false;
    });

  return { units: surviving, log };
}
