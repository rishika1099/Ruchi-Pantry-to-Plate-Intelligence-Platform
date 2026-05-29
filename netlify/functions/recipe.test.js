import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { handler } from './recipe.js'

const KEY = 'OPENAI_API_KEY'

function post(body) {
  return { httpMethod: 'POST', body: typeof body === 'string' ? body : JSON.stringify(body) }
}

describe('recipe serverless function', () => {
  let savedKey
  beforeEach(() => { savedKey = process.env[KEY] })
  afterEach(() => {
    if (savedKey === undefined) delete process.env[KEY]
    else process.env[KEY] = savedKey
    vi.restoreAllMocks()
  })

  it('rejects non-POST requests with 405', async () => {
    const res = await handler({ httpMethod: 'GET' })
    expect(res.statusCode).toBe(405)
  })

  it('returns 400 on invalid JSON', async () => {
    const res = await handler({ httpMethod: 'POST', body: '{not json' })
    expect(res.statusCode).toBe(400)
  })

  it('returns 400 on an unknown mode', async () => {
    process.env[KEY] = 'sk-test'
    const res = await handler(post({ mode: 'nope' }))
    expect(res.statusCode).toBe(400)
  })

  it('returns 502 with "no-key" when the API key is absent (client falls back)', async () => {
    delete process.env[KEY]
    const res = await handler(post({ mode: 'video', notes: 'salmon' }))
    expect(res.statusCode).toBe(502)
    expect(JSON.parse(res.body).error).toContain('no-key')
  })

  it('returns a structured recipe on success (OpenAI mocked)', async () => {
    process.env[KEY] = 'sk-test'
    const fake = {
      title: 'Lemon Garlic Salmon', emoji: '🐟', cuisine: 'Mediterranean',
      difficulty: 'Easy', minutes: 25, servings: 2, calories: 480,
      macros: { protein: 38, carbs: 12, fat: 30 }, tags: ['quick', 'high-protein'],
      ingredients: ['2 salmon fillets', '1 lemon'], steps: ['Sear', 'Bake'], note: 'Weeknight friendly.',
    }
    vi.spyOn(globalThis, 'fetch').mockResolvedValue({
      ok: true,
      json: async () => ({ choices: [{ message: { content: JSON.stringify(fake) } }] }),
    })
    const res = await handler(post({ mode: 'video', notes: 'salmon' }))
    expect(res.statusCode).toBe(200)
    expect(JSON.parse(res.body).recipe.title).toBe('Lemon Garlic Salmon')
    expect(globalThis.fetch).toHaveBeenCalledOnce()
  })

  it('injects haveCount into pantry recipes', async () => {
    process.env[KEY] = 'sk-test'
    vi.spyOn(globalThis, 'fetch').mockResolvedValue({
      ok: true,
      json: async () => ({ choices: [{ message: { content: JSON.stringify({ recipes: [{ title: 'Omelette' }] }) } }] }),
    })
    const res = await handler(post({ mode: 'pantry', ingredients: ['eggs', 'cheese', 'spinach'] }))
    expect(res.statusCode).toBe(200)
    const { recipes } = JSON.parse(res.body)
    expect(recipes[0].haveCount).toBe(3)
  })

  it('returns 502 when OpenAI errors out', async () => {
    process.env[KEY] = 'sk-test'
    vi.spyOn(globalThis, 'fetch').mockResolvedValue({ ok: false, status: 500, text: async () => 'boom' })
    const res = await handler(post({ mode: 'video', notes: 'x' }))
    expect(res.statusCode).toBe(502)
  })
})
