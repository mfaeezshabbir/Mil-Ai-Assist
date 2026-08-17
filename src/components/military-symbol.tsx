"use client";

import type { SymbolData } from "@/types";
import { TrackSymbol } from "@/components/track-symbol";
import { generateSIDC } from "@/lib/sidc-generator";
import { getFunctionIdName } from "@/lib/sidc-mappings";
import { trackClass, trackClassLabel } from "@/lib/sim/track-style";

type MilitarySymbolProps = {
  symbol: SymbolData;
  size?: number;
  selected?: boolean;
};

export function MilitarySymbol({
  symbol,
  size = 35,
  selected = false,
}: MilitarySymbolProps) {
  if (!symbol) return null;

  const sidc = (() => {
    try {
      return generateSIDC(symbol);
    } catch {
      return "";
    }
  })();
  const kind = trackClass(symbol);
  const title = [
    symbol.aiLabel,
    trackClassLabel(kind),
    getFunctionIdName(symbol.symbolSet, symbol.mainIconId),
    symbol.symbolStandardIdentity,
    symbol.symbolEchelon,
    `SIDC ${sidc}`,
  ]
    .filter(Boolean)
    .join(" · ");

  return (
    <div
      title={title}
      aria-label={title}
      className="military-symbol-container military-symbol-preview flex items-center justify-center"
      style={{ width: size, height: size, flexShrink: 0 }}
    >
      <TrackSymbol symbol={symbol} size={size} selected={selected} />
    </div>
  );
}
