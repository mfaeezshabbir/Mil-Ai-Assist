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
import type { CommandFormAction } from "@/components/mil-layout/CommandInput";

export type MapViewProps = {
  symbols: SymbolData[];
  routes?: RouteData[];
  onMapDoubleClick?: (coords: { lng: number; lat: number }) => void;
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
  formAction?: CommandFormAction;
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
      onMapDoubleClick,
      onSymbolClick,
      onSymbolDragEnd,
      mapStyle = MAP_STYLES.TACTICAL,
      onViewStateChange,
      symbolSize = "medium",
      onSymbolSizeChange,
      onOpenCreateEditor,
      formAction,
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

    const handleMapDoubleClick = (event: {
      lngLat: { lng: number; lat: number };
    }) => {
      onMapDoubleClick?.({
        lng: event.lngLat.lng,
        lat: event.lngLat.lat,
      });
    };

    const handleMove = useCallback(
      (evt: { viewState: ViewState }) => {
        setViewState(evt.viewState);
        onViewStateChange?.(evt.viewState);
      },
      [onViewStateChange]
    );

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
            onDblClick={handleMapDoubleClick}
            attributionControl={false}
            doubleClickZoom={false}
            style={{ position: "relative", width: "100%", height: "100%" }}
          >
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

            <Markers
              symbols={symbols}
              onSymbolClick={onSymbolClick}
              onSymbolDragEnd={onSymbolDragEnd}
              symbolSize={symbolSize}
            />
          </Map>

          <div className="absolute inset-0 pointer-events-none border border-primary/20">
            <div className="w-full h-full bg-tactical-grid opacity-10"></div>
          </div>
        </div>

        <Controls
          mapRef={mapRefInternal}
          symbolSize={symbolSize}
          onSymbolSizeChange={onSymbolSizeChange}
          symbols={symbols}
          onOpenCreateEditor={onOpenCreateEditor}
          formAction={formAction}
        />
      </div>
    );
  }
);

MapView.displayName = "MapView";

export default MapView;
