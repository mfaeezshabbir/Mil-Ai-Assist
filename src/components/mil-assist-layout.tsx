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
import type { ForceSide, RouteData, SymbolData } from "@/types";
import { MapView, MAP_STYLES } from "@/components/map-view";
import PlannerHeader from "@/components/mil-layout/PlannerHeader";
import MapOverlay from "@/components/mil-layout/MapOverlay";
import GameActionBar, {
  type OrderMode,
} from "@/components/mil-layout/GameActionBar";
import BattleTutorial from "@/components/mil-layout/BattleTutorial";
import TurnReport, {
  type TurnReportData,
} from "@/components/mil-layout/TurnReport";
import FloatingCommand from "@/components/mil-layout/FloatingCommand";
import WargameTray from "@/components/wargame-tray";
import { SymbolListSheet } from "./symbol-list-sheet";
import { SymbolEditor } from "./symbol-editor";
import { findFunctionId } from "@/lib/sidc-mappings";
import {
  loadPlannerState,
  savePlannerState,
  hasCompletedTutorial,
  markTutorialComplete,
} from "@/lib/planner-storage";
import { resolveTurn } from "@/lib/sim/turn";
import {
  countForces,
  countObjectives,
  isCombatUnit,
  unitLabel,
  withSimDefaults,
} from "@/lib/sim/units";
import { createPiece, type CatalogId } from "@/lib/sim/catalog";
import { sampleBattle } from "@/lib/sim/scenario";

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
  const [tutorialOpen, setTutorialOpen] = useState(false);
  const [turnReport, setTurnReport] = useState<TurnReportData | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [activeSymbol, setActiveSymbol] = useState<SymbolData | null>(null);
  const [editSheetOpen, setEditSheetOpen] = useState(false);
  const [listSheetOpen, setListSheetOpen] = useState(false);
  const [createMode, setCreateMode] = useState(false);
  const [deployId, setDeployId] = useState<CatalogId | null>(null);
  const [deploySide, setDeploySide] = useState<ForceSide>("Friend");
  const [lastCombatLine, setLastCombatLine] = useState<string | null>(null);
  const [aar, setAar] = useState<string[]>([]);
  const [defaultCoordinates, setDefaultCoordinates] = useState<
    { lng: number; lat: number } | undefined
  >();
  const [pickingLocation, setPickingLocation] = useState(false);
  const [aiOpen, setAiOpen] = useState(false);
  const [orderMode, setOrderMode] = useState<OrderMode>(null);
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
  const deployIdRef = useRef(deployId);
  const deploySideRef = useRef(deploySide);
  const pickingLocationRef = useRef(false);
  const orderModeRef = useRef<OrderMode>(null);
  const tutorialOpenRef = useRef(false);
  symbolsRef.current = symbols;
  selectedIdRef.current = selectedId;
  deployIdRef.current = deployId;
  deploySideRef.current = deploySide;
  orderModeRef.current = orderMode;
  tutorialOpenRef.current = tutorialOpen;
  const { toast } = useToast();
  const [state, formAction] = useActionState(
    getMapFeatureFromCommand,
    initialState
  );

  const selectedUnit = symbols.find((unit) => unit.id === selectedId) ?? null;
  const forces = countForces(symbols);
  const objectives = countObjectives(symbols);

  const placeCatalogPiece = (coords: { lat: number; lng: number }) => {
    const id = deployIdRef.current;
    if (!id) return;
    const piece = createPiece(id, coords, deploySideRef.current);
    setSymbols((prev) => [...prev, piece]);
    setSelectedId(piece.id);
    toast({
      title: "Piece placed",
      description: unitLabel(piece),
    });
  };

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

  const holdSelected = () => {
    const id = selectedIdRef.current;
    if (!id) return;
    setSymbols((prev) =>
      prev.map((unit) =>
        unit.id === id ? { ...unit, order: undefined } : unit
      )
    );
    setOrderMode("hold");
    toast({
      title: "Holding",
      description: "Unit will stay and fight in place",
    });
  };

  const clearSelection = () => {
    setSelectedId(null);
    setOrderMode(null);
    setDeployId(null);
  };

  useEffect(() => {
    const snapshot = loadPlannerState();
    if (snapshot) {
      setSymbols(snapshot.symbols);
      setRoutes(snapshot.routes);
      setTurn(snapshot.turn);
    }
    setHydrated(true);
    if (!hasCompletedTutorial()) setTutorialOpen(true);
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

  useEffect(() => {
    const canvas = mapRef.current?.getMap()?.getCanvas();
    if (!canvas) return;
    const previous = canvas.style.cursor;
    canvas.style.cursor = pickingLocation || orderMode === "move" ? "crosshair" : previous;
    return () => {
      canvas.style.cursor = previous;
    };
  }, [pickingLocation, orderMode]);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      const typing =
        event.target instanceof HTMLElement &&
        ["INPUT", "TEXTAREA"].includes(event.target.tagName);
      if (
        !typing &&
        (event.key === "?" || (event.key === "/" && event.shiftKey))
      ) {
        setTutorialOpen(true);
        return;
      }
      if (event.key !== "Escape") return;
      if (tutorialOpenRef.current) {
        markTutorialComplete();
        setTutorialOpen(false);
        return;
      }
      if (pickingLocationRef.current) {
        cancelLocationPick();
        return;
      }
      if (orderModeRef.current === "move") {
        setOrderMode(null);
        return;
      }
      clearSelection();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

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

  const beginLocationPick = (draft: SymbolData) => {
    pickingLocationRef.current = true;
    setActiveSymbol(draft);
    setPickingLocation(true);
    setDeployId(null);
    setEditSheetOpen(false);
  };

  const finishLocationPick = (coords: { lat: number; lng: number }) => {
    const lat = Math.round(coords.lat * 10000) / 10000;
    const lng = Math.round(coords.lng * 10000) / 10000;
    pickingLocationRef.current = false;
    setPickingLocation(false);
    setDefaultCoordinates({ lat, lng });
    setActiveSymbol((prev) =>
      prev ? { ...prev, latitude: lat, longitude: lng } : prev
    );
    setEditSheetOpen(true);
  };

  const cancelLocationPick = () => {
    pickingLocationRef.current = false;
    setPickingLocation(false);
    setEditSheetOpen(true);
  };

  const handleMapDoubleClick = (coords: { lng: number; lat: number }) => {
    if (pickingLocationRef.current) {
      finishLocationPick({ lat: coords.lat, lng: coords.lng });
      return;
    }
    if (mapClickTimer.current) {
      clearTimeout(mapClickTimer.current);
      mapClickTimer.current = null;
    }
    if (deployIdRef.current) {
      placeCatalogPiece({ lat: coords.lat, lng: coords.lng });
      return;
    }
    setActiveSymbol(null);
    setCreateMode(true);
    setDefaultCoordinates(coords);
    setEditSheetOpen(true);
  };

  const handleMapClick = (coords: { lng: number; lat: number }) => {
    if (pickingLocationRef.current) {
      if (mapClickTimer.current) {
        clearTimeout(mapClickTimer.current);
        mapClickTimer.current = null;
      }
      finishLocationPick({ lat: coords.lat, lng: coords.lng });
      return;
    }
    if (Date.now() < ignoreMapClickUntil.current) return;
    if (deployIdRef.current) {
      if (mapClickTimer.current) {
        clearTimeout(mapClickTimer.current);
        mapClickTimer.current = null;
      }
      placeCatalogPiece({ lat: coords.lat, lng: coords.lng });
      return;
    }
    if (!selectedId) return;
    if (orderModeRef.current !== "move") {
      if (mapClickTimer.current) {
        clearTimeout(mapClickTimer.current);
        mapClickTimer.current = null;
      }
      clearSelection();
      return;
    }
    if (mapClickTimer.current) clearTimeout(mapClickTimer.current);
    mapClickTimer.current = setTimeout(() => {
      mapClickTimer.current = null;
      const unit = symbolsRef.current.find(
        (item) => item.id === selectedIdRef.current
      );
      const id = selectedIdRef.current;
      if (!id || !unit || !isCombatUnit(unit)) return;
      assignMoveOrder(id, { lat: coords.lat, lng: coords.lng }, unitLabel(unit));
      setOrderMode(null);
    }, 280);
  };

  const handleSymbolClick = (symbol: SymbolData) => {
    if (pickingLocationRef.current) {
      finishLocationPick({ lat: symbol.latitude, lng: symbol.longitude });
      return;
    }
    ignoreMapClickUntil.current = Date.now() + 300;
    if (selectedIdRef.current === symbol.id) {
      clearSelection();
      return;
    }
    setDeployId(null);
    setSelectedId(symbol.id);
    setCreateMode(false);
    setEditSheetOpen(false);
    setOrderMode(null);
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
    const before = countForces(symbols);
    const result = resolveTurn(symbols);
    const after = countForces(result.units);
    setSymbols(result.units);
    setTurn((prev) => prev + 1);
    const summary = result.log[result.log.length - 1] ?? "No contact this turn";
    setLastCombatLine(summary);
    setAar(result.log.slice(-6));
    setTurnReport({
      turn,
      friendBefore: before.friend,
      friendAfter: after.friend,
      hostileBefore: before.hostile,
      hostileAfter: after.hostile,
      destroyed: result.log
        .filter((line) => line.toLowerCase().includes("destroyed"))
        .map((line) => line.replace(/\s+destroyed$/i, "")),
      lines: result.log,
    });
    if (selectedId && !result.units.some((unit) => unit.id === selectedId)) {
      setSelectedId(null);
    }
    if (result.victor === "friend") {
      toast({
        title:
          result.reason === "objectives"
            ? "Objectives held"
            : "Friendly force prevails",
        description: summary,
      });
    }
    if (result.victor === "hostile") {
      toast({
        variant: "destructive",
        title:
          result.reason === "objectives"
            ? "Objectives lost"
            : "Hostile force prevails",
        description: summary,
      });
    }
  };

  const loadSampleBattle = () => {
    const pieces = sampleBattle();
    setSymbols(pieces);
    setTurn(1);
    setSelectedId(null);
    setOrderMode(null);
    setDeployId(null);
    setLastCombatLine(null);
    setAar([]);
    setTurnReport(null);
    mapRef.current?.flyTo({
      center: [73.09, 33.71],
      zoom: 10.4,
    });
    toast({
      title: "Sample battle loaded",
      description: "Two forces, two objectives, mines and a FOB",
    });
  };

  const closeTutorial = () => {
    markTutorialComplete();
    setTutorialOpen(false);
  };

  return (
    <div className="flex flex-col h-dvh bg-background bg-tactical-grid bg-[size:24px_24px]">
      <PlannerHeader
        currentTime={currentTime}
        turn={turn}
        friendCount={forces.friend}
        hostileCount={forces.hostile}
        objFriend={objectives.friend}
        objHostile={objectives.hostile}
        objTotal={objectives.total}
        onChangeMapStyle={(s) => setCurrentMapStyle(s)}
        onOpenList={() => setListSheetOpen(true)}
        onOpenHelp={() => setTutorialOpen(true)}
      />

      <div className="flex flex-1 min-h-0 overflow-hidden p-2 pt-0">
        <div className="flex-1 flex flex-col min-h-0 border border-primary/25 bg-card/40">
          <div className={`flex-1 relative min-h-0 overflow-hidden ${pickingLocation ? "cursor-crosshair" : ""}`}>
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
            />

            <WargameTray
              deployId={deployId}
              deploySide={deploySide}
              onDeployId={setDeployId}
              onDeploySide={setDeploySide}
              onLoadSample={loadSampleBattle}
            />

            <MapOverlay
              viewState={viewState}
              formatCoordinate={formatCoordinate}
              formatScale={formatScale}
              lastCombatLine={turnReport ? null : lastCombatLine}
              aar={turnReport ? [] : aar}
              placing={!!deployId}
              pickingLocation={pickingLocation}
              moving={orderMode === "move" && !!selectedUnit && isCombatUnit(selectedUnit)}
              onCancelPick={cancelLocationPick}
              onCancelMove={() => setOrderMode(null)}
            />

            <TurnReport
              report={turnReport}
              onClose={() => setTurnReport(null)}
            />

            <GameActionBar
              selectedUnit={selectedUnit}
              turn={turn}
              queuedMoves={symbols.filter((unit) => unit.order?.type === "move").length}
              orderMode={orderMode}
              onOrderMode={(mode) =>
                setOrderMode((current) => (current === mode ? null : mode))
              }
              onHold={holdSelected}
              onClear={clearSelection}
              onEdit={() => {
                if (!selectedUnit) return;
                setActiveSymbol(selectedUnit);
                setCreateMode(false);
                setEditSheetOpen(true);
              }}
              onOpenAi={() => setAiOpen(true)}
              onEndTurn={handleResolveTurn}
              forceLine={`Blue ${forces.friend} · Red ${forces.hostile}`}
            />
          </div>
        </div>
      </div>

      <FloatingCommand
        formAction={formAction}
        open={aiOpen}
        onOpenChange={setAiOpen}
        hideTrigger
      />

      <SymbolEditor
        open={editSheetOpen}
        onOpenChange={(open) => {
          if (!open && pickingLocationRef.current) {
            setEditSheetOpen(false);
            return;
          }
          setEditSheetOpen(open);
          if (!open) {
            setCreateMode(false);
            setDefaultCoordinates(undefined);
            setPickingLocation(false);
            pickingLocationRef.current = false;
          }
        }}
        symbol={activeSymbol}
        createMode={createMode}
        defaultCoordinates={defaultCoordinates}
        onPickLocation={beginLocationPick}
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

      <BattleTutorial
        open={tutorialOpen}
        onClose={closeTutorial}
        onLoadSample={loadSampleBattle}
      />
    </div>
  );
}
