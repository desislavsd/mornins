import { bibles } from '.'
const RX_NOTATION =
  /(?<book>\d*(?:\s*\p{L}+){1})(?<passages>(?:[\s,;:-]?\d+(?!\s*\p{L}))+)/u

export function parseNotation(query: string) {
  let rx = new RegExp(RX_NOTATION.source, `${RX_NOTATION.flags}g`)

  const matches = [...query.matchAll(rx)]
    .map((e) => e.groups)
    .filter(Boolean) as unknown as { book: string; passages: string }[]

  return matches
    .map(({ book, passages }) => {
      book = normalizeNotation(book)
      passages = normalizeNotation(passages)
      const parts = passages.split(/(\d+)/g).filter(Boolean)
      let flag = 'chapter'

      return parts
        .reduce(
          (acc, part, i) => {
            const psg = acc.at(-1)
            const { chapter } = psg
            const num = +part

            if (num) {
              // @ts-ignore
              psg[flag] = num
              return acc
            }
            switch (part) {
              case ':':
                flag = 'from'
                break
              case '-':
                if (flag == 'chapter') acc.push({})
                else flag = 'to'
                break
              case ';':
                flag = 'chapter'
                acc.push({})
                break
              case ',':
                if (flag == 'chapter') acc.push({})
                else (flag = 'from') && acc.push({ chapter })
                break
              default:
                break
            }

            return acc
          },
          [{} as any]
        )
        .map((e) => ({ book, ...e }))
    })
    .flat()
    .filter((e) => e.chapter)
    .map(mkPassage)
}

function mkPassage({ book = '', chapter, from, to } = {} as any) {
  return mapObj(
    {
      book,
      chapter,
      from,
      to: to ?? from,
    },
    (v: any) => +v || v
  )
}

function mapObj(obj: {}, fn: Function) {
  return Object.fromEntries(Object.entries(obj).map(([k, v]) => [k, fn(v, k)]))
}

function normalizeNotation(notation: string) {
  return notation
    .trim()
    .toLowerCase()
    .replace(/\s/g, '') // remove whitespace
    .replaceAll('.', '') // remove dots
    .replace(/[—–]/g, '-') // normalize dashes
    .replace(/([^\w\p{L}\d]{2,})/gu, (m) => m[0]) // remove sequant non word characters `;|:|.|,`...
}
