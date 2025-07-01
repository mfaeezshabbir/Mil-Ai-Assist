'use client';

import { useEffect, useState } from 'react';
import type { SymbolData } from '@/types';
import MS from 'milsymbol';
import { generateSIDC } from '@/lib/sidc-generator';
import { toTitleCase } from '@/lib/utils';
import { getFunctionIdName } from '@/lib/sidc-mappings';


type MilitarySymbolProps = {
  symbol: SymbolData;
};

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

  const title = [
    symbol.context,
    symbol.status,
    symbol.symbolStandardIdentity,
    getFunctionIdName(symbol.symbolSet, symbol.functionId) + ' unit',
    symbol.symbolEchelon ? `(${symbol.symbolEchelon})` : '',
    symbol.hqtfd !== 'Not Applicable' ? `(${toTitleCase(symbol.hqtfd)})` : '',
    `at ${symbol.latitude.toFixed(4)}, ${symbol.longitude.toFixed(4)}`,
    `\nSIDC: ${sidc}`
  ].filter(Boolean).join(' ');

  // The container div is for tooltip and layout purposes. 
  // dangerouslySetInnerHTML will insert the SVG from milsymbol.
  return (
    <div
      title={title}
      aria-label={title}
      className="drop-shadow-lg"
      dangerouslySetInnerHTML={{ __html: svgHtml }}
    />
  );
}
