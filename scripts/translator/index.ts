#!/usr/bin/env bun
/**
 * TODO:
 * 1. remove months from titles
 * 2. remove html from content
 * 3. trim paragraphs after translation and split
 * 4.
 **/
import { Glob } from 'bun'
import { mkdir } from 'node:fs/promises'
import type { Book, Chapter } from '@surgbc/egw-writings-shared'
import { api, apiClient, type TocItem } from './api'
import { PATHS, TARGET_BOOK_ID } from './constants'
import { optimizeImage } from './tinify'
import type { BookItem, RegistryItem } from '~/utils/types'
import { enhanceFetchPromise, forceAsyncChain } from './utils'
import { bibles } from './bible'
import { t } from './t'
import { geminiTranslateSafe } from './gemini'
const gc = forceAsyncChain(getChapter, 200)

const TRANSLATE_CONCURRENCY = 6
const CONTENT_SUBTYPES = new Set(['standard-indented', 'poem-noindent'])
const FEB_29 = 59 // 0-based index of February 29 in a leap year

const EN_MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
]
const BG_MONTHS = [
  'януари', 'февруари', 'март', 'април', 'май', 'юни',
  'юли', 'август', 'септември', 'октомври', 'ноември', 'декември',
]
// the model transliterates/quotes periodical names inconsistently; keep the English titles
const PERIODICALS: [RegExp, string][] = [
  [/[„"]?(The )?Review and Herald[“"]?|[„"]?Р[еи]вю енд [ХхH][еа]р[аъо]лд[“"]?/g, 'The Review and Herald'],
  [/[„"]?(The )?Signs of the Times[“"]?|[„"]?(Знамения на времето|Сайнс ъф дъ Таймс)[“"]?/g, 'The Signs of the Times'],
  [/[„"]?(The )?Youth[’']s Instructor[“"]?/g, 'The Youth’s Instructor'],
  [/[„"]?(The )?S\.D\.A\. Bible Commentary[“"]?/g, 'The S.D.A. Bible Commentary'],
]
/**
 * The dash before the closing source reference, whatever dash the model used:
 * a source is an English title, Писмо/Ръкопис/Пак там, or a capitalised
 * Bulgarian title followed by page/date digits, with no further dash after it
 * (a hyphen inside a page range like 301-303 is allowed).
 */
