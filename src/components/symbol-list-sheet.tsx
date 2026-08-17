"use client";

import type { SymbolData } from "@/types";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
} from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import { MapPin, Pencil, Trash2 } from "lucide-react";
import { TrackSymbol } from "@/components/track-symbol";
import { getFunctionIdName } from "@/lib/sidc-mappings";

export type SymbolListSheetProps = {
  symbols: SymbolData[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSymbolSelect: (symbol: SymbolData) => void;
  onEditSymbol?: (symbol: SymbolData) => void;
  onDeleteSymbol?: (symbol: SymbolData) => void;
};

export function SymbolListSheet({
  symbols,
  open,
  onOpenChange,
  onSymbolSelect,
  onEditSymbol,
  onDeleteSymbol,
}: SymbolListSheetProps) {
  const handleGoTo = (symbol: SymbolData) => {
    onSymbolSelect(symbol);
    onOpenChange(false);
  };

  const handleEdit = (symbol: SymbolData) => {
    if (onEditSymbol) {
      onEditSymbol(symbol);
    } else {
      onSymbolSelect(symbol);
      onOpenChange(false);
    }
  };

  const handleDelete = (symbol: SymbolData) => {
    if (onDeleteSymbol) {
      onDeleteSymbol(symbol);
    } else {
      onSymbolSelect(symbol);
      onOpenChange(false);
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-[400px] sm:w-[540px] flex flex-col p-0">
        <SheetHeader className="p-6 pb-4 border-b border-primary/20">
          <SheetTitle className="font-display tracking-[0.18em]">
            Force tracks
          </SheetTitle>
          <SheetDescription className="font-mono text-[11px] tracking-wide uppercase">
            Select a track to edit. Fly to position from the pin.
          </SheetDescription>
        </SheetHeader>
        <ScrollArea className="flex-1 px-6">
          <div className="flex flex-col gap-2">
            {symbols.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">
                No symbols have been added yet.
              </p>
            ) : (
              symbols.map((symbol) => {
                const displayName =
                  symbol.aiLabel ||
                  getFunctionIdName(symbol.symbolSet, symbol.mainIconId);
                const subText = `${symbol.symbolStandardIdentity} / ${
                  symbol.symbolEchelon || "No Echelon"
                }`;
                return (
                  <div
                    key={symbol.id}
                    className="flex items-center gap-3 p-2 border border-primary/20 bg-background/60 hover:bg-muted/50 transition-colors"
                  >
                    <TrackSymbol symbol={symbol} size={40} />
                    <div className="flex-1 overflow-hidden">
                      <p className="font-semibold truncate">{displayName}</p>
                      <p className="text-sm text-muted-foreground truncate">
                        {subText}
                      </p>
                    </div>
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleGoTo(symbol)}
                        title="Go to symbol"
                      >
                        <MapPin className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleEdit(symbol)}
                        title="Edit symbol"
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(symbol)}
                        className="text-destructive hover:text-destructive"
                        title="Delete symbol"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </ScrollArea>
        <SheetFooter className="p-6 pt-4 border-t">
          <p className="text-sm font-mono text-muted-foreground tracking-widest uppercase">
            Tracks {symbols.length}
          </p>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
