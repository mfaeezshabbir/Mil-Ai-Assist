import { geocode } from "@/services/geocoding";

export type LatLng = {
  latitude: number;
  longitude: number;
};

export function toLatLng(
  latitude: unknown,
  longitude: unknown
): LatLng | null {
  if (
    typeof latitude !== "number" ||
    typeof longitude !== "number" ||
    !Number.isFinite(latitude) ||
    !Number.isFinite(longitude) ||
    latitude < -90 ||
    latitude > 90 ||
    longitude < -180 ||
    longitude > 180
  ) {
    return null;
  }
  return { latitude, longitude };
}

export function isValidLatLng(
  latitude: unknown,
  longitude: unknown
): boolean {
  return toLatLng(latitude, longitude) !== null;
}

export function parseCoordinatesFromText(text: string): LatLng | null {
  const match = text.match(/(-?\d+(?:\.\d+)?)\s*,\s*(-?\d+(?:\.\d+)?)/);
  if (!match) return null;
  return toLatLng(Number(match[1]), Number(match[2]));
}

function locationNameFromText(text: string): string | undefined {
  const locMatch = text.match(/(?:at|in)\s+([A-Za-z][A-Za-z\s,'-]{1,80})/i);
  if (!locMatch) return undefined;
  return locMatch[1].trim().split(/[.]/)[0]?.trim();
}

export async function resolveCoordinates(options: {
  latitude?: number;
  longitude?: number;
  locationName?: string;
  fallbackText?: string;
}): Promise<LatLng | null> {
  const fromText = options.fallbackText
    ? parseCoordinatesFromText(options.fallbackText)
    : null;
  if (fromText) return fromText;

  const hasNamedPlace = Boolean(
    options.locationName ||
      (options.fallbackText && locationNameFromText(options.fallbackText))
  );
  const looksUnsetPlaceholder =
    options.latitude === 0 && options.longitude === 0 && hasNamedPlace;

  const explicit = toLatLng(options.latitude, options.longitude);

  if (explicit && !looksUnsetPlaceholder) {
    return explicit;
  }

  const locationName =
    options.locationName ||
    (options.fallbackText
      ? locationNameFromText(options.fallbackText)
      : undefined);

  if (locationName) {
    const geo = await geocode(locationName);
    if (geo) return geo;
  }

  return null;
}