const SOURCE_DASH =
  /\s*[—–-]\s*(?=[„"]?(?:[A-Z][A-Za-z.’',]*(?: [A-Za-z.’',]+)* \d|Пак там|Писмо|Ръкопис|[А-Я][а-я]+(?:[^—–-]|(?<=\d)-(?=\d))*\d)(?:[^—–-]|(?<=\d)-(?=\d))*$)/

// English Bible book names the model occasionally leaves inside "(Book 1:2)" references
const BIBLE_BOOKS: [string, string][] = [
  ['Genesis', 'Битие'], ['Exodus', 'Изход'], ['Leviticus', 'Левит'], ['Numbers', 'Числа'],
  ['Deuteronomy', 'Второзаконие'], ['Joshua', 'Исус Навин'], ['Judges', 'Съдии'], ['Ruth', 'Рут'],
  ['1 Samuel', '1 Царе'], ['2 Samuel', '2 Царе'], ['1 Kings', '3 Царе'], ['2 Kings', '4 Царе'],
  ['1 Chronicles', '1 Летописи'], ['2 Chronicles', '2 Летописи'], ['Ezra', 'Ездра'], ['Nehemiah', 'Неемия'],
  ['Esther', 'Естир'], ['Job', 'Йов'], ['Psalms', 'Псалм'], ['Psalm', 'Псалм'], ['Proverbs', 'Притчи'],
  ['Ecclesiastes', 'Еклисиаст'], ['Song of Solomon', 'Песен на Песните'], ['Isaiah', 'Исая'],
  ['Jeremiah', 'Йеремия'], ['Lamentations', 'Плач Йеремиев'], ['Ezekiel', 'Йезекиил'], ['Daniel', 'Даниил'],
  ['Hosea', 'Осия'], ['Joel', 'Йоил'], ['Amos', 'Амос'], ['Obadiah', 'Авдий'], ['Jonah', 'Йона'],
  ['Micah', 'Михей'], ['Nahum', 'Наум'], ['Habakkuk', 'Авакум'], ['Zephaniah', 'Софония'], ['Haggai', 'Агей'],
  ['Zechariah', 'Захария'], ['Malachi', 'Малахия'], ['Matthew', 'Матей'], ['Mark', 'Марк'], ['Luke', 'Лука'],
  ['John', 'Йоан'], ['Acts', 'Деяния'], ['Romans', 'Римляни'], ['1 Corinthians', '1 Коринтяни'],
  ['2 Corinthians', '2 Коринтяни'], ['Galatians', 'Галатяни'], ['Ephesians', 'Ефесяни'], ['Philippians', 'Филипяни'],
  ['Colossians', 'Колосяни'], ['1 Thessalonians', '1 Солунци'], ['2 Thessalonians', '2 Солунци'],
  ['1 Timothy', '1 Тимотей'], ['2 Timothy', '2 Тимотей'], ['Titus', 'Тит'], ['Philemon', 'Филимон'],
  ['Hebrews', 'Евреи'], ['James', 'Яков'], ['1 Peter', '1 Петър'], ['2 Peter', '2 Петър'], ['1 John', '1 Йоан'],
  ['2 John', '2 Йоан'], ['3 John', '3 Йоан'], ['Jude', 'Юда'], ['Revelation', 'Откровение'],
]
const BIBLE_BOOKS_RX = new RegExp(
  `(?<![A-Za-z])(${BIBLE_BOOKS.map(([en]) => en).join('|')}) (?=\\d+(?::\\d|\\b))`,
  'g',
)
const BIBLE_BOOKS_MAP = new Map(BIBLE_BOOKS)

const formatters = {
  en: new Intl.DateTimeFormat('en-US', { month: 'long', day: 'numeric' }),
  bg: new Intl.DateTimeFormat('bg-BG', { month: 'long', day: 'numeric' }),
}


const CONTEXT = `The text is a daily devotional by Ellen G. White (Seventh-day Adventist author), one short reading per day.
- When a sentence quotes Scripture, render it in the wording of the standard Bulgarian Protestant Bible (Ревизирано издание) rather than translating freely.
- Translate the source reference at the end of a reading fully into Bulgarian: "Letter" → "Писмо", "Manuscript" → "Ръкопис", month names and descriptions of recipients in Bulgarian; keep numbers, dates, and personal names (transliterated). Example: "Letter 12, April 1, 1903, to members of the Nashville church." → "Писмо 12, 1 април 1903 г., до членовете на църквата в Нашвил."`

// console.log(await bibles.loadPassage(' 1:1'))
const toc = await getToc()

const info = await getInfo()

await getCover()

const chapters = await getChapters()

await translateContent()

await publish()

async function getCover() {
  const cover = Bun.file(PATHS.cover('webp'))

  if (await cover.exists()) return cover.arrayBuffer()

  const img = await enhanceFetchPromise(
    fetch(`https://media2.egwwritings.org${info.cover.large}`),
  ).arrayBuffer()

  const optimized = await optimizeImage(img)

  await Bun.file(PATHS.cover('webp')).write(optimized)

  return optimized
}

async function getToc(): Promise<TocItem[]> {
  const file = Bun.file(PATHS.toc)

  if (await file.exists()) return file.json()

  let data = (await apiClient.getBookToc(
    TARGET_BOOK_ID,
  )) as unknown as TocItem[]

  data = data.filter((e) => e.level === 2) // only chapters

  await file.write(JSON.stringify(data, null, 2))

  return data as any
}

async function getInfo(): Promise<Book> {
  const file = Bun.file(PATHS.info)

  if (await file.exists()) return file.json()

  const data = await apiClient.getBook(TARGET_BOOK_ID)

  await file.write(JSON.stringify(data, null, 2))

  return data
}

async function infoToRegistryItem(
  existing?: RegistryItem,
): Promise<RegistryItem> {
  const { title, code, author } = info

  // keep the curated name/author; the flag means "auto translated", whatever the backend
  if (existing) return { ...existing, googleTrnaslate: true }

  const [name, authorName] = await geminiTranslateSafe([title, author], {
    context: 'These are a book title and an author name.',
  })

  return {
    id: code.toLowerCase(),
    name,
    author: authorName,
    googleTrnaslate: true,
    hidden: false,
    added: new Date().toISOString().slice(0, 10),
  }
}

async function getChapters(): Promise<Partial<BookItem>[]> {
  const file = Bun.file(PATHS.content('en'))
  let content: Partial<BookItem>[]
  if (await file.exists()) content = await file.json()
  else {
    content = await Promise.all(
      Array.from({ length: toc.length }).map((e, i) => gc(i + 1)),
    )
    // the app indexes by leap-year day of year (366 slots); a book without a
    // February 29 reading gets an empty slot there (the app shows "no reading")
    if (content.length === 365) content.splice(FEB_29, 0, null as any)
    if (content.length !== 366)
      throw new Error(`expected 365/366 chapters, got ${toc.length}`)
  }
  // day labels are deterministic; (re)write so published en.json always has them
  // the app renders plain paragraphs; drop egwlink spans etc. (verse keeps its link for the ref)
  content = content.map((c, i) =>
    c && {
      day: getDay(i, 'en'),
      ...c,
      title: stripTags(c.title!),
      content: c.content!.map(cleanParagraph),
    },
  )
  await file.write(JSON.stringify(content, null, 2))
  return content
}

async function getChapter(n = 1): Promise<Partial<BookItem>> {
  const item = toc[n - 1]
  const chapterId = +item.para_id.split('.').pop()!
  const label = `Chapter ${n}: ${item.title}`
  console.time(label)
  const data = await apiClient.getChapter(TARGET_BOOK_ID, chapterId)
  const content = data
    .filter((e) => CONTENT_SUBTYPES.has(e.element_subtype))
    .map((e) => e.content)

  console.timeEnd(label)
  return {
    // "Where Wisdom Begins, January 2" → "Where Wisdom Begins"
    title: data
      .find((e) => e.element_type === 'h3')!
      .content.replace(
        new RegExp(`,?\\s*(${EN_MONTHS.join('|')})\\s+\\d{1,2}\\s*$`),
        '',
      ),
    verse: data.find((e) => e.element_subtype === 'devotionaltext')!.content,
    content,
  }
}

async function translateContent() {
  const file = Bun.file(PATHS.content('bg'))
  if (await file.exists()) return await file.json()

  await mkdir(PATHS.cache('bg'), { recursive: true })

  const queue = chapters.map(
    (chapter, i) => () => (chapter ? translateChapter(chapter, i) : null),
  )
  const translated: (BookItem | null)[] = new Array(chapters.length)

  await Promise.all(
    Array.from({ length: TRANSLATE_CONCURRENCY }).map(async () => {
      while (queue.length) {
        const i = chapters.length - queue.length
        translated[i] = await queue.shift()!()
      }
    }),
  )

  await file.write(JSON.stringify(translated, null, 2))
}

async function translateChapter(
  chapter: Partial<BookItem>,
  i: number,
): Promise<BookItem> {
  const cacheFile = Bun.file(`${PATHS.cache('bg')}/${i + 1}.json`)
  if (await cacheFile.exists()) {
    const cached = (await cacheFile.json()) as BookItem
    return { ...cached, content: cached.content.map(normalizeParagraph) }
  }

  const label = `Translating ${i + 1}: ${chapter.title}`
  console.time(label)
  const [title, ...content] = await geminiTranslateSafe(
    [chapter.title!, ...chapter.content!],
    { context: CONTEXT },
  )
  console.timeEnd(label)

  const ref = extractVerseRef(chapter.verse!)
  const passage = await bibles.loadPassage(ref)
  if (!passage) console.warn('Passage not found:', ref)

  const result: BookItem = {
    day: getDay(i, 'bg'),
    title: title.trim(),
    verse: passage
      ? `${stripTags(passage.verses.join(' '))} (${passage.title})`
      : ref,
    content: content.map((e) => normalizeParagraph(e)),
  }

  await cacheFile.write(JSON.stringify(result, null, 2))
  return result
}

/**
 * "…strength. Isaiah 26:3, 4." → "Isaiah 26:3-4"
 * Prefers the printed reference at the end of the verse text (it covers the
 * whole quoted range); falls back to the egwlink title (first verse only).
 */
function extractVerseRef(verse: string) {
  const text = stripTags(verse)
    .replace(/,?\s*(R\.S\.V\.|A\.R\.V\.|N\.I\.V\.|margin)\.?\s*$/i, '')
    .replace(/Song of (Solomon|Songs)/g, 'Songs') // the only multi-word book name; the parser knows "Songs"
    .trim()
  const m = /([1-3]?\s?[A-Z][a-z]+\.?\s+\d+:[\d,\s\-–]+?)\.?$/.exec(text)
  const ref = (m?.[1] ?? /title="([^"]*)"/.exec(verse)?.[1] ?? '').trim()
  // "26:3, 4, 5" → "26:3-5" (the parser treats comma lists as separate passages)
  return ref.replace(/(\d+):(\d+)((?:,\s*\d+)+)$/, (_, ch, from, rest) => {
    const last = rest.split(',').map((e: string) => e.trim()).filter(Boolean).at(-1)
    return `${ch}:${from}-${last}`
  })
}

/**
 * Make the closing source reference uniform, whatever the model did with it:
 * em dash, "Писмо"/"Ръкопис", Bulgarian dates, canonical periodical titles.
 */
function normalizeParagraph(s: string) {
  s = s.trim()
  for (const [rx, name] of PERIODICALS) s = s.replace(rx, name)
  s = s
    .replace(BIBLE_BOOKS_RX, (_, en) => `${BIBLE_BOOKS_MAP.get(en)} `)
    .replace(/\bIbid\.?/g, 'Пак там.')
    .replace(/\bLetter (\d+)/g, 'Писмо $1')
    .replace(/\bManuscript (\d+)/g, 'Ръкопис $1')
    .replace(
      new RegExp(`\\b(${EN_MONTHS.join('|')}) (\\d{1,2}), (\\d{4})\\b`, 'g'),
      (_, m, d, y) => `${d} ${BG_MONTHS[EN_MONTHS.indexOf(m)]} ${y} г.`,
    )
    .replace(/г\.\./g, 'г.')
    .replace(/(?<!\.)\.\.$/, '...') // trailing ellipsis rendered as two dots
  return s.replace(SOURCE_DASH, ' — ')
}

/**
 * Some compilations (e.g. TMK) put the source in an endnote superscript:
 * `…text.<sup class="bookendnote"><a>3<span class="bookendnote">The Review and Herald, March 15, 1892.</span></a></sup>`
 * → `…text.—The Review and Herald, March 15, 1892.` (the inline form TDG uses)
 */
function cleanParagraph(s: string) {
  s = s.replace(
    /<sup class="bookendnote">.*?<span class="bookendnote">(.*?)<\/span><\/a><\/sup>/gs,
    (_, ref) => `—${stripTags(ref)}`,
  )
  return stripTags(s)
}

function stripTags(s: string) {
  return s.replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim()
}

async function publish() {
  const registryFile = Bun.file(PATHS.registry)
  const registry = (await registryFile.json()) as RegistryItem[]
  const existingIndex = registry.findIndex(
    (e) => e.id === info.code.toLowerCase(),
  )
  const item = await infoToRegistryItem(registry[existingIndex])

  const bundleDir = PATHS.bundle

  const publishPath = PATHS.publish(item)

  // ensure publish dir exists
  await mkdir(publishPath, { recursive: true })

  const glob = new Glob('**/*.*')

  const bundleFilesNames = new Set(Array.from(glob.scanSync(bundleDir)))
  const targetFilesNames = new Set(glob.scanSync(publishPath))
  const filesNames = bundleFilesNames //.difference(targetFilesNames)

  if (!filesNames.size) return

  await Promise.all(
    filesNames
      .values()
      .toArray()
      .map(async (name) =>
        Bun.write(`${publishPath}/${name}`, Bun.file(`${bundleDir}/${name}`)),
      ),
  )


  if (!~existingIndex) registry.push(item)
  else registry.splice(existingIndex, 1, item)

  await registryFile.write(JSON.stringify(registry, null, 2))
}

/** i = 0-based day of a leap year → "January 1" / "1 януари" */
function getDay(i: number, lang: keyof typeof formatters) {
  const date = new Date(2004, 0, 1 + i)
  return formatters[lang].format(date)
}
