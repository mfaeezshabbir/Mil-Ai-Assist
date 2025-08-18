// SIDC Generation Logic with enhanced milsymbol integration
import type { SymbolData } from "@/types";
import { sidcEnumMapping } from "./sidc-mappings";
import MS from "milsymbol";

function normalize(str: string | undefined): string {
  if (!str) return "";
  return str.replace(/\s+/g, "_").toUpperCase();
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

  const functionIdCode = symbol.mainIconId || "000000";
  const modifier1Code = symbol.modifier1 || "00";
  const modifier2Code = symbol.modifier2 || "00";

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

  return sidc;
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
 * Get human-readable metadata for a SIDC using milsymbol
 */
export function getSIDCMetadata(sidc: string) {
  try {
    const symbol = new MS.Symbol(sidc, { size: 35 }) as any;
    return {
      affiliation: symbol.metadata?.affiliation || 'Unknown',
      context: symbol.metadata?.context || 'Unknown',
      dimension: symbol.metadata?.dimension || 'Unknown',
      echelon: symbol.metadata?.echelon,
      headquarters: symbol.metadata?.headquarters || false,
      taskForce: symbol.metadata?.taskForce || false,
      activity: symbol.metadata?.activity || false,
      civilian: symbol.metadata?.civilian || false,
      condition: symbol.metadata?.condition || '',
      valid: symbol.validIcon || false,
    };
  } catch (error) {
    return { valid: false, error: (error as Error).message };
  }
}
