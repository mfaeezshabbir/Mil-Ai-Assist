import type { SymbolData } from "@/types";
import { withSimDefaults } from "./units";

const EARTH_RADIUS_KM = 6371;

export function haversineKm(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number {
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return 2 * EARTH_RADIUS_KM * Math.asin(Math.min(1, Math.sqrt(a)));
}

function destinationPoint(
  lat: number,
  lng: number,
  bearingRad: number,
  distanceKm: number
): { latitude: number; longitude: number } {
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const toDeg = (rad: number) => (rad * 180) / Math.PI;
  const angular = distanceKm / EARTH_RADIUS_KM;
  const lat1 = toRad(lat);
  const lng1 = toRad(lng);
  const lat2 = Math.asin(
    Math.sin(lat1) * Math.cos(angular) +
      Math.cos(lat1) * Math.sin(angular) * Math.cos(bearingRad)
  );
  const lng2 =
    lng1 +
    Math.atan2(
      Math.sin(bearingRad) * Math.sin(angular) * Math.cos(lat1),
      Math.cos(angular) - Math.sin(lat1) * Math.sin(lat2)
    );
  return { latitude: toDeg(lat2), longitude: toDeg(lng2) };
}

export function stepUnitTowardOrder(unit: SymbolData): SymbolData {
  const next = withSimDefaults(unit);
  const order = next.order;
  if (!order || order.type === "hold") {
    return next;
  }

  const remaining = haversineKm(
    next.latitude,
    next.longitude,
    order.destLat,
    order.destLng
  );
  const speed = next.speedKmPerTurn ?? 15;

  if (remaining <= 0.05 || remaining <= speed) {
    return {
      ...next,
      latitude: order.destLat,
      longitude: order.destLng,
      order: undefined,
    };
  }

  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const bearing = Math.atan2(
    Math.sin(toRad(order.destLng - next.longitude)) *
      Math.cos(toRad(order.destLat)),
    Math.cos(toRad(next.latitude)) * Math.sin(toRad(order.destLat)) -
      Math.sin(toRad(next.latitude)) *
        Math.cos(toRad(order.destLat)) *
        Math.cos(toRad(order.destLng - next.longitude))
  );
  const stepped = destinationPoint(
    next.latitude,
    next.longitude,
    bearing,
    speed
  );

  return {
    ...next,
    latitude: stepped.latitude,
    longitude: stepped.longitude,
  };
}
