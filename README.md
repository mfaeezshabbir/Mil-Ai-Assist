# MilAIAssist: AI-Powered Mission Planner

MilAIAssist is a web-based mission planning assistant that leverages generative AI to interpret natural language commands and generate standard military symbology on an interactive map. This tool is designed to accelerate the planning cycle by allowing operators to quickly visualize the operational picture.

## Features

-   **Natural Language Commands**: Describe units, their status, and locations in plain English (e.g., "Friendly infantry company 'Raptors' at 33.72, 73.09"). The AI extracts the necessary metadata to create a compliant symbol.
-   **Interactive Map**: Powered by Mapbox, the map allows for intuitive placement and adjustment of units. Users can double-click to set coordinates and drag-and-drop symbols to new locations.
-   **MIL-STD-2525D Compliant Symbols**: Symbols are generated using the `milsymbol` library, ensuring they conform to military standards for symbology.
-   **Detailed Symbol Editor**: A comprehensive editor allows users to fine-tune every aspect of a symbol, from its identity and status to specific function IDs and modifiers, with dynamic dropdowns showing only valid options.
-   **Symbol Management**: A slide-out panel lists all symbols currently on the map, with controls to quickly locate, edit, or delete them.
-   **Modern Tech Stack**: Built with Next.js, React, ShadCN UI, Tailwind CSS, and Genkit for AI functionality.

## Getting Started

The application is composed of two main parts:

1.  **Landing Page (`/`)**: An introduction to the application and its features.
2.  **Planner (`/planner`)**: The main mission planning interface.

To start using the planner, navigate to the `/planner` route.

### Environment Setup

To enable the interactive map, you need a Mapbox access token.

1.  Create a free account at [mapbox.com](https://www.mapbox.com).
2.  Find your access token on your account page.
3.  Create a `.env.local` file in the root of the project.
4.  Add your token to the file:

    ```
    NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN=your_mapbox_token_here
    ```

## How It Works

The application uses Genkit to define an AI flow that processes natural language commands. A Zod schema defines the expected output, which the AI uses as a function-calling tool to extract structured data. This data is then used to generate a Symbol Identification Code (SIDC) and render the corresponding symbol on the map.
