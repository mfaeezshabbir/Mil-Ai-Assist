"use client";

import { useEffect, useState } from "react";
import type { SymbolData } from "@/types";
import { generateSIDC, validateSIDC } from "@/lib/sidc-generator";
import { createMilSymbol } from "@/lib/ms-symbol";

type SidcGlyphProps = {
  symbol: SymbolData;
  size?: number;
  showAmplifiers?: boolean;
};

export function SidcGlyph({
  symbol,
  size = 120,
  showAmplifiers = false,
}: SidcGlyphProps) {
  const [svg, setSvg] = useState("");
  const [valid, setValid] = useState(true);

  useEffect(() => {
    try {
      const sidc = generateSIDC(symbol);
      const drawn = createMilSymbol(sidc, {
        size,
        standard: "2525",
        frame: true,
        fill: true,
        icon: true,
        infoFields: showAmplifiers,
        uniqueDesignation: showAmplifiers ? symbol.aiLabel : undefined,
        additionalInformation: showAmplifiers
          ? symbol.additionalInformation
          : undefined,
        higherFormation: showAmplifiers ? symbol.higherFormation : undefined,
        colorMode: "Light",
        strokeWidth: 4,
        outlineWidth: 3,
        outlineColor: "rgba(0,0,0,0.9)",
      });
      setValid(Boolean(drawn.validIcon) || validateSIDC(sidc));
      setSvg(drawn.asSVG());
    } catch {
      setValid(false);
      setSvg("");
    }
  }, [symbol, size, showAmplifiers]);

  if (!svg) {
    return (
      <div
        className="flex items-center justify-center font-mono text-[10px] tracking-[0.22em] text-destructive"
        style={{ width: size, height: size }}
      >
        NO GLYPH
      </div>
    );
  }

  return (
    <div
      className={`sidc-glyph flex items-center justify-center ${
        valid ? "" : "ring-1 ring-destructive/70"
      }`}
      style={{ width: size, height: size }}
      dangerouslySetInnerHTML={{ __html: svg }}
    />
  );
}

export default SidcGlyph;
