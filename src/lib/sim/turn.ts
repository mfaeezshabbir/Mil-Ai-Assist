import type { SymbolData } from "@/types";
import { resolveCombat, type CombatLogEntry } from "./combat";
import { stepUnitTowardOrder } from "./movement";
import { countForces, isFriendly, isHostile } from "./units";

export type TurnResult = {
  units: SymbolData[];
  log: CombatLogEntry[];
  victor: "friend" | "hostile" | null;
};

export function resolveTurn(units: SymbolData[]): TurnResult {
  const moved = units.map(stepUnitTowardOrder);
  const fought = resolveCombat(moved);
  const forces = countForces(fought.units);
  const hadFriends = units.some((unit) =>
    isFriendly(unit.symbolStandardIdentity)
  );
  const hadHostiles = units.some((unit) =>
    isHostile(unit.symbolStandardIdentity)
  );

  let victor: TurnResult["victor"] = null;
  if (hadFriends && hadHostiles) {
    if (forces.friend === 0 && forces.hostile > 0) victor = "hostile";
    if (forces.hostile === 0 && forces.friend > 0) victor = "friend";
  }

  return {
    units: fought.units,
    log: fought.log,
    victor,
  };
}
