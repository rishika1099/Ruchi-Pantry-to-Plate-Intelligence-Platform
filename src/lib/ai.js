// Talks to the Netlify serverless function. Falls back to a local generator
// so the app is always usable (offline, no API key, local dev without functions).

const ENDPOINT = '/.netlify/functions/recipe'

const EMOJI_BY_WORD = [
  [/(pasta|noodle|ramen|spaghetti)/i, '🍝'],
  [/(salad|bowl|greens)/i, '🥗'],
  [/(egg|omelet|scramble)/i, '🍳'],
  [/(chicken|poultry)/i, '🍗'],
  [/(beef|steak|burger)/i, '🥩'],
  [/(fish|salmon|tuna|seafood)/i, '🐟'],
  [/(soup|stew|broth)/i, '🍲'],
  [/(rice|biryani|fried rice)/i, '🍚'],
  [/(taco|burrito|mexican)/i, '🌮'],
  [/(pizza)/i, '🍕'],
  [/(curry|masala|dal)/i, '🍛'],
  [/(cake|dessert|sweet|cookie)/i, '🍰'],
  [/(smoothie|juice|drink)/i, '🥤'],
  [/(pancake|waffle|breakfast)/i, '🥞'],
]

function pickEmoji(text = '') {
  for (const [re, e] of EMOJI_BY_WORD) if (re.test(text)) return e
  return '🍽️'
}

function uid(prefix = 'r') {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`
}

// ---- local fallback generators -------------------------------------------

function localFromVideo(url, notes) {
  const hint = (notes || url || '').toString()
  const titleSeed = notes?.trim()
    ? notes.split(/[.\n]/)[0].slice(0, 48)
    : 'Recipe from Video'
  const emoji = pickEmoji(hint)
  return {
    id: uid(),
    title: titleSeed.replace(/\b\w/g, c => c.toUpperCase()),
    emoji,
    cuisine: 'Inferred',
    difficulty: 'Medium',
    minutes: 30,
    servings: 2,
    calories: 480,
    macros: { protein: 24, carbs: 45, fat: 20 },
    tags: ['From Video', 'AI Draft'],
    ingredients: [
      'Main ingredient shown in the video',
      'Aromatics (onion, garlic, ginger)',
      'Oil or butter for cooking',
      'Seasoning: salt, pepper, spices to taste',
      'Fresh herbs to finish',
    ],
    steps: [
      'Prep and measure all ingredients seen in the clip (mise en place).',
      'Heat the pan and cook the aromatics until fragrant.',
      'Add the main ingredient and cook through, following the video timing.',
      'Season and adjust to taste.',
      'Plate and finish with fresh herbs.',
    ],
    note: 'Demo draft. Connect an OpenAI key to extract the exact recipe from the video.',
    source: url || 'Video import',
  }
}

function localFromPantry(ingredients) {
  const list = ingredients.map(i => i.toLowerCase())
  const has = (w) => list.some(i => i.includes(w))
  const ideas = []

  if (has('egg')) ideas.push({ title: 'Quick Veggie Scramble', emoji: '🍳', cal: 310, base: ['eggs'] })
  if (has('tomato') || has('quinoa') || has('feta')) ideas.push({ title: 'Fresh Grain Bowl', emoji: '🥗', cal: 420, base: ['quinoa', 'tomatoes'] })
  if (has('rice')) ideas.push({ title: 'Garden Fried Rice', emoji: '🍚', cal: 460, base: ['rice'] })
  if (has('pasta') || has('noodle')) ideas.push({ title: 'Pantry Pasta', emoji: '🍝', cal: 540, base: ['pasta'] })
  if (has('chicken')) ideas.push({ title: 'Simple Seared Chicken', emoji: '🍗', cal: 520, base: ['chicken'] })
  while (ideas.length < 3) {
    ideas.push({ title: 'Chef’s Improv Plate', emoji: '🍲', cal: 400, base: list.slice(0, 3) })
  }

  return ideas.slice(0, 4).map(idea => ({
    id: uid(),
    title: idea.title,
    emoji: idea.emoji,
    cuisine: 'Pantry',
    difficulty: 'Easy',
    minutes: 20,
    servings: 2,
    calories: idea.cal,
    macros: { protein: 20, carbs: 40, fat: 15 },
    tags: ['Pantry Match', 'AI Draft'],
    matched: list.filter(i => idea.base.some(b => i.includes(b))).length || Math.min(3, list.length),
    haveCount: list.length,
    ingredients: [...new Set([...idea.base, ...list])].slice(0, 8),
    steps: [
      'Gather the matched ingredients from your pantry.',
      'Prep, season, and cook the main components.',
      'Combine, taste, and adjust seasoning.',
      'Plate and enjoy.',
    ],
    note: 'Demo match. Connect an OpenAI key for precise, ranked suggestions.',
    source: 'Pantry engine',
  }))
}

// ---- public API -----------------------------------------------------------

async function callFn(payload) {
  const res = await fetch(ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })
  if (!res.ok) throw new Error(`fn ${res.status}`)
  return res.json()
}

export async function recipeFromVideo(url, notes) {
  try {
    const data = await callFn({ mode: 'video', url, notes })
    const r = data.recipe
    return { ...r, id: r.id || uid(), emoji: r.emoji || pickEmoji(r.title), source: url || 'Video import' }
  } catch {
    return localFromVideo(url, notes)
  }
}

export async function recipesFromPantry(ingredients, prefs) {
  try {
    const data = await callFn({ mode: 'pantry', ingredients, prefs })
    return (data.recipes || []).map(r => ({ ...r, id: r.id || uid(), emoji: r.emoji || pickEmoji(r.title) }))
  } catch {
    return localFromPantry(ingredients)
  }
}
