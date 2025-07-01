'use client';

import { useEffect, useState } from 'react';
import type { SymbolData } from '@/types';
import MS from 'milsymbol';

type MilitarySymbolProps = {
  symbol: SymbolData;
};

export function MilitarySymbol({ symbol }: MilitarySymbolProps) {
  const [svgHtml, setSvgHtml] = useState('');

  useEffect(() => {
    // milsymbol is a client-side library, so we only run it in the browser
    if (typeof window === 'undefined') return;

    const {
      symbolStandardIdentity,
      symbolCategory,
      symbolEchelon,
      symbolDamaged,
      symbolTaskForce,
    } = symbol;

    const properties: { [key: string]: any } = {
      identity: symbolStandardIdentity.toLowerCase(),
      // Assuming Land Unit for now. This could be extended via AI later.
      symbolset: '10', 
      status: symbolDamaged ? 'damaged' : 'present',
      echelon: symbolEchelon,
      taskForce: symbolTaskForce,
    };

    const category = symbolCategory.toLowerCase();
    switch (category) {
      case 'infantry':
        properties.functionid = '121100'; // MIL-STD-2525D Infantry
        break;
      case 'armored':
        properties.functionid = '120300'; // MIL-STD-2525D Armor/Armoured/Mechanized/Tracked
        break;
      // 'unknown' category will result in a question mark in the symbol frame, which is good.
    }

    try {
      const milSymbol = new MS.Symbol(properties, { 
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

  const title = `${symbol.symbolStandardIdentity} ${symbol.symbolCategory} unit` +
    (symbol.symbolEchelon ? ` (${symbol.symbolEchelon})` : '') +
    (symbol.symbolDamaged ? ', Damaged' : '') +
    (symbol.symbolTaskForce ? ', Task Force' : '') +
    ` at ${symbol.latitude.toFixed(4)}, ${symbol.longitude.toFixed(4)}`;

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
