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
import { Switch } from '@/components/ui/switch';

type SymbolEditorProps = {
  symbol: SymbolData | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpdate: (symbol: SymbolData) => void;
};

const identities = ['Friend', 'Hostile', 'Neutral', 'Unknown'];
const categories = ['Infantry', 'Armored', 'Unknown'];
const echelons = [
  'Team', 'Squad', 'Section', 'Platoon', 'Company', 'Battalion',
  'Regiment', 'Brigade', 'Division', 'Corps', 'Army',
];

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
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit Symbol</DialogTitle>
          <DialogDescription>
            Make changes to the military symbol. Click save when you're done.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
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
            <Label htmlFor="category" className="text-right">Category</Label>
            <Select
              value={editedSymbol.symbolCategory}
              onValueChange={(value) => handleChange('symbolCategory', value)}
            >
              <SelectTrigger id="category" className="col-span-3">
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((cat) => (
                  <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                ))}
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
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="damaged" className="text-right">Damaged</Label>
            <Switch
              id="damaged"
              checked={!!editedSymbol.symbolDamaged}
              onCheckedChange={(checked) => handleChange('symbolDamaged', checked)}
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="taskforce" className="text-right">Task Force</Label>
            <Switch
              id="taskforce"
              checked={!!editedSymbol.symbolTaskForce}
              onCheckedChange={(checked) => handleChange('symbolTaskForce', checked)}
              className="col-span-3"
            />
          </div>
        </div>
        <DialogFooter>
          <Button onClick={handleSave}>Save changes</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
