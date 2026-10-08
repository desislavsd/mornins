import { SQL } from 'bun'
import { parseNotation } from './parser'

interface PassageQuery {
  book: number
  chapter: number
  from: number
  to: number
}

interface PassageData extends Omit<PassageQuery, 'book'> {
  book: BibleBook
  verses: string[]
}

interface BibleBook {
  book_number: number
  short_name: string
  long_name: string
  book_color: string
  slugs: string[]
}

export class Bible {
  sql: SQL
  books: BibleBook[] = []

  constructor(name: string) {
    this.sql = new SQL({
      url: `sqlite:${import.meta.dir}/${name}.SQLite3`,
    })
  }

  async init() {
    const books = <Omit<BibleBook, 'slugs'>[]>(
      await this.sql`select * from books`
    )

    this.books = books.map((b) => ({
      ...b,
      slugs: [b.short_name, b.long_name].map(slugify),
    }))
    return this
  }

  loadPassages(passages: PassageQuery[]) {
    return Promise.all(passages.map((p) => this.loadPassage(p)))
  }

  async loadPassage(query: PassageQuery) {
    let { book, chapter = 1, from = 1, to = 300 } = query

    const verses = await this.sql`
      SELECT * FROM verses
      WHERE book_number = ${book}
      AND chapter = ${chapter}
      AND verse >= ${from}
      AND verse <= ${to}
    `

    if (!verses.length) return null

    to = +from + verses.length - 1

    return new Passage({
      book: this.books.find((e) => e.book_number == book)!,
      chapter,
      from,
      to,
      verses: verses.map((e: { text: string }) => e.text),
    })
  }

  findBook(s: string) {
    s = slugify(s)
    return this.books.find(({ slugs }) => slugs.some((e) => s.startsWith(e)))
  }
}

export class Bibles extends Map<string, Bible> {
  async loadPassage(
    passages: string | PassageQuery[],
    bible: string | Bible = this.values().next().value!
  ) {
    const result = await this.loadPassages(passages, bible)

    return result.filter(Boolean)[0]
  }

  loadPassages(
    passages: string | PassageQuery[],
    bible: string | Bible = this.values().next().value!
  ): Promise<Passage[]> {
    if (typeof passages == 'string') passages = this.parse(passages)

    if (typeof bible === 'string') bible = this.get(bible)!

    return bible.loadPassages(passages) as any
  }

  parse(notation: string) {
    const res = parseNotation(notation).filter(Boolean)

    return res
      .map(
        (e) =>
          <PassageQuery>{
            ...e,
            book: this.findBook(e.book)?.book_number,
          }
      )
      .filter((e) => e.book)
  }

  findBook(s: string, match?: BibleBook) {
    for (let bible of this.values())
      if ((match = bible.findBook(s))) return match
  }
}

export interface Passage {
  title: string
  chapter: number
  from: number
  to: number
  verses: string[]
}

export class Passage {
  constructor(data: PassageData | Passage) {
    Object.assign(
      this,
      data instanceof Passage
        ? structuredClone(data)
        : {
            title: buildPassageTitle({ ...data, book: data.book.long_name }),
            ...data,
            book: data.book.book_number,
          }
    )
  }
}

function slugify(term: string) {
  return term.trim().toLowerCase().replaceAll(' ', '')
}

function buildPassageTitle({
  book,
  from,
  to,
  chapter,
}: Omit<PassageData, 'book'> & { book: BibleBook['long_name'] }) {
  return `${book.replace(/\n/g, '')} ${chapter}:${from}${
    to != from ? `-${to}` : ''
  }`
}
