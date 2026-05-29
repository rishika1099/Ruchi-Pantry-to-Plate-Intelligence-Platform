#!/usr/bin/env node
// LLM evaluation harness for Ruchi's recipe-generation function.
//
// Sends a battery of prompts to the deployed serverless endpoint and scores the
// model output on: JSON validity, schema completeness + types, enum adherence,
// the project's no-em-dash style rule, macro/calorie physical plausibility, and
// latency. Prints an aggregate report.
//
// Usage:
//   node eval/llm_eval.mjs                         # hits production
//   ENDPOINT=http://localhost:8888/.netlify/functions/recipe node eval/llm_eval.mjs

const ENDPOINT =
  process.env.ENDPOINT || 'https://ruchi-app.netlify.app/.netlify/functions/recipe'

// LOCAL=1 invokes the real serverless handler in-process (same production code
// path) against live OpenAI, using OPENAI_API_KEY from the environment. This
// lets the eval run without a deployed endpoint.
const LOCAL = process.env.LOCAL === '1'
let handler = null
if (LOCAL) {
  ({ handler } = await import('../netlify/functions/recipe.js'))
}

const VIDEO_CASES = [
  'one-pan lemon garlic salmon with asparagus',
  'classic margherita pizza from scratch',
  'thai green curry with chicken and basil',
  'creamy mushroom risotto',
  'beef tacos with pico de gallo',
  'chocolate lava cake for two',
  'shakshuka with feta and herbs',
  'butter chicken with naan',
]

const PANTRY_CASES = [
  ['eggs', 'spinach', 'cheese', 'onion'],
  ['chicken', 'rice', 'garlic', 'soy sauce', 'broccoli'],
  ['pasta', 'tomatoes', 'basil', 'parmesan'],
  ['chickpeas', 'cumin', 'onion', 'tomatoes', 'spinach'],
]

const DIFFICULTY = new Set(['Easy', 'Medium', 'Hard'])
const REQUIRED = {
  title: 'string', emoji: 'string', cuisine: 'string', difficulty: 'string',
  minutes: 'number', servings: 'number', calories: 'number',
  tags: 'array', ingredients: 'array', steps: 'array', note: 'string',
}

function typeOf(v) {
  return Array.isArray(v) ? 'array' : typeof v
}

function validateRecipe(r) {
  const issues = []
  for (const [k, t] of Object.entries(REQUIRED)) {
    if (!(k in r)) { issues.push(`missing:${k}`); continue }
    if (typeOf(r[k]) !== t) issues.push(`type:${k}`)
  }
  if (!r.macros || ['protein', 'carbs', 'fat'].some(m => typeof r.macros?.[m] !== 'number')) {
    issues.push('macros')
  }
  const enumOk = DIFFICULTY.has(r.difficulty)
  if (!enumOk) issues.push('enum:difficulty')

  // No em dashes anywhere in the text fields (project style rule).
  const text = JSON.stringify(r)
  const emDash = text.includes('—')
  if (emDash) issues.push('em-dash')

  // Macro/calorie physical plausibility: 4/4/9 kcal per gram.
  let macroErr = null
  if (r.macros && typeof r.calories === 'number' && r.calories > 0) {
    const kcal = r.macros.protein * 4 + r.macros.carbs * 4 + r.macros.fat * 9
    macroErr = Math.abs(kcal - r.calories) / r.calories
  }
  return { issues, schemaOk: issues.filter(i => !i.startsWith('em-dash')).length === 0, emDash, enumOk, macroErr }
}

function pct(n, d) { return d ? `${((n / d) * 100).toFixed(1)}%` : 'n/a' }
function quantile(arr, q) {
  if (!arr.length) return 0
  const s = [...arr].sort((a, b) => a - b)
  return s[Math.min(s.length - 1, Math.floor(q * s.length))]
}

async function call(payload) {
  const t0 = Date.now()
  if (LOCAL) {
    const res = await handler({ httpMethod: 'POST', body: JSON.stringify(payload) })
    const ms = Date.now() - t0
    let json = null, parseOk = true
    try { json = JSON.parse(res.body) } catch { parseOk = false }
    return { status: res.statusCode, ms, json, parseOk }
  }
  const res = await fetch(ENDPOINT, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(payload),
  })
  const ms = Date.now() - t0
  let json = null, parseOk = true
  try { json = await res.json() } catch { parseOk = false }
  return { status: res.status, ms, json, parseOk }
}

