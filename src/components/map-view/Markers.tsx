"use client";

import { Marker } from "react-map-gl";
import { PointMarker } from "@/components/point-marker";
import type { SymbolData } from "@/types";
import { SYMBOL_SIZES } from "./MapView";

type MarkersProps = {
  symbols: SymbolData[];
  onSymbolClick: (s: SymbolData) => void;
  onSymbolDragEnd?: (id: string, coords: { lng: number; lat: number }) => void;
  symbolSize?: "small" | "medium" | "large" | "xxl";
};

export default function Markers({ symbols, onSymbolClick, onSymbolDragEnd, symbolSize = "medium" }: MarkersProps) {
  return (
    <>
      {symbols.map((symbol) => (
        <Marker
          key={symbol.id}
          longitude={symbol.longitude}
          latitude={symbol.latitude}
          draggable={!!onSymbolDragEnd}
          onDragEnd={(e) => {
            if (onSymbolDragEnd) {
              onSymbolDragEnd(symbol.id, { lng: e.lngLat.lng, lat: e.lngLat.lat });
            }
          }}
        >
          <div onClick={() => onSymbolClick(symbol)}>
            <PointMarker symbol={symbol} size={SYMBOL_SIZES[symbolSize]} />
          </div>
        </Marker>
      ))}
    </>
  );
}
