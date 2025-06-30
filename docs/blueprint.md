# **App Name**: MilAIAssist

## Core Features:

- NLU to Symbol: Natural Language to Symbol Command: Interpret user's natural language commands using the Gemini API, translating intent into structured parameters for drawing military symbols, by using the function-calling tool to determine when or if to include each individual piece of data.
- SIDC Rendering: Render SIDC: Use the function-calling tool to build a valid SIDC (Standard Identity, Distinction, Category) string from parsed command parameters and the milsymbol library to generate the SVG for the military symbol.
- Symbol Plotting: Map Display: Plot the rendered SVG military symbol on a map at the specified coordinates, using a library such as Leaflet or Mapbox.
- Input Box: User Input: A simple text input box to allow users to type in natural language commands for symbol creation.
- Map Display: Map Canvas: A dedicated area to display the interactive map with plotted military symbols.
- API Log: Response Log: Display the raw JSON output from the Gemini API function calling for debugging and confirmation.

## Style Guidelines:

- Primary color: Deep gray-blue (#4A6572) to evoke a sense of authority and strategic overview.
- Background color: Light gray (#E8E8E8), offering a clean and neutral backdrop to focus attention on the map and symbols.
- Accent color: A vibrant orange (#E27D60) will draw attention to key elements like the input box and important metadata.
- Body and headline font: 'Inter', a sans-serif font, to offer a clean, objective and readable style. 'Inter' will be used throughout because this application's expected content volume is small.
- Use clear, simple icons for UI elements like zoom controls, and display metadata.
- A split-screen layout with the map occupying the larger portion and a sidebar for user input and response logs.
- Subtle animations for symbol appearance and user interactions, avoiding unnecessary distractions.