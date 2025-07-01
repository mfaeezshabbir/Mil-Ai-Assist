'use client';

import type { MapRef, MapLayerMouseEvent } from 'react-map-gl';
import Map, { Marker, NavigationControl, GeolocateControl, FullscreenControl } from 'react-map-gl';
import type { SymbolData } from '@/types';
import { MilitarySymbol } from '@/components/military-symbol';
import { Geocoder } from '@/components/geocoder';

type MapViewProps = {
  symbols: SymbolData[];
  onMapDoubleClick: (coords: { lng: number; lat: number }) => void;
  onSymbolClick: (symbolId: string) => void;
  mapRef: React.RefObject<MapRef>;
};

const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN;

export function MapView({ symbols, onMapDoubleClick, onSymbolClick, mapRef }: MapViewProps) {
  if (!MAPBOX_TOKEN || MAPBOX_TOKEN === 'YOUR_MAPBOX_ACCESS_TOKEN_HERE') {
    return (
      <div className="flex items-center justify-center w-full h-full bg-muted rounded-lg border">
        <div className="text-center p-8 bg-card rounded-lg shadow-md max-w-lg">
          <h2 className="text-xl font-semibold text-primary mb-3">Map Configuration Required</h2>
          <p className="text-muted-foreground mb-4">
            To display the interactive map, please get a free access token from Mapbox and add it to the <code>.env</code> file.
          </p>
          <a
            href="https://account.mapbox.com/access-tokens/"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center h-10 px-4 py-2 bg-accent text-accent-foreground font-medium rounded-md text-sm hover:bg-accent/90"
          >
            Get Mapbox Token
          </a>
        </div>
      </div>
    );
  }

  const handleDblClick = (event: MapLayerMouseEvent) => {
    onMapDoubleClick({
      lng: event.lngLat.lng,
      lat: event.lngLat.lat,
    });
  };

  return (
    <div className="w-full h-full rounded-lg overflow-hidden border relative">
      <Map
        ref={mapRef}
        mapboxAccessToken={MAPBOX_TOKEN}
        initialViewState={{
          longitude: 73.05,
          latitude: 33.675,
          zoom: 11,
        }}
        mapStyle="mapbox://styles/mapbox/satellite-streets-v12"
        onDblClick={handleDblClick}
        doubleClickZoom={false}
      >
        <Geocoder mapboxAccessToken={MAPBOX_TOKEN} mapRef={mapRef} />
        <NavigationControl position="top-right" />
        <GeolocateControl position="top-right" />
        <FullscreenControl position="top-right" />

        {symbols.map((symbol) => (
          <Marker
            key={symbol.id}
            longitude={symbol.longitude}
            latitude={symbol.latitude}
            anchor="bottom"
          >
            <div onClick={() => onSymbolClick(symbol.id)}>
              <MilitarySymbol symbol={symbol} />
            </div>
          </Marker>
        ))}
      </Map>
    </div>
  );
}
