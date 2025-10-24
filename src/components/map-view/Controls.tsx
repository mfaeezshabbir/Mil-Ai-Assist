"use client";

import React from "react";
import {
  NavigationControl,
  GeolocateControl,
  FullscreenControl,
} from "react-map-gl";
import { Geocoder } from "@/components/geocoder";
import FloatingCommand from "@/components/mil-layout/FloatingCommand";
import { AddSymbolDialog } from "@/components/add-symbol-dialog";
import type { MapRef } from "react-map-gl";
import type { SymbolData } from "@/types";
import SymbolSizer from "../symbolSizer";

type ControlsProps = {
  mapRef: React.RefObject<MapRef>;
  symbolSize?: "small" | "medium" | "large" | "xxl";
  onSymbolSizeChange?: (s: "small" | "medium" | "large" | "xxl") => void;
  symbols?: SymbolData[];
  formAction?: any;
  onAddSymbol?: (symbol: SymbolData) => void;
  mapCenter?: { latitude: number; longitude: number };
};

export default function Controls({
  mapRef,
  symbolSize,
  onSymbolSizeChange,
  symbols,
  formAction,
  onAddSymbol,
  mapCenter,
}: ControlsProps) {
  const [showSymbolSize, setShowSymbolSize] = React.useState(false);

  return (
    <>
      <NavigationControl
        showCompass
        showZoom
        visualizePitch
        position="bottom-right"
      />
      <FullscreenControl position="bottom-right" />

      <GeolocateControl
        positionOptions={{ enableHighAccuracy: true }}
        trackUserLocation
        position="bottom-right"
        style={{
          color: "white",
          backgroundColor: "#528F3D",
          borderRadius: "4px",
          border: "1px solid rgba(255, 255, 255, 0.2)",
        }}
      />

      <div className="fixed right-3 top-20 flex flex-col gap-2">
        {symbols && symbols.length > 0 && (
          <SymbolSizer
            symbolSize={symbolSize}
            onSymbolSizeChange={onSymbolSizeChange}
          />
        )}
        <Geocoder
          mapboxAccessToken={process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN!}
          mapRef={mapRef}
        />

        {onAddSymbol && (
          <AddSymbolDialog
            onAddSymbol={onAddSymbol}
            defaultPosition={mapCenter}
          />
        )}

        <FloatingCommand inline formAction={formAction} />
      </div>
    </>
  );
}
