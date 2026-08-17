import type { RouteData, SymbolData, UnitOrder } from "@/types";
import { withSimDefaults } from "@/lib/sim/units";

const STORAGE_KEY = "milaiassist.sim.v1";

export type PlannerSnapshot = {
  symbols: SymbolData[];
  routes: RouteData[];
  turn: number;
};

function isOrder(value: unknown): value is UnitOrder {
  if (!value || typeof value !== "object") return false;
  const candidate = value as Partial<UnitOrder>;
  return (
    (candidate.type === "move" || candidate.type === "hold") &&
    typeof candidate.destLng === "number" &&
    typeof candidate.destLat === "number"
  );
}

function isSymbol(value: unknown): value is SymbolData {
  if (!value || typeof value !== "object") return false;
  const candidate = value as Partial<SymbolData>;
  return (
    typeof candidate.id === "string" &&
    typeof candidate.latitude === "number" &&
    typeof candidate.longitude === "number"
  );
}

function isRoute(value: unknown): value is RouteData {
  if (!value || typeof value !== "object") return false;
  const candidate = value as Partial<RouteData>;
  return (
    typeof candidate.id === "string" &&
    typeof candidate.start?.lat === "number" &&
    typeof candidate.start?.lng === "number" &&
    typeof candidate.end?.lat === "number" &&
    typeof candidate.end?.lng === "number"
  );
}

export function loadPlannerState(): PlannerSnapshot | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<PlannerSnapshot>;
    return {
      symbols: Array.isArray(parsed.symbols)
        ? parsed.symbols.filter(isSymbol).map((unit) => {
            const next = withSimDefaults(unit);
            return isOrder(unit.order) ? { ...next, order: unit.order } : next;
          })
        : [],
      routes: Array.isArray(parsed.routes) ? parsed.routes.filter(isRoute) : [],
      turn: typeof parsed.turn === "number" && parsed.turn >= 1 ? parsed.turn : 1,
    };
  } catch {
    return null;
  }
}

export function savePlannerState(snapshot: PlannerSnapshot): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(snapshot));
  } catch {
    // Ignore quota / private-mode failures.
  }
}
