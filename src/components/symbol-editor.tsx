"use client";

import { useEffect, useState } from "react";
import type { SymbolData } from "@/types";
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
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { ScrollArea } from "./ui/scroll-area";
import { toTitleCase } from "@/lib/utils";
import {
  sidcEnumMapping,
  symbolSetData,
  getFunctionIdName,
  amplifierData,
  getEmtOptionsForSymbolSet,
} from "@/lib/sidc-mappings";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MilitarySymbol } from "./military-symbol";
import { generateSIDC } from "@/lib/sidc-generator";
import { HelpCircle, Upload } from "lucide-react";
import Image from "next/image";

export type SymbolEditorProps = {
  symbol: SymbolData | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpdate?: (symbol: SymbolData) => void;
  onSave: (symbol: SymbolData) => void;
  onDelete: (symbolId: string) => void;
};

const contexts = Object.keys(sidcEnumMapping.context).map((key) =>
  toTitleCase(key.replace(/_/g, " "))
);
const identities = Object.keys(sidcEnumMapping.standardIdentity).map((key) =>
  toTitleCase(key.replace(/_/g, " "))
);
const statuses = Object.keys(sidcEnumMapping.status).map((key) =>
  toTitleCase(key.replace(/_/g, " "))
);
const hqtfds = Object.keys(sidcEnumMapping.hqtfd).map((key) =>
  toTitleCase(key.replace(/_/g, " "))
);

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

