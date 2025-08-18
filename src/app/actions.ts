"use server";

import {
  processCommand,
  type MapFeature,
} from "@/ai/flows/process-command-flow";
import type { SIDCMetadataOutput } from "@/ai/flows/extract-sidc-metadata";
import { geocode } from "@/services/geocoding";

// Define the output shapes for the client
type SymbolResult = {
  // GeoJSON-like feature representing the symbol location
  feature: {
    type: string;
    geometry: {
      type: string;
      coordinates: [number, number];
    };
    properties?: Record<string, any>;
  };
  metadata: SIDCMetadataOutput;
};

type RouteResult = {
  type: "route";
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
  const command = formData.get("command") as string;
  if (!command) {
    return { feature: null, error: "Command cannot be empty." };
  }

  try {
    const extractedFeature = await processCommand({ command });
    if (extractedFeature.type === "symbol") {
      // Build a GeoJSON-like point feature for the map and return SIDC metadata separately
      const { latitude, longitude, ...meta } = extractedFeature.data as any;
      if (typeof latitude !== "number" || typeof longitude !== "number") {
        throw new Error("Symbol data missing coordinates.");
      }

      const geoFeature = {
        type: "Feature",
        geometry: {
          type: "Point",
          coordinates: [longitude, latitude],
        },
        properties: {
          // include main icon and sidc if present for debugging
          mainIconId: (extractedFeature.data as any).mainIconId,
          sidc: (extractedFeature.data as any).sidc,
        },
      };

      const result: ActionResult = {
        feature: {
          feature: geoFeature,
          metadata: meta,
        } as any,
        error: null,
      };
      return result;
    } else if (extractedFeature.type === "route") {
      const { startLocationName, endLocationName, ...rest } =
        extractedFeature.data;

      const [startCoords, endCoords] = await Promise.all([
        geocode(startLocationName),
        geocode(endLocationName),
      ]);

      if (!startCoords || !endCoords) {
        throw new Error(
          `Could not find coordinates for "${startLocationName}" or "${endLocationName}".`
        );
      }

      return {
        feature: {
          type: "route",
          data: {
            ...rest,
            start: { lat: startCoords.latitude, lng: startCoords.longitude },
            end: { lat: endCoords.latitude, lng: endCoords.longitude },
          },
        },
        error: null,
      };
    }

    return { feature: null, error: "Unrecognized feature type from AI." };
  } catch (e) {
    console.error(e);
    let errorMessage =
      e instanceof Error ? e.message : "An unknown error occurred.";
    if (
      errorMessage.includes("503") ||
      errorMessage.toLowerCase().includes("overloaded")
    ) {
      errorMessage =
        "The AI model is currently busy. Please try your command again shortly.";
    } else {
      errorMessage = `Failed to process command: ${errorMessage}`;
    }
    return { feature: null, error: errorMessage };
  }
}
