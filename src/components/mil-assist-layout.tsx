"use client";

import { useEffect, useState, useRef } from "react";
import { useActionState } from "react";
import type { MapRef, ViewState } from "react-map-gl";
import {
  getMapFeatureFromCommand,
  type ActionResult,
} from "@/app/actions";
import { useToast } from "@/hooks/use-toast";
import type { SIDCMetadataOutput } from "@/ai/flows/extract-sidc-metadata";
import type { RouteData, SymbolData } from "@/types";
import { MapView, MAP_STYLES } from "@/components/map-view";
import PlannerHeader from "@/components/mil-layout/PlannerHeader";
import MapOverlay from "@/components/mil-layout/MapOverlay";
import { SymbolListSheet } from "./symbol-list-sheet";
import { SymbolEditor } from "./symbol-editor";
import CommandInputPanel from "@/components/mil-layout/CommandInput";
import { findFunctionId } from "@/lib/sidc-mappings";
import {
  loadPlannerState,
  savePlannerState,
} from "@/lib/planner-storage";

const initialState: ActionResult = {
  id: null,
  feature: null,
  error: null,
};

function tzOffsetHoursFromLongitude(longitude: number) {
  let offset = Math.round(longitude / 15);
  if (offset < -12) offset = -12;
  if (offset > 14) offset = 14;
  return offset;
}

