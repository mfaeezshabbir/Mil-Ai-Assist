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
import { resolveTurn } from "@/lib/sim/turn";
import {
  countForces,
  unitLabel,
  withSimDefaults,
} from "@/lib/sim/units";

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

function findByLabel(units: SymbolData[], label?: string) {
  if (!label) return undefined;
  const key = label.trim().toLowerCase();
  if (!key) return undefined;
  return units.find((unit) => unit.aiLabel?.trim().toLowerCase() === key);
}

function symbolFromMetadata(
  metadata: SIDCMetadataOutput,
  latitude: number,
  longitude: number
): SymbolData {
  const symbolSet = metadata.symbolSet || "Land Unit";
  const mainIconId =
    findFunctionId(symbolSet, metadata.symbolCategory) || "000000";

  return withSimDefaults({
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
  });
}

export function MilAssistLayout() {
  const [symbols, setSymbols] = useState<SymbolData[]>([]);
  const [routes, setRoutes] = useState<RouteData[]>([]);
  const [turn, setTurn] = useState(1);
  const [hydrated, setHydrated] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [activeSymbol, setActiveSymbol] = useState<SymbolData | null>(null);
  const [editSheetOpen, setEditSheetOpen] = useState(false);
  const [listSheetOpen, setListSheetOpen] = useState(false);
  const [createMode, setCreateMode] = useState(false);
  const [lastCombatLine, setLastCombatLine] = useState<string | null>(null);
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
  const ignoreMapClickUntil = useRef(0);
  const mapClickTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const symbolsRef = useRef(symbols);
  const selectedIdRef = useRef(selectedId);
  symbolsRef.current = symbols;
  selectedIdRef.current = selectedId;
  const { toast } = useToast();
  const [state, formAction] = useActionState(
    getMapFeatureFromCommand,
    initialState
  );

  const selectedUnit = symbols.find((unit) => unit.id === selectedId) ?? null;
  const forces = countForces(symbols);

  const assignMoveOrder = (
    unitId: string,
    dest: { lat: number; lng: number },
    label?: string
  ) => {
    setSymbols((prev) =>
      prev.map((unit) =>
        unit.id === unitId
          ? {
              ...unit,
              order: {
                type: "move",
                destLat: dest.lat,
                destLng: dest.lng,
              },
            }
          : unit
      )
    );
    toast({
      title: "Order queued",
      description: `${label ?? "Unit"} will move next turn`,
    });
  };

  useEffect(() => {
    const snapshot = loadPlannerState();
    if (snapshot) {
      setSymbols(snapshot.symbols);
      setRoutes(snapshot.routes);
      setTurn(snapshot.turn);
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    savePlannerState({ symbols, routes, turn });
  }, [hydrated, symbols, routes, turn]);

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
      const existing = findByLabel(symbolsRef.current, metadata.aiLabel);
      if (existing) {
        assignMoveOrder(
          existing.id,
          { lat: latitude, lng: longitude },
          unitLabel(existing)
        );
        setSelectedId(existing.id);
        mapRef.current?.flyTo({ center: [longitude, latitude], zoom: 11 });
      } else {
        const symbolData = symbolFromMetadata(metadata, latitude, longitude);
        setSymbols((prev) => [...prev, symbolData]);
        setSelectedId(symbolData.id);
        mapRef.current?.flyTo({
          center: [longitude, latitude],
          zoom: 12,
        });
        toast({
          title: "Unit deployed",
          description: `Placed ${unitLabel(symbolData)}`,
        });
      }
    }

    if (state.feature?.type === "route") {
      const route: RouteData = {
        id: `route-${state.id}`,
        ...state.feature.data,
      };
      const match =
        findByLabel(symbolsRef.current, route.unitInfo) ||
        (selectedIdRef.current
          ? symbolsRef.current.find((unit) => unit.id === selectedIdRef.current)
          : undefined);

      if (match) {
        assignMoveOrder(
          match.id,
          { lat: route.end.lat, lng: route.end.lng },
          unitLabel(match)
        );
        setSelectedId(match.id);
      } else {
        const spawned = withSimDefaults({
          id: `sym-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
          displayType: "sidc",
          aiLabel: route.unitInfo,
          context: "Reality",
          symbolStandardIdentity: "Friend",
          status: "Present",
          hqtfd: "Not Applicable",
          symbolSet: "Land Unit",
          mainIconId: findFunctionId("Land Unit", "Infantry") || "000000",
          modifier1: "00",
          modifier2: "00",
          symbolEchelon: "Company",
          latitude: route.start.lat,
          longitude: route.start.lng,
          order: {
            type: "move",
            destLat: route.end.lat,
            destLng: route.end.lng,
          },
        });
        setSymbols((prev) => [...prev, spawned]);
        setSelectedId(spawned.id);
        toast({
          title: "Unit deployed",
          description: `${unitLabel(spawned)} ordered along the route`,
        });
      }

      setRoutes((prev) => [...prev, route]);
      mapRef.current?.fitBounds(
        [
          [route.start.lng, route.start.lat],
          [route.end.lng, route.end.lat],
        ],
        { padding: 64, duration: 1000 }
      );
    }

    if (state.error) {
      toast({
        variant: "destructive",
        title: "Command Error",
        description: state.error,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- handle each command result once by id
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
    if (mapClickTimer.current) {
      clearTimeout(mapClickTimer.current);
      mapClickTimer.current = null;
    }
    setActiveSymbol(null);
    setCreateMode(true);
    setDefaultCoordinates(coords);
    setEditSheetOpen(true);
  };

  const handleMapClick = (coords: { lng: number; lat: number }) => {
    if (Date.now() < ignoreMapClickUntil.current) return;
    if (!selectedId) return;
    if (mapClickTimer.current) clearTimeout(mapClickTimer.current);
    mapClickTimer.current = setTimeout(() => {
      mapClickTimer.current = null;
      const unit = symbolsRef.current.find(
        (item) => item.id === selectedIdRef.current
      );
      const id = selectedIdRef.current;
      if (!id || !unit) return;
      assignMoveOrder(id, { lat: coords.lat, lng: coords.lng }, unitLabel(unit));
    }, 280);
  };

  const handleSymbolClick = (symbol: SymbolData) => {
    ignoreMapClickUntil.current = Date.now() + 300;
    setSelectedId(symbol.id);
    setCreateMode(false);
    setEditSheetOpen(false);
  };

  const handleSymbolSave = (symbol: SymbolData) => {
    const withDefaults = withSimDefaults(symbol);
    if (createMode) {
      setSymbols((prev) => [...prev, withDefaults]);
      setSelectedId(withDefaults.id);
      toast({
        title: "Unit deployed",
        description: `Created ${unitLabel(withDefaults)}`,
      });
    } else {
      setSymbols((prev) =>
        prev.map((s) => (s.id === withDefaults.id ? withDefaults : s))
      );
      toast({
        title: "Unit updated",
        description: `Updated ${unitLabel(withDefaults)}`,
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

  const handleResolveTurn = () => {
    const result = resolveTurn(symbols);
    setSymbols(result.units);
    setTurn((prev) => prev + 1);
    const summary = result.log[result.log.length - 1] ?? "No contact this turn";
    setLastCombatLine(summary);
    if (selectedId && !result.units.some((unit) => unit.id === selectedId)) {
      setSelectedId(null);
    }
    toast({
      title: `Turn resolved`,
      description:
        result.log.length > 0
          ? result.log.slice(0, 2).join(" · ")
          : "Forces moved. No engagement.",
    });
    if (result.victor === "friend") {
      toast({ title: "Friendly force prevails", description: summary });
    }
    if (result.victor === "hostile") {
      toast({
        variant: "destructive",
        title: "Hostile force prevails",
        description: summary,
      });
    }
  };

  return (
    <div className="flex flex-col h-dvh bg-tactical-grid bg-[size:20px_20px]">
      <PlannerHeader
        currentTime={currentTime}
        turn={turn}
        friendCount={forces.friend}
        hostileCount={forces.hostile}
        onChangeMapStyle={(s) => setCurrentMapStyle(s)}
        onOpenList={() => setListSheetOpen(true)}
        onResolveTurn={handleResolveTurn}
      />

      <div className="flex flex-1 overflow-hidden">
        <div className="flex-1 flex flex-col">
          <div className="flex-1 relative">
            <MapOverlay
              viewState={viewState}
              formatCoordinate={formatCoordinate}
              formatScale={formatScale}
              selectedUnit={selectedUnit}
              lastCombatLine={lastCombatLine}
            />

            <MapView
              ref={mapRef}
              symbols={symbols}
              routes={routes}
              selectedSymbolId={selectedId}
              onSymbolClick={handleSymbolClick}
              onMapClick={handleMapClick}
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
          if (selectedId === symbolId) setSelectedId(null);
          toast({
            title: "Unit removed",
            description: "Unit has been removed from the theater",
          });
        }}
      />

      <SymbolListSheet
        open={listSheetOpen}
        onOpenChange={setListSheetOpen}
        symbols={symbols}
        onSymbolSelect={(symbol: SymbolData) => {
          setListSheetOpen(false);
          setSelectedId(symbol.id);
          setActiveSymbol(symbol);
          setCreateMode(false);
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
