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
} from "lucide-react";
import type { MapRef } from "react-map-gl";
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
import { MapView } from "@/components/map-view";
import { Separator } from "./ui/separator";
import { SymbolListSheet } from "./symbol-list-sheet";
import { SymbolEditor } from "./symbol-editor";
import { Badge } from "./ui/badge";
import { findFunctionId } from "@/lib/sidc-mappings";

const initialState: { feature: any; error: string | null } = {
  feature: null,
  error: null,
};

const initialSymbols: SymbolData[] = [
  {
    id: "initial-1",
    displayType: "sidc",
    uniqueDesignation: "Alpha Company",
    context: "Reality",
    symbolStandardIdentity: "Friend",
    status: "Present",
    hqtfd: "Not Applicable",
    symbolSet: "Land Unit",
    functionId: "121100", // Infantry
    modifier1: "00",
    modifier2: "00",
    symbolEchelon: "Company",
    latitude: 33.72,
    longitude: 73.09,
  },
  {
    id: "initial-2",
    displayType: "sidc",
    uniqueDesignation: "Enemy Armor",
    context: "Reality",
    symbolStandardIdentity: "Hostile",
    status: "Damaged",
    hqtfd: "Not Applicable",
    symbolSet: "Land Unit",
    functionId: "120500", // Armour
    modifier1: "00",
    modifier2: "00",
    symbolEchelon: "Battalion",
    latitude: 33.68,
    longitude: 73.04,
  },
];

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
  const [symbols, setSymbols] = useState<SymbolData[]>(initialSymbols);
  const [activeSymbol, setActiveSymbol] = useState<SymbolData | null>(null);
  const [editSheetOpen, setEditSheetOpen] = useState(false);
  const [listSheetOpen, setListSheetOpen] = useState(false);
  const mapRef = useRef<MapRef>(null);
  const { toast } = useToast();
  const [state, formAction] = useFormState(
    getMapFeatureFromCommand,
    initialState
  );

  useEffect(() => {
    if (state.feature) {
      const { feature, metadata } = state.feature;
      if (!feature) return;

      const symbolData: SymbolData = {
        id: `sym-${Date.now()}`,
        displayType: "sidc",
        uniqueDesignation: metadata?.uniqueDesignation || "Unknown",
        context: "Reality",
        symbolStandardIdentity: metadata?.standardIdentity || "Friend",
        status: metadata?.status || "Present",
        hqtfd: metadata?.hqtfd || "Not Applicable",
        symbolSet: metadata?.symbolSet || "Land Unit",
        functionId: findFunctionId(metadata?.functionId) ?? "",
        modifier1: "00",
        modifier2: "00",
        symbolEchelon: metadata?.echelon || "Unit",
        latitude: feature.geometry.coordinates[1],
        longitude: feature.geometry.coordinates[0],
      };

      setSymbols((prev) => [...prev, symbolData]);
      toast({
        title: "Symbol Added",
        description: `Added symbol for ${symbolData.uniqueDesignation}`,
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
              <span>{new Date().toLocaleTimeString()}</span>
            </Badge>
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
                  <span>33.72°N, 73.09°E</span>
                </div>
              </div>
              <div className="absolute bottom-2 left-2 bg-background/80 backdrop-blur-sm px-2 py-1 text-xs font-mono text-primary/70 rounded-sm border border-primary/20">
                <div className="flex items-center gap-1">
                  <Info className="h-3 w-3" />
                  <span>SCALE: 1:50,000</span>
                </div>
              </div>
              <div className="absolute bottom-2 right-2 bg-destructive/20 backdrop-blur-sm px-2 py-1 text-xs font-mono text-destructive rounded-sm border border-destructive/30">
                <div className="flex items-center gap-1">
                  <AlertTriangle className="h-3 w-3" />
                  <span>EXERCISE // NOT ACTUAL</span>
                </div>
              </div>
            </div>

            <MapView
              symbols={symbols}
              onSymbolClick={(symbol) => {
                setActiveSymbol(symbol);
                setEditSheetOpen(true);
              }}
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
        onSave={(updatedSymbol: SymbolData) => {
          setSymbols((prev: SymbolData[]) =>
            prev.map((s: SymbolData) =>
              s.id === updatedSymbol.id ? updatedSymbol : s
            )
          );
          setEditSheetOpen(false);
          toast({
            title: "Symbol Updated",
            description: `Updated symbol for ${updatedSymbol.uniqueDesignation}`,
          });
        }}
        onDelete={(symbolId: string) => {
          setSymbols((prev: SymbolData[]) =>
            prev.filter((s: SymbolData) => s.id !== symbolId)
          );
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
        onSymbolSelect={(symbol) => {
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
