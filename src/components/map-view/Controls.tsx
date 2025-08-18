"use client";

import React from "react";
import {
  NavigationControl,
  GeolocateControl,
  FullscreenControl,
} from "react-map-gl";
import { Geocoder } from "@/components/geocoder";
import type { MapRef } from "react-map-gl";
import { SYMBOL_SIZES } from "./MapView";

type ControlsProps = {
  mapRef: React.RefObject<MapRef>;
  symbolSize?: "small" | "medium" | "large" | "xxl";
  onSymbolSizeChange?: (s: "small" | "medium" | "large" | "xxl") => void;
};

export default function Controls({
  mapRef,
  symbolSize,
  onSymbolSizeChange,
}: ControlsProps) {
  const [showSymbolSize, setShowSymbolSize] = React.useState(false);

  return (
    <>
      <div className="absolute right-3 top-10 flex flex-col gap-2">
        <NavigationControl
          showCompass
          showZoom
          visualizePitch
          position="bottom-right"
          style={{
            color: "white",
            backgroundColor: "rgba(0, 0, 0, 0.5)",
            borderRadius: "4px",
            border: "1px solid rgba(255, 255, 255, 0.2)",
          }}
        />
        <FullscreenControl
          position="bottom-right"
          style={{
            color: "white",
            backgroundColor: "rgba(0, 0, 0, 0.5)",
            borderRadius: "4px",
            border: "1px solid rgba(255, 255, 255, 0.2)",
          }}
        />

        {onSymbolSizeChange && (
          <div className="relative">
            <button
              className="bg-primary/60 backdrop-blur-md rounded-full border border-white/30 p-2 shadow-lg flex items-center justify-center hover:bg-primary/80 transition"
              onClick={() => setShowSymbolSize((prev) => !prev)}
              aria-label="Change Symbol Size"
              type="button"
            >
              <svg width={20} height={20} fill="none" viewBox="0 0 20 20">
                <circle
                  cx={10}
                  cy={10}
                  r={8}
                  stroke="white"
                  strokeWidth={2}
                  fill="none"
                />
                <path
                  d="M10 5v10M5 10h10"
                  stroke="white"
                  strokeWidth={2}
                  strokeLinecap="round"
                />
              </svg>
            </button>
            {showSymbolSize && (
              <div className="absolute right-0 mt-2 z-20 bg-black/60 backdrop-blur-md rounded-lg border border-white/30 p-2 shadow-lg flex flex-col items-center">
                <div className="text-[10px] text-white/60 mb-2 px-2 font-mono tracking-widest uppercase">
                  Symbol Size
                </div>
                <div className="flex flex-row gap-2 justify-center items-center">
                  {Object.entries(SYMBOL_SIZES).map(([size, pixels]) => (
                    <button
                      key={size}
                      onClick={() => {
                        onSymbolSizeChange?.(size as keyof typeof SYMBOL_SIZES);
                        setShowSymbolSize(false);
                      }}
                      className={`flex flex-col items-center px-2 py-1 rounded-lg transition-all border border-transparent
                ${
                  symbolSize === size
                    ? "bg-white/20 text-white border-white/40 shadow"
                    : "text-white/70 hover:bg-white/10 hover:text-white"
                }`}
                      style={{ minWidth: 48 }}
                    >
                      <span
                        className="inline-block mb-1 rounded-full border border-white/30"
                        style={{
                          width: (pixels as number) / 2,
                          height: (pixels as number) / 2,
                          background: "rgba(255,255,255,0.15)",
                        }}
                      />
                      <span className="text-[11px] font-mono uppercase">
                        {size}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        <GeolocateControl
          positionOptions={{ enableHighAccuracy: true }}
          trackUserLocation
          position="bottom-right"
          style={{
            color: "white",
            backgroundColor: "rgba(0, 0, 0, 0.5)",
            borderRadius: "4px",
            border: "1px solid rgba(255, 255, 255, 0.2)",
          }}
        />
      </div>

      <div className="absolute left-3 top-16 w-[300px]">
        <Geocoder
          mapboxAccessToken={process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN!}
          mapRef={mapRef}
        />
      </div>
    </>
  );
}
