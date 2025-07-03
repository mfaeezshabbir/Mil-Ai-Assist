"use client";

import { forwardRef, useImperativeHandle, useRef } from "react";
import type { MapRef, MapLayerMouseEvent } from "react-map-gl";
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
};

const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN;

// Military-inspired map styles
const SATELLITE_MAP_STYLE = "mapbox://styles/mapbox/satellite-v9";
const TACTICAL_MAP_STYLE = "mapbox://styles/mapbox/dark-v11";
const TERRAIN_MAP_STYLE = "mapbox://styles/mapbox/outdoors-v12";
const MILITARY_MAP_STYLE = TACTICAL_MAP_STYLE;

export const MapView = forwardRef<MapRef, MapViewProps>(
  (
    {
      symbols,
      onMapDoubleClick,
      onSymbolClick,
      onSymbolDragEnd,
      features,
      onFeaturesChange,
    },
    ref
  ) => {
    const mapRefInternal = useRef<MapRef>(null);

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
        }) as MapRef
    );

    const handleMapDoubleClick = (e: MapLayerMouseEvent) => {
      if (onMapDoubleClick) {
        onMapDoubleClick({
          lng: e.lngLat.lng,
          lat: e.lngLat.lat,
        });
      }
    };

    return (
      <div className="w-full h-full relative">
        <Map
          ref={mapRefInternal}
          initialViewState={{
            longitude: 73.09,
            latitude: 33.72,
            zoom: 10,
          }}
          mapStyle={MILITARY_MAP_STYLE}
          mapboxAccessToken={MAPBOX_TOKEN}
          onDblClick={handleMapDoubleClick}
          attributionControl={false}
          terrain={{ source: "mapbox-dem", exaggeration: 1.5 }}
          doubleClickZoom={false}
          style={{}}
          className="map-tactical"
        >
          {/* Military-styled Navigation Controls */}
          <div className="absolute right-3 top-3 flex flex-col gap-2">
            <NavigationControl
              showCompass
              showZoom
              visualizePitch
              className="navigation-tactical border border-primary/30 shadow-tactical"
            />
            <FullscreenControl className="fullscreen-tactical border border-primary/30 shadow-tactical" />
          </div>
          <div className="absolute left-3 top-3">
            <GeolocateControl
              positionOptions={{ enableHighAccuracy: true }}
              trackUserLocation
              className="geolocate-tactical border border-primary/30 shadow-tactical"
            />
          </div>
          <div className="absolute left-3 top-16 w-[300px]">
            <Geocoder mapboxAccessToken={MAPBOX_TOKEN!} mapRef={mapRefInternal} />
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
                const updatedFeatures = features.features.map((f: any) => {
                  if (f.id === e.features[0].id) {
                    return e.features[0];
                  }
                  return f;
                });
                onFeaturesChange({
                  ...features,
                  features: updatedFeatures,
                });
              }}
              onDelete={(e) => {
                const updatedFeatures = features.features.filter(
                  (f: any) => !e.features.some((ef) => ef.id === f.id)
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
                <PointMarker symbol={symbol} />
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
