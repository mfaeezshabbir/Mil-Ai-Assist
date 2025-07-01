'use client';

import { useState } from 'react';
import type { MapRef } from 'react-map-gl';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { Search } from 'lucide-react';
import { Card, CardContent } from './ui/card';

type GeocoderProps = {
  mapboxAccessToken: string;
  mapRef: React.RefObject<MapRef>;
};

export function Geocoder({ mapboxAccessToken, mapRef }: GeocoderProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<any[]>([]);

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
      console.error('Error fetching geocoding data:', error);
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
  };

  return (
    <div className="absolute top-4 left-4 z-10 w-80">
      <form onSubmit={handleSearch} className="flex gap-2">
        <div className="relative w-full">
          <Input
            type="text"
            placeholder="Search for a location..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onBlur={() => setTimeout(() => setResults([]), 200)}
            className="bg-background/90 backdrop-blur-sm shadow-lg"
          />
          {results.length > 0 && (
            <Card className="absolute top-full mt-2 w-full max-h-60 overflow-y-auto">
              <CardContent className="p-2">
                {results.map((result) => (
                  <button
                    key={result.id}
                    onClick={() => handleSelect(result)}
                    className="block w-full text-left p-2 rounded-md hover:bg-muted text-sm"
                  >
                    {result.place_name}
                  </button>
                ))}
              </CardContent>
            </Card>
          )}
        </div>
        <Button type="submit" size="icon" className="bg-accent hover:bg-accent/90 shrink-0 shadow-lg">
          <Search />
        </Button>
      </form>
    </div>
  );
}
