import type { SymbolData } from "@/types";
import {
  applyMinefields,
  applySupply,
  captureObjectives,
  engineersClearHazards,
} from "./board";
import { resolveCombat, type CombatLogEntry } from "./combat";
import { haversineKm, stepUnitTowardOrder } from "./movement";
import { RULES, movementFactor } from "./rules";
import {
  countForces,
  countObjectives,
  isCombatUnit,
  isFriendly,
  isHostile,
} from "./units";

export type VictoryReason = "annihilation" | "objectives" | null;

export type TurnResult = {
  units: SymbolData[];
  log: CombatLogEntry[];
  victor: "friend" | "hostile" | null;
  reason: VictoryReason;
};

function movedIds(
  before: SymbolData[],
  after: SymbolData[]
): Set<string> {
  const prior = new Map(before.map((unit) => [unit.id, unit]));
  const ids = new Set<string>();
  for (const unit of after) {
    const prev = prior.get(unit.id);
    if (!prev) continue;
    const dist = haversineKm(
      prev.latitude,
      prev.longitude,
      unit.latitude,
      unit.longitude
    );
    if (dist > 0.08) ids.add(unit.id);
  }
  return ids;
}

function judgeVictory(
  started: SymbolData[],
  ended: SymbolData[]
): { victor: TurnResult["victor"]; reason: VictoryReason } {
  const startForces = countForces(started);
  const endForces = countForces(ended);
  const objectives = countObjectives(ended);
  const objs = ended.filter((unit) => unit.pieceKind === "objective");

  if (
    startForces.friend > 0 &&
    startForces.hostile > 0 &&
    endForces.friend === 0 &&
    endForces.hostile > 0
  ) {
    return { victor: "hostile", reason: "annihilation" };
  }
  if (
    startForces.friend > 0 &&
    startForces.hostile > 0 &&
    endForces.hostile === 0 &&
    endForces.friend > 0
  ) {
    return { victor: "friend", reason: "annihilation" };
  }

  if (objectives.total > 0) {
    const held = (side: "Friend" | "Hostile") =>
      objs.length > 0 &&
      objs.every(
        (obj) =>
          obj.controlledBy === side &&
          (obj.controlStreak ?? 0) >= RULES.holdTurnsToWin
      );
    if (held("Friend")) return { victor: "friend", reason: "objectives" };
    if (held("Hostile")) return { victor: "hostile", reason: "objectives" };
  }

  return { victor: null, reason: null };
}

export function resolveTurn(units: SymbolData[]): TurnResult {
  const started = units;
  const moved = units.map((unit) =>
    isCombatUnit(unit)
      ? stepUnitTowardOrder(unit, movementFactor(unit, units))
      : unit
  );
  const displaced = movedIds(started, moved);

  const mined = applyMinefields(moved);
  const fought = resolveCombat(mined.units, displaced);
  const cleared = engineersClearHazards(fought.units);
  const supplied = applySupply(cleared.units);
  const held = captureObjectives(supplied.units);
  const verdict = judgeVictory(started, held.units);

  const log = [
    ...mined.log,
    ...fought.log,
    ...cleared.log,
    ...supplied.log,
    ...held.log,
  ];
  if (verdict.victor && verdict.reason === "objectives") {
    log.push(
      `${verdict.victor === "friend" ? "Friendly" : "Hostile"} force holds all objectives`
    );
  }
  if (verdict.victor && verdict.reason === "annihilation") {
    log.push(
      `${verdict.victor === "friend" ? "Hostile" : "Friendly"} combat force eliminated`
    );
  }

  return {
    units: held.units,
    log,
    victor: verdict.victor,
    reason: verdict.reason,
  };
}
