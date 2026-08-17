"use client";

import { useEffect, useState } from "react";
import { MapPin, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

type LocationPickerProps = {
  latitude: number;
  longitude: number;
  onChange: (coords: { lat: number; lng: number }) => void;
  onPickOnMap?: () => void;
};

type PlaceHit = {
  id: string;
  place_name: string;
  center: [number, number];
};

const TOKEN = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN ?? "";

function roundCoord(value: number) {
  return Math.round(value * 10000) / 10000;
}

export function LocationPicker({
  onChange,
  onPickOnMap,
}: LocationPickerProps) {
  const [query, setQuery] = useState("");
  const [hits, setHits] = useState<PlaceHit[]>([]);

  useEffect(() => {
    const q = query.trim();
    if (q.length < 2 || !TOKEN) {
      setHits([]);
      return;
    }

    const timer = window.setTimeout(async () => {
      try {
        const endpoint = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(
          q
        )}.json?access_token=${TOKEN}&autocomplete=true&limit=5`;
        const response = await fetch(endpoint);
        const data = (await response.json()) as { features?: PlaceHit[] };
        setHits(data.features ?? []);
      } catch {
        setHits([]);
      }
    }, 280);

    return () => window.clearTimeout(timer);
  }, [query]);

  return (
    <div className="space-y-2">
      <div className="relative">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search a place"
          className="pl-9"
        />
        {hits.length > 0 && (
          <div className="absolute z-20 mt-1 w-full border border-primary/30 bg-popover max-h-40 overflow-y-auto">
            {hits.map((hit) => (
              <button
                key={hit.id}
                type="button"
                className="block w-full text-left px-3 py-2 font-mono text-xs hover:bg-muted"
                onClick={() => {
                  onChange({
                    lat: roundCoord(hit.center[1]),
                    lng: roundCoord(hit.center[0]),
                  });
                  setQuery(hit.place_name);
                  setHits([]);
                }}
              >
                {hit.place_name}
              </button>
            ))}
          </div>
        )}
      </div>

      <Button
        type="button"
        variant="outline"
        className="w-full font-mono text-[11px] tracking-[0.16em] uppercase"
        onClick={onPickOnMap}
      >
        <MapPin className="h-4 w-4" />
        Pick on theater map
      </Button>
    </div>
  );
}