async function run() {
  console.log(`Endpoint: ${ENDPOINT}\n`)
  const recipes = []
  const latencies = []
  let jsonValid = 0, schemaValid = 0, enumValid = 0, emDashHits = 0
  const macroErrs = []
  let total = 0, failed = 0

  // ---- video mode ----
  for (const notes of VIDEO_CASES) {
    total++
    const r = await call({ mode: 'video', notes })
    latencies.push(r.ms)
    if (r.status !== 200 || !r.json?.recipe) {
      failed++
      console.log(`  [video] FAIL (${r.status}) "${notes}"`)
      continue
    }
    jsonValid++
    const v = validateRecipe(r.json.recipe)
    if (v.schemaOk) schemaValid++
    if (v.enumOk) enumValid++
    if (v.emDash) emDashHits++
    if (v.macroErr != null) macroErrs.push(v.macroErr)
    recipes.push(r.json.recipe)
    console.log(`  [video] ok ${r.ms}ms ${v.issues.length ? 'issues=' + v.issues.join(',') : '✓'} "${r.json.recipe.title}"`)
  }

  // ---- pantry mode ----
  let pantryRecipes = 0, pantryCountOk = 0, matchedOk = 0
  for (const ingredients of PANTRY_CASES) {
    total++
    const r = await call({ mode: 'pantry', ingredients })
    latencies.push(r.ms)
    if (r.status !== 200 || !Array.isArray(r.json?.recipes)) {
      failed++
      console.log(`  [pantry] FAIL (${r.status}) [${ingredients.join(',')}]`)
      continue
    }
    jsonValid++
    const list = r.json.recipes
    if (list.length >= 3 && list.length <= 4) pantryCountOk++
    let allMatched = true
    for (const rec of list) {
      pantryRecipes++
      const v = validateRecipe(rec)
      if (v.schemaOk) schemaValid++; else allMatched = allMatched // schema counted per-recipe below
      if (v.enumOk) enumValid++
      if (v.emDash) emDashHits++
      if (v.macroErr != null) macroErrs.push(v.macroErr)
      recipes.push(rec)
      if (typeof rec.matched === 'number' && rec.matched > ingredients.length) allMatched = false
    }
    if (allMatched) matchedOk++
    console.log(`  [pantry] ok ${r.ms}ms ${list.length} recipes [${ingredients.join(',')}]`)
  }

  const within15 = macroErrs.filter(e => e <= 0.15).length
  const meanErr = macroErrs.length ? macroErrs.reduce((a, b) => a + b, 0) / macroErrs.length : 0
  const totalScored = recipes.length

  console.log('\n================ LLM EVALUATION REPORT ================')
  console.log(`Requests:                 ${total}  (failed: ${failed})`)
  console.log(`Recipes scored:           ${totalScored}`)
  console.log(`Request success rate:     ${pct(total - failed, total)}`)
  console.log(`JSON valid (parsable):    ${pct(jsonValid, total)}`)
  console.log(`Schema complete + typed:  ${pct(schemaValid, totalScored)}`)
  console.log(`Difficulty enum valid:    ${pct(enumValid, totalScored)}`)
  console.log(`Em-dash style violations: ${emDashHits} (${pct(emDashHits, totalScored)})`)
  console.log(`Macro→calorie |err| mean: ${(meanErr * 100).toFixed(1)}%`)
  console.log(`Macro within 15% of kcal: ${pct(within15, macroErrs.length)}`)
  console.log(`Pantry count 3-4 OK:      ${pct(pantryCountOk, PANTRY_CASES.length)}`)
  console.log(`Pantry matched<=have OK:  ${pct(matchedOk, PANTRY_CASES.length)}`)
  console.log(`Latency mean/p50/p95:     ${Math.round(latencies.reduce((a, b) => a + b, 0) / latencies.length)}ms / ${quantile(latencies, 0.5)}ms / ${quantile(latencies, 0.95)}ms`)
  console.log('=======================================================')
}

run().catch(e => { console.error(e); process.exit(1) })
