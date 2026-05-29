# Ruchi — Evaluation & Test Results

This folder holds the end-to-end evaluation evidence for **Ruchi** (రుచి, Telugu for *taste*), the
pantry-to-plate food-intelligence platform. Everything here was produced by running the project's own
harnesses against the real code path — no estimates, no hand-waving.

| Area | Tool | Result file | Headline |
|------|------|-------------|----------|
| LLM output quality | `eval/llm_eval.mjs` | [`llm-eval.txt`](./llm-eval.txt) | 100% valid JSON & schema, 4.3% mean macro error |
| Backend correctness | Vitest | [`unit-tests.txt`](./unit-tests.txt) | 7/7 passing |
| Dependency security | `npm audit` | [`security-audit.txt`](./security-audit.txt) | 0 vulnerabilities |
| Bundle / delivery | Vite build | [`bundle-analysis.txt`](./bundle-analysis.txt) | 122 KB gzip landing chunk |

---

## 1. LLM Evaluation

The recipe generator is an LLM (gpt-4o-mini) wrapped in a serverless function that forces structured
JSON output. The risk with any LLM feature is that it *mostly* works but silently degrades: malformed
JSON, missing fields, nonsensical nutrition, or style violations. The harness in
[`../eval/llm_eval.mjs`](../eval/llm_eval.mjs) turns those risks into measurable pass/fail metrics.

### Methodology

- **12 requests** across both product modes:
  - **8 video cases** — single-recipe prompts (e.g. *"thai green curry with chicken and basil"*).
  - **4 pantry cases** — ingredient lists that should yield 3–4 matching recipes.
- Each returned recipe (**18 total**) is scored independently on six dimensions:

| Metric | What it checks | Why it matters |
|--------|----------------|----------------|
| **JSON valid** | Response body parses as JSON | A parse failure breaks the entire UI |
| **Schema complete + typed** | All 11 required fields present with correct types (`title`, `emoji`, `cuisine`, `difficulty`, `minutes`, `servings`, `calories`, `tags`, `ingredients`, `steps`, `note`) + `macros{protein,carbs,fat}` | Missing/mistyped fields cause render crashes |
| **Difficulty enum** | `difficulty ∈ {Easy, Medium, Hard}` | Drives UI badges and filtering |
| **Em-dash style** | No `—` anywhere in the output | Project style rule (em-dashes look machine-generated) |
| **Macro→calorie plausibility** | `protein×4 + carbs×4 + fat×9` vs stated `calories`, relative error | Catches physically impossible nutrition |
| **Pantry constraints** | List size 3–4, and `matched ≤ ingredients supplied` | Validates the pantry-matching contract |

Latency is recorded per request (mean / p50 / p95).

### Results

```
Requests:                 12  (failed: 0)
Recipes scored:           18
Request success rate:     100.0%
JSON valid (parsable):    100.0%
Schema complete + typed:  100.0%
Difficulty enum valid:    100.0%
Em-dash style violations: 0 (0.0%)
Macro→calorie |err| mean: 4.3%
Macro within 15% of kcal: 94.4%
Pantry count 3-4 OK:      50.0%
Pantry matched<=have OK:  100.0%
Latency mean/p50/p95:     5888ms / 5150ms / 10590ms
```

### Interpretation

- **Structural reliability is perfect.** Every request returned parsable JSON with a complete, correctly
  typed schema and a valid difficulty enum. Zero style violations. This is the part that, if it broke,
  would crash the app — and it held at 100% across all 18 recipes.
- **Nutrition is trustworthy.** The 4-4-9 macro/calorie identity holds to a **4.3% mean error**, with
  **94.4%** of recipes within 15% — well inside the noise of real-world rounding and ingredient variance.
- **One honest finding:** *Pantry count 3–4* passed only **50%**. In 2 of 4 pantry prompts the model
  returned 2 recipes instead of the requested 3–4. This is a prompt-tuning issue, not a correctness bug
  (every returned recipe was valid and every `matched` count was within bounds). Tracked as the top
  follow-up. Surfacing it is the point of the harness.
- **Latency** is dominated by the upstream model: ~5.9s mean, with the p95 driven by the largest pantry
  fan-out. Acceptable for a generate-on-demand UX with a loading state; not chat-grade.

> Reproduce: `node eval/llm_eval.mjs` (hits production) or
> `LOCAL=1 OPENAI_API_KEY=… node eval/llm_eval.mjs` (runs the serverless handler in-process).

---

## 2. Unit Tests

The serverless recipe function ([`../netlify/functions/recipe.js`](../netlify/functions/recipe.js)) is the
trust boundary between the client and OpenAI. Its tests ([`recipe.test.js`](../netlify/functions/recipe.test.js))
mock `fetch` so they run offline and assert on contract behavior, not model output:

- Rejects non-POST with **405**
- Returns **400** on invalid JSON and on an unknown mode
- Returns **502** with a `no-key` error when `OPENAI_API_KEY` is absent (client then falls back to the
  local generator)
- Returns a **structured recipe (200)** on success
- Injects `haveCount` into pantry recipes
- Returns **502** when OpenAI itself errors

**Result: `7 passed (7)` in 128 ms.** See [`unit-tests.txt`](./unit-tests.txt).

---

## 3. Security Audit

`npm audit` against the full dependency tree:

```
found 0 vulnerabilities
```

Additional hardening shipped alongside (in `netlify.toml`): a strict Content-Security-Policy,
`X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY`, `Referrer-Policy`, and a locked-down
`Permissions-Policy`. The OpenAI key lives only as a server-side Netlify environment secret — it is never
shipped to the browser, and the client degrades gracefully to a local generator if the key is missing.

---

## 4. Bundle & Delivery

The public landing page is code-split from the authenticated app so first-time visitors download only
what they need. The store, Supabase client, app shell, and all screens live in a lazily-loaded `AppRoot`
chunk.

```
dist/index.html                     1.07 kB │ gzip:   0.57 kB
dist/assets/AppRoot-*.css          17.81 kB │ gzip:   3.94 kB
dist/assets/index-*.css            18.76 kB │ gzip:   4.58 kB
dist/assets/AppRoot-*.js          236.03 kB │ gzip:  62.28 kB
dist/assets/index-*.js            379.08 kB │ gzip: 122.29 kB
```

- **Landing (initial load):** `index` JS+CSS ≈ **127 KB gzip**.
- **App (deferred):** `AppRoot` JS+CSS ≈ **66 KB gzip**, fetched only when a visitor enters `/app`.

Long-lived immutable caching (`max-age=31536000`) is set on `/assets/*` via `netlify.toml`, so repeat
visits pay zero bytes for unchanged chunks.

---

## Summary scorecard

| Dimension | Status |
|-----------|--------|
| JSON validity | ✅ 100% |
| Schema completeness + typing | ✅ 100% |
| Enum adherence | ✅ 100% |
| Style compliance (no em-dash) | ✅ 100% |
| Nutrition plausibility | ✅ 94.4% within 15%, 4.3% mean error |
| Pantry matching bounds | ✅ 100% |
| Pantry result count (3–4) | ⚠️ 50% — prompt-tuning follow-up |
| Backend unit tests | ✅ 7/7 |
| Dependency vulnerabilities | ✅ 0 |
| Bundle (landing, gzip) | ✅ ~127 KB |

**Verdict:** structurally production-ready. The one open item is a recipe-count prompt tweak for pantry
mode, which the harness exists to keep honest.
