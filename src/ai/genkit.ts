import { genkit } from "genkit";
import { googleAI } from "@genkit-ai/googleai";

// Check if API key is configured
const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
  console.warn(
    "⚠️  GEMINI_API_KEY is not configured. AI features will use fallback mode."
  );
}

export const ai = genkit({
  plugins: [
    googleAI({
      apiKey: apiKey,
    }),
  ],
  model: "googleai/gemini-2.0-flash",
});
