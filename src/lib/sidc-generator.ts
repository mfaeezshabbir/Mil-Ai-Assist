import type { SymbolData } from "@/types";
import { createMilSymbol } from "./ms-symbol";
import {
  getSymbolSetData,
  getSymbolSetDisplayName,
  sidcEnumMapping,
} from "./sidc-mappings";

function normalize(str: string | undefined): string {
  if (!str) return "";
  return str
    .toString()
    .trim()
    .replace(/\W+/g, "_")
    .replace(/_+/g, "_")
    .replace(/^_+|_+$/g, "")
    .toUpperCase();
}

function titleFromKey(key: string): string {
  return key
    .toLowerCase()
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

function lookupCode(
  table: Record<string, string>,
  value: string | undefined,
  fallback: string
): string {
  if (value == null || value === "") return fallback;
  const raw = value.toString().trim();
  if (/^\d+$/.test(raw) && Object.values(table).includes(raw)) return raw;
  const key = normalize(raw);
  if (key in table) return table[key];
  for (const [entryKey, code] of Object.entries(table)) {
    if (titleFromKey(entryKey) === raw) return code;
    if (entryKey === raw) return code;
  }
  return fallback;
}

function padDigits(code: string | number | undefined, length: number): string {
  const digits = (code ?? "").toString().replace(/\D/g, "");
  if (!digits) return "0".repeat(length);
  if (digits.length >= length) return digits.slice(-length);
  return digits.padStart(length, "0");
}

function resolveCodedOption(
  items: { name: string; code: string }[] | undefined,
  value: string | undefined,
  length: number
): string {
  const raw = (value ?? "").toString().trim();
  if (!raw || /^unspecified$/i.test(raw) || raw === "-") {
    return "0".repeat(length);
  }
  if (/^\d+$/.test(raw)) return padDigits(raw, length);
  const found = items?.find(
    (item) =>
      item.code === raw || item.name.toLowerCase() === raw.toLowerCase()
  );
  return padDigits(found?.code, length);
}

export function compactSIDC(value: string): string {
  return value.replace(/\D/g, "").slice(0, 20);
}

export function generateSIDC(symbol: SymbolData): string {
  const setData = getSymbolSetData(symbol.symbolSet || "");
  const version = "10";
  const contextCode = lookupCode(sidcEnumMapping.context, symbol.context, "0");
  const identityCode = lookupCode(
    sidcEnumMapping.standardIdentity,
    symbol.symbolStandardIdentity,
    "3"
  );
  const symbolSetCode = lookupCode(
    sidcEnumMapping.symbolSet,
    symbol.symbolSet,
    "10"
  );
  const statusCode = lookupCode(sidcEnumMapping.status, symbol.status, "0");
  const hqtfdCode = lookupCode(sidcEnumMapping.hqtfd, symbol.hqtfd, "0");
  const echelonCode = lookupCode(
    sidcEnumMapping.echelonMobilityTowedArray,
    symbol.symbolEchelon,
    "00"
  );

  return (
    version +
    contextCode +
    identityCode +
    symbolSetCode +
    statusCode +
    hqtfdCode +
    padDigits(echelonCode, 2) +
    resolveCodedOption(setData.mainIcons, symbol.mainIconId, 6) +
    resolveCodedOption(setData.modifier1, symbol.modifier1, 2) +
    resolveCodedOption(setData.modifier2, symbol.modifier2, 2)
  );
}

export const SIDC_FIELDS = [
  { key: "VER", start: 0, end: 2 },
  { key: "CTX", start: 2, end: 3 },
  { key: "IDN", start: 3, end: 4 },
  { key: "SET", start: 4, end: 6 },
  { key: "STA", start: 6, end: 7 },
  { key: "HQ", start: 7, end: 8 },
  { key: "ECH", start: 8, end: 10 },
  { key: "ICON", start: 10, end: 16 },
  { key: "M1", start: 16, end: 18 },
  { key: "M2", start: 18, end: 20 },
] as const;

export function splitSIDC(sidc: string) {
  if (sidc.length !== 20) return [];
  return SIDC_FIELDS.map((field) => ({
    key: field.key,
    value: sidc.slice(field.start, field.end),
  }));
}

export function formatSIDC(sidc: string): string {
  const parts = splitSIDC(sidc);
  return parts.length ? parts.map((part) => part.value).join(" ") : sidc;
}

const CONTEXT_BY_CODE: Record<string, NonNullable<SymbolData["context"]>> = {
  "0": "Reality",
  "1": "Exercise",
  "2": "Simulation",
};

const IDENTITY_BY_CODE: Record<
  string,
  NonNullable<SymbolData["symbolStandardIdentity"]>
> = {
  "0": "Pending",
  "1": "Unknown",
  "2": "Assumed Friend",
  "3": "Friend",
  "4": "Neutral",
  "5": "Suspect",
  "6": "Hostile",
};

const STATUS_BY_CODE: Record<string, NonNullable<SymbolData["status"]>> = {
  "0": "Present",
  "1": "Planned",
  "2": "Fully Capable",
  "3": "Damaged",
  "4": "Destroyed",
  "5": "Full to Capacity",
};

const HQTFD_BY_CODE: Record<string, NonNullable<SymbolData["hqtfd"]>> = {
  "0": "Not Applicable",
  "1": "Feint Dummy",
  "2": "Headquarters",
  "3": "Feint Dummy Headquarters",
  "4": "Task Force",
  "5": "Feint Dummy Task Force",
  "6": "Task Force Headquarters",
  "7": "Feint Dummy Task Force Headquarters",
};

const ECHELON_BY_CODE: Record<string, NonNullable<SymbolData["symbolEchelon"]>> =
  {
    "11": "Team",
    "12": "Squad",
    "13": "Section",
    "14": "Platoon",
    "15": "Company",
    "16": "Battalion",
    "17": "Regiment",
    "18": "Brigade",
    "21": "Division",
    "22": "Corps",
    "23": "Army",
  };

export function applySIDC(symbol: SymbolData, raw: string): SymbolData {
  const sidc = compactSIDC(raw);
  if (sidc.length !== 20) return symbol;

  const echelonCode = sidc.slice(8, 10);

  return {
    ...symbol,
    displayType: "sidc",
    context: CONTEXT_BY_CODE[sidc.slice(2, 3)] ?? "Reality",
    symbolStandardIdentity:
      IDENTITY_BY_CODE[sidc.slice(3, 4)] ?? "Unknown",
    symbolSet: getSymbolSetDisplayName(sidc.slice(4, 6)),
    status: STATUS_BY_CODE[sidc.slice(6, 7)] ?? "Present",
    hqtfd: HQTFD_BY_CODE[sidc.slice(7, 8)] ?? "Not Applicable",
    symbolEchelon: ECHELON_BY_CODE[echelonCode],
    mainIconId: sidc.slice(10, 16),
    modifier1: sidc.slice(16, 18),
    modifier2: sidc.slice(18, 20),
  };
}

export function validateSIDC(sidc: string): boolean {
  const compact = compactSIDC(sidc);
  if (compact.length !== 20) return false;
  try {
    const symbol = createMilSymbol(compact, { size: 35 });
    const valid = symbol.isValid();
    return Boolean(symbol.validIcon) || valid === true;
  } catch {
    return false;
  }
}

export function buildAndValidateSIDC(symbol: SymbolData) {
  const sidc = generateSIDC(symbol);
  const valid = validateSIDC(sidc);
  const metadata = getSIDCMetadata(sidc);
  return { sidc, valid, metadata };
}

export function getSIDCMetadata(sidc: string) {
  try {
    const symbol = createMilSymbol(sidc, { size: 35 });
    return {
      affiliation: symbol.metadata?.affiliation || "Unknown",
      context: symbol.metadata?.context || "Unknown",
      dimension: symbol.metadata?.dimension || "Unknown",
      echelon: symbol.metadata?.echelon,
      headquarters: symbol.metadata?.headquarters || false,
      taskForce: symbol.metadata?.taskForce || false,
      activity: symbol.metadata?.activity || false,
      civilian: symbol.metadata?.civilian || false,
      condition: symbol.metadata?.condition || "",
      functionId: symbol.metadata?.functionid || "",
      valid: Boolean(symbol.validIcon),
    };
  } catch (error) {
    return { valid: false, error: (error as Error).message };
  }
}
