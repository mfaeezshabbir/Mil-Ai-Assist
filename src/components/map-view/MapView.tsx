"use client";

import {
  forwardRef,
  useImperativeHandle,
  useRef,
  useState,
  useCallback,
} from "react";
import type { MapRef, ViewState } from "react-map-gl";
import Map, { Layer, Source } from "react-map-gl";
import type { RouteData, SymbolData } from "@/types";
import Controls from "./Controls";
import Markers from "./Markers";
import { circlePolygon } from "@/lib/sim/geo";
import { BOARD } from "@/lib/sim/catalog";
import { isCombatUnit } from "@/lib/sim/units";
import { TRACK_COLORS, pieceIdentity } from "@/lib/sim/track-style";

export type MapViewProps = {
  symbols: SymbolData[];
  routes?: RouteData[];
  selectedSymbolId?: string | null;
  onMapDoubleClick?: (coords: { lng: number; lat: number }) => void;
  onMapClick?: (coords: { lng: number; lat: number }) => void;
  onSymbolClick: (symbol: SymbolData) => void;
  onSymbolDragEnd?: (
    symbolId: string,
    coords: { lng: number; lat: number }
  ) => void;
  mapStyle?: string;
  onViewStateChange?: (viewState: ViewState) => void;
  symbolSize?: "small" | "medium" | "large" | "xxl";
  onSymbolSizeChange?: (size: "small" | "medium" | "large" | "xxl") => void;
  onOpenCreateEditor?: () => void;
};

