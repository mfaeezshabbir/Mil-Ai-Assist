'use server';

import { processCommandFlow, type MapFeature } from '@/ai/flows/process-command-flow';
import type { SIDCMetadataOutput } from '@/ai/flows/extract-sidc-metadata';
import { geocode } from '@/services/geocoding';

// Define the output shapes for the client
type SymbolResult = {
  type: 'symbol';
  data: SIDCMetadataOutput;
};

type RouteResult = {
  type: 'route';
  data: {
    start: { lat: number; lng: number };
    end: { lat: number; lng: number };
    pathType?: string;
    unitInfo?: string;
  };
};

type ActionResult = {
  feature: SymbolResult | RouteResult | null;
  error: string | null;
};

export async function getMapFeatureFromCommand(
  prevState: ActionResult,
  formData: FormData
): Promise<ActionResult> {
  const command = formData.get('command') as string;
  if (!command) {
    return { feature: null, error: 'Command cannot be empty.' };
  }

  try {
    const extractedFeature = await processCommandFlow({ command });

    if (extractedFeature.type === 'symbol') {
      return {
        feature: {
          type: 'symbol',
          data: extractedFeature.data,
        },
        error: null,
      };
    } else if (extractedFeature.type === 'route') {
      const { startLocationName, endLocationName, ...rest } = extractedFeature.data;
      
      const [startCoords, endCoords] = await Promise.all([
        geocode(startLocationName),
        geocode(endLocationName),
      ]);

      if (!startCoords || !endCoords) {
        throw new Error(`Could not find coordinates for "${startLocationName}" or "${endLocationName}".`);
      }

      return {
        feature: {
          type: 'route',
          data: {
            ...rest,
            start: { lat: startCoords.latitude, lng: startCoords.longitude },
            end: { lat: endCoords.latitude, lng: endCoords.longitude },
          },
        },
        error: null,
      };
    }
    
    return { feature: null, error: 'Unrecognized feature type from AI.' };

  } catch (e) {
    console.error(e);
    const errorMessage = e instanceof Error ? e.message : 'An unknown error occurred.';
    return { feature: null, error: `Failed to process command: ${errorMessage}` };
  }
}
