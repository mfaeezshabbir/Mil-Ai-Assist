// SIDC Generation Logic
import type { SymbolData } from "@/types";
import { sidcEnumMapping } from "./sidc-mappings";

function normalize(str: string | undefined): string {
  if (!str) return "";
  return str.replace(/\s+/g, "_").toUpperCase();
}

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
