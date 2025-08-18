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
    if (size <= 96) return "symbol-marker-small";
    if (size <= 128) return "symbol-marker-medium";
    if (size <= 156) return "symbol-marker-large";
    return "symbol-marker-xxl";
  };

  return (
    <div className="relative flex flex-col items-center cursor-pointer">
      {/* The icon (either SIDC or custom image) */}
      <div
        className={`absolute bottom-full mb-1 drop-shadow-lg symbol-marker-container ${getSizeClass(size)}`}
      >
        {/* AI-provided label shown above symbol if present */}
        {symbol.aiLabel && (
          <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 bg-black/70 text-white text-xs px-2 py-0.5 rounded whitespace-nowrap">
            {symbol.aiLabel}
          </div>
        )}
        {symbol.displayType === "image" && symbol.imageUrl ? (
          <Image
            src={symbol.imageUrl}
            alt={symbol.aiLabel || "Custom Icon"}
            width={size}
            height={size}
            className="object-contain max-w-full max-h-full"
          />
        ) : (
          <MilitarySymbol symbol={symbol} size={size} />
        )}
      </div>

      {/* The base point on the map */}
      <div className="w-3 h-3 bg-primary border-2 border-white rounded-full shadow-md"></div>
    </div>
  );
}
