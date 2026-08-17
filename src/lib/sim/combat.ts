import type { SymbolData } from "@/types";
import { haversineKm } from "./movement";
import { isFriendly, isHostile, unitLabel, withSimDefaults } from "./units";

export const ENGAGEMENT_RANGE_KM = 3;

export type CombatLogEntry = string;

function clampStrength(value: number): number {
  return Math.max(0, Math.min(100, Math.round(value)));
}

export function resolveCombat(units: SymbolData[]): {
  units: SymbolData[];
  log: CombatLogEntry[];
} {
  const next = units.map(withSimDefaults);
  const friends = next.filter((unit) =>
    isFriendly(unit.symbolStandardIdentity)
  );
  const hostiles = next.filter((unit) =>
    isHostile(unit.symbolStandardIdentity)
  );
  const usedHostile = new Set<string>();
  const log: CombatLogEntry[] = [];
  const strengthById = new Map(next.map((unit) => [unit.id, unit.strength ?? 100]));

  for (const friend of friends) {
    let best: { unit: SymbolData; distance: number } | null = null;
    for (const hostile of hostiles) {
      if (usedHostile.has(hostile.id)) continue;
      const distance = haversineKm(
        friend.latitude,
        friend.longitude,
        hostile.latitude,
        hostile.longitude
      );
      if (distance > ENGAGEMENT_RANGE_KM) continue;
      if (!best || distance < best.distance) {
        best = { unit: hostile, distance };
      }
    }
    if (!best) continue;

    usedHostile.add(best.unit.id);
    const friendStr = strengthById.get(friend.id) ?? 100;
    const hostileStr = strengthById.get(best.unit.id) ?? 100;
    const friendHit = 10 + friendStr * 0.25;
    const hostileHit = 10 + hostileStr * 0.25;
    const friendAfter = clampStrength(friendStr - hostileHit);
    const hostileAfter = clampStrength(hostileStr - friendHit);
    strengthById.set(friend.id, friendAfter);
    strengthById.set(best.unit.id, hostileAfter);

    log.push(
      `${unitLabel(friend)} (${friendAfter}) engaged ${unitLabel(best.unit)} (${hostileAfter}) at ${best.distance.toFixed(1)} km`
    );
  }

  const surviving = next
    .map((unit) => ({
      ...unit,
      strength: strengthById.get(unit.id) ?? unit.strength ?? 100,
    }))
    .filter((unit) => {
      const fights =
        isFriendly(unit.symbolStandardIdentity) ||
        isHostile(unit.symbolStandardIdentity);
      if (!fights) return true;
      if ((unit.strength ?? 0) > 0) return true;
      log.push(`${unitLabel(unit)} destroyed`);
      return false;
    });

  return { units: surviving, log };
}
