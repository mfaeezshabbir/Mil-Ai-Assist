# MilAIAssist: AI-Powered Mission Planner

[![Next.js](https://img.shields.io/badge/Next.js-000000?logo=nextdotjs&logoColor=white)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-20232a?logo=react&logoColor=61dafb)](https://react.dev/)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-38B2AC?logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Mapbox](https://img.shields.io/badge/Mapbox-000000?logo=mapbox&logoColor=white)](https://mapbox.com/)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

**MilAIAssist** is a web-based mission planning assistant that uses **Generative AI** to interpret natural language commands and generate **MIL-STD-2525D-compliant military symbology** on an interactive map.  
It accelerates planning by transforming plain English inputs into **visual operational pictures**.

---

## 📑 Table of Contents

- [Features](#-features)
- [Getting Started](#-getting-started)
  - [Environment Setup](#environment-setup)
- [How It Works](#-how-it-works)
- [Tech Stack](#-tech-stack)
- [Recent Improvements](#-recent-improvements)
- [Planner Overview](#-planner-overview)
- [Developer Setup](#-developer-setup)
- [Quick Test](#-quick-test-command-flow)
- [Next Improvements](#-next-improvements)

---

## 🚀 Features

- **Natural Language Commands** – Generate units, locations, and statuses from plain text (requires GEMINI_API_KEY).
- **Manual Symbol Addition** – Add symbols manually using the "+" button without AI.
- **Live Situational Awareness** – Real-time clock, coordinates, and map scale.
- **Multiple Map Styles** – Tactical (dark), Satellite, Terrain, and Streets.
- **Interactive Map (Mapbox-powered)** – Double-click to place units, drag-and-drop to reposition.
- **MIL-STD-2525D Symbology** – Powered by [`milsymbol`](https://github.com/spatialillusions/milsymbol).
- **Advanced Symbol Editor** – Customize identity, status, and modifiers with valid-only options.
- **Symbol Management** – Slide-out panel for locating, editing, or deleting symbols.
- **Modern Tech Stack** – Built with Next.js, React, Tailwind, ShadCN UI, and Genkit AI.

---

## 🛠 Getting Started

The app has two main modules:

1. **Landing Page (`/`)** – Overview and introduction.
2. **Planner (`/planner`)** – Core mission planning interface.

### Environment Setup

1. **Mapbox Setup** (Required for maps):
   - Create a free [Mapbox account](https://www.mapbox.com).
   - Retrieve your **access token**.

2. **Google Gemini Setup** (Required for AI features):
   - Get a free API key from [Google AI Studio](https://aistudio.google.com/app/apikey).
   - This enables natural language command processing.

3. Add both tokens to `.env.local`:

   ```bash
   NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN=your_mapbox_token_here
   GEMINI_API_KEY=your_gemini_api_key_here
   ```

   **Note**: If you don't configure `GEMINI_API_KEY`, AI features will use a fallback parser with limited functionality. You can still add symbols manually using the "+" button on the map.

---

## ⚙️ How It Works

- **Genkit AI Flow** – Processes natural language inputs.
- **Zod Schema** – Validates and structures AI output.
- **SIDC Generation** – Produces a Symbol Identification Code to render compliant symbology on the map.

---

## 🧩 Tech Stack

```js
[
  "Next.js",
  "React",
  "TypeScript",
  "ShadCN UI",
  "Tailwind CSS",
  "Mapbox GL JS",
  "milsymbol",
  "Genkit",
  "Zod",
];
```

---

## 📌 Recent Improvements

- **Responsive Design** – Mobile-first enhancements for planner and landing pages.
- **Refactored Components** – Modularized (`PlannerHeader`, `MapOverlay`, `CommandInput`, etc.).
- **Command Input Fixes** – Unified form handling and new `FloatingCommand` (inline or floating modes).
- **Controls Consolidation** – Geocoder, Symbol Sizer, and Command Trigger unified into a single compact column.
- **Map Enhancements** – Full-container rendering and center-based time approximation.
- **Documentation** – Added Security Policy and User Manual.

---

## 🔎 Planner Overview

- **MapView** – Renders Mapbox map, overlays, and symbols.
- **Controls** – Unified floating column (Geocoder, SymbolSizer, FloatingCommand).
- **CommandInputPanel** – Submits prompts via server actions.
- **SymbolEditor / SymbolListSheet** – Edit and manage placed symbols.

---

## 👨‍💻 Developer Setup

1. Install dependencies:

   ```bash
   npm install
   ```

2. Add environment variables (see [Environment Setup](#environment-setup)):

   ```bash
   NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN=your_mapbox_token_here
   GEMINI_API_KEY=your_gemini_api_key_here
   ```

3. Run locally:

   ```bash
   npm run dev
   ```

4. Type-check after edits:

   ```bash
   npm run typecheck
   ```

---

## 🧪 Quick Test (Command Flow)

1. Open `/planner`.
2. Use inline input (desktop) or footer button (mobile).
3. Try sample commands:
   - `Friendly infantry company 'Raptors' at 33.72, 73.09`
   - `Draw an air corridor for an F-16 from Lahore to Delhi`
4. Submit – AI parses – Symbol appears on the map.

---

## 🔮 Next Improvements

- ✅ Replace longitude-based clock with **IANA timezone lookup** (`tz-lookup`).
- ✅ Add **Playwright E2E tests** for mission workflows.
- ✅ Add **micro-animations** for smoother UX.

---

✨ **MilAIAssist empowers planners with faster, AI-driven situational visualization—transforming natural language into operational clarity.**
