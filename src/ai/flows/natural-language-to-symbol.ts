// src/ai/flows/natural-language-to-symbol.ts
'use server';

/**
 * @fileOverview This file defines a Genkit flow for converting natural language commands
 * into military symbols using function calling with the Gemini API.
 *
 * - naturalLanguageToSymbol - The main function to convert natural language to a military symbol.
 * - NaturalLanguageToSymbolInput - The input type for the naturalLanguageToSymbol function.
 * - NaturalLanguageToSymbolOutput - The output type for the naturalLanguageToSymbol function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

// Define Zod schema for the tool input
const DrawSidcSymbolInputSchema = z.object({
  standardIdentity: z.enum([
    'Unknown',
    'Assumption of Hostile',
    'Hostile',
    'Neutral',
    'Friendly',
  ]).describe('The standard identity of the unit.'),
  dimension: z.enum([
    'Air',
    'Ground',
    'Sea Surface',
    'Subsurface',
    'Space',
    'SOF',
  ]).describe('The dimension in which the unit operates.'),
  affiliation: z.enum([
    'Not applicable',
    'Task Force',
    'Headquarters',
  ]).optional().describe('The affiliation of the unit (e.g., Task Force, Headquarters).'),
  echelon: z.enum([
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
  ]).optional().describe('The echelon level of the unit.'),
  damaged: z.boolean().optional().describe('Whether the unit is damaged.'),
  latitude: z.number().describe('The latitude of the unit.'),
  longitude: z.number().describe('The longitude of the unit.'),
});

// Define the tool itself
const drawSidcSymbolTool = ai.defineTool(
  {
    name: 'draw_sidc_symbol',
    description: 'Generates a military symbol on a map at the specified coordinates.',
    inputSchema: DrawSidcSymbolInputSchema,
    outputSchema: z.string().describe('A string containing an SVG representation of the generated symbol.'),
  },
  async (input) => {
    // Placeholder implementation: replace with actual milsymbol rendering logic
    // In a real implementation, this function would use the `milsymbol` library
    // to generate an SVG based on the input parameters.
    // For this example, just return a simple string.
    return `SVG symbol for unit at ${input.latitude}, ${input.longitude}`;
  }
);

const NaturalLanguageToSymbolInputSchema = z.object({
  command: z.string().describe('A natural language command describing a military unit and its attributes.'),
});

export type NaturalLanguageToSymbolInput = z.infer<typeof NaturalLanguageToSymbolInputSchema>;

const NaturalLanguageToSymbolOutputSchema = z.object({
  svg: z.string().describe('The SVG representation of the military symbol.'),
  apiResponse: z.any().describe('Raw JSON output from the Gemini API function calling.')
});

export type NaturalLanguageToSymbolOutput = z.infer<typeof NaturalLanguageToSymbolOutputSchema>;

export async function naturalLanguageToSymbol(input: NaturalLanguageToSymbolInput): Promise<NaturalLanguageToSymbolOutput> {
  return naturalLanguageToSymbolFlow(input);
}

const naturalLanguageToSymbolPrompt = ai.definePrompt({
  name: 'naturalLanguageToSymbolPrompt',
  tools: [drawSidcSymbolTool],
  input: {schema: NaturalLanguageToSymbolInputSchema},
  output: {schema: NaturalLanguageToSymbolOutputSchema},
  prompt: `You are an AI mission planning assistant.
  The user will provide a natural language command describing a military unit.
  Parse the command and use the draw_sidc_symbol tool to generate the corresponding military symbol on a map.
  Return the SVG symbol and the raw JSON response from the tool call.

  Command: {{{command}}}`,
});

const naturalLanguageToSymbolFlow = ai.defineFlow(
  {
    name: 'naturalLanguageToSymbolFlow',
    inputSchema: NaturalLanguageToSymbolInputSchema,
    outputSchema: NaturalLanguageToSymbolOutputSchema,
  },
  async input => {
    const {output, response} = await naturalLanguageToSymbolPrompt(input);
    return {
      svg: output?.svg ?? 'Error: No SVG generated.',
      apiResponse: response
    };
  }
);
