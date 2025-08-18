"use client";

import { useEffect, useState } from "react";
import type { SymbolData } from "@/types";
import MS from "milsymbol";
import { generateSIDC } from "@/lib/sidc-generator";
import { toTitleCase } from "@/lib/utils";
import { getFunctionIdName } from "@/lib/sidc-mappings";

type MilitarySymbolProps = {
  symbol: SymbolData;
  size?: number;
};

export function MilitarySymbol({ symbol, size = 35 }: MilitarySymbolProps) {
  const [svgHtml, setSvgHtml] = useState("");
  const [sidc, setSidc] = useState("");

  useEffect(() => {
    // milsymbol is a client-side library, so we only run it in the browser
    if (typeof window === "undefined" || !symbol) return;

    try {
      const generatedSidc = generateSIDC(symbol);
      setSidc(generatedSidc);

      const {
        id,
        latitude,
        longitude,
        symbolEchelon,
        functionId,
        symbolStandardIdentity,
        context,
        status,
        hqtfd,
        symbolSet,
        modifier1,
        modifier2,
        ...options
      } = symbol;

      const milSymbol = new MS.Symbol(generatedSidc, {
        ...options,
        size: size,
        colorMode: "Light",
        outlineWidth: 3,
        outlineColor: "rgba(0, 0, 0, 0.9)",
      });

      setSvgHtml(milSymbol.asSVG());
    } catch (e) {
      console.error("Error creating military symbol:", e, symbol);
      // Fallback to a simple placeholder if milsymbol fails
      setSvgHtml(
        `<svg width="${size}" height="${size}"><rect x="0" y="0" width="${size}" height="${size}" fill="red" /></svg>`
      );
    }
  }, [symbol, size]);

  if (!symbol) return null;

  const title = [
    symbol.context,
    symbol.status,
    symbol.symbolStandardIdentity,
    getFunctionIdName(symbol.symbolSet, symbol.functionId) + " unit",
    symbol.symbolEchelon ? `(${symbol.symbolEchelon})` : "",
    symbol.hqtfd !== "Not Applicable" ? `(${toTitleCase(symbol.hqtfd)})` : "",
    `at ${symbol.latitude.toFixed(4)}, ${symbol.longitude.toFixed(4)}`,
    `\nSIDC: ${sidc}`,
  ]
    .filter(Boolean)
    .join(" ");

  // The container div is for tooltip and layout purposes.
  // dangerouslySetInnerHTML will insert the SVG from milsymbol.
  return (
    <div
      title={title}
      aria-label={title}
      className="drop-shadow-lg military-symbol-container military-symbol-preview"
      style={{ 
        width: `${size}px`, 
        height: `${size}px`,
        flexShrink: 0 
      }}
    >
      <div 
        className="w-full h-full flex items-center justify-center"
        dangerouslySetInnerHTML={{ __html: svgHtml }}
      />
    </div>
  );
}
