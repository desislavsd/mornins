/**
 * Gemini translation backend (same approach as ../blessons translate-mt.ts).
 *
 * gemini-3.8-flash was tested 2026-10 in blessons against the lite models for
 * Bulgarian: the lite models were noticeably worse (stray non-Cyrillic glyphs).
 */
const MODEL = 'gemini-3.8-flash'
const KEY = process.env.GEMINI_API_KEY ?? ''

const LANG_NAMES: Record<string, string> = { en: 'English', bg: 'Bulgarian' }

export interface TranslateOptions {
  source?: string
  target?: string
  /** extra instructions appended to the system prompt */
  context?: string
}

function systemPrompt({ source = 'en', target = 'bg', context = '' }: TranslateOptions) {
  return `You are a professional literary translator. Translate each source string from ${LANG_NAMES[source] ?? source} to ${LANG_NAMES[target] ?? target}.
Rules:
- Return a JSON array of strings: exactly one translation per input, same length, same order.
- Translate faithfully, in a formal literary register; do not paraphrase, summarise, add, or omit content.
- Preserve paragraph structure and punctuation style. Use proper ${LANG_NAMES[target] ?? target} typographic quotation marks.
- Keep every reference to a source (e.g. book abbreviations, page numbers, references in parentheses at the end of a paragraph) exactly as in the source.
${context}`.trim()
}

/** Translate a batch of strings; returns one translation per input. */
export async function geminiTranslate(
  texts: string[],
  options: TranslateOptions = {},
): Promise<string[]> {
  if (!KEY) throw new Error('GEMINI_API_KEY is not set')
  if (!texts.length) return []

  for (let attempt = 0; ; attempt++) {
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          systemInstruction: { parts: [{ text: systemPrompt(options) }] },
          contents: [{ role: 'user', parts: [{ text: JSON.stringify(texts) }] }],
          generationConfig: {
            temperature: 0,
            responseMimeType: 'application/json',
            responseSchema: { type: 'array', items: { type: 'string' } },
          },
        }),
      },
    )
    if ((res.status === 429 || res.status >= 500) && attempt < 6) {
      const wait = 5000 * (attempt + 1)
      console.error(`  gemini ${res.status}, backing off ${wait / 1000}s`)
      await Bun.sleep(wait)
      continue
    }
    if (!res.ok)
      throw new Error(`gemini failed: ${res.status} ${(await res.text()).slice(0, 300)}`)

    const data = await res.json()
    const txt = data.candidates?.[0]?.content?.parts?.[0]?.text
    if (!txt) throw new Error(`gemini returned no text: ${JSON.stringify(data).slice(0, 300)}`)
    const out = JSON.parse(txt)
    if (!Array.isArray(out) || out.length !== texts.length)
      throw new Error(`gemini returned ${out?.length} translations for ${texts.length} inputs`)
    return out.map(String)
  }
}

/** Translate with split-and-retry on count mismatch, down to single strings. */
export async function geminiTranslateSafe(
  texts: string[],
  options: TranslateOptions = {},
): Promise<string[]> {
  try {
    return await geminiTranslate(texts, options)
  } catch (e) {
    if (texts.length === 1) throw e
    const mid = Math.ceil(texts.length / 2)
    return [
      ...(await geminiTranslateSafe(texts.slice(0, mid), options)),
      ...(await geminiTranslateSafe(texts.slice(mid), options)),
    ]
  }
}
