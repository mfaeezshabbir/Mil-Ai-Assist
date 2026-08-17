// src/ai/flows/extract-sidc-metadata.ts
// This module defines schemas and tools for extracting SIDC metadata.
// It must not be marked with `"use server"` because it exports objects (schemas/tools)
// which Next.js considers invalid in server modules. Keep it a regular module.
/**
 * @fileOverview This file defines the Genkit flow for extracting and validating SIDC metadata.
 * It uses AI tools to extract metadata from natural language descriptions and convert them
 * to properly formatted data for Symbol Identification Coding (SIDC).
 */

import { ai } from "@/ai/genkit";
import { z } from "genkit";
import { resolveCoordinates } from "@/lib/coordinates";

// Zod schema for the output data structure of SIDC metadata
export const SIDCMetadataSchema = z.object({
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
  latitude: z
    .number()
    .optional()
    .describe("Latitude of the unit when known from the command."),
  longitude: z
    .number()
    .optional()
    .describe("Longitude of the unit when known from the command."),
  locationName: z
    .string()
    .optional()
    .describe(
      "Place name to geocode when numeric coordinates were not provided."
    ),
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

// Export the TypeScript type from the Zod schema
export type SIDCMetadataOutput = z.infer<typeof SIDCMetadataSchema>;

const extractSidcMetadataPrompt = ai.definePrompt({
  name: "extractSidcMetadataPrompt",
  output: { schema: SIDCMetadataSchema },
  prompt: `You are an AI assistant specialized in military symbology according to APP-6D standards.
Extract complete and accurate SIDC metadata from the given description.

Rules:
- Use numeric latitude/longitude when the description includes coordinates.
- Otherwise set locationName to the place mentioned (after "at" or "in") and omit coordinates.
- Copy quoted designations into aiLabel (max 21 characters). Omit aiLabel if none is given.
- Do not invent a default label like "Unknown".

Description: {{{description}}}`,
});

export const extractSidcMetadataFlow = ai.defineFlow(
  {
    name: "extractSidcMetadataFlow",
    inputSchema: z.object({ description: z.string() }),
    outputSchema: SIDCMetadataSchema,
  },
  async (input) => {
    const { output } = await extractSidcMetadataPrompt(input);
    if (!output) {
      throw new Error("AI model did not return valid SIDC metadata.");
    }

    const coords = await resolveCoordinates({
      latitude: output.latitude,
      longitude: output.longitude,
      locationName: output.locationName,
      fallbackText: input.description,
    });

    if (!coords) {
      throw new Error(
        "Could not determine coordinates from the symbol description."
      );
    }

    return {
      ...output,
      latitude: coords.latitude,
      longitude: coords.longitude,
    };
  }
);

// Export a function that can be called from other modules
export async function extractSidcMetadata(input: {
  description: string;
}): Promise<SIDCMetadataOutput> {
  return extractSidcMetadataFlow(input);
}
