import type { SymbolData } from "@/types";
import { getFunctionIdName } from "@/lib/sidc-mappings";

export type TrackIdentity = "friend" | "hostile" | "neutral" | "unknown";
export type TrackFrame = "rect" | "diamond" | "square" | "circle";
export type TrackClass =
  | "infantry"
  | "armor"
  | "artillery"
  | "recon"
  | "aviation"
  | "air"
  | "air-defence"
  | "engineer"
  | "signal"
  | "hq"
  | "sof"
  | "naval"
  | "subsurface"
  | "missile"
  | "cbrn"
  | "medical"
  | "logistics"
  | "installation"
  | "objective"
  | "fob"
  | "supply"
  | "minefield"
  | "obstacle"
  | "unknown";

export const TRACK_COLORS: Record<
  TrackIdentity,
  { stroke: string; fill: string; glow: string }
> = {
  friend: {
    stroke: "#0FD0E6",
    fill: "rgba(15, 208, 230, 0.16)",
    glow: "rgba(15, 208, 230, 0.45)",
  },
  hostile: {
    stroke: "#E23D3D",
    fill: "rgba(226, 61, 61, 0.18)",
    glow: "rgba(226, 61, 61, 0.45)",
  },
  neutral: {
    stroke: "#7CDB6A",
    fill: "rgba(124, 219, 106, 0.14)",
    glow: "rgba(124, 219, 106, 0.4)",
  },
  unknown: {
    stroke: "#F59E2A",
    fill: "rgba(245, 158, 42, 0.16)",
    glow: "rgba(245, 158, 42, 0.45)",
  },
};

export function trackIdentity(identity?: string): TrackIdentity {
  if (identity === "Friend" || identity === "Assumed Friend") return "friend";
  if (identity === "Hostile" || identity === "Suspect") return "hostile";
  if (identity === "Neutral") return "neutral";
  return "unknown";
}

export function pieceIdentity(symbol: SymbolData): TrackIdentity {
  if (symbol.pieceKind === "objective") {
    return trackIdentity(symbol.controlledBy ?? symbol.symbolStandardIdentity);
  }
  if (symbol.pieceKind === "minefield" || symbol.pieceKind === "obstacle") {
    return "unknown";
  }
  return trackIdentity(symbol.symbolStandardIdentity);
}

export function trackFrame(identity: TrackIdentity): TrackFrame {
  if (identity === "friend") return "rect";
  if (identity === "hostile") return "diamond";
  if (identity === "neutral") return "square";
  return "circle";
}

export function trackClass(symbol: SymbolData): TrackClass {
  if (symbol.pieceKind === "objective") return "objective";
  if (symbol.pieceKind === "fob") return "fob";
  if (symbol.pieceKind === "supply") return "supply";
  if (symbol.pieceKind === "minefield") return "minefield";
  if (symbol.pieceKind === "obstacle") return "obstacle";

  const set = (symbol.symbolSet || "").toLowerCase();
  const id = symbol.mainIconId || "";
  const named = `${getFunctionIdName(symbol.symbolSet, id)} ${set}`.toLowerCase();

  if (set.includes("subsurface")) return "subsurface";
  if (set.includes("sea")) return "naval";
  if (set.includes("installation")) return "installation";
  if (set.includes("air missile") || set.includes("space missile")) {
    return "missile";
  }
  if (set === "air" || set.startsWith("air ")) return "air";
  if (set.includes("space")) return "missile";

  if (id.startsWith("1211") || named.includes("infantry")) return "infantry";
  if (id.startsWith("1205") || named.includes("armour") || named.includes("armor")) {
    return "armor";
  }
  if (
    id.startsWith("1303") ||
    id.startsWith("1308") ||
    id.startsWith("1307") ||
    named.includes("artillery") ||
    named.includes("mortar")
  ) {
    return "artillery";
  }
  if (
    id.startsWith("1213") ||
    id.startsWith("1216") ||
    id.startsWith("1212") ||
    named.includes("recon") ||
    named.includes("surveillance")
  ) {
    return "recon";
  }
  if (
    id.startsWith("1206") ||
    id.startsWith("1207") ||
    id.startsWith("1208") ||
    named.includes("aviation") ||
    named.includes("rotary") ||
    named.includes("fixed wing")
  ) {
    return "aviation";
  }
  if (id.startsWith("1301") || named.includes("air defence") || named.includes("air defense")) {
    return "air-defence";
  }
  if (id.startsWith("1407") || named.includes("engineer")) return "engineer";
  if (
    id.startsWith("1110") ||
    id.startsWith("1107") ||
    id.startsWith("1108") ||
    named.includes("signal") ||
    named.includes("radio")
  ) {
    return "signal";
  }
  if (
    id.startsWith("1217") ||
    id.startsWith("1218") ||
    id.startsWith("1220") ||
    named.includes("special") ||
    named.includes("ranger")
  ) {
    return "sof";
  }
  if (id.startsWith("1401") || named.includes("cbrn")) return "cbrn";
  if (id.startsWith("1613") || id.startsWith("1614") || named.includes("medical")) {
    return "medical";
  }
  if (id.startsWith("16") || named.includes("sustainment") || named.includes("supply")) {
    return "logistics";
  }
  if (
    id === "110000" ||
    named.includes("command and control") ||
    (symbol.hqtfd || "").toLowerCase().includes("headquarters")
  ) {
    return "hq";
  }

  return "unknown";
}

export function trackClassLabel(kind: TrackClass): string {
  const labels: Record<TrackClass, string> = {
    infantry: "Infantry",
    armor: "Armor",
    artillery: "Artillery",
    recon: "Recon",
    aviation: "Aviation",
    air: "Air",
    "air-defence": "Air defence",
    engineer: "Engineer",
    signal: "Signal",
    hq: "HQ",
    sof: "SOF",
    naval: "Naval",
    subsurface: "Subsurface",
    missile: "Missile",
    cbrn: "CBRN",
    medical: "Medical",
    logistics: "Logistics",
    installation: "Site",
    objective: "Objective",
    fob: "FOB",
    supply: "Supply",
    minefield: "Minefield",
    obstacle: "Obstacle",
    unknown: "Track",
  };
  return labels[kind];
}

export function echelonTicks(echelon?: string): number {
  const table: Record<string, number> = {
    Team: 1,
    Squad: 1,
    Section: 2,
    Platoon: 2,
    Company: 3,
    Battalion: 3,
    Regiment: 4,
    Brigade: 4,
    Division: 5,
    Corps: 5,
    Army: 6,
  };
  return table[echelon ?? ""] ?? 0;
}
