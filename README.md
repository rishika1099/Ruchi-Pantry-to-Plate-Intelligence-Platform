# Ruchi · రుచి

**The taste of living well.** Ruchi is an AI-powered food intelligence web app that unifies
recipe discovery, pantry-to-plate cooking, and personalised health tracking into one fluid,
food-themed experience.

### Live app

**https://ruchi-app.netlify.app**

---

## Features

| Screen | What it does |
|--------|--------------|
| **Dashboard** | Daily calorie hero, animated macro rings, quick actions, suggested recipes |
| **Discover** | Paste any cooking-video link (TikTok, Reels, YouTube), get a structured recipe back |
| **Pantry** | Add what you have, then "What can I cook?" surfaces ranked recipe matches |
| **Cookbook** | Your saved recipes with search and cuisine filters |
| **Health** | Editable calorie/macro goals plus a running log of today's meals |

State persists in the browser via `localStorage`. AI extraction is powered by a Netlify
serverless function that calls OpenAI server-side, with a graceful local fallback so the app
always works even without an API key.

## Tech stack

- **React 19 + Vite**: SPA with fast HMR and production builds
- **React Router**: nested routes for the landing page (`/`) and app shell (`/app/*`)
- **Framer Motion**: physics-based animations, reveals, and the interactive background
- **Netlify Functions**: serverless `recipe` endpoint wrapping the OpenAI API
- **Netlify**: hosting + CI build + functions

## Local development

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # production build to dist/
```

### Enabling live AI (optional)

The Discover and Pantry screens fall back to a built-in demo generator unless an OpenAI key
is configured. To enable real extraction, set an environment variable on the Netlify site:

```
OPENAI_API_KEY=sk-...
```

Add it under **Site configuration → Environment variables** (scope: Functions), then redeploy.

## Project structure

```
src/
  landing/   marketing landing page (Background, Phone, content)
  app/        functional app screens + AppShell + RecipeCard/Modal
  lib/        store.jsx (state + localStorage), ai.js (client), sample.js (seed data)
netlify/
  functions/  recipe.js: server-side OpenAI integration
```

## License

Concept project. Not for redistribution.
