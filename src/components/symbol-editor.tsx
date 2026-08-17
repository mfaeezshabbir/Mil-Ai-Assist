"use client";

import React, { useEffect, useMemo, useState } from "react";
import type { ForceSide, SymbolData } from "@/types";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ScrollArea } from "./ui/scroll-area";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { toTitleCase } from "@/lib/utils";
import {
  sidcEnumMapping,
  getFunctionIdName,
  amplifierData,
  getEmtOptionsForSymbolSet,
  getSymbolSetData,
} from "@/lib/sidc-mappings";
import { TrackSymbol } from "./track-symbol";
import { SidcGlyph } from "./sidc-glyph";
import { LocationPicker } from "./location-picker";
import {
  applySIDC,
  compactSIDC,
  formatSIDC,
  generateSIDC,
  validateSIDC,
} from "@/lib/sidc-generator";
import { withSimDefaults } from "@/lib/sim/units";
import {
  CATALOG,
  getCatalog,
  type CatalogEntry,
} from "@/lib/sim/catalog";
import {
  TRACK_COLORS,
  trackIdentity,
} from "@/lib/sim/track-style";
import { ChevronDown, Upload } from "lucide-react";

export type SymbolEditorProps = {
  symbol: SymbolData | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpdate?: (symbol: SymbolData) => void;
  onSave: (symbol: SymbolData) => void;
  onDelete: (symbolId: string) => void;
  createMode?: boolean;
  defaultCoordinates?: { lng: number; lat: number };
  onPickLocation?: (draft: SymbolData) => void;
};

const SIZE_CHIPS = ["Team", "Squad", "Platoon", "Company", "Battalion"] as const;
const FORCES: { id: ForceSide; label: string; sub: string }[] = [
  { id: "Friend", label: "Blue", sub: "Friendly" },
  { id: "Hostile", label: "Red", sub: "Hostile" },
  { id: "Neutral", label: "Green", sub: "Neutral" },
];

const contexts = ["Reality", "Exercise", "Simulation"] as const;
const statuses = [
  "Present",
  "Planned",
  "Fully Capable",
  "Damaged",
  "Destroyed",
  "Full to Capacity",
] as const;
const hqtfds = [
  "Not Applicable",
  "Feint Dummy",
  "Headquarters",
  "Feint Dummy Headquarters",
  "Task Force",
  "Feint Dummy Task Force",
  "Task Force Headquarters",
  "Feint Dummy Task Force Headquarters",
] as const;
const symbolSets = Object.keys(sidcEnumMapping.symbolSet).map((key) => ({
  name: toTitleCase(key.replace(/_/g, " ")),
  code: sidcEnumMapping.symbolSet[
    key as keyof typeof sidcEnumMapping.symbolSet
  ],
}));

function normalize(str: string | undefined): string {
  if (!str) return "";
  return str.replace(/\s+/g, "_").toUpperCase();
}

function applyCatalog(
  symbol: SymbolData,
  entry: CatalogEntry
): SymbolData {
  const keepName =
    symbol.aiLabel &&
    symbol.aiLabel !== getCatalog(symbol.catalogId)?.name
      ? symbol.aiLabel
      : entry.name;
  return {
    ...symbol,
    catalogId: entry.id,
    pieceKind: entry.pieceKind,
    symbolSet: entry.symbolSet,
    mainIconId: entry.mainIconId,
    modifier1: "00",
    modifier2: "00",
    symbolEchelon: entry.echelon ?? symbol.symbolEchelon ?? "Company",
    attack: entry.attack,
    defense: entry.defense,
    rangeKm: entry.rangeKm,
    speedKmPerTurn: entry.speedKmPerTurn,
    hqtfd: entry.id === "hq" ? "Headquarters" : "Not Applicable",
    displayType: "sidc",
    imageUrl: undefined,
    aiLabel: keepName,
    controlledBy:
      entry.pieceKind === "objective"
        ? (symbol.controlledBy ?? "Neutral")
        : undefined,
  };
}

