import { destinationPoint } from "./movement";

export function circlePolygon(
  lat: number,
  lng: number,
  radiusKm: number,
  steps = 64
) {
  const ring: [number, number][] = [];
  for (let i = 0; i <= steps; i++) {
    const bearing = (i / steps) * Math.PI * 2;
    const point = destinationPoint(lat, lng, bearing, radiusKm);
    ring.push([point.longitude, point.latitude]);
  }
  return {
    type: "Feature" as const,
    properties: {},
    geometry: {
      type: "Polygon" as const,
      coordinates: [ring],
    },
  };
}
