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
}
