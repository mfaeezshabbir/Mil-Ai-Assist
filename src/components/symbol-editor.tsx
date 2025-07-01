'use client';

import { useEffect, useState } from 'react';
import type { SymbolData } from '@/types';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ScrollArea } from './ui/scroll-area';
import { toTitleCase } from '@/lib/utils';
import { LandUnitSymbolSet10, sidcEnumMapping } from '@/lib/sidc-mappings';

type SymbolEditorProps = {
  symbol: SymbolData | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpdate: (symbol: SymbolData) => void;
};

const contexts = Object.keys(sidcEnumMapping.context).map(key => toTitleCase(key.replace(/_/g, ' ')));
const identities = Object.keys(sidcEnumMapping.standardIdentity).map(key => toTitleCase(key.replace(/_/g, ' ')));
const statuses = Object.keys(sidcEnumMapping.status).map(key => toTitleCase(key.replace(/_/g, ' ')));
const hqtfds = Object.keys(sidcEnumMapping.hqtfd).map(key => toTitleCase(key.replace(/_/g, ' ')));

const echelons = Object.keys(sidcEnumMapping.echelonMobilityTowedArray)
    .filter(k => k !== 'UNSPECIFIED') // Don't show unspecified in the list
    .map(key => toTitleCase(key.replace(/_/g, ' ')));

const functionIds = Object.entries(LandUnitSymbolSet10).map(([name, code]) => ({
    name: toTitleCase(name.replace(/_/g, ' ')),
    code,
}));

export function SymbolEditor({ symbol, open, onOpenChange, onUpdate }: SymbolEditorProps) {
  const [editedSymbol, setEditedSymbol] = useState<SymbolData | null>(symbol);

  useEffect(() => {
    setEditedSymbol(symbol);
  }, [symbol]);

  if (!editedSymbol) return null;

  const handleChange = (field: keyof Omit<SymbolData, 'id' | 'latitude' | 'longitude'>, value: any) => {
    setEditedSymbol((prev) => (prev ? { ...prev, [field]: value } : null));
  };

  const handleSave = () => {
    if (editedSymbol) {
      onUpdate(editedSymbol);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Edit Symbol</DialogTitle>
          <DialogDescription>
            Make changes to the military symbol. Click save when you're done.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
           <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="context" className="text-right">Context</Label>
            <Select
              value={editedSymbol.context}
              onValueChange={(value) => handleChange('context', value)}
            >
              <SelectTrigger id="context" className="col-span-3">
                <SelectValue placeholder="Select context" />
              </SelectTrigger>
              <SelectContent>
                {contexts.map((item) => (
                  <SelectItem key={item} value={item}>{item}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="identity" className="text-right">Identity</Label>
            <Select
              value={editedSymbol.symbolStandardIdentity}
              onValueChange={(value) => handleChange('symbolStandardIdentity', value)}
            >
              <SelectTrigger id="identity" className="col-span-3">
                <SelectValue placeholder="Select identity" />
              </SelectTrigger>
              <SelectContent>
                {identities.map((id) => (
                  <SelectItem key={id} value={id}>{id}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="status" className="text-right">Status</Label>
            <Select
              value={editedSymbol.status}
              onValueChange={(value) => handleChange('status', value)}
            >
              <SelectTrigger id="status" className="col-span-3">
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                {statuses.map((item) => (
                  <SelectItem key={item} value={item}>{item}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="hqtfd" className="text-right whitespace-nowrap">HQ/TF/Dummy</Label>
            <Select
              value={editedSymbol.hqtfd}
              onValueChange={(value) => handleChange('hqtfd', value)}
            >
              <SelectTrigger id="hqtfd" className="col-span-3">
                <SelectValue placeholder="Select setting" />
              </SelectTrigger>
              <SelectContent>
                {hqtfds.map((item) => (
                  <SelectItem key={item} value={item}>{item}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="functionId" className="text-right">Function ID</Label>
            <Select
              value={editedSymbol.functionId}
              onValueChange={(value) => handleChange('functionId', value)}
            >
              <SelectTrigger id="functionId" className="col-span-3">
                <SelectValue placeholder="Select function ID" />
              </SelectTrigger>
              <SelectContent>
                <ScrollArea className="h-72">
                  {functionIds.map((item) => (
                    <SelectItem key={item.code} value={item.code}>{item.name}</SelectItem>
                  ))}
                </ScrollArea>
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="echelon" className="text-right">Echelon</Label>
            <Select
              value={editedSymbol.symbolEchelon}
              onValueChange={(value) => handleChange('symbolEchelon', value)}
            >
              <SelectTrigger id="echelon" className="col-span-3">
                <SelectValue placeholder="Select echelon" />
              </SelectTrigger>
              <SelectContent>
                {echelons.map((ech) => (
                  <SelectItem key={ech} value={ech}>{ech}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <Button onClick={handleSave}>Save changes</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
