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

State persists in the browser via `localStorage` for guests. Signed-in users get a Supabase
account so their cookbook, pantry, goals, and meal log sync across devices. AI extraction is
powered by a Netlify serverless function that calls OpenAI server-side, with a graceful local
fallback so the app always works even without an API key.

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

### Enabling accounts and sync (optional)

User accounts and cross-device sync are powered by Supabase. Without these keys the app runs
in guest mode (localStorage only) and stays fully usable.

1. Create a free project at [supabase.com](https://supabase.com).
2. In the SQL Editor, run `supabase/schema.sql` to create the `profiles` table with
   row-level security.
3. Copy your project URL and anon key from **Project Settings → API** into `.env.local`
   (see `.env.example`) for local dev, and into the Netlify site environment variables:

```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-public-key
```

The anon key is safe to expose client-side; row-level security ensures users only ever
read and write their own data.

## Project structure

```
src/
  landing/   marketing landing page (Background, Phone, content)
  app/        functional app screens + AppShell + RecipeCard/Modal + AuthModal
  lib/        store.jsx (state + sync), supabase.js (client), ai.js, sample.js (seed data)
netlify/
  functions/  recipe.js: server-side OpenAI integration
supabase/
  schema.sql: profiles table + row-level security policies
```

## License

Concept project. Not for redistribution.
