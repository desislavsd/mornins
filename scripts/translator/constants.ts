import type { RegistryItem } from '~/utils/types'

export const TARGET_BOOK_ID = +Bun.argv[2]

export const WORKSPACE = `./temp/translator/${TARGET_BOOK_ID}`

export const PATHS = {
  workspace: WORKSPACE,
  bundle: `${WORKSPACE}/bundle`,
  toc: `${WORKSPACE}/toc.json`,
  info: `${WORKSPACE}/info.json`,
  content: (lang = 'en') => `${WORKSPACE}/bundle/${lang}.json`,
  cover: (ext: string) => `${WORKSPACE}/bundle/img.${ext}`,
  registry: './assets/registry.json',
  publish: (info: RegistryItem) => `./public/books/${info.id}`,
}
