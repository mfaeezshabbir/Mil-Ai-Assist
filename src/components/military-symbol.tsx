'use client';

import { useEffect, useState } from 'react';
import type { SymbolData } from '@/types';
import MS from 'milsymbol';
import { generateSIDC } from '@/lib/sidc-generator';
import { toTitleCase } from '@/lib/utils';
import { LandUnitSymbolSet10 } from '@/lib/sidc-mappings';

type MilitarySymbolProps = {
  symbol: SymbolData;
};

function getFunctionIdName(functionId: string): string {
    const entry = Object.entries(LandUnitSymbolSet10).find(([, code]) => code === functionId);
    return entry ? toTitleCase(entry[0]) : 'Unknown';
}

export function MilitarySymbol({ symbol }: MilitarySymbolProps) {
  const [svgHtml, setSvgHtml] = useState('');
  const [sidc, setSidc] = useState('');

  useEffect(() => {
    // milsymbol is a client-side library, so we only run it in the browser
    if (typeof window === 'undefined') return;

    try {
      const generatedSidc = generateSIDC(symbol);
      setSidc(generatedSidc);
      
      const milSymbol = new MS.Symbol(generatedSidc, { 
        size: 35,
        colorMode: "Light",
        outlineWidth: 3,
        outlineColor: "rgba(255, 255, 255, 0.8)",
      });
      setSvgHtml(milSymbol.asSVG());
    } catch (e) {
      console.error('Error creating military symbol:', e);
      // Fallback to a simple placeholder if milsymbol fails
      setSvgHtml('<svg width="35" height="40"><rect x="0" y="0" width="35" height="40" fill="red" /></svg>');
    }
  }, [symbol]);

  const title = `${symbol.symbolStandardIdentity} ${getFunctionIdName(symbol.functionId)} unit` +
    (symbol.symbolEchelon ? ` (${symbol.symbolEchelon})` : '') +
    (symbol.symbolDamaged ? ', Damaged' : '') +
    (symbol.symbolTaskForce ? ', Task Force' : '') +
    ` at ${symbol.latitude.toFixed(4)}, ${symbol.longitude.toFixed(4)}` +
    `\nSIDC: ${sidc}`;

  // The container div is for tooltip and layout purposes. 
  // dangerouslySetInnerHTML will insert the SVG from milsymbol.
  return (
    <div
      title={title}
      aria-label={title}
      className="drop-shadow-lg cursor-pointer"
      dangerouslySetInnerHTML={{ __html: svgHtml }}
    />
  );
}
