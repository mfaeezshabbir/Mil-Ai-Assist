'use client';

import type { SymbolData } from '@/types';
import { MilitarySymbol } from '@/components/military-symbol';
import Image from 'next/image';

type MapViewProps = {
  symbols: SymbolData[];
};

// Define a bounding box for our map area (centered around Islamabad)
const MAP_BOUNDS = {
  minLon: 72.8,
  maxLon: 73.3,
  minLat: 33.5,
  maxLat: 33.8,
};

const convertCoordsToPixels = (lat: number, lon: number, width: number, height: number) => {
  const x = ((lon - MAP_BOUNDS.minLon) / (MAP_BOUNDS.maxLon - MAP_BOUNDS.minLon)) * width;
  const y = ((MAP_BOUNDS.maxLat - lat) / (MAP_BOUNDS.maxLat - MAP_BOUNDS.minLat)) * height;
  return { x, y };
};

export function MapView({ symbols }: MapViewProps) {
  const mapWidth = 1600;
  const mapHeight = 1200;

  return (
    <div className="relative w-full h-full bg-card rounded-lg shadow-inner overflow-hidden border">
      <Image
        src="https://placehold.co/1600x1200.png"
        alt="Map background"
        data-ai-hint="map satellite"
        width={mapWidth}
        height={mapHeight}
        className="object-cover w-full h-full"
        priority
      />
      <div className="absolute inset-0">
        {symbols.map((symbol) => {
          const { x, y } = convertCoordsToPixels(symbol.latitude, symbol.longitude, mapWidth, mapHeight);

          // Simple check to not render symbols outside the view
          if (x < 0 || x > mapWidth || y < 0 || y > mapHeight) {
            return null;
          }

          return (
            <div
              key={symbol.id}
              className="absolute transition-all duration-300 ease-out"
              style={{
                left: `${x}px`,
                top: `${y}px`,
                transform: 'translate(-50%, -50%)',
              }}
            >
              <MilitarySymbol symbol={symbol} />
            </div>
          );
        })}
      </div>
    </div>
  );
}
