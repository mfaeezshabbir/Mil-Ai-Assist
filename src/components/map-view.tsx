'use client';

import type { MapRef, MapLayerMouseEvent } from 'react-map-gl';
import Map, { Marker, NavigationControl, GeolocateControl, FullscreenControl } from 'react-map-gl';
import type { SymbolData } from '@/types';
import { Geocoder } from '@/components/geocoder';
import { PointMarker } from './point-marker';
import DrawControl from './draw-control';

type MapViewProps = {
  symbols: SymbolData[];
  onMapDoubleClick: (coords: { lng: number; lat: number }) => void;
  onSymbolClick: (symbolId: string) => void;
  onSymbolDragEnd: (symbolId: string, coords: { lng: number; lat: number }) => void;
  mapRef: React.RefObject<MapRef>;
  features: any;
  onFeaturesChange: (features: any) => void;
};

const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN;

export function MapView({ 
  symbols, 
  onMapDoubleClick, 
  onSymbolClick, 
  onSymbolDragEnd, 
  mapRef,
  features,
  onFeaturesChange
}: MapViewProps) {
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
  
  const onUpdate = (e: { features: object[] }) => {
    onFeaturesChange(e.features);
  };

  const onCreate = (e: { features: object[] }) => {
    onFeaturesChange(e.features);
  };

  const onDelete = (e: { features: object[] }) => {
    onFeaturesChange(e.features);
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
        
        <DrawControl
          position="top-right"
          displayControlsDefault={false}
          controls={{
            polygon: true,
            line_string: true,
            trash: true
          }}
          features={features}
          onCreate={onCreate}
          onUpdate={onUpdate}
          onDelete={onDelete}
        />

        {symbols.map((symbol) => (
          <Marker
            key={symbol.id}
            longitude={symbol.longitude}
            latitude={symbol.latitude}
            anchor="bottom"
            draggable={true}
            onClick={() => onSymbolClick(symbol.id)}
            onDragEnd={(event) =>
              onSymbolDragEnd(symbol.id, {
                lng: event.lngLat.lng,
                lat: event.lngLat.lat,
              })
            }
          >
            <PointMarker symbol={symbol} />
          </Marker>
        ))}
      </Map>
    </div>
  );
}
