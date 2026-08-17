type GeocodeResult = {
  latitude: number;
  longitude: number;
};

/**
 * Geocodes a location name using the Mapbox Geocoding API.
 * Server-only helper — not a public server action.
 */
export async function geocode(
  locationName: string
): Promise<GeocodeResult | null> {
  const accessToken = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN;
  if (!accessToken) {
    console.error("Mapbox access token is not configured.");
    return null;
  }

  const endpoint = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(
    locationName
  )}.json?access_token=${accessToken}&limit=1`;

  try {
    const response = await fetch(endpoint);
    const data = (await response.json()) as {
      features?: { center: [number, number] }[];
    };

    if (data.features && data.features.length > 0) {
      const [longitude, latitude] = data.features[0].center;
      return { latitude, longitude };
    }

    return null;
  } catch (error) {
    console.error("Error fetching geocoding data:", error);
    return null;
  }
}
