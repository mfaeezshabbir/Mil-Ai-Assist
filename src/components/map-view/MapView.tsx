"use client";

import {
  forwardRef,
  useImperativeHandle,
  useRef,
  useState,
  useCallback,
} from "react";
import type { MapRef, ViewState } from "react-map-gl";
import Map from "react-map-gl";
import type { SymbolData } from "@/types";
import Controls from "./Controls";
import Markers from "./Markers";
import DrawControl from "../draw-control";

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

export const MAP_STYLES = {
  SATELLITE: "mapbox://styles/mapbox/satellite-v9",
  TACTICAL: "mapbox://styles/mapbox/dark-v11",
  TERRAIN: "mapbox://styles/mapbox/outdoors-v12",
  STREETS: "mapbox://styles/mapbox/streets-v12",
};

export const SYMBOL_SIZES = {
  small: 30,
  medium: 40,
  large: 50,
  xxl: 60,
} as const;

const MapView = forwardRef<MapRef, MapViewProps>(
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

    const handleMapDoubleClick = (e: any) => {
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

    return (
      <div className="w-full h-full relative">
        <div className="w-full h-full">
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
            style={{ position: "relative", width: "100%", height: "100%" }}
          >
            <Controls
              mapRef={mapRefInternal}
              symbolSize={symbolSize}
              onSymbolSizeChange={onSymbolSizeChange}
              symbols={symbols}
            />

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

            <Markers
              symbols={symbols}
              onSymbolClick={onSymbolClick}
              onSymbolDragEnd={onSymbolDragEnd}
              symbolSize={symbolSize}
            />
          </Map>

          {/* Grid overlay for tactical map appearance */}
          <div className="absolute inset-0 pointer-events-none border border-primary/20">
            <div className="w-full h-full bg-tactical-grid opacity-10"></div>
          </div>
        </div>
      </div>
    );
  }
);

MapView.displayName = "MapView";

export default MapView;
