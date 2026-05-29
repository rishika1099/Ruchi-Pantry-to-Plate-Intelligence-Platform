// Ruchi recipe intelligence (server-side AI).
// Reads OPENAI_API_KEY from the environment (never exposed to the client).
// If the key is absent or the call fails, returns 502 so the client falls
// back to its local generator and the app stays usable.

const MODEL = 'gpt-4o-mini'

const VIDEO_SYSTEM = `You are Ruchi, a culinary intelligence that turns cooking videos into precise, structured recipes.
Given a video URL and/or a dish description, infer the most likely recipe.
Return STRICT JSON only, no prose, matching exactly this shape:
{
  "title": string,
  "emoji": string (a single food emoji),
  "cuisine": string,
  "difficulty": "Easy" | "Medium" | "Hard",
  "minutes": number,
  "servings": number,
  "calories": number (per serving),
  "macros": { "protein": number, "carbs": number, "fat": number },
  "tags": string[] (2-4 short tags),
  "ingredients": string[] (with quantities),
  "steps": string[] (clear, ordered),
  "note": string (one short line of context)
}
Never use em dashes (—) in any text; use commas, colons, or periods instead.`

const PANTRY_SYSTEM = `You are Ruchi's Pantry-to-Plate engine. Given a list of ingredients a user has, propose 3-4 realistic recipes they can make right now, ranked by how much they can make with what they have.
Return STRICT JSON only, no prose, matching exactly this shape:
{
  "recipes": [
    {
      "title": string,
      "emoji": string (single food emoji),
      "cuisine": string,
      "difficulty": "Easy" | "Medium" | "Hard",
      "minutes": number,
      "servings": number,
      "calories": number,
      "macros": { "protein": number, "carbs": number, "fat": number },
      "tags": string[],
      "matched": number (how many of the user's ingredients this uses),
      "haveCount": number (total ingredients the user listed),
      "ingredients": string[],
      "steps": string[],
      "note": string
    }
  ]
}
Never use em dashes (—) in any text; use commas, colons, or periods instead.`

async function chat(system, user) {
  const key = process.env.OPENAI_API_KEY
  if (!key) throw new Error('no-key')

  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${key}`,
    },
    body: JSON.stringify({
      model: MODEL,
      temperature: 0.7,
      response_format: { type: 'json_object' },
      messages: [
        { role: 'system', content: system },
        { role: 'user', content: user },
      ],
    }),
  })

  if (!res.ok) {
    const detail = await res.text().catch(() => '')
    throw new Error(`openai ${res.status} ${detail.slice(0, 200)}`)
  }
  const data = await res.json()
  const content = data.choices?.[0]?.message?.content
  if (!content) throw new Error('empty')
  return JSON.parse(content)
}

export async function handler(event) {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' }
  }

  let body
  try {
    body = JSON.parse(event.body || '{}')
  } catch {
    return { statusCode: 400, body: 'Invalid JSON' }
  }

  try {
    if (body.mode === 'video') {
      const prompt = [
        body.url ? `Video URL: ${body.url}` : 'No video URL provided.',
        body.notes ? `Dish description / notes: ${body.notes}` : '',
        'Produce the single most likely recipe for this dish.',
      ]
        .filter(Boolean)
        .join('\n')
      const recipe = await chat(VIDEO_SYSTEM, prompt)
      return json({ recipe })
    }

    if (body.mode === 'pantry') {
      const ingredients = Array.isArray(body.ingredients) ? body.ingredients : []
      const prefs = body.prefs ? `Dietary preferences: ${body.prefs}.` : ''
      const prompt = `Ingredients on hand: ${ingredients.join(', ') || '(none)'}. ${prefs}`.trim()
      const out = await chat(PANTRY_SYSTEM, prompt)
      const recipes = (out.recipes || []).map(r => ({
        haveCount: ingredients.length,
        ...r,
      }))
      return json({ recipes })
    }

    return { statusCode: 400, body: 'Unknown mode' }
  } catch (err) {
    // Signal the client to use its local fallback.
    return {
      statusCode: 502,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: String(err.message || err) }),
    }
  }
}

function json(payload) {
  return {
    statusCode: 200,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  }
}
