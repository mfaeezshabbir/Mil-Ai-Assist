'use client';

import { MilitarySymbol } from './military-symbol';
import type { SymbolData } from '@/types';
import Image from 'next/image';

type PointMarkerProps = {
  symbol: SymbolData;
};

export function PointMarker({ symbol }: PointMarkerProps) {
  return (
    <div className="relative flex flex-col items-center cursor-pointer">
      {/* The icon (either SIDC or custom image) */}
      <div className="absolute bottom-full mb-1 drop-shadow-lg">
        {symbol.displayType === 'image' && symbol.imageUrl ? (
          <Image
            src={symbol.imageUrl}
            alt={symbol.uniqueDesignation || 'Custom Icon'}
            width={40}
            height={40}
            className="object-contain"
          />
        ) : (
          <MilitarySymbol symbol={symbol} size={40} />
        )}
      </div>

      {/* The base point on the map */}
      <div className="w-3 h-3 bg-blue-500 border-2 border-white rounded-full shadow-md"></div>
    </div>
  );
}
