// src/ai/flows/process-command-flow.ts
'use server';

/**
 * @fileOverview This file defines the primary Genkit flow for processing natural language commands.
 * It uses AI tools to determine whether the user wants to draw a single symbol or a route between two points,
 * and extracts the necessary data for either action.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import { geocode } from '@/services/geocoding';

// Zod schema for the input required to draw a standard military symbol.
const SymbolInputSchema = z.object({
  context: z.enum([
      'Reality',
      'Exercise',
      'Simulation',
    ]).optional().describe('The context of the symbol (e.g., Reality, Exercise).'),
  symbolStandardIdentity: z.enum([
    'Pending',
    'Unknown',
    'Assumed Friend',
    'Friend',
    'Neutral',
    'Suspect',
    'Hostile',
  ]).describe('The standard identity of the symbol.'),
  symbolSet: z.string().describe("The operational domain of the symbol (e.g., 'Land Unit', 'Air', 'Subsurface')."),
  symbolCategory: z.string().describe('The main function or category of the symbol (e.g., armored, infantry, bomber). This determines the Function ID.'),
  status: z.enum([
      'Present',
      'Planned',
      'Fully Capable',
      'Damaged',
      'Destroyed',
      'Full to Capacity',
    ]).optional().describe('The status of the symbol.'),
  hqtfd: z.enum([
      'Not Applicable',
      'Feint Dummy',
      'Headquarters',
      'Feint Dummy Headquarters',
      'Task Force',
      'Feint Dummy Task Force',
      'Task Force Headquarters',
      'Feint Dummy Task Force Headquarters',
  ]).optional().describe('The headquarters, task force, or dummy status of the symbol.'),
  symbolEchelon: z.enum([
    'Team',
    'Squad',
    'Section',
    'Platoon',
    'Company',
    'Battalion',
    'Regiment',
    'Brigade',
    'Division',
    'Corps',
    'Army',
  ]).optional().describe('The echelon/command level of the symbol, if specified.'),
  modifier1: z.string().optional().describe("The first modifier for the symbol, if applicable (e.g., 'Attack', 'Cargo'). Use Title Case."),
  modifier2: z.string().optional().describe("The second modifier for the symbol, if applicable (e.g., 'Heavy', 'Light'). Use Title Case."),
  uniqueDesignation: z.string().optional().describe('A unique name or designation for the unit, if specified (e.g., "Alpha-1", "Task Force Bravo"). Max length 21.'),
  latitude: z.number().describe('Latitude of the unit'),
  longitude: z.number().describe('Longitude of the unit'),
  // Amplifiers
  additionalInformation: z.string().optional().describe('A text modifier for units, equipment, and installations. Max length 20.'),
  altitudeDepth: z.string().optional().describe('Altitude, flight level, depth, or height of equipment/structures. Max length 14.'),
  combatEffectiveness: z.string().optional().describe('Unit effectiveness or installation capability. Max length 5.'),
  commonIdentifier: z.string().optional().describe('Common identifier, e.g., "Hawk" for Hawk SAM system. Max length 12.'),
  direction: z.string().optional().describe('Direction of movement of an object. Max length 4.'),
  dtg: z.string().optional().describe('Date-Time Group, e.g., DDHHMMSSZMONYYYY. Max length 16.'),
  equipmentTeardownTime: z.string().optional().describe('Equipment teardown time in minutes. Max length 3.'),
  evaluationRating: z.string().optional().describe('A single-letter reliability and single-digit credibility rating. Max length 2.'),
  headquartersElement: z.string().optional().describe('Type of element of a headquarters, e.g., TOC, MAIN. Max length 4.'),
  higherFormation: z.string().optional().describe('Number or title of higher echelon command. Max length 21.'),
  hostile: z.string().optional().describe('Letters "ENY" for hostile equipment. Max length 3.'),
  iffSif: z.string().optional().describe('IFF/SIF Identification modes and codes. Max length 5.'),
  location: z.string().optional().describe('Location in degrees, minutes, seconds or UTM. Max length 19.'),
  platformType: z.string().optional().describe('Electronic intelligence notation (ELNOT) or communications intelligence notation (CENOT). Max length 10.'),
  quantity: z.string().optional().describe('Number of items of equipment present. Max length 9.'),
  reinforcedReduced: z.string().optional().describe('(+) for reinforced, (-) for reduced. Max length 1.'),
  signatureEquipment: z.string().optional().describe('Identifies a detectable electronic signature. Max length 1.'),
  specialHeadquarters: z.string().optional().describe('A named command such as SHAPE, PACOM, etc. Max length 9.'),
  speed: z.string().optional().describe('Velocity in nautical miles per hour or kilometres per hour. Max length 8.'),
  staffComments: z.string().optional().describe('Staff comments; content is implementation specific. Max length 20.'),
  type: z.string().optional().describe('Type of equipment. Max length 24.'),
});

// Zod schema for the data extracted for a route.
const RouteInputSchema = z.object({
  startLocationName: z.string().describe('The starting location name of the path or route (e.g., "Paris", "Lahore").'),
  endLocationName: z.string().describe('The ending location name of the path or route (e.g., "Berlin", "Delhi").'),
  pathType: z.string().optional().describe('The type of military path, e.g., "Axis of Advance", "Air Corridor", "Main Attack Route".'),
  unitInfo: z.string().optional().describe('Information about the unit associated with the path, e.g., "F-16".'),
});

// The final feature data that the flow can output. It's a union of the two possible feature types.
const MapFeatureSchema = z.union([
  z.object({
    type: z.literal('symbol'),
    data: SymbolInputSchema,
  }),
  z.object({
    type: z.literal('route'),
    data: RouteInputSchema,
  }),
]);
export type MapFeature = z.infer<typeof MapFeatureSchema>;

// The tool the AI will use to "draw" features. Its input is the union schema.
const drawMapFeaturesTool = ai.defineTool({
  name: 'drawMapFeatures',
  description: 'Draw features on the map. This can be a single symbol or a route between two locations.',
  inputSchema: MapFeatureSchema,
  outputSchema: MapFeatureSchema,
}, async (input) => input); // The tool just returns the structured data.


// The main prompt that directs the AI to use the appropriate tool based on the user's command.
const processCommandPrompt = ai.definePrompt({
  name: 'processCommandPrompt',
  tools: [drawMapFeaturesTool],
  prompt: `You are an AI mission planning assistant. Analyze the user's command and extract the necessary information to draw a feature on the map using the drawMapFeatures tool.
- If the command describes a single unit at a specific location, extract the data for a 'symbol'.
- If the command describes a path, movement, or route between two locations, extract the data for a 'route'.
- For routes, you must extract both a start and an end location name.
- Your response must be a call to the drawMapFeatures tool.

Command: {{{command}}}`,
});

// The main flow that gets executed by the server action.
const processCommandFlow = ai.defineFlow({
  name: 'processCommandFlow',
  inputSchema: z.object({ command: z.string() }),
  outputSchema: MapFeatureSchema,
}, async (input) => {
  const { output } = await processCommandPrompt(input);
  if (!output) {
    throw new Error('AI model did not return a valid feature.');
  }
  return output;
});

export async function processCommand(input: { command: string }): Promise<MapFeature> {
  return processCommandFlow(input);
}
