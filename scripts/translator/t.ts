import { forceAsyncChain } from './utils'

const API_BASE_URL = 'https://translate.googleapis.com/translate_a/single'

const THROTTLE_MS = 200

const defaults = {
  q: '',
  sl: 'auto',
  tl: 'bg',
}

export const t = forceAsyncChain(async function t(
  query = '',
  lang = defaults.tl,
) {
  query = query?.trim()

  if (!query) return ''

  const promise = gt({
    q: query,
    sl: 'en',
    tl: lang,
  })

  return promise
}, THROTTLE_MS)

async function gt(params = defaults) {
  const searchParams = new URLSearchParams([
    ['client', 'gtx'],
    ['dj', '1'],
    ['dt', 't'],
    ...Object.entries({ ...defaults, ...params }),
  ])

  const url = `${API_BASE_URL}?${searchParams}`

  const res = await fetch(url, {
    headers: {
      'User-Agent':
        'Mozilla/5.0 (Windows NT 6.1; WOW64; rv:23.0) Gecko/20100101 Firefox/23.0',
    },
  })

  const { sentences } = <{ sentences: { trans: string }[] }>await res.json()

  return sentences.map((e) => e.trans).join(' ')
}

/**
 * Parameters for the unofficial Google Translate HTTP endpoint:
 * https://translate.googleapis.com/translate_a/single
 *
 * ⚠️ NOTE:
 * - This endpoint is undocumented and may change at any time.
 * - For production use, prefer the official Cloud Translation API.
 */
interface GoogleTranslateSingleParams {
  /**
   * Identifies the client type.
   * Common values:
   * - "gtx" (default, used by web translate)
   * - "t" (legacy internal)
   * - "webapp" (newer web interface)
   * - "dict-chrome-ex" (Chrome dictionary extension)
   */
  client?: string

  /**
   * Source language of the input text.
   * Use ISO 639-1 codes (e.g., "en", "fr", "es").
   * Special value:
   * - "auto" → auto-detects source language.
   */
  sl?: string

  /**
   * Target language for the translated output.
   * Use ISO 639-1 codes (e.g., "es", "de", "ja").
   */
  tl?: string

  /**
   * The actual text to be translated.
   * Must be URL-encoded.
   * Can appear multiple times to translate multiple phrases.
   */
  q: string | string[]

  /**
   * Data types (flags) specifying what information to return.
   * Can appear multiple times (e.g. dt=t&dt=rm).
   *
   * Common flags:
   * - "t"  → Translated text
   * - "at" → Alternate translations
   * - "rm" → Transliteration (romanization)
   * - "bd" → Dictionary definitions
   * - "ex" → Example sentences
   * - "ss" → Synonyms
   * - "rw" → Related words
   * - "ld" → Language detection info
   * - "md" → Morphological data
   * - "qc" → Quality/confidence data
   * - "sr" → Source-related corrections
   *
   * Usually you only need ["t"].
   */
  dt?: string | string[]

  /**
   * Input text encoding.
   * Default: "UTF-8".
   */
  ie?: string

  /**
   * Output text encoding.
   * Default: "UTF-8".
   */
  oe?: string

  /**
   * Host/UI language — affects language of dictionary metadata or examples.
   * Example: hl="en".
   */
  hl?: string

  /**
   * On-the-fly translation mode.
   * 0 = off, 1 = on.
   * Rarely needed (internal use).
   */
  otf?: 0 | 1

  /**
   * Source selection index.
   * Typically 0.
   * Internal use only.
   */
  ssel?: number

  /**
   * Target selection index.
   * Typically 0.
   * Internal use only.
   */
  tsel?: number

  /**
   * Internal parameter (tokenization/caching hint).
   * Small integer (commonly 1 or 2).
   * Rarely needed.
   */
  kc?: number
}
