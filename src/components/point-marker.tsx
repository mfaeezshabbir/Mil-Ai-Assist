"use client";

import { MilitarySymbol } from "./military-symbol";
import type { SymbolData } from "@/types";
import Image from "next/image";
import { TRACK_COLORS, pieceIdentity } from "@/lib/sim/track-style";

type PointMarkerProps = {
  symbol: SymbolData;
  size?: number;
  selected?: boolean;
};

export function PointMarker({
  symbol,
  size = 40,
  selected = false,
}: PointMarkerProps) {
  const identity = pieceIdentity(symbol);
  const colors = TRACK_COLORS[identity];

  return (
    <div className="relative flex flex-col items-center cursor-pointer">
      {symbol.aiLabel && (
        <div
          className="mb-0.5 px-1.5 py-0.5 font-mono text-[10px] tracking-wider uppercase whitespace-nowrap border"
          style={{
            color: colors.stroke,
            borderColor: `${colors.stroke}66`,
            background: "rgba(8, 12, 20, 0.82)",
          }}
        >
          {symbol.aiLabel}
        </div>
      )}

      <div
        className="relative"
        style={{
          boxShadow: selected ? `0 0 0 1px ${colors.stroke}` : undefined,
        }}
      >
        {symbol.displayType === "image" && symbol.imageUrl ? (
          <Image
            src={symbol.imageUrl}
            alt={symbol.aiLabel || "Custom Icon"}
            width={size}
            height={size}
            className="object-contain max-w-full max-h-full"
          />
        ) : (
          <MilitarySymbol symbol={symbol} size={size} selected={selected} />
        )}
      </div>

      <div
        className="mt-0.5 h-1.5 w-1.5 rotate-45 border"
        style={{
          background: colors.stroke,
          borderColor: colors.stroke,
        }}
      />
    </div>
  );
}
