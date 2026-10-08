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
const gc = forceAsyncChain(getChapter, 200)

// console.log(await bibles.loadPassage(' 1:1'))
const toc = await getToc()

const info = await getInfo()

await getCover()

const chapters = await getChapters()

translateContent()

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

async function infoToRegistryItem(): RegistryItem {
  const { title, code, author } = info

  return {
    id: code.toLowerCase(),
    name: await t(title),
    author: await t(author),
    googleTrnaslate: true,
    hidden: false,
  }
}

async function getChapters(): Promise<Partial<BookItem>[]> {
  const file = Bun.file(PATHS.content('en'))
  if (await file.exists()) return file.json()
  const content = await Promise.all(
    Array.from({ length: 366 }).map((e, i) => gc(i + 1)),
  )
  file.write(JSON.stringify(content, null, 2))
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

  const separator = `\n`.repeat(10)

  const translated = await Promise.all(
    chapters.map(async (chapter) => {
      chapter = structuredClone(chapter)

      const label = `Translating Chapter: ${chapter.title}`
      console.time(label)
      const translated = await t(
        [chapter.title, ...chapter.content!].join(separator),
      )
      console.timeEnd(label)

      const [title, ...content] = translated
        .split(separator)
        .map((e) => e.trim())

      const verse = /title="([^"]*)"/.exec(chapter.verse!)?.[1]!
      const passage = await bibles.loadPassage(verse)

      if (!passage) console.warn('Passage not found:', verse)

      return Object.assign(chapter, {
        title,
        verse: `${passage.verses.join(' ')} (${passage.title})`,
        content,
      })
    }),
  )

  await file.write(JSON.stringify(translated, null, 2))
}

async function publish() {
  const item = await infoToRegistryItem()

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

  const registryFile = Bun.file(PATHS.registry)
  const registry = (await registryFile.json()) as RegistryItem[]

  const existingIndex = registry.findIndex((e) => e.id === item.id)

  if (!~existingIndex) registry.push(item)
  else registry.splice(existingIndex, 1, item)

  await registryFile.write(JSON.stringify(registry, null, 2))
}

const formatter = new Intl.DateTimeFormat('en-US', {
  month: 'long',
  day: 'numeric',
})

function getDay(i: number) {
  const yearStart = new Date(2004, 0, 1)
  const date = new Date(+yearStart + i * 86400000)
  return formatter.format(date)
}
