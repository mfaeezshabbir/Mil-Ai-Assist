"use client";

import { useEffect, useState, useRef } from "react";
import { useFormState, useFormStatus } from "react-dom";
import {
  Loader2,
  Send,
  Target,
  Shield,
  Radio,
  AlertTriangle,
  Clock,
  Info,
  MapPin,
  Crosshair,
  Map as MapIcon,
  Layers,
} from "lucide-react";
import type { MapRef, ViewState } from "react-map-gl";
import { getMapFeatureFromCommand } from "@/app/actions";
import { useToast } from "@/hooks/use-toast";
import type { SymbolData } from "@/types";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { MapView, MAP_STYLES, SYMBOL_SIZES } from "@/components/map-view";
import { Separator } from "./ui/separator";
import { SymbolListSheet } from "./symbol-list-sheet";
import { SymbolEditor } from "./symbol-editor";
import { Badge } from "./ui/badge";
import { findFunctionId } from "@/lib/sidc-mappings";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";

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

function CommandForm() {
  const { pending } = useFormStatus();

  return (
    <div className="relative">
      <div className="absolute left-3 top-3">
        <Crosshair className="h-4 w-4 text-muted-foreground" />
      </div>
      <Input
        name="command"
        className="pl-10 pr-20 h-12 bg-card/70 font-mono border-primary/30 shadow-tactical-inset focus-visible:ring-primary"
        placeholder="ENTER TACTICAL COMMAND..."
        disabled={pending}
        required
      />
      <Button
        className="absolute right-1 top-1 h-10 font-mono tracking-wide"
        size="sm"
        disabled={pending}
      >
        {pending ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            PROCESSING
          </>
        ) : (
          <>
            EXECUTE
            <Send className="ml-2 h-4 w-4" />
          </>
        )}
      </Button>
    </div>
  );
}

