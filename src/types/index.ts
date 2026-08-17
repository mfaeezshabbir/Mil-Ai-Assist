import type { SIDCMetadataOutput as AIMetadata } from "@/ai/flows/extract-sidc-metadata";

export type RouteData = {
  id: string;
  start: { lat: number; lng: number };
  end: { lat: number; lng: number };
  pathType?: string;
  unitInfo?: string;
};

export type SymbolData = Omit<
  AIMetadata,
  "symbolCategory" | "latitude" | "longitude"
> & {
  id: string;
  displayType: "sidc" | "image";
  imageUrl?: string;
  symbolSet: string;
  mainIconId: string;
  modifier1: string;
  modifier2: string;
  context: string;
  status: string;
  hqtfd: string;
  symbolEchelon?: string;
  latitude: number;
  longitude: number;
};
