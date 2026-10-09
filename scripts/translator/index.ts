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

const EN_MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
]
const BG_MONTHS = [
  'януари', 'февруари', 'март', 'април', 'май', 'юни',
  'юли', 'август', 'септември', 'октомври', 'ноември', 'декември',
]
const PERIODICALS: [RegExp, string][] = [
  [/(The )?Review and Herald|„?Ревю енд Хералд“?/g, 'The Review and Herald'],
  [/(The )?Signs of the Times|„?Знамения на времето“?/g, 'The Signs of the Times'],
]

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

  if (existing) {
    // keep the curated name/author; the book is no longer machine-translated by Google
    const { googleTrnaslate, ...rest } = existing
    return rest
  }

  const [name, authorName] = await geminiTranslateSafe([title, author], {
    context: 'These are a book title and an author name.',
  })

  return {
    id: code.toLowerCase(),
    name,
    author: authorName,
    hidden: false,
  }
}

async function getChapters(): Promise<Partial<BookItem>[]> {
  const file = Bun.file(PATHS.content('en'))
  let content: Partial<BookItem>[]
  if (await file.exists()) content = await file.json()
  else {
    content = await Promise.all(
      Array.from({ length: 366 }).map((e, i) => gc(i + 1)),
    )
  }
  // day labels are deterministic; (re)write so published en.json always has them
  // the app renders plain paragraphs; drop egwlink spans etc. (verse keeps its link for the ref)
  content = content.map((c, i) => ({
    day: getDay(i, 'en'),
    ...c,
    title: stripTags(c.title!),
    content: c.content!.map(stripTags),
  }))
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
    .filter((e) => e.element_subtype === 'standard-indented')
    .map((e) => e.content)

  console.timeEnd(label)
  return {
    title: data
      .find((e) => e.element_type === 'h3')!
      .content.split(/(?<=[^\w\s'])/)
      .slice(0, -1)
      .join(''),
    verse: data.find((e) => e.element_subtype === 'devotionaltext')!.content,
    content,
  }
}

async function translateContent() {
  const file = Bun.file(PATHS.content('bg'))
  if (await file.exists()) return await file.json()

  await mkdir(PATHS.cache('bg'), { recursive: true })

  const queue = chapters.map((chapter, i) => () => translateChapter(chapter, i))
  const translated: BookItem[] = new Array(chapters.length)

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
    .replace(/\bLetter (\d+)/g, 'Писмо $1')
    .replace(/\bManuscript (\d+)/g, 'Ръкопис $1')
    .replace(
      new RegExp(`\\b(${EN_MONTHS.join('|')}) (\\d{1,2}), (\\d{4})\\b`, 'g'),
      (_, m, d, y) => `${d} ${BG_MONTHS[EN_MONTHS.indexOf(m)]} ${y} г.`,
    )
    .replace(/г\.\./g, 'г.')
    .replace(/(?<!\.)\.\.$/, '...') // trailing ellipsis rendered as two dots
  return s.replace(
    /\s*[—–-]\s*(?=(Писмо|Ръкопис|The Review|The Signs|Пак там|Testimonies))/g,
    ' — ',
  )
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
