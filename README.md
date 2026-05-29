# Ruchi · రుచి

**The taste of living well.** Ruchi is an AI-powered food intelligence web app that unifies
recipe discovery, pantry-to-plate cooking, and personalised health tracking into one fluid,
food-themed experience.

> _Ruchi_ (రుచి) means "taste" in Telugu.

### Live app

**https://ruchi-app.netlify.app**

---

## Table of contents

- [Features](#features)
- [Tech stack](#tech-stack)
- [Architecture](#architecture)
  - [High-level overview](#high-level-overview)
  - [Routing](#routing)
  - [State management](#state-management)
  - [Authentication and data sync](#authentication-and-data-sync)
  - [The save gate](#the-save-gate)
  - [AI recipe pipeline](#ai-recipe-pipeline)
- [Design system](#design-system)
- [Data model](#data-model)
- [Project structure](#project-structure)
- [Local development](#local-development)
- [Environment variables](#environment-variables)
  - [Enabling accounts and sync](#enabling-accounts-and-sync-supabase)
  - [Enabling live AI](#enabling-live-ai-openai)
- [Database setup](#database-setup)
- [Deployment](#deployment)
- [Security model](#security-model)
- [License](#license)

---

## Features

| Screen | What it does |
|--------|--------------|
| **Dashboard** | Daily calorie hero, animated macro rings, quick actions, suggested recipes |
| **Discover** | Paste any cooking-video link (TikTok, Reels, YouTube), get a structured recipe back |
| **Pantry** | Add what you have, then "What can I cook?" surfaces ranked recipe matches |
| **Cookbook** | Your saved recipes with search and cuisine filters |
| **Health** | Editable calorie/macro goals plus a running log of today's meals |

Guests can browse and generate freely. Saving (recipes, meal logs, pantry edits, health
goals) requires an account, at which point data syncs to the cloud across devices. AI
extraction is powered by a Netlify serverless function that calls OpenAI server-side, with a
graceful local fallback so the app always works even without an API key.

## Tech stack

- **React 19 + Vite 8**: SPA with fast HMR and production builds
- **React Router 7**: nested routes for the landing page (`/`) and app shell (`/app/*`)
- **Framer Motion 12**: physics-based animations, scroll reveals, and the interactive background
- **Supabase**: email/password auth plus a Postgres row per user (with row-level security)
- **Netlify Functions**: serverless `recipe` endpoint wrapping the OpenAI API
- **Netlify**: hosting, CI build, and functions
- **lucide-react**: icon set

## Architecture

### High-level overview

```
                        ┌──────────────────────────────────────────┐
                        │                Browser (SPA)              │
                        │                                           │
   /  (Landing) ───────▶│  React Router                             │
   /app/* (App shell) ─▶│   ├─ Landing  (marketing, animated)       │
                        │   └─ AppShell (Outlet)                    │
                        │        ├─ Dashboard                       │
                        │        ├─ Discover                        │
                        │        ├─ Pantry                          │
                        │        ├─ Cookbook                        │
                        │        └─ Health                          │
                        │                                           │
                        │  StoreProvider (single source of truth)   │
                        │   • localStorage cache (guests + offline) │
                        │   • Supabase sync (signed-in users)       │
                        └──────┬───────────────────────┬────────────┘
                               │                       │
                  recipe extraction            auth + data sync
                               │                       │
                               ▼                       ▼
              ┌────────────────────────┐   ┌───────────────────────────┐
              │  Netlify Function       │   │  Supabase                 │
              │  /.netlify/functions/   │   │   • Auth (JWT)            │
              │  recipe                 │   │   • profiles table        │
              │   └─ OpenAI gpt-4o-mini │   │     (jsonb + RLS)         │
              └────────────────────────┘   └───────────────────────────┘
```

The client is the centre of gravity. Both backends are optional: if Supabase keys are
absent the app runs in guest mode (localStorage only), and if the OpenAI key is absent the
function returns 502 so the client falls back to a built-in recipe generator. The app is
always usable.

### Routing

Defined in `src/main.jsx` with `BrowserRouter`:

- `/` → `Landing` (standalone marketing page)
- `/app` → `AppShell` (persistent sidebar + animated `<Outlet />`)
  - index → `Dashboard`
  - `discover`, `pantry`, `cookbook`, `health` → their screens
- `*` → redirect to `/`

`netlify.toml` adds an SPA redirect (`/* → /index.html` 200) so client-side routes resolve
on hard refresh.

### State management

A single React Context (`StoreProvider` in `src/lib/store.jsx`) holds the entire app state
and exposes an `api` of actions via the `useStore()` hook. There is no Redux/Zustand; the
state shape is small and the context is read by every screen.

State flow:

1. **Initial load**: `load()` reads `localStorage` (key `ruchi-state-v1`), merged over
   seed defaults from `sample.js` so the app feels alive on first open.
2. **Every change**: a `useEffect` writes the state back to `localStorage`. This is the
   guest cache and the offline fallback.
3. **Signed-in users**: state additionally syncs to Supabase (see below).

Only a whitelist of keys (`cookbook`, `pantry`, `goal`, `log`, `profile`) is synced; derived
values like today's totals are computed on read.

### Authentication and data sync

Auth is handled entirely by Supabase via `src/lib/supabase.js`, which lazily creates a
client only when `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` are present
(`isSupabaseConfigured`). The store wires three lifecycle effects:

1. **Session bootstrap**: on mount, `supabase.auth.getSession()` restores any existing
   session, and `onAuthStateChange` keeps `user` in sync.
2. **Hydration on login**: when a user signs in, the store pulls their row from the
   `profiles` table. If the row is empty (first login) it seeds the cloud from the current
   local state, so recipes saved as a guest carry over. Otherwise the cloud copy wins. A
   `hydrating` ref prevents this initial pull from triggering a write-back.
3. **Debounced push**: any change to synced state, while signed in, upserts the whole blob
   to `profiles.data` after an 800 ms debounce.

Signing out resets the in-memory state to defaults (the cloud copy remains the source of
truth on next login).

### The save gate

Guests can browse, generate recipes, and explore pantry matches, but **persisting** actions
require an account. This is enforced centrally in the store rather than per-component:

```js
const needsAuth = () => isSupabaseConfigured && !user
const guard = () => {
  if (needsAuth()) { setAuthPrompt(true); return false }  // open sign-in modal
  return true
}
```

Every mutating action (`saveRecipe`, `removeRecipe`, `addPantry`, `removePantry`,
`logMeal`, `removeLog`, `setGoal`, `setProfile`) calls `guard()` first and returns a boolean.
When a guest triggers one, the global `AuthModal` opens instead, and callers that chain UI
side-effects (e.g. closing a modal after logging a meal) only proceed on a `true` result.

Because the gate keys off `isSupabaseConfigured`, local dev without Supabase keys stays fully
usable; the gate only activates in environments where signing in is actually possible.

### AI recipe pipeline

Two layers, defined in `src/lib/ai.js` (client) and `netlify/functions/recipe.js` (server):

```
recipeFromVideo(url, notes)        recipesFromPantry(ingredients, prefs)
        │                                       │
        ▼                                       ▼
   POST /.netlify/functions/recipe  { mode: 'video' | 'pantry', ... }
        │
        ▼
   recipe.js handler
        ├─ reads OPENAI_API_KEY (server-only, never exposed)
        ├─ calls gpt-4o-mini with response_format: json_object
        ├─ strict JSON schema enforced via system prompt
        └─ on missing key / failure → HTTP 502
        │
        ▼ (502 or network error)
   client catches → local generator (localFromVideo / localFromPantry)
```

The local generator uses keyword-to-emoji heuristics and templated steps so Discover and
Pantry produce believable results even with no API key. System prompts explicitly forbid em
dashes to match the project's writing style.

## Design system

A warm, food-themed luxury aesthetic driven by CSS custom properties:

- **Palette**: saffron, gold, terracotta, sage on a near-black background (`--bg`), with
  cream/muted/faint text tiers and a subtle `--border`.
- **Type**: a serif display face for headings/brand and a sans for body/UI.
- **Motion**: Framer Motion throughout: a scroll-progress bar, `whileInView` reveal
  variants on the landing page, an interactive animated `Background`, a tilting `Phone`
  mockup, page transitions on the app `<Outlet />`, and spring-based micro-interactions.
- **Layout**: the app uses a sticky sidebar on desktop and a bottom tab bar on mobile.
- The brand mark pairs the Latin "Ruchi" with the Telugu "రుచి".

## Data model

App state (cached in `localStorage`, synced to `profiles.data` as JSON):

```jsonc
{
  "cookbook": [ Recipe, ... ],      // saved recipes
  "pantry":   [ "eggs", "rice" ],   // lowercased, deduped ingredient strings
  "goal":     { "calories": 1840, "protein": 120, "carbs": 220, "fat": 65 },
  "log":      { "2026-05-29": [ LogEntry, ... ] },  // keyed by ISO date
  "profile":  { "name": "Rishika", "diet": "Balanced", "restrictions": [] }
}
```

```jsonc
// Recipe
{
  "id": "r-greek-bowl", "title": "...", "emoji": "🥗", "cuisine": "Mediterranean",
  "difficulty": "Easy", "minutes": 25, "servings": 2, "calories": 420,
  "macros": { "protein": 22, "carbs": 48, "fat": 16 },
  "tags": ["High Protein", ...], "ingredients": ["..."], "steps": ["..."],
  "note": "...", "source": "Video import"
}

// LogEntry
{ "id": "r-greek-bowl-1716998400000", "title": "...", "emoji": "🥗",
  "calories": 420, "macros": { ... }, "at": 1716998400000 }
```

Supabase `profiles` table:

| Column | Type | Notes |
|--------|------|-------|
| `id` | `uuid` | primary key, references `auth.users(id)` on delete cascade |
| `data` | `jsonb` | the whole synced app state blob |
| `updated_at` | `timestamptz` | last write |

Row-level security policies restrict `select`/`insert`/`update` to `auth.uid() = id`.

## Project structure

```
src/
  main.jsx        app entry: BrowserRouter + StoreProvider + routes
  index.css       global tokens (colors, fonts) and resets
  landing/
    Landing.jsx   marketing landing page (hero, features, how-it-works, integrations, CTA)
    Landing.css   landing styles
    Background.jsx animated interactive background
    Phone.jsx     animated phone mockup
    content.js    PILLARS, INTEGRATIONS, DAY copy
  app/
    AppShell.jsx  sidebar + mobile tabbar + animated Outlet + auth controls
    Dashboard.jsx daily energy, macro rings, quick actions, suggestions
    Discover.jsx  video-link to structured recipe
    Pantry.jsx    ingredient list + "what can I cook"
    Cookbook.jsx  saved recipes with search/filter
    Health.jsx    editable goals + today's meal log
    RecipeCard.jsx recipe card + detail modal
    AuthModal.jsx sign in / sign up modal
    app.css       app shell + screen styles
  lib/
    store.jsx     state, actions, auth lifecycle, sync, save gate
    supabase.js   Supabase client (null when unconfigured)
    ai.js         client AI calls + local fallback generators
    sample.js     seed recipes, pantry, starter goals
netlify/
  functions/
    recipe.js     server-side OpenAI integration (video + pantry modes)
supabase/
  schema.sql      profiles table + row-level security policies
netlify.toml      build, publish dir, functions dir, SPA redirect
.env.example      documented environment variables
```

## Local development

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # production build to dist/
npm run preview  # serve the production build locally
npm run lint     # eslint
```

Without any environment variables the app runs in full guest mode (localStorage only) with
the local AI fallback, so you can develop offline.

## Environment variables

Copy `.env.example` to `.env.local` for local dev. Set the same keys on the Netlify site
(**Project configuration → Environment variables**). See `.env.example` for the canonical
list.

### Enabling accounts and sync (Supabase)

Client-side, safe to expose (these are the public anon credentials):

```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-public-key
```

These are `VITE_`-prefixed, so they are baked in at build time. After adding or changing
them on Netlify you must trigger a redeploy. Without them the app runs in guest mode.

### Enabling live AI (OpenAI)

Server-side only, used by the Netlify function. Never expose this client-side; scope it to
**Functions** in the Netlify dashboard.

```
OPENAI_API_KEY=sk-...
```

Without it, Discover and Pantry use the built-in demo generator.

## Database setup

1. Create a free project at [supabase.com](https://supabase.com).
2. In the SQL Editor, run `supabase/schema.sql` to create the `profiles` table with
   row-level security.
3. Copy your project URL and anon key from **Project Settings → API** into the env vars
   above (locally and on Netlify), then redeploy.

Row-level security guarantees users can only read and write their own row, which is why the
anon key is safe to ship to the browser.

## Deployment

Hosted on Netlify. `netlify.toml` configures:

- build command `npm run build`, publish dir `dist`, functions dir `netlify/functions`
- `NODE_VERSION = 20`
- SPA redirect so client routes resolve on refresh

A production build is a static `dist/` plus the serverless `recipe` function. Set the
environment variables described above on the site, then deploy. `VITE_` changes require a
fresh build to take effect.

## Security model

- The OpenAI key lives only in the Netlify function environment and is never sent to the
  browser; the client only ever talks to `/.netlify/functions/recipe`.
- Supabase access uses the public anon key plus row-level security, so a user can only ever
  touch their own `profiles` row. The `service_role` key is never used client-side.
- Secrets (`.env`, `.env.*`) are gitignored; only `.env.example` is committed.

## License

Concept project. Not for redistribution.
