import { enhanceFetchPromise } from './utils'
import { createAuthManager, createApiClient } from '@surgbc/egw-writings-shared'

const authManager = createAuthManager()
export const apiClient = createApiClient(authManager)

const API_BASE = 'https://a.egwwritings.org'

class Api {
  constructor() {}

  fetch(url: string, options?: RequestInit) {
    if (!url.startsWith('http')) url = `${API_BASE}${url}`
    const headers = new Headers(options?.headers)
    headers.set('Authorization', `Bearer ${process.env.EGW_API_TOKEN}`)
    return enhanceFetchPromise(fetch(url, { ...options, headers }))
  }

  fetchBookToc(id: ID) {
    const url = `/content/books/${id}/toc`
    return this.fetch(url).json() as Promise<TocItem[]>
  }

  fetchBookContent(book: ID, [from, to]: [number, number]) {
    const searchParams = new URLSearchParams({
      trans: 'all',
      limit: `${to - from - 1}`,
      direction: 'both',
    })
    const url = `/content/books/${book}/content/${from}?${searchParams}`
    return this.fetch(url).json() as Promise<ContentItem[]>
  }

  fetchBookCover(id: ID, size = 'l') {
    const url = `https://media2.egwwritings.org/covers/${id}_${size}.jpg`
    return this.fetch(url).arrayBuffer()
  }
}

export const api = new Api()

export interface TocItem {
  para_id: string
  level: number
  title: string
  refcode_short: string
  dup: null
  puborder: number
}

export interface ContentItem {
  para_id: string
  id_prev: null
  id_next: string
  refcode_1: string
  refcode_2: string
  refcode_3: string
  refcode_4: string
  refcode_short: string
  refcode_long: string
  element_type: string
  element_subtype: string
  content: string
  puborder: number
  translations: ContentItemTranslation[]
}

export interface ContentItemTranslation {
  para_id: string
  lang: string
  refcode: string
}

type ID = string | number
