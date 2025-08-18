"use client";

import {
  forwardRef,
  useImperativeHandle,
  useRef,
  useState,
  useCallback,
} from "react";
import type { MapRef, MapLayerMouseEvent, ViewState } from "react-map-gl";
import Map, {
  Marker,
  NavigationControl,
  GeolocateControl,
  FullscreenControl,
} from "react-map-gl";
import type { SymbolData } from "@/types";
import { Geocoder } from "@/components/geocoder";
import { PointMarker } from "./point-marker";
import DrawControl from "./draw-control";

export type MapViewProps = {
  symbols: SymbolData[];
  onMapDoubleClick?: (coords: { lng: number; lat: number }) => void;
  onSymbolClick: (symbol: SymbolData) => void;
  onSymbolDragEnd?: (
    symbolId: string,
    coords: { lng: number; lat: number }
  ) => void;
  features?: any;
  onFeaturesChange?: (features: any) => void;
  mapStyle?: string;
  onViewStateChange?: (viewState: ViewState) => void;
  symbolSize?: "small" | "medium" | "large" | "xxl";
  onSymbolSizeChange?: (size: "small" | "medium" | "large" | "xxl") => void;
};

const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN;

// Military-inspired map styles
export const MAP_STYLES = {
  SATELLITE: "mapbox://styles/mapbox/satellite-v9",
  TACTICAL: "mapbox://styles/mapbox/dark-v11",
  TERRAIN: "mapbox://styles/mapbox/outdoors-v12",
  STREETS: "mapbox://styles/mapbox/streets-v12",
};

// Symbol size mapping
export const SYMBOL_SIZES = {
  small: 30,
  medium: 40,
  large: 50,
  xxl: 60,
} as const;

export const MapView = forwardRef<MapRef, MapViewProps>(
  (
    {
      symbols,
      onMapDoubleClick,
      onSymbolClick,
      onSymbolDragEnd,
      features,
      onFeaturesChange,
      mapStyle = MAP_STYLES.TACTICAL,
      onViewStateChange,
      symbolSize = "medium",
      onSymbolSizeChange,
    },
    ref
  ) => {
    const mapRefInternal = useRef<MapRef>(null);
    const [viewState, setViewState] = useState({
      longitude: 73.09,
      latitude: 33.72,
      zoom: 10,
    });

    // Forward ref methods to parent component
    useImperativeHandle(
      ref,
      () =>
        ({
          flyTo: (options: any) => {
            if (mapRefInternal.current) {
              mapRefInternal.current.flyTo(options);
            }
          },
          getMap: () => mapRefInternal.current,
        }) as unknown as MapRef
    );

    const handleMapDoubleClick = (e: MapLayerMouseEvent) => {
      if (onMapDoubleClick) {
        onMapDoubleClick({
          lng: e.lngLat.lng,
          lat: e.lngLat.lat,
        });
      }
    };

    const handleMove = useCallback(
      (evt: { viewState: ViewState }) => {
        setViewState(evt.viewState);
        if (onViewStateChange) {
          onViewStateChange(evt.viewState);
        }
      },
      [onViewStateChange]
    );

    const [showSymbolSize, setShowSymbolSize] = useState(false);
    return (
      <div className="w-full h-full relative">
        <Map
          ref={mapRefInternal}
          initialViewState={{
            longitude: 74.3587,
            latitude: 31.5204,
            zoom: 10,
          }}
          {...viewState}
          onMove={handleMove}
          mapStyle={mapStyle}
          mapboxAccessToken={MAPBOX_TOKEN}
          onDblClick={handleMapDoubleClick}
          attributionControl={false}
          terrain={{ source: "mapbox-dem", exaggeration: 1.5 }}
          doubleClickZoom={false}
          style={{}}
        >
          {/* Military-styled Navigation Controls */}
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

            {/* Symbol Size Control */}
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
                            onSymbolSizeChange(
                              size as keyof typeof SYMBOL_SIZES
                            );
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
                              width: pixels / 2,
                              height: pixels / 2,
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
            {/* </div>
          <div className="absolute left-3 top-3"> */}
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
              mapboxAccessToken={MAPBOX_TOKEN!}
              mapRef={mapRefInternal}
            />
          </div>

          {features && onFeaturesChange && (
            <DrawControl
              position="top-right"
              displayControlsDefault={false}
              controls={{
                polygon: true,
                line_string: true,
                trash: true,
              }}
              defaultMode="simple_select"
              onCreate={(e) => {
                onFeaturesChange({
                  ...features,
                  features: features.features.concat(e.features),
                });
              }}
              onUpdate={(e) => {
                const updatedFeatures = features.features.map(
                  (f: { id: string }) => {
                    if (f.id === (e.features[0] as { id: string }).id) {
                      return e.features[0];
                    }
                    return f;
                  }
                );
                onFeaturesChange({
                  ...features,
                  features: updatedFeatures,
                });
              }}
              onDelete={(e) => {
                const updatedFeatures = features.features.filter(
                  (f: any) =>
                    !e.features.some(
                      (ef: any) =>
                        (ef as { id: string }).id === (f as { id: string }).id
                    )
                );
                onFeaturesChange({
                  ...features,
                  features: updatedFeatures,
                });
              }}
            />
          )}

          {symbols.map((symbol) => (
            <Marker
              key={symbol.id}
              longitude={symbol.longitude}
              latitude={symbol.latitude}
              draggable={!!onSymbolDragEnd}
              onDragEnd={(e) => {
                if (onSymbolDragEnd) {
                  onSymbolDragEnd(symbol.id, {
                    lng: e.lngLat.lng,
                    lat: e.lngLat.lat,
                  });
                }
              }}
            >
              <div onClick={() => onSymbolClick(symbol)}>
                <PointMarker symbol={symbol} size={SYMBOL_SIZES[symbolSize]} />
              </div>
            </Marker>
          ))}
        </Map>

        {/* Grid overlay for tactical map appearance */}
        <div className="absolute inset-0 pointer-events-none border border-primary/20">
          <div className="w-full h-full bg-tactical-grid opacity-10"></div>
        </div>
      </div>
    );
  }
);

// Add displayName to satisfy react/display-name ESLint rule
MapView.displayName = "MapView";