const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN;
const DEFAULT_VIEW = {
  longitude: 73.09,
  latitude: 33.72,
  zoom: 10,
};

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
      routes = [],
      selectedSymbolId,
      onMapDoubleClick,
      onMapClick,
      onSymbolClick,
      onSymbolDragEnd,
      mapStyle = MAP_STYLES.TACTICAL,
      onViewStateChange,
      symbolSize = "medium",
      onSymbolSizeChange,
      onOpenCreateEditor,
    },
    ref
  ) => {
    const mapRefInternal = useRef<MapRef>(null);
    const [viewState, setViewState] = useState(DEFAULT_VIEW);

    useImperativeHandle(
      ref,
      () =>
        ({
          flyTo: (options: Parameters<MapRef["flyTo"]>[0]) => {
            mapRefInternal.current?.flyTo(options);
          },
          fitBounds: (bounds: Parameters<MapRef["fitBounds"]>[0], options?: Parameters<MapRef["fitBounds"]>[1]) => {
            mapRefInternal.current?.fitBounds(bounds, options);
          },
          getMap: () => mapRefInternal.current?.getMap(),
        }) as unknown as MapRef
    );

    const handleMapClick = (event: {
      lngLat: { lng: number; lat: number };
    }) => {
      onMapClick?.({
        lng: event.lngLat.lng,
        lat: event.lngLat.lat,
      });
    };

    const handleMapDoubleClick = (event: {
      lngLat: { lng: number; lat: number };
    }) => {
      onMapDoubleClick?.({
        lng: event.lngLat.lng,
        lat: event.lngLat.lat,
      });
    };

    const orderCollection = {
      type: "FeatureCollection" as const,
      features: symbols
        .filter((unit) => unit.order?.type === "move")
        .map((unit) => ({
          type: "Feature" as const,
          properties: { id: unit.id },
          geometry: {
            type: "LineString" as const,
            coordinates: [
              [unit.longitude, unit.latitude],
              [unit.order!.destLng, unit.order!.destLat],
            ],
          },
        })),
    };

    const handleMove = useCallback(
      (evt: { viewState: ViewState }) => {
        setViewState(evt.viewState);
        onViewStateChange?.(evt.viewState);
      },
      [onViewStateChange]
    );

    const selected = symbols.find((unit) => unit.id === selectedSymbolId);
    const rangeCollection = {
      type: "FeatureCollection" as const,
      features:
        selected && isCombatUnit(selected) && (selected.rangeKm ?? 0) > 0
          ? [
              circlePolygon(
                selected.latitude,
                selected.longitude,
                selected.rangeKm ?? 3
              ),
            ]
          : [],
    };

    const assetRings = {
      type: "FeatureCollection" as const,
      features: symbols.flatMap((unit) => {
        if (unit.pieceKind === "objective") {
          const feature = circlePolygon(
            unit.latitude,
            unit.longitude,
            BOARD.captureKm
          );
          const color = TRACK_COLORS[pieceIdentity(unit)].stroke;
          return [{ ...feature, properties: { kind: "objective", color } }];
        }
        if (unit.pieceKind === "minefield") {
          const feature = circlePolygon(
            unit.latitude,
            unit.longitude,
            BOARD.mineKm
          );
          return [{ ...feature, properties: { kind: "mine", color: "#F59E2A" } }];
        }
        if (unit.pieceKind === "supply" || unit.pieceKind === "fob") {
          const feature = circlePolygon(
            unit.latitude,
            unit.longitude,
            BOARD.supplyKm
          );
          return [
            {
              ...feature,
              properties: { kind: "supply", color: "#0FD0E6" },
            },
          ];
        }
        return [];
      }),
    };

    const selectedColor = selected
      ? TRACK_COLORS[pieceIdentity(selected)].stroke
      : "#0FD0E6";

    const routeCollection = {
      type: "FeatureCollection" as const,
      features: routes.map((route) => ({
        type: "Feature" as const,
        properties: {
          id: route.id,
          pathType: route.pathType ?? "Route",
          unitInfo: route.unitInfo ?? "",
        },
        geometry: {
          type: "LineString" as const,
          coordinates: [
            [route.start.lng, route.start.lat],
            [route.end.lng, route.end.lat],
          ],
        },
      })),
    };

    return (
      <div className="w-full h-full relative">
        <div className="w-full h-full">
          <Map
            ref={mapRefInternal}
            initialViewState={DEFAULT_VIEW}
            {...viewState}
            onMove={handleMove}
            mapStyle={mapStyle}
            mapboxAccessToken={MAPBOX_TOKEN}
            onClick={handleMapClick}
            onDblClick={handleMapDoubleClick}
            attributionControl={false}
            doubleClickZoom={false}
            style={{ position: "relative", width: "100%", height: "100%" }}
          >
            {assetRings.features.length > 0 && (
              <Source id="board-rings" type="geojson" data={assetRings}>
                <Layer
                  id="board-rings-fill"
                  type="fill"
                  paint={{
                    "fill-color": ["get", "color"],
                    "fill-opacity": 0.08,
                  }}
                />
                <Layer
                  id="board-rings-line"
                  type="line"
                  paint={{
                    "line-color": ["get", "color"],
                    "line-width": 1.5,
                    "line-dasharray": [2, 2],
                    "line-opacity": 0.7,
                  }}
                />
              </Source>
            )}

            {rangeCollection.features.length > 0 && (
              <Source id="unit-range" type="geojson" data={rangeCollection}>
                <Layer
                  id="unit-range-fill"
                  type="fill"
                  paint={{
                    "fill-color": selectedColor,
                    "fill-opacity": 0.1,
                  }}
                />
                <Layer
                  id="unit-range-line"
                  type="line"
                  paint={{
                    "line-color": selectedColor,
                    "line-width": 2,
                    "line-opacity": 0.85,
                  }}
                />
              </Source>
            )}

            {routes.length > 0 && (
              <Source id="command-routes" type="geojson" data={routeCollection}>
                <Layer
                  id="command-routes-line"
                  type="line"
                  paint={{
                    "line-color": "#E27D60",
                    "line-width": 3,
                    "line-opacity": 0.9,
                  }}
                />
              </Source>
            )}

            {orderCollection.features.length > 0 && (
              <Source id="queued-orders" type="geojson" data={orderCollection}>
                <Layer
                  id="queued-orders-line"
                  type="line"
                  paint={{
                    "line-color": "#7dd3fc",
                    "line-width": 2,
                    "line-dasharray": [2, 2],
                    "line-opacity": 0.95,
                  }}
                />
              </Source>
            )}

            <Markers
              symbols={symbols}
              selectedSymbolId={selectedSymbolId}
              onSymbolClick={onSymbolClick}
              onSymbolDragEnd={onSymbolDragEnd}
              symbolSize={symbolSize}
            />
          </Map>

          <div className="absolute inset-0 pointer-events-none border border-primary/15" />
        </div>

        <Controls
          mapRef={mapRefInternal}
          symbolSize={symbolSize}
          onSymbolSizeChange={onSymbolSizeChange}
          symbols={symbols}
          onOpenCreateEditor={onOpenCreateEditor}
        />
      </div>
    );
  }
);

MapView.displayName = "MapView";

export default MapView;
