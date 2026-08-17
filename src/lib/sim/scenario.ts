import type { SymbolData } from "@/types";
import { createPiece } from "./catalog";

export function sampleBattle(): SymbolData[] {
  return [
    createPiece("infantry", { lat: 33.72, lng: 72.95 }, "Friend", "Raptors"),
    createPiece("armor", { lat: 33.695, lng: 72.97 }, "Friend", "Iron"),
    createPiece("artillery", { lat: 33.74, lng: 72.92 }, "Friend", "Thunder"),
    createPiece("recon", { lat: 33.71, lng: 73.0 }, "Friend", "Scouts"),
    createPiece("hq", { lat: 33.745, lng: 72.89 }, "Friend", "Blue HQ"),
    createPiece("engineer", { lat: 33.705, lng: 72.98 }, "Friend", "Sappers"),
    createPiece("aviation", { lat: 33.76, lng: 72.96 }, "Friend", "Vipers"),
    createPiece("supply", { lat: 33.73, lng: 72.9 }, "Friend", "Dump 1"),
    createPiece("fob", { lat: 33.75, lng: 72.88 }, "Friend", "FOB North"),
    createPiece("infantry", { lat: 33.71, lng: 73.22 }, "Hostile", "Red Rifle"),
    createPiece("armor", { lat: 33.69, lng: 73.2 }, "Hostile", "Red Armor"),
    createPiece("artillery", { lat: 33.73, lng: 73.26 }, "Hostile", "Red Guns"),
    createPiece("air-defence", { lat: 33.7, lng: 73.24 }, "Hostile", "Red AD"),
    createPiece("aviation", { lat: 33.74, lng: 73.23 }, "Hostile", "Red Birds"),
    createPiece("objective", { lat: 33.708, lng: 73.09 }, "Neutral", "OBJ Alpha"),
    createPiece("objective", { lat: 33.68, lng: 73.12 }, "Neutral", "OBJ Bravo"),
    createPiece("minefield", { lat: 33.7, lng: 73.05 }, "Neutral", "Mine belt"),
    createPiece("obstacle", { lat: 33.715, lng: 73.07 }, "Neutral", "Wire"),
  ];
}
