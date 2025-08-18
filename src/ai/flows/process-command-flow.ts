// src/ai/flows/process-command-flow.ts
"use server";

/**
 * @fileOverview This file defines the primary Genkit flow for processing natural language commands.
 * It uses AI tools to determine whether the user wants to draw a single symbol or a route between two points,
 * and extracts the necessary data for either action.
 */

import { ai } from "@/ai/genkit";
import { z } from "genkit";
import { geocode } from "@/services/geocoding";
import { extractSidcMetadataFlow } from "./extract-sidc-metadata";
import { findFunctionId } from "@/lib/sidc-mappings";
import { generateSIDC, validateSIDC } from "@/lib/sidc-generator";

// Zod schema for the input required to draw a standard military symbol.
const SymbolInputSchema = z.object({
  context: z
    .enum(["Reality", "Exercise", "Simulation"])
    .optional()
    .describe("The context of the symbol (e.g., Reality, Exercise)."),
  symbolStandardIdentity: z
    .enum([
      "Pending",
      "Unknown",
      "Assumed Friend",
      "Friend",
      "Neutral",
      "Suspect",
      "Hostile",
    ])
    .describe("The standard identity of the symbol."),
  symbolSet: z
    .string()
    .describe(
      "The operational domain of the symbol (e.g., 'Land Unit', 'Air', 'Subsurface')."
    ),
  symbolCategory: z
    .string()
    .describe(
      "The main function or category of the symbol (e.g., armored, infantry, bomber). This determines the Function ID."
    ),
  status: z
    .enum([
      "Present",
      "Planned",
      "Fully Capable",
      "Damaged",
      "Destroyed",
      "Full to Capacity",
    ])
    .optional()
    .describe("The status of the symbol."),
  hqtfd: z
    .enum([
      "Not Applicable",
      "Feint Dummy",
      "Headquarters",
      "Feint Dummy Headquarters",
      "Task Force",
      "Feint Dummy Task Force",
      "Task Force Headquarters",
      "Feint Dummy Task Force Headquarters",
    ])
    .optional()
    .describe("The headquarters, task force, or dummy status of the symbol."),
  symbolEchelon: z
    .enum([
      "Team",
      "Squad",
      "Section",
      "Platoon",
      "Company",
      "Battalion",
      "Regiment",
      "Brigade",
      "Division",
      "Corps",
      "Army",
    ])
    .optional()
    .describe("The echelon/command level of the symbol, if specified."),
  modifier1: z
    .string()
    .optional()
    .describe(
      "The first modifier for the symbol, if applicable (e.g., 'Attack', 'Cargo'). Use Title Case."
    ),
  modifier2: z
    .string()
    .optional()
    .describe(
      "The second modifier for the symbol, if applicable (e.g., 'Heavy', 'Light'). Use Title Case."
    ),
  aiLabel: z
    .string()
    .optional()
    .describe(
      'AI-provided label or designation for the unit (e.g., "Alpha-1", "Task Force Bravo"). Max length 21.'
    ),
  latitude: z.number().describe("Latitude of the unit"),
  longitude: z.number().describe("Longitude of the unit"),
  // Amplifiers
  additionalInformation: z
    .string()
    .optional()
    .describe(
      "A text modifier for units, equipment, and installations. Max length 20."
    ),
  altitudeDepth: z
    .string()
    .optional()
    .describe(
      "Altitude, flight level, depth, or height of equipment/structures. Max length 14."
    ),
  combatEffectiveness: z
    .string()
    .optional()
    .describe("Unit effectiveness or installation capability. Max length 5."),
  commonIdentifier: z
    .string()
    .optional()
    .describe(
      'Common identifier, e.g., "Hawk" for Hawk SAM system. Max length 12.'
    ),
  direction: z
    .string()
    .optional()
    .describe("Direction of movement of an object. Max length 4."),
  dtg: z
    .string()
    .optional()
    .describe("Date-Time Group, e.g., DDHHMMSSZMONYYYY. Max length 16."),
  equipmentTeardownTime: z
    .string()
    .optional()
    .describe("Equipment teardown time in minutes. Max length 3."),
  evaluationRating: z
    .string()
    .optional()
    .describe(
      "A single-letter reliability and single-digit credibility rating. Max length 2."
    ),
  headquartersElement: z
    .string()
    .optional()
    .describe(
      "Type of element of a headquarters, e.g., TOC, MAIN. Max length 4."
    ),
  higherFormation: z
    .string()
    .optional()
    .describe("Number or title of higher echelon command. Max length 21."),
  hostile: z
    .string()
    .optional()
    .describe('Letters "ENY" for hostile equipment. Max length 3.'),
  iffSif: z
    .string()
    .optional()
    .describe("IFF/SIF Identification modes and codes. Max length 5."),
  location: z
    .string()
    .optional()
    .describe("Location in degrees, minutes, seconds or UTM. Max length 19."),
  platformType: z
    .string()
    .optional()
    .describe(
      "Electronic intelligence notation (ELNOT) or communications intelligence notation (CENOT). Max length 10."
    ),
  quantity: z
    .string()
    .optional()
    .describe("Number of items of equipment present. Max length 9."),
  reinforcedReduced: z
    .string()
    .optional()
    .describe("(+) for reinforced, (-) for reduced. Max length 1."),
  signatureEquipment: z
    .string()
    .optional()
    .describe("Identifies a detectable electronic signature. Max length 1."),
  specialHeadquarters: z
    .string()
    .optional()
    .describe("A named command such as SHAPE, PACOM, etc. Max length 9."),
  speed: z
    .string()
    .optional()
    .describe(
      "Velocity in nautical miles per hour or kilometres per hour. Max length 8."
    ),
  staffComments: z
    .string()
    .optional()
    .describe(
      "Staff comments; content is implementation specific. Max length 20."
    ),
  type: z.string().optional().describe("Type of equipment. Max length 24."),
});

