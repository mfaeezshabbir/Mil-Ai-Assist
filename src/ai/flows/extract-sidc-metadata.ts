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
  symbolStandardIdentity: z.enum([
    'Pending',
    'Unknown',
    'Assumed Friend',
    'Friend',
    'Neutral',
    'Suspect',
    'Hostile',
  ]).describe('The standard identity of the symbol.'),
  symbolCategory: z.string().describe('The category of the symbol (e.g., armored, infantry).'),
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
  symbolDamaged: z.boolean().optional().describe('Whether the unit is damaged or not'),
  symbolTaskForce: z.boolean().optional().describe('Whether the unit is a task force headquarters'),
  latitude: z.number().describe('Latitude of the unit'),
  longitude: z.number().describe('Longitude of the unit'),
});

export type SIDCMetadataOutput = z.infer<typeof SIDCMetadataOutputSchema>;

async function extractSIDCMetadata(input: SIDCMetadataInput): Promise<SIDCMetadataOutput> {
  return extractSIDCMetadataFlow(input);
}

const drawSIDC = ai.defineTool({
  name: 'draw_sidc_symbol',
  description: 'Use this tool to extract the metadata of SIDC symbol from natural language, including standard identity, category, echelon, damaged, task force, latitude and longitude.',
  inputSchema: SIDCMetadataInputSchema,
  outputSchema: SIDCMetadataOutputSchema,
}, async (input) => {
  // This tool itself does not perform any action, but defines the structure for data extraction.
  return {
    symbolStandardIdentity: 'Unknown',
    symbolCategory: 'Unknown',
    symbolEchelon: 'Team',
    symbolDamaged: false,
    symbolTaskForce: false,
    latitude: 0,
    longitude: 0,
  };
});

const extractSIDCMetadataPrompt = ai.definePrompt({
  name: 'extractSIDCMetadataPrompt',
  tools: [drawSIDC],
  input: {schema: SIDCMetadataInputSchema},
  output: {schema: SIDCMetadataOutputSchema},
  prompt: `Extract the SIDC metadata from the following natural language command, using the draw_sidc_symbol tool to extract all fields necessary to draw the symbol. Return latitude and longitude as floating point numbers.

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
