// src/ai/flows/extract-sidc-metadata.ts
'use server';

/**
 * @fileOverview Extracts SIDC metadata from natural language commands using function calling.
 *
 * @function extractSIDCMetadata - Extracts and returns SIDC metadata from a natural language command.
 * @typedef {Object} SIDCMetadataInput - The input type for the extractSIDCMetadata function.
 * @typedef {Object} SIDCMetadataOutput - The return type for the extractSIDCMetadata function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SIDCMetadataInputSchema = z.object({
  naturalLanguageCommand: z.string().describe('A natural language command describing a military symbol.'),
});

export type SIDCMetadataInput = z.infer<typeof SIDCMetadataInputSchema>;

const SIDCMetadataOutputSchema = z.object({
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
  uniqueDesignation: z.string().optional().describe('A unique name or designation for the unit, if specified (e.g., "Alpha-1", "Task Force Bravo").'),
  latitude: z.number().describe('Latitude of the unit'),
  longitude: z.number().describe('Longitude of the unit'),
});

export type SIDCMetadataOutput = z.infer<typeof SIDCMetadataOutputSchema>;

async function extractSIDCMetadata(input: SIDCMetadataInput): Promise<SIDCMetadataOutput> {
  return extractSIDCMetadataFlow(input);
}

const drawSIDC = ai.defineTool({
  name: 'draw_sidc_symbol',
  description: 'Use this tool to extract the metadata of SIDC symbol from natural language. Use title case for string enum values.',
  inputSchema: SIDCMetadataOutputSchema,
  outputSchema: SIDCMetadataOutputSchema,
}, async (input) => {
  // This tool itself does not perform any action, but defines the structure for data extraction.
  return input;
});

const extractSIDCMetadataPrompt = ai.definePrompt({
  name: 'extractSIDCMetadataPrompt',
  tools: [drawSIDC],
  input: {schema: SIDCMetadataInputSchema},
  output: {schema: SIDCMetadataOutputSchema},
  prompt: `Extract the SIDC metadata from the following natural language command, using the draw_sidc_symbol tool to extract all fields necessary to draw the symbol.
- Extract any unique name or designation for the unit (e.g., "Alpha Company", "TF-121").
- Return latitude and longitude as floating point numbers.
- Also extract context (reality, exercise, etc), status (planned, damaged, etc), and headquarters/task force/dummy status.
- Determine the correct symbolSet, symbolCategory (the main icon, e.g. Infantry), and any applicable Modifiers (1 and 2).

Command: {{{naturalLanguageCommand}}}`,
});

const extractSIDCMetadataFlow = ai.defineFlow(
  {
    name: 'extractSIDCMetadataFlow',
    inputSchema: SIDCMetadataInputSchema,
    outputSchema: SIDCMetadataOutputSchema,
  },
  async input => {
    const {output} = await extractSIDCMetadataPrompt(input);
    return output!;
  }
);

export { extractSIDCMetadata };
