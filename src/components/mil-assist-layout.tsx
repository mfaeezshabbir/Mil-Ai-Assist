"use client";

import { useEffect, useState, useRef } from "react";
import { useFormState } from "react-dom";
import type { MapRef, ViewState } from "react-map-gl";
import { getMapFeatureFromCommand } from "@/app/actions";
import { useToast } from "@/hooks/use-toast";
import type { SymbolData } from "@/types";
import { MapView, MAP_STYLES } from "@/components/map-view";
import PlannerHeader from "@/components/mil-layout/PlannerHeader";
import MapOverlay from "@/components/mil-layout/MapOverlay";
import { SymbolListSheet } from "./symbol-list-sheet";
import { SymbolEditor } from "./symbol-editor";
import CommandInputPanel from "@/components/mil-layout/CommandInput";
// import FloatingCommand from "@/components/mil-layout/FloatingCommand";

const initialState: { feature: any; error: string | null } = {
  feature: null,
  error: null,
};

const samplePrompts = [
  "Friendly infantry company 'Raptors' at 33.72, 73.09",
  "Damaged hostile armored battalion 'Thunder Run' at 33.68, 73.04",
  "Draw an air corridor for an F-16 from Lahore to Delhi",
  "Show a main attack route from the Khyber Pass to Kabul",
];

export function MilAssistLayout() {
  const [symbols, setSymbols] = useState<SymbolData[]>([]);
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
  const { toast } = useToast();
  const [state, formAction] = useFormState(
    getMapFeatureFromCommand,
    initialState
  );

  // Time now reflects timezone based on map center longitude
  const tzOffsetHoursFromLongitude = (longitude: number) => {
    // 15° longitude per hour
    let offset = Math.round(longitude / 15);
    if (offset < -12) offset = -12;
    if (offset > 14) offset = 14;
    return offset;
  };

  const formatTimeForLongitude = (longitude: number) => {
    const now = new Date();
    const utc = now.getTime() + now.getTimezoneOffset() * 60000;
    const offsetHours = tzOffsetHoursFromLongitude(longitude);
    const target = new Date(utc + offsetHours * 3600 * 1000);
    return target.toLocaleTimeString();
  };

  useEffect(() => {
    const update = () =>
      setCurrentTime(formatTimeForLongitude(viewState.longitude));
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
    // Approximate scale calculation based on zoom level
    const scale = Math.round(559082264.028 / Math.pow(2, zoom));
    return `1:${scale.toLocaleString()}`;
  };

  useEffect(() => {
    if (state.feature) {
      const { feature, metadata } = state.feature;
      if (!feature) return;

      const symbolData: SymbolData = {
        id: `sym-${Date.now()}`,
        displayType: "sidc",
        aiLabel: metadata?.aiLabel || undefined,
        context: "Reality",
        symbolStandardIdentity: metadata?.standardIdentity || "Friend",
        status: metadata?.status || "Present",
        hqtfd: metadata?.hqtfd || "Not Applicable",
        symbolSet: metadata?.symbolSet || "Land Unit",
        mainIconId: metadata?.mainIconId || "000000",
        modifier1: "00",
        modifier2: "00",
        symbolEchelon: metadata?.echelon || "Unit",
        latitude: feature.geometry.coordinates[1],
        longitude: feature.geometry.coordinates[0],
      };

      setSymbols((prev) => [...prev, symbolData]);
      toast({
        title: "Symbol Added",
        description: `Added symbol${symbolData.aiLabel ? ` for ${symbolData.aiLabel}` : ""}`,
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

  // Handle adding symbol via button click
  const handleAddSymbol = () => {
    setActiveSymbol(null);
    setCreateMode(true);
    setDefaultCoordinates(undefined); // Will use map center
    setEditSheetOpen(true);
  };

  // Handle adding symbol via double-click
  const handleMapDoubleClick = (coords: { lng: number; lat: number }) => {
    setActiveSymbol(null);
    setCreateMode(true);
    setDefaultCoordinates(coords);
    setEditSheetOpen(true);
  };

  // Handle symbol editor save with creation
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

  return (
    <div className="flex flex-col h-dvh bg-tactical-grid bg-[size:20px_20px]">
      <PlannerHeader
        currentTime={currentTime}
        onChangeMapStyle={(s) => setCurrentMapStyle(s)}
        onOpenList={() => setListSheetOpen(true)}
      />

      <div className="flex flex-1 overflow-hidden">
        {/* Main content area */}
        <div className="flex-1 flex flex-col">
          {/* Map area */}
          <div className="flex-1 relative">
            <MapOverlay
              viewState={viewState}
              formatCoordinate={formatCoordinate}
              formatScale={formatScale}
            />

            <MapView
              ref={mapRef}
              symbols={symbols}
              onSymbolClick={(symbol: SymbolData) => {
                setActiveSymbol(symbol);
                setCreateMode(false);
                setEditSheetOpen(true);
              }}
              onMapDoubleClick={handleMapDoubleClick}
              onAddSymbol={handleAddSymbol}
              mapStyle={currentMapStyle}
              onViewStateChange={handleViewStateChange}
              symbolSize={symbolSize}
              onSymbolSizeChange={setSymbolSize}
            />
          </div>

          {/* Keep inline command input on larger screens if desired */}
          <div className="hidden lg:block">
            <CommandInputPanel formAction={formAction} />
          </div>
          {/* Floating command button + sheet for mobile and quick access */}
          {/* <FloatingCommand formAction={formAction} /> */}
        </div>
      </div>

      {/* Symbol editing interface */}
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

      {/* Symbol list interface */}
      <SymbolListSheet
        open={listSheetOpen}
        onOpenChange={setListSheetOpen}
        symbols={symbols}
        onSymbolSelect={(symbol: SymbolData) => {
          setListSheetOpen(false);
          setActiveSymbol(symbol);
          setEditSheetOpen(true);
          if (mapRef.current) {
            mapRef.current.flyTo({
              center: [symbol.longitude, symbol.latitude],
              zoom: 14,
            });
          }
        }}
      />
    </div>
  );
}
