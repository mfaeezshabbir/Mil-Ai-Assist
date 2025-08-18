// SIDC Generation Logic with enhanced milsymbol integration
import type { SymbolData } from "@/types";
import { sidcEnumMapping } from "./sidc-mappings";
import MS from "milsymbol";

function normalize(str: string | undefined): string {
  if (!str) return "";
  // Trim, replace non-word characters with underscores, collapse multiple underscores,
  // strip edge underscores and uppercase to match mapping keys (e.g. "Land Unit" -> "LAND_UNIT").
  return str
    .toString()
    .trim()
    .replace(/\W+/g, "_")
    .replace(/_+/g, "_")
    .replace(/^_+|_+$/g, "")
    .toUpperCase();
}

function padCode(
  code: string | number | undefined,
  length: number,
  padChar = "0"
) {
  const s = (code ?? "").toString();
  if (!s) return padChar.repeat(length);
  // If code already longer than required, slice right-most characters (function IDs should keep leftmost but keep safe)
  if (s.length >= length) return s.slice(0, length);
  return s.padStart(length, padChar);
}

/**
 * Enhanced SIDC generation with validation using milsymbol library
 */
export function generateSIDC(symbol: SymbolData): string {
  const version = "10"; // APP-6D

  const contextKey = normalize(
    symbol.context
  ) as keyof typeof sidcEnumMapping.context;
  const contextCode = sidcEnumMapping.context[contextKey] || "0";

  const identityKey = normalize(
    symbol.symbolStandardIdentity
  ) as keyof typeof sidcEnumMapping.standardIdentity;
  const standardIdentityCode =
    sidcEnumMapping.standardIdentity[identityKey] || "1";

  const symbolSetKey = normalize(
    symbol.symbolSet
  ) as keyof typeof sidcEnumMapping.symbolSet;
  const symbolSetCode = sidcEnumMapping.symbolSet[symbolSetKey] || "10"; // Default to Land Unit

  const statusKey = normalize(
    symbol.status
  ) as keyof typeof sidcEnumMapping.status;
  const statusCode = sidcEnumMapping.status[statusKey] || "0";

  const hqtfdKey = normalize(
    symbol.hqtfd
  ) as keyof typeof sidcEnumMapping.hqtfd;
  const hqtfdCode = sidcEnumMapping.hqtfd[hqtfdKey] || "0";

  const echelonKey = symbol.symbolEchelon
    ? (normalize(
        symbol.symbolEchelon
      ) as keyof typeof sidcEnumMapping.echelonMobilityTowedArray)
    : null;
  const echelonCode = echelonKey
    ? sidcEnumMapping.echelonMobilityTowedArray[echelonKey] || "00"
    : "00";

  // Ensure codes have exact expected widths
  const functionIdCode = padCode(symbol.mainIconId || "000000", 6);
  const modifier1Code = padCode(symbol.modifier1 || "00", 2);
  const modifier2Code = padCode(symbol.modifier2 || "00", 2);

  const sidc =
    version +
    contextCode +
    standardIdentityCode +
    symbolSetCode +
    statusCode +
    hqtfdCode +
    echelonCode +
    functionIdCode +
    modifier1Code +
    modifier2Code;

  // Final safety: ensure SIDC is exactly 20 characters
  const final = padCode(sidc, 20, "0");
  return final;
}

/**
 * Validate a SIDC using milsymbol library
 */
export function validateSIDC(sidc: string): boolean {
  try {
    const symbol = new MS.Symbol(sidc, { size: 35 }) as any;
    return symbol.validIcon || false;
  } catch {
    return false;
  }
}

/**
 * Convenience: build a SIDC from SymbolData, validate it and return metadata.
 * Useful for the code path that needs to add a symbol to the map in one step.
 */
export function buildAndValidateSIDC(symbol: SymbolData) {
  const sidc = generateSIDC(symbol);
  const valid = validateSIDC(sidc);
  const metadata = getSIDCMetadata(sidc);
  return { sidc, valid, metadata };
}

/**
 * Get human-readable metadata for a SIDC using milsymbol
 */
export function getSIDCMetadata(sidc: string) {
  try {
    const symbol = new MS.Symbol(sidc, { size: 35 }) as any;
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
      valid: symbol.validIcon || false,
    };
  } catch (error) {
    return { valid: false, error: (error as Error).message };
  }
}