export function SymbolEditor({
  symbol,
  open,
  onOpenChange,
  onSave,
  onDelete,
}: SymbolEditorProps) {
  const [editedSymbol, setEditedSymbol] = useState<SymbolData | null>(symbol);

  useEffect(() => {
    setEditedSymbol(symbol);
  }, [symbol]);

  if (!editedSymbol) return null;

  const currentSetData = symbolSetData[editedSymbol.symbolSet || ""];
  const currentSetCode =
    sidcEnumMapping.symbolSet[
      normalize(
        editedSymbol.symbolSet
      ) as keyof typeof sidcEnumMapping.symbolSet
    ] || "10";
  const allAmplifiers = amplifierData; // Show all amplifiers regardless of symbol set
  const currentEmtOptions = getEmtOptionsForSymbolSet(currentSetCode);

  const handleChange = (field: keyof SymbolData, value: any) => {
    const newSymbol = { ...editedSymbol, [field]: value };

    if (field === "symbolSet") {
      newSymbol.mainIconId = "000000";
      newSymbol.modifier1 = "00";
      newSymbol.modifier2 = "00";
      newSymbol.symbolEchelon = undefined;
      newSymbol.displayType = "sidc";
      newSymbol.imageUrl = undefined;
    }

    setEditedSymbol(newSymbol);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (loadEvent) => {
        const imageUrl = loadEvent.target?.result as string;
        setEditedSymbol((prev) =>
          prev ? { ...prev, imageUrl, displayType: "image" } : null
        );
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = () => {
    if (editedSymbol) {
      onSave(editedSymbol);
    }
  };

  const handleDelete = () => {
    if (symbol && symbol.id) {
      onDelete(symbol.id);
    }
  };

  const renderSelectGroup = (
    label: string,
    field: keyof SymbolData,
    options: { name: string; code?: string }[],
    placeholder: string
  ) => (
    <div className="grid grid-cols-3 items-center gap-4">
      <Label htmlFor={String(field)} className="text-right">
        {label}
      </Label>
      <Select
        value={editedSymbol[field] as string}
        onValueChange={(value) =>
          handleChange(field as keyof SymbolData, value)
        }
      >
        <SelectTrigger id={String(field)} className="col-span-2">
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          {options.map((item) => (
            <SelectItem key={item.name} value={item.name}>
              {item.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );

  const renderComplexSelectGroup = (
    label: string,
    field: keyof SymbolData,
    options: { name: string; code: string }[],
    placeholder: string
  ) => (
    <div className="grid grid-cols-3 items-center gap-4">
      <Label htmlFor={String(field)} className="text-right">
        {label}
      </Label>
      <Select
        value={editedSymbol[field] as string}
        onValueChange={(value) => handleChange(field, value)}
      >
        <SelectTrigger id={String(field)} className="col-span-2">
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          <ScrollArea className="h-72">
            {options.map((item) => (
              <SelectItem key={item.code} value={item.code}>
                {item.name}
              </SelectItem>
            ))}
          </ScrollArea>
        </SelectContent>
      </Select>
    </div>
  );

  const renderAmplifierInput = (amp: (typeof amplifierData)[number]) => (
    <div key={amp.amplifierId} className="grid grid-cols-3 items-center gap-4">
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Label
              htmlFor={amp.amplifierId}
              className="text-right flex items-center justify-end gap-1 cursor-help"
            >
              <span>{amp.label}</span>
              <HelpCircle className="h-4 w-4 text-muted-foreground" />
            </Label>
          </TooltipTrigger>
          <TooltipContent>
            <p className="max-w-xs">{amp.description}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
      <Input
        id={amp.amplifierId}
        value={
          (editedSymbol[amp.amplifierId as keyof SymbolData] as string) || ""
        }
        onChange={(e) =>
          handleChange(amp.amplifierId as keyof SymbolData, e.target.value)
        }
        className="col-span-2"
        maxLength={amp.maxLength}
      />
    </div>
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl bg-background/80 backdrop-blur-md">
        <DialogHeader>
          <DialogTitle>Symbol Editor</DialogTitle>
          <DialogDescription>
            Modify the symbol's properties and see a live preview. Click save
            when you're done.
          </DialogDescription>
        </DialogHeader>
        <div className="grid grid-cols-1 md:grid-cols-[280px_1fr] gap-6 p-1">
          <div className="flex flex-col items-center justify-start pt-8 space-y-4 border rounded-lg bg-white/5">
            {editedSymbol.displayType === "image" && editedSymbol.imageUrl ? (
              <Image
                src={editedSymbol.imageUrl}
                alt="Custom Icon"
                width={150}
                height={150}
                className="object-contain"
              />
            ) : (
              <MilitarySymbol symbol={editedSymbol} size={150} />
            )}
            <div className="text-center px-4">
              <p className="font-bold text-sm">
                {getFunctionIdName(
                  editedSymbol.symbolSet,
                  editedSymbol.mainIconId
                )}
              </p>
              <p className="text-xs text-muted-foreground">
                {editedSymbol.symbolSet}
              </p>
            </div>
            <ScrollArea className="h-32 w-full px-2">
              <pre className="text-xs text-muted-foreground break-all p-2">
                SIDC: {generateSIDC(editedSymbol)}
              </pre>
            </ScrollArea>
          </div>

          <div>
            <Tabs defaultValue="identifiers" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="identifiers">Identifiers</TabsTrigger>
                <TabsTrigger value="amplifiers">Amplifiers</TabsTrigger>
                <TabsTrigger value="custom">Custom Icon</TabsTrigger>
              </TabsList>
              <TabsContent value="identifiers">
                <ScrollArea className="h-[400px] p-1">
                  <div className="space-y-4 p-4">
                    {renderSelectGroup(
                      "Context",
                      "context",
                      contexts.map((c) => ({ name: c })),
                      "Select context"
                    )}
                    {renderSelectGroup(
                      "Identity",
                      "symbolStandardIdentity",
                      identities.map((i) => ({ name: i })),
                      "Select identity"
                    )}
                    {renderSelectGroup(
                      "Status",
                      "status",
                      statuses.map((s) => ({ name: s })),
                      "Select status"
                    )}
                    {renderSelectGroup(
                      "HQ/TF/Dummy",
                      "hqtfd",
                      hqtfds.map((h) => ({ name: h })),
                      "Select setting"
                    )}

                    <div className="grid grid-cols-3 items-center gap-4">
                      <Label htmlFor="symbolSet" className="text-right">
                        Symbol Set
                      </Label>
                      <Select
                        value={editedSymbol.symbolSet}
                        onValueChange={(value) =>
                          handleChange("symbolSet", value)
                        }
                      >
                        <SelectTrigger id="symbolSet" className="col-span-2">
                          <SelectValue placeholder="Select Symbol Set" />
                        </SelectTrigger>
                        <SelectContent>
                          <ScrollArea className="h-72">
                            {symbolSets.map((item) => (
                              <SelectItem key={item.code} value={item.name}>
                                {item.name}
                              </SelectItem>
                            ))}
                          </ScrollArea>
                        </SelectContent>
                      </Select>
                    </div>

                    {renderSelectGroup(
                      "Echelon/Mobility",
                      "symbolEchelon",
                      currentEmtOptions,
                      "Select Echelon/Mobility"
                    )}

                    {currentSetData &&
                      renderComplexSelectGroup(
                        "Main icon",
                        "mainIconId",
                        currentSetData.mainIcons,
                        "Select Main icon"
                      )}
                    {currentSetData?.modifier1 &&
                      currentSetData.modifier1.length > 1 &&
                      renderComplexSelectGroup(
                        "Modifier 1",
                        "modifier1",
                        currentSetData.modifier1,
                        "Select Modifier 1"
                      )}
                    {currentSetData?.modifier2 &&
                      currentSetData.modifier2.length > 1 &&
                      renderComplexSelectGroup(
                        "Modifier 2",
                        "modifier2",
                        currentSetData.modifier2,
                        "Select Modifier 2"
                      )}
                  </div>
                </ScrollArea>
              </TabsContent>
              <TabsContent value="amplifiers">
                <ScrollArea className="h-[400px] p-1">
                  <div className="space-y-4 p-4">
                    {allAmplifiers.map(renderAmplifierInput)}
                  </div>
                </ScrollArea>
              </TabsContent>
              <TabsContent value="custom">
                <div className="h-[400px] p-4 flex flex-col items-center justify-center gap-4">
                  <p className="text-sm text-muted-foreground text-center">
                    Upload a custom image to use as the symbol icon. This will
                    override the SIDC-based symbol.
                  </p>
                  <Label htmlFor="custom-icon-upload" className="w-full">
                    <div className="flex items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer hover:bg-muted/50">
                      <div className="flex flex-col items-center justify-center pt-5 pb-6">
                        <Upload className="w-8 h-8 mb-4 text-muted-foreground" />
                        <p className="mb-2 text-sm text-muted-foreground">
                          <span className="font-semibold">Click to upload</span>{" "}
                          or drag and drop
                        </p>
                        <p className="text-xs text-muted-foreground">
                          PNG, JPG, or SVG
                        </p>
                      </div>
                    </div>
                  </Label>
                  <Input
                    id="custom-icon-upload"
                    type="file"
                    className="sr-only"
                    onChange={handleImageUpload}
                    accept="image/png, image/jpeg, image/svg+xml"
                  />
                  {editedSymbol.imageUrl && (
                    <div className="mt-4">
                      <p className="text-sm font-medium mb-2">
                        Current Custom Icon:
                      </p>
                      <Image
                        src={editedSymbol.imageUrl}
                        alt="Custom icon preview"
                        width={80}
                        height={80}
                        className="rounded-md border p-1"
                      />
                    </div>
                  )}
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>
        <DialogFooter className="flex justify-between">
          <Button
            onClick={handleDelete}
            variant="destructive"
            className="font-mono tracking-wide"
          >
            DELETE SYMBOL
          </Button>
          <div className="flex gap-2">
            <Button
              onClick={onOpenChange.bind(null, false)}
              variant="outline"
              className="font-mono tracking-wide"
            >
              CANCEL
            </Button>
            <Button
              onClick={handleSave}
              variant="tactical"
              className="font-mono tracking-wide"
            >
              SAVE CHANGES
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