// Zod schema for the data extracted for a route.
const RouteInputSchema = z.object({
  startLocationName: z
    .string()
    .describe(
      'The starting location name of the path or route (e.g., "Paris", "Lahore").'
    ),
  endLocationName: z
    .string()
    .describe(
      'The ending location name of the path or route (e.g., "Berlin", "Delhi").'
    ),
  pathType: z
    .string()
    .optional()
    .describe(
      'The type of military path, e.g., "Axis of Advance", "Air Corridor", "Main Attack Route".'
    ),
  unitInfo: z
    .string()
    .optional()
    .describe(
      'Information about the unit associated with the path, e.g., "F-16".'
    ),
});

// The final feature data that the flow can output. It's a union of the two possible feature types.
const MapFeatureSchema = z.union([
  z.object({
    type: z.literal("symbol"),
    data: SymbolInputSchema,
  }),
  z.object({
    type: z.literal("route"),
    data: RouteInputSchema,
  }),
]);
export type MapFeature = z.infer<typeof MapFeatureSchema>;

// The tool the AI will use to "draw" features. We accept any input here and
// validate inside the handler to avoid pre-validation errors when the AI
// returns an empty object ({}). The handler will attempt to coerce/fallback
// to a valid MapFeature.
const drawMapFeaturesTool = ai.defineTool(
  {
    name: "drawMapFeatures",
    description:
      "Draw features on the map. This can be a single symbol or a route between two locations.",
    // Accept anything at the tool boundary; validate/parse inside the handler.
    inputSchema: z.any(),
    outputSchema: z.any(),
  },
  async (input) => {
    try {
      // If input already matches MapFeatureSchema, return it.
      const parsed = MapFeatureSchema.parse(input);
      return parsed;
    } catch (e) {
      // If the AI returned an empty object or invalid structure, attempt a fallback.
      // If the tool call included a natural language command, use that as a description.
      try {
        // Try common places where a description/command might be provided
        const description =
          (input && (input.description || input.command)) ||
          (input && input.data && input.data.description) ||
          "";

        // Always attempt fallback extraction (mock extractor will return a placeholder)
        const fallback = await extractSidcMetadataFlow({ description });
        if (
          fallback &&
          typeof (fallback as any).latitude === "number" &&
          typeof (fallback as any).longitude === "number"
        ) {
          return { type: "symbol", data: fallback } as any;
        }
      } catch (err) {
        console.warn("drawMapFeaturesTool fallback failed:", err);
      }

      // If fallback also failed, return a minimal placeholder feature so the app can handle it
      return {
        type: "symbol",
        data: {
          symbolStandardIdentity: "Friend",
          symbolSet: "Land Unit",
          symbolCategory: "Unknown",
          latitude: 0,
          longitude: 0,
        },
      } as any;
    }
  }
);

// The main prompt that directs the AI to use the appropriate tool based on the user's command.
const processCommandPrompt = ai.definePrompt({
  name: "processCommandPrompt",
  tools: [drawMapFeaturesTool],
  prompt: `You are an AI mission planning assistant. Analyze the user's command and extract the necessary information to draw a feature on the map using the drawMapFeatures tool.
- If the command describes a single unit at a specific location, extract the data for a 'symbol'.
- If the command describes a path, movement, or route between two locations, extract the data for a 'route'.
- For routes, you must extract both a start and an end location name.
- Your response must be a call to the drawMapFeatures tool.

Command: {{{command}}}

If a unique name or designation is included in the user's command (for example: 'Raptors', "Thunder Run", or Alpha-1), set the aiLabel field in the symbol data to that exact text (max 21 characters). If no name is provided, omit aiLabel (do not insert a default like 'Unknown').`,
});
// Note: aiLabel instruction is embedded directly in the prompt above.

