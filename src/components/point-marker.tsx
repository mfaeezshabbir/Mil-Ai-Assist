"use client";

import { MilitarySymbol } from "./military-symbol";
import type { SymbolData } from "@/types";
import Image from "next/image";

type PointMarkerProps = {
  symbol: SymbolData;
  size?: number;
};

export function PointMarker({ symbol, size = 40 }: PointMarkerProps) {
  // Determine size class based on size value
  const getSizeClass = (size: number) => {
    if (size <= 16) return 'symbol-marker-small';
    if (size <= 22) return 'symbol-marker-medium';
    if (size <= 32) return 'symbol-marker-large';
    return 'symbol-marker-xxl';
  };

  return (
    <div className="relative flex flex-col items-center cursor-pointer">
      {/* The icon (either SIDC or custom image) */}
      <div className={`absolute bottom-full mb-1 drop-shadow-lg symbol-marker-container ${getSizeClass(size)}`}>
        {symbol.displayType === "image" && symbol.imageUrl ? (
          <Image
            src={symbol.imageUrl}
            alt={symbol.uniqueDesignation || "Custom Icon"}
            width={size}
            height={size}
            className="object-contain max-w-full max-h-full"
          />
        ) : (
          <MilitarySymbol symbol={symbol} size={size} />
        )}
      </div>

      {/* The base point on the map */}
      <div className="w-3 h-3 bg-blue-500 border-2 border-white rounded-full shadow-md"></div>
    </div>
  );
}
