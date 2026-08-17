import type { RouteData, SymbolData } from "@/types";

const STORAGE_KEY = "milaiassist.planner";

export type PlannerSnapshot = {
  symbols: SymbolData[];
  routes: RouteData[];
};

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
        ? parsed.symbols.filter(isSymbol)
        : [],
      routes: Array.isArray(parsed.routes) ? parsed.routes.filter(isRoute) : [],
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