function catalogPreview(
  entry: CatalogEntry,
  side: SymbolData["symbolStandardIdentity"]
): SymbolData {
  return {
    id: `preview-${entry.id}`,
    displayType: "sidc",
    aiLabel: entry.name,
    context: "Reality",
    symbolStandardIdentity: side,
    status: "Present",
    hqtfd: "Not Applicable",
    symbolSet: entry.symbolSet,
    mainIconId: entry.mainIconId,
    modifier1: "00",
    modifier2: "00",
    symbolEchelon: entry.echelon,
    latitude: 0,
    longitude: 0,
    pieceKind: entry.pieceKind,
    catalogId: entry.id,
  };
}

export function SymbolEditor({
  symbol,
  open,
  onOpenChange,
  onSave,
  onDelete,
  createMode = false,
  defaultCoordinates,
  onPickLocation,
}: SymbolEditorProps) {
  const createDefaultSymbol = React.useCallback((): SymbolData => {
    const base: SymbolData = {
      id: `sym-${Date.now()}`,
      displayType: "sidc",
      context: "Reality",
      symbolStandardIdentity: "Friend",
      status: "Present",
      hqtfd: "Not Applicable",
      symbolSet: "Land Unit",
      mainIconId: "121100",
      modifier1: "00",
      modifier2: "00",
      symbolEchelon: "Company",
      latitude: defaultCoordinates?.lat || 33.72,
      longitude: defaultCoordinates?.lng || 73.09,
      aiLabel: "Infantry",
      strength: 100,
    };
    const infantry = getCatalog("infantry");
    return infantry ? applyCatalog(base, infantry) : base;
  }, [defaultCoordinates]);

  const [editedSymbol, setEditedSymbol] = useState<SymbolData | null>(
    createMode && !symbol ? createDefaultSymbol() : symbol
  );
  const [sidcDraft, setSidcDraft] = useState("");
  const [advancedOpen, setAdvancedOpen] = useState(false);

  useEffect(() => {
    const next = createMode && !symbol ? createDefaultSymbol() : symbol;
    setEditedSymbol(next);
    setSidcDraft("");
    setAdvancedOpen(false);
  }, [symbol, createMode, defaultCoordinates, createDefaultSymbol, open]);

  const preview = useMemo(
    () => (editedSymbol ? withSimDefaults(editedSymbol) : null),
    [editedSymbol]
  );
  const sidc = useMemo(
    () => (editedSymbol ? generateSIDC(editedSymbol) : ""),
    [editedSymbol]
  );
  const sidcValid = useMemo(() => (sidc ? validateSIDC(sidc) : false), [sidc]);

  if (!editedSymbol) return null;

  const currentSetData = getSymbolSetData(editedSymbol.symbolSet || "");
  const currentSetCode =
    sidcEnumMapping.symbolSet[
      normalize(editedSymbol.symbolSet) as keyof typeof sidcEnumMapping.symbolSet
    ] || "10";
  const currentEmtOptions = getEmtOptionsForSymbolSet(currentSetCode);
  const identity = trackIdentity(editedSymbol.symbolStandardIdentity);
  const paint = TRACK_COLORS[identity];
  const selectedCatalog =
    getCatalog(editedSymbol.catalogId) ||
    CATALOG.find((entry) => entry.mainIconId === editedSymbol.mainIconId);
  const combat = CATALOG.filter((entry) => entry.group === "combat");
  const board = CATALOG.filter((entry) => entry.group === "board");
  const strength = Math.max(10, Math.min(100, preview?.strength ?? 100));
  const unitTitle =
    editedSymbol.aiLabel ||
    selectedCatalog?.name ||
    getFunctionIdName(editedSymbol.symbolSet, editedSymbol.mainIconId);

  const handleChange = (
    field: keyof SymbolData,
    value: string | number | undefined
  ) => {
    setEditedSymbol({ ...editedSymbol, [field]: value });
  };

  const pickForce = (side: ForceSide) => {
    setEditedSymbol({
      ...editedSymbol,
      symbolStandardIdentity: side,
      controlledBy:
        editedSymbol.pieceKind === "objective"
          ? side
          : editedSymbol.controlledBy,
    });
  };

  const pickCatalog = (entry: CatalogEntry) => {
    setEditedSymbol(applyCatalog(editedSymbol, entry));
  };

  const applyDraftSidc = () => {
    const compact = compactSIDC(sidcDraft);
    if (compact.length !== 20) return;
    setEditedSymbol((prev) => (prev ? applySIDC(prev, compact) : prev));
    setSidcDraft("");
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (loadEvent) => {
      const imageUrl = loadEvent.target?.result as string;
      setEditedSymbol((prev) =>
        prev ? { ...prev, imageUrl, displayType: "image" } : null
      );
    };
    reader.readAsDataURL(file);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl w-[min(1180px,96vw)] p-0 gap-0 overflow-hidden bg-card border-primary/35">
        <DialogHeader className="px-5 py-3 border-b border-primary/20">
          <DialogTitle className="tracking-[0.18em]">
            {createMode ? "Deploy unit" : "Refit unit"}
          </DialogTitle>
          <DialogDescription className="text-[11px]">
            Pick a force, a piece, and a drop point on the map.
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] min-h-[560px]">
          <aside
            className="relative p-5 flex flex-col items-center gap-4 border-r border-primary/20"
            style={{
              background: `radial-gradient(circle at 50% 20%, ${paint.fill}, transparent 70%)`,
            }}
          >
            <div
              className="relative flex items-center justify-center w-[9.5rem] h-[9.5rem]"
              style={{
                boxShadow: `0 0 28px ${paint.glow}`,
              }}
            >
              <TrackSymbol symbol={editedSymbol} size={118} selected />
            </div>

            <div className="text-center w-full">
              <div className="font-display text-xl tracking-[0.12em] uppercase text-foreground">
                {unitTitle}
              </div>
              <div className="mt-1 font-mono text-[10px] tracking-[0.22em] uppercase"
                style={{ color: paint.stroke }}
              >
                {selectedCatalog?.name || "Custom"} · {editedSymbol.symbolEchelon || "Unspecified"}
              </div>
            </div>

            <div className="w-full space-y-1.5">
              <div className="flex justify-between font-mono text-[10px] tracking-widest uppercase text-muted-foreground">
                <span>Strength</span>
                <span style={{ color: paint.stroke }}>{strength}%</span>
              </div>
              <div className="h-2 border border-primary/20 bg-black/40">
                <div
                  className="h-full"
                  style={{
                    width: `${strength}%`,
                    background: paint.stroke,
                    boxShadow: `0 0 10px ${paint.glow}`,
                  }}
                />
              </div>
            </div>

            {preview && (
              <div className="grid grid-cols-2 gap-2 w-full">
                {[
                  ["Attack", preview.attack],
                  ["Armor", preview.defense],
                  ["Range", `${preview.rangeKm} km`],
                  ["Speed", `${preview.speedKmPerTurn}`],
                ].map(([label, value]) => (
                  <div
                    key={String(label)}
                    className="border border-primary/20 bg-black/35 px-3 py-2"
                  >
                    <div className="font-mono text-[9px] tracking-[0.2em] uppercase text-muted-foreground">
                      {label}
                    </div>
                    <div className="font-display text-lg leading-none mt-1">
                      {value ?? "—"}
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="mt-auto w-full flex items-center justify-between border border-primary/20 bg-black/30 px-3 py-2">
              <div>
                <div className="font-mono text-[9px] tracking-[0.2em] uppercase text-muted-foreground">
                  NATO 2525
                </div>
                <div className="font-mono text-[10px] text-primary/80 truncate max-w-[8rem]">
                  {sidcValid ? "Ready" : "Check symbol"}
                </div>
              </div>
              <div
                className="bg-[#f4f6f2] p-1"
                title={formatSIDC(sidc)}
              >
                <SidcGlyph symbol={editedSymbol} size={44} />
              </div>
            </div>
          </aside>

          <div className="p-4">
            <ScrollArea className="h-[560px] pr-3">
              <div className="space-y-5">
                <section>
                  <SectionLabel>Force</SectionLabel>
                  <div className="grid grid-cols-3 gap-2">
                    {FORCES.map((force) => {
                      const active =
                        editedSymbol.symbolStandardIdentity === force.id;
                      const color = TRACK_COLORS[trackIdentity(force.id)];
                      return (
                        <button
                          key={force.id}
                          type="button"
                          onClick={() => pickForce(force.id)}
                          className="px-3 py-3 border text-left"
                          style={{
                            borderColor: active ? color.stroke : "hsl(186 88% 48% / 0.2)",
                            background: active ? color.fill : "transparent",
                            boxShadow: active ? `0 0 16px ${color.glow}` : "none",
                          }}
                        >
                          <div
                            className="font-display text-sm tracking-[0.16em] uppercase"
                            style={{ color: active ? color.stroke : undefined }}
                          >
                            {force.label}
                          </div>
                          <div className="font-mono text-[10px] tracking-widest uppercase text-muted-foreground">
                            {force.sub}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </section>

                <section>
                  <SectionLabel>Unit</SectionLabel>
                  <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                    {combat.map((entry) => {
                      const active = selectedCatalog?.id === entry.id;
                      return (
                        <button
                          key={entry.id}
                          type="button"
                          onClick={() => pickCatalog(entry)}
                          className={`flex flex-col items-center gap-1.5 border px-2 py-3 ${
                            active
                              ? "border-primary bg-primary/10"
                              : "border-primary/20 hover:border-primary/50"
                          }`}
                        >
                          <TrackSymbol
                            symbol={catalogPreview(
                              entry,
                              editedSymbol.symbolStandardIdentity
                            )}
                            size={36}
                            selected={active}
                          />
                          <span className="font-mono text-[9px] tracking-widest uppercase text-center leading-tight">
                            {entry.name}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                  <div className="grid grid-cols-5 gap-2 mt-2">
                    {board.map((entry) => {
                      const active = selectedCatalog?.id === entry.id;
                      return (
                        <button
                          key={entry.id}
                          type="button"
                          onClick={() => pickCatalog(entry)}
                          className={`flex flex-col items-center gap-1 border px-1 py-2 ${
                            active
                              ? "border-secondary bg-secondary/10"
                              : "border-primary/15 hover:border-primary/40"
                          }`}
                        >
                          <TrackSymbol
                            symbol={catalogPreview(
                              entry,
                              editedSymbol.symbolStandardIdentity
                            )}
                            size={28}
                          />
                          <span className="font-mono text-[8px] tracking-widest uppercase text-muted-foreground">
                            {entry.name}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </section>

                <section className="grid grid-cols-1 sm:grid-cols-[1fr_auto] gap-3">
                  <div className="space-y-1.5">
                    <SectionLabel>Callsign</SectionLabel>
                    <Input
                      value={editedSymbol.aiLabel || ""}
                      onChange={(e) => handleChange("aiLabel", e.target.value)}
                      placeholder="RAPTORS"
                      maxLength={21}
                      className="h-11 font-display tracking-widest uppercase"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <SectionLabel>Size</SectionLabel>
                    <div className="flex flex-wrap gap-1">
                      {SIZE_CHIPS.map((size) => {
                        const active = editedSymbol.symbolEchelon === size;
                        return (
                          <button
                            key={size}
                            type="button"
                            onClick={() => handleChange("symbolEchelon", size)}
                            className={`px-2.5 py-2 font-mono text-[10px] tracking-widest uppercase border ${
                              active
                                ? "border-primary bg-primary/15 text-primary"
                                : "border-primary/20 text-muted-foreground"
                            }`}
                          >
                            {size === "Battalion" ? "Bn" : size.slice(0, 3)}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </section>

                <section>
                  <div className="flex items-center justify-between mb-2">
                    <SectionLabel className="mb-0">Drop point</SectionLabel>
                    <span className="font-mono text-[10px] tracking-widest text-muted-foreground">
                      {Number.isFinite(editedSymbol.latitude)
                        ? editedSymbol.latitude.toFixed(4)
                        : "—"}
                      {" · "}
                      {Number.isFinite(editedSymbol.longitude)
                        ? editedSymbol.longitude.toFixed(4)
                        : "—"}
                    </span>
                  </div>
                  <LocationPicker
                    latitude={editedSymbol.latitude}
                    longitude={editedSymbol.longitude}
                    onChange={({ lat, lng }) => {
                      setEditedSymbol((prev) =>
                        prev ? { ...prev, latitude: lat, longitude: lng } : prev
                      );
                    }}
                    onPickOnMap={() => onPickLocation?.(editedSymbol)}
                  />
                </section>

                <section>
                  <SectionLabel>Readiness</SectionLabel>
                  <input
                    type="range"
                    min={10}
                    max={100}
                    step={5}
                    value={strength}
                    onChange={(e) =>
                      handleChange("strength", Number(e.target.value))
                    }
                    className="w-full accent-cyan-400"
                  />
                </section>

                <Collapsible open={advancedOpen} onOpenChange={setAdvancedOpen}>
                  <CollapsibleTrigger asChild>
                    <button
                      type="button"
                      className="flex w-full items-center justify-between border border-primary/20 bg-black/20 px-3 py-2 font-mono text-[10px] tracking-[0.22em] uppercase text-muted-foreground hover:text-primary"
                    >
                      NATO / SIDC
                      <ChevronDown
                        className={`h-4 w-4 transition-transform ${
                          advancedOpen ? "rotate-180" : ""
                        }`}
                      />
                    </button>
                  </CollapsibleTrigger>
                  <CollapsibleContent className="space-y-3 pt-3">
                    <AdvField label="Set">
                      <Select
                        value={editedSymbol.symbolSet}
                        onValueChange={(value) => {
                          const icons = getSymbolSetData(value).mainIcons;
                          const icon =
                            icons.find((item) => item.code !== "000000")?.code ??
                            "000000";
                          setEditedSymbol({
                            ...editedSymbol,
                            symbolSet: value,
                            mainIconId: icon,
                            catalogId: undefined,
                            modifier1: "00",
                            modifier2: "00",
                          });
                        }}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Symbol set" />
                        </SelectTrigger>
                        <SelectContent>
                          <ScrollArea className="h-64">
                            {symbolSets.map((item) => (
                              <SelectItem key={item.code} value={item.name}>
                                {item.name}
                              </SelectItem>
                            ))}
                          </ScrollArea>
                        </SelectContent>
                      </Select>
                    </AdvField>
                    {currentSetData && (
                      <AdvField label="Icon">
                        <Select
                          value={editedSymbol.mainIconId}
                          onValueChange={(value) =>
                            setEditedSymbol({
                              ...editedSymbol,
                              mainIconId: value,
                              catalogId: undefined,
                            })
                          }
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <ScrollArea className="h-64">
                              {currentSetData.mainIcons.map((item) => (
                                <SelectItem
                                  key={`${item.code}-${item.name}`}
                                  value={item.code}
                                >
                                  {item.name}
                                </SelectItem>
                              ))}
                            </ScrollArea>
                          </SelectContent>
                        </Select>
                      </AdvField>
                    )}
                    <AdvField label="Echelon">
                      <Select
                        value={editedSymbol.symbolEchelon || "Unspecified"}
                        onValueChange={(value) =>
                          handleChange(
                            "symbolEchelon",
                            value === "Unspecified" ? undefined : value
                          )
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {currentEmtOptions.map((item) => (
                            <SelectItem key={item.name} value={item.name}>
                              {item.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </AdvField>
                    <AdvField label="Context">
                      <Select
                        value={editedSymbol.context}
                        onValueChange={(value) => handleChange("context", value)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {contexts.map((item) => (
                            <SelectItem key={item} value={item}>
                              {item}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </AdvField>
                    <AdvField label="Status">
                      <Select
                        value={editedSymbol.status}
                        onValueChange={(value) => handleChange("status", value)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {statuses.map((item) => (
                            <SelectItem key={item} value={item}>
                              {item}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </AdvField>
                    <AdvField label="HQ / TF">
                      <Select
                        value={editedSymbol.hqtfd}
                        onValueChange={(value) => handleChange("hqtfd", value)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {hqtfds.map((item) => (
                            <SelectItem key={item} value={item}>
                              {item}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </AdvField>
                    <AdvField label="Paste SIDC">
                      <div className="flex gap-2">
                        <Input
                          value={sidcDraft}
                          onChange={(e) => setSidcDraft(e.target.value)}
                          placeholder="20-digit 2525D code"
                        />
                        <Button
                          type="button"
                          variant="outline"
                          disabled={compactSIDC(sidcDraft).length !== 20}
                          onClick={applyDraftSidc}
                        >
                          LOAD
                        </Button>
                      </div>
                    </AdvField>
                    {currentSetData?.modifier1 &&
                      currentSetData.modifier1.length > 1 && (
                        <AdvField label="Mod 1">
                          <Select
                            value={editedSymbol.modifier1 || "00"}
                            onValueChange={(value) =>
                              handleChange("modifier1", value)
                            }
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <ScrollArea className="h-48">
                                {currentSetData.modifier1.map((item) => (
                                  <SelectItem
                                    key={`${item.code}-${item.name}`}
                                    value={item.code}
                                  >
                                    {item.name}
                                  </SelectItem>
                                ))}
                              </ScrollArea>
                            </SelectContent>
                          </Select>
                        </AdvField>
                      )}
                    {currentSetData?.modifier2 &&
                      currentSetData.modifier2.length > 1 && (
                        <AdvField label="Mod 2">
                          <Select
                            value={editedSymbol.modifier2 || "00"}
                            onValueChange={(value) =>
                              handleChange("modifier2", value)
                            }
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <ScrollArea className="h-48">
                                {currentSetData.modifier2.map((item) => (
                                  <SelectItem
                                    key={`${item.code}-${item.name}`}
                                    value={item.code}
                                  >
                                    {item.name}
                                  </SelectItem>
                                ))}
                              </ScrollArea>
                            </SelectContent>
                          </Select>
                        </AdvField>
                      )}
                    {amplifierData.slice(0, 6).map((amp) => (
                      <AdvField key={amp.amplifierId} label={amp.label}>
                        <Input
                          value={
                            (editedSymbol[
                              amp.amplifierId as keyof SymbolData
                            ] as string) || ""
                          }
                          onChange={(e) =>
                            handleChange(
                              amp.amplifierId as keyof SymbolData,
                              e.target.value
                            )
                          }
                          maxLength={amp.maxLength}
                        />
                      </AdvField>
                    ))}
                    <Label htmlFor="custom-icon-upload" className="block">
                      <div className="flex items-center justify-center w-full h-20 border border-dashed border-primary/40 cursor-pointer hover:bg-muted/40">
                        <Upload className="w-4 h-4 mr-2 text-muted-foreground" />
                        <span className="font-mono text-[10px] tracking-widest uppercase">
                          Custom icon
                        </span>
                      </div>
                    </Label>
                    <Input
                      id="custom-icon-upload"
                      type="file"
                      className="sr-only"
                      onChange={handleImageUpload}
                      accept="image/png, image/jpeg, image/svg+xml"
                    />
                  </CollapsibleContent>
                </Collapsible>
              </div>
            </ScrollArea>
          </div>
        </div>

        <DialogFooter className="px-5 py-3 border-t border-primary/20 flex-row justify-between sm:justify-between">
          {!createMode ? (
            <Button
              onClick={() => symbol?.id && onDelete(symbol.id)}
              variant="destructive"
              className="font-mono tracking-wide"
            >
              SCRAP
            </Button>
          ) : (
            <span />
          )}
          <div className="flex gap-2">
            <Button
              onClick={() => onOpenChange(false)}
              variant="outline"
              className="font-mono tracking-wide"
            >
              CANCEL
            </Button>
            <Button
              onClick={() => onSave(withSimDefaults(editedSymbol))}
              className="font-mono tracking-[0.18em] px-6"
            >
              {createMode ? "DEPLOY" : "UPDATE"}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function SectionLabel({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`font-mono text-[10px] tracking-[0.22em] uppercase text-muted-foreground mb-2 ${className}`}
    >
      {children}
    </div>
  );
}

function AdvField({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="grid grid-cols-[7rem_1fr] items-center gap-3">
      <Label className="font-mono text-[10px] tracking-[0.16em] uppercase text-muted-foreground">
        {label}
      </Label>
      {children}
    </div>
  );
}