function symbolFromMetadata(
  metadata: SIDCMetadataOutput,
  latitude: number,
  longitude: number
): SymbolData {
  const symbolSet = metadata.symbolSet || "Land Unit";
  const mainIconId =
    findFunctionId(symbolSet, metadata.symbolCategory) || "000000";

  return {
    id: `sym-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    displayType: "sidc",
    aiLabel: metadata.aiLabel,
    context: metadata.context || "Reality",
    symbolStandardIdentity: metadata.symbolStandardIdentity || "Friend",
    status: metadata.status || "Present",
    hqtfd: metadata.hqtfd || "Not Applicable",
    symbolSet,
    mainIconId,
    modifier1: metadata.modifier1 || "00",
    modifier2: metadata.modifier2 || "00",
    symbolEchelon: metadata.symbolEchelon,
    latitude,
    longitude,
    additionalInformation: metadata.additionalInformation,
    higherFormation: metadata.higherFormation,
    dtg: metadata.dtg,
    type: metadata.type,
    quantity: metadata.quantity,
    speed: metadata.speed,
    direction: metadata.direction,
    hostile: metadata.hostile,
    commonIdentifier: metadata.commonIdentifier,
  };
}

export function MilAssistLayout() {
  const [symbols, setSymbols] = useState<SymbolData[]>([]);
  const [routes, setRoutes] = useState<RouteData[]>([]);
  const [hydrated, setHydrated] = useState(false);
  const [activeSymbol, setActiveSymbol] = useState<SymbolData | null>(null);
  const [editSheetOpen, setEditSheetOpen] = useState(false);
  const [listSheetOpen, setListSheetOpen] = useState(false);
  const [createMode, setCreateMode] = useState(false);
  const [defaultCoordinates, setDefaultCoordinates] = useState<
    { lng: number; lat: number } | undefined
  >();
  const [currentMapStyle, setCurrentMapStyle] = useState<string>(
    MAP_STYLES.TACTICAL
  );
  const [currentTime, setCurrentTime] = useState<string>("");
  const [symbolSize, setSymbolSize] = useState<
    "small" | "medium" | "large" | "xxl"
  >("medium");
  const [viewState, setViewState] = useState<ViewState>({
    longitude: 73.09,
    latitude: 33.72,
    zoom: 10,
    bearing: 0,
    pitch: 0,
    padding: { top: 0, bottom: 0, left: 0, right: 0 },
  });
  const mapRef = useRef<MapRef>(null);
  const lastResultId = useRef<string | null>(null);
  const { toast } = useToast();
  const [state, formAction] = useActionState(
    getMapFeatureFromCommand,
    initialState
  );

  useEffect(() => {
    const snapshot = loadPlannerState();
    if (snapshot) {
      setSymbols(snapshot.symbols);
      setRoutes(snapshot.routes);
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    savePlannerState({ symbols, routes });
  }, [hydrated, symbols, routes]);

  useEffect(() => {
    const update = () => {
      const now = new Date();
      const utc = now.getTime() + now.getTimezoneOffset() * 60000;
      const offsetHours = tzOffsetHoursFromLongitude(viewState.longitude);
      const target = new Date(utc + offsetHours * 3600 * 1000);
      setCurrentTime(target.toLocaleTimeString());
    };
    update();
    const timer = setInterval(update, 1000);
    return () => clearInterval(timer);
  }, [viewState.longitude]);

  const handleViewStateChange = (newViewState: ViewState) => {
    setViewState(newViewState);
  };

  const formatCoordinate = (coord: number): string => {
    return coord.toFixed(6);
  };

  const formatScale = (zoom: number): string => {
    const scale = Math.round(559082264.028 / Math.pow(2, zoom));
    return `1:${scale.toLocaleString()}`;
  };

  useEffect(() => {
    if (!state.id || state.id === lastResultId.current) return;
    lastResultId.current = state.id;

    if (state.feature?.type === "symbol") {
      const { feature, metadata } = state.feature;
      const [longitude, latitude] = feature.geometry.coordinates;
      const symbolData = symbolFromMetadata(metadata, latitude, longitude);
      setSymbols((prev) => [...prev, symbolData]);
      mapRef.current?.flyTo({
        center: [longitude, latitude],
        zoom: 12,
      });
      toast({
        title: "Symbol Added",
        description: `Added symbol${symbolData.aiLabel ? ` for ${symbolData.aiLabel}` : ""}`,
      });
    }

    if (state.feature?.type === "route") {
      const route: RouteData = {
        id: `route-${state.id}`,
        ...state.feature.data,
      };
      setRoutes((prev) => [...prev, route]);
      mapRef.current?.fitBounds(
        [
          [route.start.lng, route.start.lat],
          [route.end.lng, route.end.lat],
        ],
        { padding: 64, duration: 1000 }
      );
      toast({
        title: "Route Added",
        description: route.pathType
          ? `Drew ${route.pathType}${route.unitInfo ? ` for ${route.unitInfo}` : ""}`
          : "Drew route on the map",
      });
    }

    if (state.error) {
      toast({
        variant: "destructive",
        title: "Command Error",
        description: state.error,
      });
    }
  }, [state, toast]);

  const handleAddSymbol = () => {
    setActiveSymbol(null);
    setCreateMode(true);
    setDefaultCoordinates({
      lng: viewState.longitude,
      lat: viewState.latitude,
    });
    setEditSheetOpen(true);
  };

  const handleMapDoubleClick = (coords: { lng: number; lat: number }) => {
    setActiveSymbol(null);
    setCreateMode(true);
    setDefaultCoordinates(coords);
    setEditSheetOpen(true);
  };

  const handleSymbolSave = (symbol: SymbolData) => {
    if (createMode) {
      setSymbols((prev) => [...prev, symbol]);
      toast({
        title: "Symbol Created",
        description: `Created symbol${symbol.aiLabel ? ` for ${symbol.aiLabel}` : ""}`,
      });
    } else {
      setSymbols((prev) => prev.map((s) => (s.id === symbol.id ? symbol : s)));
      toast({
        title: "Symbol Updated",
        description: `Updated symbol${symbol.aiLabel ? ` for ${symbol.aiLabel}` : ""}`,
      });
    }
    setCreateMode(false);
    setDefaultCoordinates(undefined);
    setEditSheetOpen(false);
  };

  const handleSymbolDragEnd = (
    symbolId: string,
    coords: { lng: number; lat: number }
  ) => {
    setSymbols((prev) =>
      prev.map((symbol) =>
        symbol.id === symbolId
          ? { ...symbol, longitude: coords.lng, latitude: coords.lat }
          : symbol
      )
    );
  };

  return (
    <div className="flex flex-col h-dvh bg-tactical-grid bg-[size:20px_20px]">
      <PlannerHeader
        currentTime={currentTime}
        onChangeMapStyle={(s) => setCurrentMapStyle(s)}
        onOpenList={() => setListSheetOpen(true)}
      />

      <div className="flex flex-1 overflow-hidden">
        <div className="flex-1 flex flex-col">
          <div className="flex-1 relative">
            <MapOverlay
              viewState={viewState}
              formatCoordinate={formatCoordinate}
              formatScale={formatScale}
            />

            <MapView
              ref={mapRef}
              symbols={symbols}
              routes={routes}
              onSymbolClick={(symbol: SymbolData) => {
                setActiveSymbol(symbol);
                setCreateMode(false);
                setEditSheetOpen(true);
              }}
              onMapDoubleClick={handleMapDoubleClick}
              onOpenCreateEditor={handleAddSymbol}
              onSymbolDragEnd={handleSymbolDragEnd}
              mapStyle={currentMapStyle}
              onViewStateChange={handleViewStateChange}
              symbolSize={symbolSize}
              onSymbolSizeChange={setSymbolSize}
              formAction={formAction}
            />
          </div>

          <div className="hidden lg:block">
            <CommandInputPanel formAction={formAction} />
          </div>
        </div>
      </div>

      <SymbolEditor
        open={editSheetOpen}
        onOpenChange={(open) => {
          setEditSheetOpen(open);
          if (!open) {
            setCreateMode(false);
            setDefaultCoordinates(undefined);
          }
        }}
        symbol={activeSymbol}
        createMode={createMode}
        defaultCoordinates={defaultCoordinates}
        onSave={handleSymbolSave}
        onDelete={(symbolId) => {
          setSymbols((prev) => prev.filter((s) => s.id !== symbolId));
          setEditSheetOpen(false);
          setCreateMode(false);
          setDefaultCoordinates(undefined);
          toast({
            title: "Symbol Removed",
            description: "Symbol has been removed from the map",
          });
        }}
      />

      <SymbolListSheet
        open={listSheetOpen}
        onOpenChange={setListSheetOpen}
        symbols={symbols}
        onSymbolSelect={(symbol: SymbolData) => {
          setListSheetOpen(false);
          setActiveSymbol(symbol);
          setEditSheetOpen(true);
          mapRef.current?.flyTo({
            center: [symbol.longitude, symbol.latitude],
            zoom: 14,
          });
        }}
      />
    </div>
  );
}
