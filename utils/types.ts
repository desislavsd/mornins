export interface BookItem {
  day: string
  title: string
  verse: string
  content: string[]
}

export interface RegistryItem {
  id: string
  name: string
  author: string
  googleTrnaslate?: boolean
  hidden?: boolean
  /** ISO date (YYYY-MM-DD) the book was added; see isNewBook() */
  added?: string
}
