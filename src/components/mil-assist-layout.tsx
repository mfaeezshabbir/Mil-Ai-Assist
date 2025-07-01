'use client';

import { useEffect, useState, useRef } from 'react';
import { useFormState, useFormStatus } from 'react-dom';
import { Loader2, Send } from 'lucide-react';
import type { MapRef } from 'react-map-gl';
import { getMapFeatureFromCommand } from '@/app/actions';
import { useToast } from '@/hooks/use-toast';
import type { SymbolData } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { MapView } from '@/components/map-view';
import { Separator } from './ui/separator';
import { SymbolListSheet } from './symbol-list-sheet';
import { SymbolEditor } from './symbol-editor';
import type { SIDCMetadataOutput } from '@/ai/flows/extract-sidc-metadata';
import { findFunctionId } from '@/lib/sidc-mappings';

const initialState: { feature: any; error: string | null } = {
  feature: null,
  error: null,
};

const initialSymbols: SymbolData[] = [
    {
      id: 'initial-1',
      displayType: 'sidc',
      uniqueDesignation: 'Alpha Company',
      context: 'Reality',
      symbolStandardIdentity: 'Friend',
      status: 'Present',
      hqtfd: 'Not Applicable',
      symbolSet: 'Land Unit',
      functionId: '121100', // Infantry
      modifier1: '00',
      modifier2: '00',
      symbolEchelon: 'Company',
      latitude: 33.72,
      longitude: 73.09,
    },
    {
      id: 'initial-2',
      displayType: 'sidc',
      uniqueDesignation: 'Enemy Armor',
      context: 'Reality',
      symbolStandardIdentity: 'Hostile',
      status: 'Damaged',
      hqtfd: 'Not Applicable',
      symbolSet: 'Land Unit',
      functionId: '120500', // Armour
      modifier1: '00',
      modifier2: '00',
      symbolEchelon: 'Battalion',
      latitude: 33.68,
      longitude: 73.04,
    },
];

const samplePrompts = [
    "Friendly infantry company 'Raptors' at 33.72, 73.09",
    "Damaged hostile armored battalion 'Thunder Run' at 33.68, 73.04",
    "Draw an air corridor for an F-16 from Lahore to Delhi",
    "Show a main attack route from the Khyber Pass to Kabul"
];

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending} className="w-full">
      {pending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Send className="mr-2 h-4 w-4" />}
      <span>Generate Feature</span>
    </Button>
  );
}