// The main flow that gets executed by the server action.
const processCommandFlow = ai.defineFlow(
  {
    name: "processCommandFlow",
    inputSchema: z.object({ command: z.string() }),
    // Accept any output at the flow boundary and validate/parse inside the handler.
    outputSchema: z.any(),
  },
  async (input) => {
    const { output } = await processCommandPrompt(input);

    // Try to validate the AI output against our MapFeatureSchema.
    try {
      const parsed = MapFeatureSchema.parse(output);
      return parsed;
    } catch (err) {
      // If validation failed, continue to fallbacks below.
    }

    // Fallback: try extracting SIDC metadata directly from the command
    // This helps when the AI returns an empty object ({}) or fails schema validation.
    // 1) Try extracting with the dedicated extractor
    try {
      const fallback = await extractSidcMetadataFlow({
        description: input.command,
      });
      if (
        fallback &&
        typeof (fallback as any).latitude === "number" &&
        typeof (fallback as any).longitude === "number"
      ) {
        return { type: "symbol", data: fallback } as any;
      }
    } catch (e) {
      console.warn("Fallback SIDC metadata extraction failed:", e);
    }

    // 2) Lightweight NL fallback parser: try to parse "<unit-type> <echelon> at <location>"
    try {
      const cmd = (input.command || "").toString();
      const cmdLower = cmd.toLowerCase();

      // Echelon regex
      const echelonMatch = cmdLower.match(
        /\b(team|squad|section|platoon|company|battalion|regiment|brigade|division|corps|army)\b/
      );
      const unitMatch = cmdLower.match(
        /\b(infantry|armou?red|armor|tank|artillery|engineer|recon|airborne|cavalry|infantryman)\b/
      );
      // location: capture the token after ' at ' or ' in '
      const locMatch = cmd.match(/(?:at|in)\s+([A-Za-z\s\,]+)/i);

      const locationName = locMatch
        ? locMatch[1].trim().split(/[,\.]/)[0]
        : undefined;
      let latitude: number | null = null;
      let longitude: number | null = null;

      if (locationName) {
        const geo = await geocode(locationName);
        if (geo) {
          latitude = geo.latitude;
          longitude = geo.longitude;
        }
      }

      // Try to extract a quoted aiLabel from the command (e.g., 'Raptors', "Thunder Run")
      const quotedMatch = cmd.match(/['\"]([^'\"]{1,21})['\"]/);
      const aiLabel = quotedMatch ? quotedMatch[1].trim() : undefined;

      if (latitude !== null && longitude !== null) {
        // Build normalized symbol data
        const symbolCategory = unitMatch
          ? unitMatch[1] || unitMatch[0]
          : "Infantry";

        // Title-case helpers
        const toTitle = (s?: string) =>
          s
            ? s
                .toString()
                .trim()
                .toLowerCase()
                .replace(/(^|\s)\S/g, (t) => t.toUpperCase())
            : s;

        const echelon = echelonMatch ? toTitle(echelonMatch[1]) : undefined;

        // Find function ID from mappings
        const mainIconId =
          findFunctionId("Land Unit", symbolCategory) || "000000";

        const symbolData: any = {
          symbolStandardIdentity: "Friend",
          symbolSet: "Land Unit",
          symbolCategory: toTitle(symbolCategory),
          mainIconId,
          modifier1: "00",
          modifier2: "00",
          latitude,
          longitude,
          aiLabel,
        };
        if (echelon) symbolData.symbolEchelon = echelon;

        // Generate SIDC and validate
        try {
          const sidc = generateSIDC(symbolData);
          const valid = validateSIDC(sidc);
          symbolData.sidc = sidc;
          symbolData.sidcValid = valid;
        } catch (err) {
          console.warn("Failed to generate SIDC:", err);
        }

        return { type: "symbol", data: symbolData } as any;
      }
    } catch (e) {
      console.warn("NL fallback parser failed:", e);
    }

    // 3) Final fallback: return a minimal placeholder symbol so the app can handle it.
    return {
      type: "symbol",
      data: {
        symbolStandardIdentity: "Friend",
        symbolSet: "Land Unit",
        symbolCategory: "Unknown",
        latitude: 0,
        longitude: 0,
      },
    } as any;
  }
);

export async function processCommand(input: {
  command: string;
}): Promise<MapFeature> {
  return processCommandFlow(input);
}
