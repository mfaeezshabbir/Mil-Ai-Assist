'use client';

import type { SymbolData } from '@/types';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetDescription,
  SheetFooter,
} from '@/components/ui/sheet';
import { ScrollArea } from '@/components/ui/scroll-area';
import { List, MapPin, Pencil, Trash2 } from 'lucide-react';
import type { MapRef } from 'react-map-gl';
import { getFunctionIdName } from '@/lib/sidc-mappings';

type SymbolListSheetProps = {
  symbols: SymbolData[];
  mapRef: React.RefObject<MapRef>;
  onEdit: (symbolId: string) => void;
  onDelete: (symbolId: string) => void;
};

export function SymbolListSheet({ symbols, mapRef, onEdit, onDelete }: SymbolListSheetProps) {
  
  const handleGoTo = (symbol: SymbolData) => {
    mapRef.current?.flyTo({
      center: [symbol.longitude, symbol.latitude],
      zoom: 14,
      duration: 1500,
    });
  };

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline" size="icon" className="shrink-0">
          <List className="h-4 w-4" />
           <span className="sr-only">View All Symbols ({symbols.length})</span>
        </Button>
      </SheetTrigger>
      <SheetContent className="w-[400px] sm:w-[540px] flex flex-col p-0">
        <SheetHeader className="p-6 pb-4">
          <SheetTitle>Symbols on Map</SheetTitle>
          <SheetDescription>
            List of all military symbols currently deployed. You can view, edit, or delete them from here.
          </SheetDescription>
        </SheetHeader>
        <ScrollArea className="flex-1 px-6">
          <div className="flex flex-col gap-2">
            {symbols.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">No symbols have been added yet.</p>
            ) : (
                symbols.map((symbol) => {
                    const displayName = symbol.uniqueDesignation || getFunctionIdName(symbol.symbolSet, symbol.functionId);
                    const subText = `${symbol.symbolStandardIdentity} / ${symbol.symbolEchelon || 'No Echelon'}`;
                    return (
                        <div key={symbol.id} className="flex items-center gap-2 p-2 rounded-lg border bg-background hover:bg-muted/50 transition-colors">
                            <div className="flex-1 overflow-hidden">
                            <p className="font-semibold truncate">{displayName}</p>
                            <p className="text-sm text-muted-foreground truncate">{subText}</p>
                            </div>
                            <div className="flex gap-1">
                            <Button variant="ghost" size="icon" onClick={() => handleGoTo(symbol)} title="Go to symbol">
                                <MapPin className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon" onClick={() => onEdit(symbol.id)} title="Edit symbol">
                                <Pencil className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon" onClick={() => onDelete(symbol.id)} className="text-destructive hover:text-destructive" title="Delete symbol">
                                <Trash2 className="h-4 w-4" />
                            </Button>
                            </div>
                        </div>
                )})
            )}
          </div>
        </ScrollArea>
        <SheetFooter className="p-6 pt-4 border-t">
            <p className="text-sm text-muted-foreground">Total symbols: {symbols.length}</p>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