export function MilAssistLayout() {
  const [state, formAction] = useFormState(getMapFeatureFromCommand, initialState);
  const [symbols, setSymbols] = useState<SymbolData[]>(initialSymbols);
  const [command, setCommand] = useState('');
  const [apiLog, setApiLog] = useState<object | null>(null);
  const { toast } = useToast();
  
  const mapRef = useRef<MapRef>(null);
  const [editingSymbol, setEditingSymbol] = useState<SymbolData | null>(null);
  const [features, setFeatures] = useState<any[]>([]);

  useEffect(() => {
    if (state !== initialState) {
      setApiLog(state);
    }
    
    if (state.error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: state.error,
      });
    }

    if (state.feature) {
      if (state.feature.type === 'symbol') {
        const { symbolCategory, ...restOfData } = state.feature.data;
        const functionId = findFunctionId(state.feature.data.symbolSet, symbolCategory) || '000000';
        const newSymbol: SymbolData = {
          ...restOfData,
          id: new Date().toISOString() + Math.random(),
          displayType: 'sidc',
          functionId: functionId,
          symbolSet: state.feature.data.symbolSet || 'Land Unit',
          context: state.feature.data.context || 'Reality',
          status: state.feature.data.status || 'Present',
          hqtfd: state.feature.data.hqtfd || 'Not Applicable',
          modifier1: '00',
          modifier2: '00',
        };
        setSymbols((prev) => [...prev, newSymbol]);
        setCommand(''); // Clear input on success

      } else if (state.feature.type === 'route') {
        const routeData = state.feature.data;
        const newFeature = {
          id: new Date().toISOString() + Math.random(),
          type: 'Feature',
          properties: {
            type: routeData.pathType || 'Path',
            unitInfo: routeData.unitInfo || 'Unknown'
          },
          geometry: {
            type: 'LineString',
            coordinates: [
              [routeData.start.lng, routeData.start.lat],
              [routeData.end.lng, routeData.end.lat]
            ]
          }
        };
        setFeatures(prevFeatures => [...prevFeatures, newFeature]);
        setCommand(''); // Clear input on success
      }
    }
  }, [state, toast]);
  
  const handleSampleClick = (prompt: string) => {
    setCommand(prompt);
  };

  const handleMapDoubleClick = ({ lng, lat }: { lng: number; lat: number }) => {
    const coordsString = `at ${lat.toFixed(4)}, ${lng.toFixed(4)}`;
    const coordRegex = /at\s+(-?\d+\.?\d*),\s*(-?\d+\.?\d*)/i;

    setCommand((prevCommand) => {
      if (coordRegex.test(prevCommand)) {
        return prevCommand.replace(coordRegex, coordsString);
      } else {
        return `${prevCommand.trim()} ${coordsString}`.trim();
      }
    });
  };

  const handleEditClick = (symbolId: string) => {
    const symbolToEdit = symbols.find((s) => s.id === symbolId);
    setEditingSymbol(symbolToEdit || null);
  };

  const handleUpdateSymbol = (updatedSymbol: SymbolData) => {
    setSymbols((prev) =>
      prev.map((s) => (s.id === updatedSymbol.id ? updatedSymbol : s))
    );
    setEditingSymbol(null);
  };

  const handleDeleteSymbol = (symbolId: string) => {
    setSymbols((prev) => prev.filter((s) => s.id !== symbolId));
    setEditingSymbol(null);
  };
  
  const handleSymbolDragEnd = (symbolId: string, { lng, lat }: { lng: number; lat: number }) => {
    setSymbols((prevSymbols) =>
      prevSymbols.map((symbol) =>
        symbol.id === symbolId
          ? { ...symbol, longitude: lng, latitude: lat }
          : symbol
      )
    );
  };

  return (
    <div className="grid md:grid-cols-[420px_1fr] h-screen bg-background text-foreground">
      <aside className="p-4 flex flex-col gap-4 border-r bg-background overflow-y-auto">
        <header className="flex items-center justify-between p-2">
          <div>
            <h1 className="text-2xl font-bold text-primary">MilAIAssist</h1>
            <p className="text-sm text-muted-foreground">AI Mission Planner</p>
          </div>
          <SymbolListSheet 
            symbols={symbols}
            mapRef={mapRef}
            onEdit={handleEditClick}
            onDelete={handleDeleteSymbol}
          />
        </header>

        <Card className="flex-shrink-0 bg-card shadow-lg">
          <CardHeader>
            <CardTitle>Natural Language Command</CardTitle>
            <CardDescription>Describe the military symbol or route to generate. You can also double-click on the map to add coordinates.</CardDescription>
          </CardHeader>
          <CardContent>
            <form action={formAction} className="space-y-4">
              <div>
                <Label htmlFor="command-input" className="sr-only">Enter your command:</Label>
                <Input
                  id="command-input"
                  name="command"
                  placeholder="A hostile armored unit at 33.68, 73.04..."
                  required
                  value={command}
                  onChange={(e) => setCommand(e.target.value)}
                  className="mt-1"
                  aria-label="Natural language command input"
                />
              </div>
              <SubmitButton />
            </form>
          </CardContent>
        </Card>

        <Card className="bg-card shadow-lg">
          <CardHeader>
            <CardTitle>Sample Prompts</CardTitle>
            <CardDescription>Click a sample to try it out.</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-2">
            {samplePrompts.map((prompt, index) => (
              <Button
                key={index}
                variant="outline"
                size="sm"
                className="text-left justify-start h-auto"
                onClick={() => handleSampleClick(prompt)}
              >
                {prompt}
              </Button>
            ))}
          </CardContent>
        </Card>
        
        <Separator />

        <Card className="flex-1 min-h-0 bg-card shadow-lg">
          <CardHeader>
            <CardTitle>API Response Log</CardTitle>
            <CardDescription>Raw JSON output from the AI model.</CardDescription>
          </CardHeader>
          <CardContent className="h-full pb-2">
            <ScrollArea className="h-[calc(100%-4rem)] rounded-md border bg-muted/30">
              <pre className="text-xs p-3">
                {apiLog ? JSON.stringify(apiLog, null, 2) : 'Awaiting command...'}
              </pre>
            </ScrollArea>
          </CardContent>
        </Card>
      </aside>
      <main className="p-4">
        <MapView 
            symbols={symbols} 
            onMapDoubleClick={handleMapDoubleClick} 
            mapRef={mapRef}
            onSymbolClick={handleEditClick}
            onSymbolDragEnd={handleSymbolDragEnd}
            features={features}
            onFeaturesChange={setFeatures}
        />
      </main>
      <SymbolEditor 
        symbol={editingSymbol}
        open={!!editingSymbol}
        onOpenChange={(open) => !open && setEditingSymbol(null)}
        onUpdate={handleUpdateSymbol}
      />
    </div>
  );
}
