import type { ForceSide, PieceKind, SymbolData } from "@/types";

export type CatalogId =
  | "infantry"
  | "armor"
  | "artillery"
  | "recon"
  | "aviation"
  | "air-defence"
  | "engineer"
  | "hq"
  | "sof"
  | "objective"
  | "fob"
  | "supply"
  | "minefield"
  | "obstacle";

export type CatalogEntry = {
  id: CatalogId;
  name: string;
  group: "combat" | "board";
  pieceKind: PieceKind;
  symbolSet: string;
  mainIconId: string;
  echelon?: SymbolData["symbolEchelon"];
  attack: number;
  defense: number;
  speedKmPerTurn: number;
  rangeKm: number;
};

export const BOARD = {
  captureKm: 2.5,
  mineKm: 1.5,
  supplyKm: 2.2,
  obstacleKm: 1.6,
  engineerClearKm: 2.2,
  supplyHeal: 10,
  mineDamage: 16,
} as const;

export const CATALOG: CatalogEntry[] = [
  {
    id: "infantry",
    name: "Infantry",
    group: "combat",
    pieceKind: "combat",
    symbolSet: "Land Unit",
    mainIconId: "121100",
    echelon: "Company",
    attack: 4,
    defense: 4,
    speedKmPerTurn: 12,
    rangeKm: 3,
  },
  {
    id: "armor",
    name: "Armor",
    group: "combat",
    pieceKind: "combat",
    symbolSet: "Land Unit",
    mainIconId: "120500",
    echelon: "Company",
    attack: 8,
    defense: 6,
    speedKmPerTurn: 22,
    rangeKm: 4,
  },
  {
    id: "artillery",
    name: "Artillery",
    group: "combat",
    pieceKind: "combat",
    symbolSet: "Land Unit",
    mainIconId: "130300",
    echelon: "Company",
    attack: 7,
    defense: 2,
    speedKmPerTurn: 10,
    rangeKm: 14,
  },
  {
    id: "recon",
    name: "Recon",
    group: "combat",
    pieceKind: "combat",
    symbolSet: "Land Unit",
    mainIconId: "121300",
    echelon: "Company",
    attack: 2,
    defense: 2,
    speedKmPerTurn: 24,
    rangeKm: 3,
  },
  {
    id: "aviation",
    name: "Attack helo",
    group: "combat",
    pieceKind: "combat",
    symbolSet: "Land Unit",
    mainIconId: "120600",
    echelon: "Company",
    attack: 6,
    defense: 3,
    speedKmPerTurn: 40,
    rangeKm: 6,
  },
  {
    id: "air-defence",
    name: "Air defence",
    group: "combat",
    pieceKind: "combat",
    symbolSet: "Land Unit",
    mainIconId: "130100",
    echelon: "Company",
    attack: 5,
    defense: 4,
    speedKmPerTurn: 12,
    rangeKm: 8,
  },
  {
    id: "engineer",
    name: "Engineer",
    group: "combat",
    pieceKind: "combat",
    symbolSet: "Land Unit",
    mainIconId: "140700",
    echelon: "Company",
    attack: 3,
    defense: 4,
    speedKmPerTurn: 12,
    rangeKm: 2,
  },
  {
    id: "hq",
    name: "HQ",
    group: "combat",
    pieceKind: "combat",
    symbolSet: "Land Unit",
    mainIconId: "110000",
    echelon: "Battalion",
    attack: 1,
    defense: 3,
    speedKmPerTurn: 10,
    rangeKm: 2,
  },
  {
    id: "sof",
    name: "SOF",
    group: "combat",
    pieceKind: "combat",
    symbolSet: "Land Unit",
    mainIconId: "121700",
    echelon: "Team",
    attack: 5,
    defense: 3,
    speedKmPerTurn: 18,
    rangeKm: 3,
  },
  {
    id: "objective",
    name: "Objective",
    group: "board",
    pieceKind: "objective",
    symbolSet: "Land Installation",
    mainIconId: "110000",
    attack: 0,
    defense: 0,
    speedKmPerTurn: 0,
    rangeKm: BOARD.captureKm,
  },
  {
    id: "fob",
    name: "FOB",
    group: "board",
    pieceKind: "fob",
    symbolSet: "Land Installation",
    mainIconId: "110000",
    attack: 0,
    defense: 2,
    speedKmPerTurn: 0,
    rangeKm: 2,
  },
  {
    id: "supply",
    name: "Supply dump",
    group: "board",
    pieceKind: "supply",
    symbolSet: "Land Unit",
    mainIconId: "160200",
    attack: 0,
    defense: 1,
    speedKmPerTurn: 0,
    rangeKm: BOARD.supplyKm,
  },
  {
    id: "minefield",
    name: "Minefield",
    group: "board",
    pieceKind: "minefield",
    symbolSet: "Land Unit",
    mainIconId: "141300",
    attack: 0,
    defense: 0,
    speedKmPerTurn: 0,
    rangeKm: BOARD.mineKm,
  },
  {
    id: "obstacle",
    name: "Obstacle",
    group: "board",
    pieceKind: "obstacle",
    symbolSet: "Land Unit",
    mainIconId: "140700",
    attack: 0,
    defense: 0,
    speedKmPerTurn: 0,
    rangeKm: BOARD.obstacleKm,
  },
];

export function getCatalog(id?: string): CatalogEntry | undefined {
  if (!id) return undefined;
  return CATALOG.find((entry) => entry.id === id);
}

export function createPiece(
  catalogId: CatalogId,
  coords: { lat: number; lng: number },
  identity: ForceSide,
  label?: string
): SymbolData {
  const entry = getCatalog(catalogId);
  if (!entry) {
    throw new Error(`Unknown catalog piece: ${catalogId}`);
  }

  const side =
    entry.group === "board" && entry.pieceKind === "objective"
      ? "Neutral"
      : entry.group === "board"
        ? identity === "Hostile"
          ? "Hostile"
          : identity === "Friend"
            ? "Friend"
            : "Neutral"
        : identity;

  return {
    id: `sym-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    displayType: "sidc",
    aiLabel: label || entry.name,
    context: "Reality",
    symbolStandardIdentity: side,
    status: "Present",
    hqtfd: entry.id === "hq" ? "Headquarters" : "Not Applicable",
    symbolSet: entry.symbolSet,
    mainIconId: entry.mainIconId,
    modifier1: "00",
    modifier2: "00",
    symbolEchelon: entry.echelon,
    latitude: coords.lat,
    longitude: coords.lng,
    strength: entry.group === "combat" ? 100 : 100,
    speedKmPerTurn: entry.speedKmPerTurn,
    attack: entry.attack,
    defense: entry.defense,
    rangeKm: entry.rangeKm,
    pieceKind: entry.pieceKind,
    catalogId: entry.id,
    controlledBy: entry.pieceKind === "objective" ? "Neutral" : side,
    controlStreak: entry.pieceKind === "objective" ? 0 : undefined,
  };
}
