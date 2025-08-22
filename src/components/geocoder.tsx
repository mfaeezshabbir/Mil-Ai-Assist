"use client";

import React, { useEffect, useState } from "react";
import type { MapRef } from "react-map-gl";
import { Search, X, MapPin } from "lucide-react";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { Card, CardContent } from "./ui/card";

type GeocoderProps = {
  mapboxAccessToken: string;
  mapRef: React.RefObject<MapRef>;
};

export function Geocoder({ mapboxAccessToken, mapRef }: GeocoderProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<any[]>([]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query) {
      setResults([]);
      return;
    }

    const endpoint = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(
      query
    )}.json?access_token=${mapboxAccessToken}&autocomplete=true&limit=5`;

    try {
      const response = await fetch(endpoint);
      const data = await response.json();
      setResults(data.features || []);
    } catch (error) {
      console.error("Error fetching geocoding data:", error);
      setResults([]);
    }
  };

  const handleSelect = (result: any) => {
    mapRef.current?.flyTo({
      center: result.center,
      zoom: 14,
      duration: 2000,
    });
    setQuery(result.place_name);
    setResults([]);
    setOpen(false);
  };

  return (
    <>
      <div
        aria-label={open ? "Close geocoder" : "Open geocoder"}
        className="border-2 border-primary h-10 w-10 rounded-lg bg-gradient-to-br from-accent to-primary text-white shadow-2xl flex items-center justify-center transform transition-transform duration-200 p-[2px] z-50"
        onClick={() => setOpen((s) => !s)}
      >
        {open ? <X className="h-6 w-6" /> : <MapPin className="h-6 w-6" />}
      </div>

      {/* Panel as Sheet */}
      {open && (
        <div className="fixed inset-0 z-50 flex items-end justify-center">
          {/* backdrop */}
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => setOpen(false)}
            aria-hidden
          />

          <div className="relative h-2/5 w-full max-w-md mx-4 mb-6">
            <div className="bg-background/90 backdrop-blur-md border border-primary/20 rounded-t-xl shadow-tactical overflow-hidden transform transition-all duration-300 animate-slide-in-up">
              <div className="flex items-center justify-between px-4 py-2 border-b border-primary/10">
                <div className="flex items-center gap-3">
                  <div className="h-2 w-2 rounded-full bg-accent shadow-md" />
                  <h3 className="text-sm font-display uppercase tracking-wide text-primary">
                    Location Search
                  </h3>
                </div>
                <button
                  aria-label="Close geocoder"
                  className="text-muted-foreground hover:text-foreground p-1"
                  onClick={() => setOpen(false)}
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="p-2">
                <form onSubmit={handleSearch} className="flex gap-2">
                  <div className="relative w-full">
                    <Input
                      type="text"
                      placeholder="Search for a location..."
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                      onBlur={() => setTimeout(() => setResults([]), 200)}
                      className="bg-background/80 backdrop-blur-md shadow-lg"
                    />
                    {results.length > 0 && (
                      <Card className="absolute top-full mt-2 w-full max-h-60 overflow-y-auto bg-background/80 backdrop-blur-md z-50">
                        <CardContent className="p-2">
                          {results.map((result) => (
                            <button
                              key={result.id}
                              onClick={() => handleSelect(result)}
                              className="block w-full text-left p-2 rounded-md hover:bg-muted text-sm"
                              type="button"
                            >
                              {result.place_name}
                            </button>
                          ))}
                        </CardContent>
                      </Card>
                    )}
                  </div>
                  <Button
                    type="submit"
                    size="icon"
                    className="bg-primary hover:bg-primary/90 shrink-0 shadow-lg"
                  >
                    <Search />
                  </Button>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
