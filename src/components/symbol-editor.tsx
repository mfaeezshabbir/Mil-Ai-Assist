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
import { sidcEnumMapping, symbolSetData } from '@/lib/sidc-mappings';

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
    .filter(k => k !== 'UNSPECIFIED')
    .map(key => toTitleCase(key.replace(/_/g, ' ')));

const symbolSets = Object.keys(sidcEnumMapping.symbolSet).map(key => ({
    name: toTitleCase(key.replace(/_/g, ' ')),
    code: sidcEnumMapping.symbolSet[key as keyof typeof sidcEnumMapping.symbolSet],
}));

export function SymbolEditor({ symbol, open, onOpenChange, onUpdate }: SymbolEditorProps) {
  const [editedSymbol, setEditedSymbol] = useState<SymbolData | null>(symbol);
  
  useEffect(() => {
    setEditedSymbol(symbol);
  }, [symbol]);

  const currentSetData = symbolSetData[editedSymbol?.symbolSet || ''];

  if (!editedSymbol) return null;

  const handleChange = (field: keyof SymbolData, value: any) => {
    const newSymbol = { ...editedSymbol, [field]: value };
    
    // If symbolSet is changed, reset dependent fields
    if (field === 'symbolSet') {
        newSymbol.functionId = '000000';
        newSymbol.modifier1 = '00';
        newSymbol.modifier2 = '00';
    }
    
    setEditedSymbol(newSymbol);
  };

  const handleSave = () => {
    if (editedSymbol) {
      onUpdate(editedSymbol);
    }
  };

  const renderSelect = (label: string, field: keyof SymbolData, options: {name: string, code: string}[], placeholder: string) => (
    <div className="grid grid-cols-4 items-center gap-4">
      <Label htmlFor={field} className="text-right">{label}</Label>
      <Select value={editedSymbol[field] as string} onValueChange={(value) => handleChange(field as keyof SymbolData, value)}>
        <SelectTrigger id={field} className="col-span-3">
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
            <ScrollArea className="h-72">
                {options.map((item) => (
                    <SelectItem key={item.code} value={item.code}>{item.name}</SelectItem>
                ))}
            </ScrollArea>
        </SelectContent>
      </Select>
    </div>
  );

  const renderSimpleSelect = (label: string, field: keyof SymbolData, options: string[], placeholder: string) => (
     <div className="grid grid-cols-4 items-center gap-4">
      <Label htmlFor={field} className="text-right">{label}</Label>
      <Select value={editedSymbol[field] as string} onValueChange={(value) => handleChange(field as keyof SymbolData, value)}>
        <SelectTrigger id={field} className="col-span-3">
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
            {options.map((item) => (
              <SelectItem key={item} value={item}>{item}</SelectItem>
            ))}
        </SelectContent>
      </Select>
    </div>
  )

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>Edit Symbol</DialogTitle>
          <DialogDescription>
            Make changes to the military symbol. Click save when you're done.
          </DialogDescription>
        </DialogHeader>
        <ScrollArea className="max-h-[60vh] p-4">
            <div className="grid gap-4 py-4">
            {renderSimpleSelect('Context', 'context', contexts, 'Select context')}
            {renderSimpleSelect('Identity', 'symbolStandardIdentity', identities, 'Select identity')}
            {renderSimpleSelect('Status', 'status', statuses, 'Select status')}
            {renderSimpleSelect('HQ/TF/Dummy', 'hqtfd', hqtfds, 'Select setting')}
            {renderSimpleSelect('Echelon', 'symbolEchelon', echelons, 'Select echelon')}

            <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="symbolSet" className="text-right">Symbol Set</Label>
                <Select value={editedSymbol.symbolSet} onValueChange={(value) => handleChange('symbolSet', value)}>
                    <SelectTrigger id="symbolSet" className="col-span-3">
                    <SelectValue placeholder="Select Symbol Set" />
                    </SelectTrigger>
                    <SelectContent>
                    {symbolSets.map((item) => (
                        <SelectItem key={item.code} value={item.name}>{item.name}</SelectItem>
                    ))}
                    </SelectContent>
                </Select>
            </div>

            {currentSetData && renderSelect('Function ID', 'functionId', currentSetData.mainIcons, 'Select Function ID')}
            {currentSetData?.modifier1 && renderSelect('Modifier 1', 'modifier1', currentSetData.modifier1, 'Select Modifier 1')}
            {currentSetData?.modifier2 && renderSelect('Modifier 2', 'modifier2', currentSetData.modifier2, 'Select Modifier 2')}
            </div>
        </ScrollArea>
        <DialogFooter>
          <Button onClick={handleSave}>Save changes</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
