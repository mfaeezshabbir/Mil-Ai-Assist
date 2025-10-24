"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
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
import type { SymbolData } from "@/types";

type AddSymbolDialogProps = {
  onAddSymbol: (symbol: SymbolData) => void;
  defaultPosition?: { latitude: number; longitude: number };
};

export function AddSymbolDialog({
  onAddSymbol,
  defaultPosition,
}: AddSymbolDialogProps) {
  const [open, setOpen] = useState(false);
  const [latitude, setLatitude] = useState(
    defaultPosition?.latitude?.toString() || "33.72"
  );
  const [longitude, setLongitude] = useState(
    defaultPosition?.longitude?.toString() || "73.09"
  );
  const [label, setLabel] = useState("");
  const [identity, setIdentity] = useState("Friend");
  const [symbolSet, setSymbolSet] = useState("Land Unit");
  const [echelon, setEchelon] = useState("Company");
  const [category, setCategory] = useState("Infantry");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const lat = parseFloat(latitude);
    const lng = parseFloat(longitude);

    if (isNaN(lat) || isNaN(lng)) {
      alert("Please enter valid coordinates");
      return;
    }

    // Create a new symbol with the provided data
    const newSymbol: SymbolData = {
      id: `sym-manual-${Date.now()}`,
      displayType: "sidc",
      context: "Reality",
      symbolStandardIdentity: identity as any,
      status: "Present",
      hqtfd: "Not Applicable",
      symbolSet: symbolSet,
      mainIconId: getCategoryId(category),
      modifier1: "00",
      modifier2: "00",
      symbolEchelon: echelon as
        | "Team"
        | "Squad"
        | "Section"
        | "Platoon"
        | "Company"
        | "Battalion"
        | "Regiment"
        | "Brigade"
        | "Division"
        | "Corps"
        | "Army",
      latitude: lat,
      longitude: lng,
      aiLabel: label || undefined,
    };

    onAddSymbol(newSymbol);
    setOpen(false);

    // Reset form
    setLabel("");
    setLatitude(defaultPosition?.latitude?.toString() || "33.72");
    setLongitude(defaultPosition?.longitude?.toString() || "73.09");
  };

  // Simple mapping for common categories to function IDs
  const getCategoryId = (category: string): string => {
    const mapping: Record<string, string> = {
      Infantry: "110100",
      Armor: "120100",
      Artillery: "130100",
      Engineer: "140100",
      Reconnaissance: "150100",
      Aviation: "050000",
      Naval: "100000",
    };
    return mapping[category] || "000000";
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="icon"
          className="bg-gradient-to-br from-accent to-primary text-white hover:from-primary hover:to-accent border-none shadow-md"
          title="Add Symbol Manually"
        >
          <Plus className="h-5 w-5" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Add Symbol Manually</DialogTitle>
          <DialogDescription>
            Manually add a military symbol to the map by filling in the details
            below.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-2">
                <Label htmlFor="latitude">Latitude</Label>
                <Input
                  id="latitude"
                  type="number"
                  step="any"
                  placeholder="33.72"
                  value={latitude}
                  onChange={(e) => setLatitude(e.target.value)}
                  required
                />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="longitude">Longitude</Label>
                <Input
                  id="longitude"
                  type="number"
                  step="any"
                  placeholder="73.09"
                  value={longitude}
                  onChange={(e) => setLongitude(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="label">Label (Optional)</Label>
              <Input
                id="label"
                placeholder="e.g., Alpha Company, Raptors"
                value={label}
                onChange={(e) => setLabel(e.target.value)}
                maxLength={21}
              />
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="identity">Identity</Label>
              <Select value={identity} onValueChange={setIdentity}>
                <SelectTrigger id="identity">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Friend">Friend</SelectItem>
                  <SelectItem value="Hostile">Hostile</SelectItem>
                  <SelectItem value="Neutral">Neutral</SelectItem>
                  <SelectItem value="Unknown">Unknown</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="symbolSet">Symbol Set</Label>
              <Select value={symbolSet} onValueChange={setSymbolSet}>
                <SelectTrigger id="symbolSet">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Land Unit">Land Unit</SelectItem>
                  <SelectItem value="Air">Air</SelectItem>
                  <SelectItem value="Sea Surface">Sea Surface</SelectItem>
                  <SelectItem value="Subsurface">Subsurface</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="category">Category</Label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger id="category">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Infantry">Infantry</SelectItem>
                  <SelectItem value="Armor">Armor</SelectItem>
                  <SelectItem value="Artillery">Artillery</SelectItem>
                  <SelectItem value="Engineer">Engineer</SelectItem>
                  <SelectItem value="Reconnaissance">Reconnaissance</SelectItem>
                  <SelectItem value="Aviation">Aviation</SelectItem>
                  <SelectItem value="Naval">Naval</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="echelon">Echelon</Label>
              <Select value={echelon} onValueChange={setEchelon}>
                <SelectTrigger id="echelon">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Team">Team</SelectItem>
                  <SelectItem value="Squad">Squad</SelectItem>
                  <SelectItem value="Section">Section</SelectItem>
                  <SelectItem value="Platoon">Platoon</SelectItem>
                  <SelectItem value="Company">Company</SelectItem>
                  <SelectItem value="Battalion">Battalion</SelectItem>
                  <SelectItem value="Regiment">Regiment</SelectItem>
                  <SelectItem value="Brigade">Brigade</SelectItem>
                  <SelectItem value="Division">Division</SelectItem>
                  <SelectItem value="Corps">Corps</SelectItem>
                  <SelectItem value="Army">Army</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button type="submit">Add Symbol</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