export function MilAssistLayout() {
  const [symbols, setSymbols] = useState<SymbolData[]>([]);
  const [activeSymbol, setActiveSymbol] = useState<SymbolData | null>(null);
  const [editSheetOpen, setEditSheetOpen] = useState(false);
  const [listSheetOpen, setListSheetOpen] = useState(false);
  const [currentMapStyle, setCurrentMapStyle] = useState<string>(
    MAP_STYLES.TACTICAL
  );
  const [currentTime, setCurrentTime] = useState<string>(
    new Date().toLocaleTimeString()
  );
  const [symbolSize, setSymbolSize] = useState<
    "small" | "medium" | "large" | "xxl"
  >("medium");
  const [viewState, setViewState] = useState<ViewState>({
    longitude: 0,
    latitude: 0,
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

  // Live time update
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date().toLocaleTimeString());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

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

  return (
    <div className="flex flex-col h-dvh bg-tactical-grid bg-[size:20px_20px]">
      {/* Military-style header */}
      <header className="border-b border-tactical border-primary/50 bg-background/90 backdrop-blur-sm shadow-tactical z-10">
        <div className="container mx-auto h-14 flex items-center justify-between px-4">
          <div className="flex items-center gap-4">
            <div className="flex items-center">
              <Shield className="h-5 w-5 text-primary mr-2" />
              <h1 className="text-lg font-display font-bold uppercase tracking-wider">
                MilAIAssist
              </h1>
            </div>
            <div className="hidden md:flex items-center">
              <Separator orientation="vertical" className="h-6 mx-4" />
              <Badge
                variant="outline"
                className="font-mono text-xs tracking-wide px-2 py-0 border-primary/30"
              >
                MISSION PLANNER
              </Badge>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Badge
              variant="secondary"
              className="font-mono text-xs gap-1 border border-primary/20"
            >
              <Clock className="h-3 w-3" />
              <span>{currentTime}</span>
            </Badge>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="font-mono text-xs border-primary/30"
                >
                  <Layers className="h-3 w-3 mr-1" />
                  MAP STYLE
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem
                  onClick={() => setCurrentMapStyle(MAP_STYLES.TACTICAL)}
                >
                  Tactical (Dark)
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => setCurrentMapStyle(MAP_STYLES.SATELLITE)}
                >
                  Satellite
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => setCurrentMapStyle(MAP_STYLES.TERRAIN)}
                >
                  Terrain
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => setCurrentMapStyle(MAP_STYLES.STREETS)}
                >
                  Streets
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <Button
              variant="outline"
              size="sm"
              className="font-mono text-xs border-primary/30"
              onClick={() => setListSheetOpen(true)}
            >
              SYMBOL LIST
            </Button>
          </div>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Main content area */}
        <div className="flex-1 flex flex-col">
          {/* Map area */}
          <div className="flex-1 relative">
            {/* Military-style map overlay frame */}
            <div className="absolute inset-0 pointer-events-none border-2 border-tactical border-primary/30 z-10">
              <div className="absolute top-2 left-2 bg-background/80 backdrop-blur-sm px-2 py-1 text-xs font-mono text-primary/70 rounded-sm border border-primary/20">
                <div className="flex items-center gap-1">
                  <Target className="h-3 w-3" />
                  <span>GRID: 31TDF08269735</span>
                </div>
              </div>
              <div className="absolute top-2 right-2 bg-background/80 backdrop-blur-sm px-2 py-1 text-xs font-mono text-primary/70 rounded-sm border border-primary/20">
                <div className="flex items-center gap-1">
                  <MapPin className="h-3 w-3" />
                  <span>
                    {formatCoordinate(viewState.latitude)}°N,{" "}
                    {formatCoordinate(viewState.longitude)}°E
                  </span>
                </div>
              </div>
              <div className="absolute bottom-2 left-2 bg-background/80 backdrop-blur-sm px-2 py-1 text-xs font-mono text-primary/70 rounded-sm border border-primary/20">
                <div className="flex items-center gap-1">
                  <Info className="h-3 w-3" />
                  <span>SCALE: {formatScale(viewState.zoom)}</span>
                </div>
              </div>
              <div className="absolute bottom-2 right-12 bg-destructive/20 backdrop-blur-sm px-2 py-1 text-xs font-mono text-destructive rounded-sm border border-destructive/30">
                <div className="flex items-center gap-1">
                  <AlertTriangle className="h-3 w-3" />
                  <span>EXERCISE // NOT ACTUAL</span>
                </div>
              </div>
            </div>

            <MapView
              ref={mapRef}
              symbols={symbols}
              onSymbolClick={(symbol: SymbolData) => {
                  setActiveSymbol(symbol);
                  setEditSheetOpen(true);
                }}
              mapStyle={currentMapStyle}
              onViewStateChange={handleViewStateChange}
              symbolSize={symbolSize}
              onSymbolSizeChange={setSymbolSize}
            />
          </div>

          {/* Command input area with military styling */}
          <div className="p-4 border-t border-tactical border-primary/30 bg-background/90 backdrop-blur-sm">
            <form action={formAction} className="space-y-2">
              <div className="flex items-center justify-between mb-2">
                <Label
                  htmlFor="command"
                  className="text-sm font-display uppercase tracking-wide text-primary"
                >
                  TACTICAL COMMAND INPUT
                </Label>
                <Badge
                  variant="outline"
                  className="font-mono text-xs border-primary/30"
                >
                  <Radio className="h-3 w-3 mr-1 animate-tactical-pulse" />
                  SECURE CHANNEL
                </Badge>
              </div>
              <CommandForm />

              <div className="text-xs text-muted-foreground font-mono mt-1">
                Example:{" "}
                <span className="text-primary/80">
                  "Place an infantry platoon at grid 31TDF0826973541"
                </span>
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* Symbol editing interface */}
      <SymbolEditor
        open={editSheetOpen}
        onOpenChange={setEditSheetOpen}
        symbol={activeSymbol}
        onSave={(updatedSymbol) => {
          setSymbols((prev) =>
            prev.map((s) => (s.id === updatedSymbol.id ? updatedSymbol : s))
          );
          setEditSheetOpen(false);
          toast({
            title: "Symbol Updated",
            description: `Updated symbol${updatedSymbol.aiLabel ? ` for ${updatedSymbol.aiLabel}` : ""}`,
          });
        }}
        onDelete={(symbolId) => {
          setSymbols((prev) => prev.filter((s) => s.id !== symbolId));
          setEditSheetOpen(false);
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
