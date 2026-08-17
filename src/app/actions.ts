"use server";

import {
  processCommand,
  type MapFeature,
} from "@/ai/flows/process-command-flow";
import type { SIDCMetadataOutput } from "@/ai/flows/extract-sidc-metadata";
import { geocode } from "@/services/geocoding";
import { requireSession } from "@/lib/auth";
import { toLatLng } from "@/lib/coordinates";

export type SymbolResult = {
  type: "symbol";
  feature: {
    type: "Feature";
    geometry: {
      type: "Point";
      coordinates: [number, number];
    };
    properties?: Record<string, string | undefined>;
  };
  metadata: SIDCMetadataOutput;
};

export type RouteResult = {
  type: "route";
  data: {
    start: { lat: number; lng: number };
    end: { lat: number; lng: number };
    pathType?: string;
    unitInfo?: string;
  };
};

export type ActionResult = {
  id: string | null;
  feature: SymbolResult | RouteResult | null;
  error: string | null;
};

function resultId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export async function getMapFeatureFromCommand(
  _prevState: ActionResult,
  formData: FormData
): Promise<ActionResult> {
  try {
    await requireSession();
  } catch {
    return {
      id: resultId(),
      feature: null,
      error: "You must be signed in to run commands.",
    };
  }

  const commandValue = formData.get("command");
  const command =
    typeof commandValue === "string" ? commandValue.trim() : "";
  if (!command) {
    return {
      id: resultId(),
      feature: null,
      error: "Command cannot be empty.",
    };
  }

  try {
    const extractedFeature: MapFeature = await processCommand({ command });
    if (extractedFeature.type === "symbol") {
      const { latitude, longitude, ...meta } = extractedFeature.data;
      const coords = toLatLng(latitude, longitude);
      if (!coords) {
        throw new Error(
          "Could not determine coordinates. Please specify a location in your command (e.g., 'at Lahore' or provide coordinates like '33.72, 73.09')."
        );
      }

      return {
        id: resultId(),
        feature: {
          type: "symbol",
          feature: {
            type: "Feature",
            geometry: {
              type: "Point",
              coordinates: [coords.longitude, coords.latitude],
            },
            properties: {
              mainIconId: (extractedFeature.data as { mainIconId?: string })
                .mainIconId,
            },
          },
            metadata: {
            ...meta,
            latitude: coords.latitude,
            longitude: coords.longitude,
          },
        },
        error: null,
      };
    }

    if (extractedFeature.type === "route") {
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
        id: resultId(),
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

    return {
      id: resultId(),
      feature: null,
      error: "Unrecognized feature type from AI.",
    };
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
    } else if (!errorMessage.startsWith("Could not")) {
      errorMessage = `Failed to process command: ${errorMessage}`;
    }
    return { id: resultId(), feature: null, error: errorMessage };
  }
}
