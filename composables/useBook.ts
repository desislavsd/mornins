import books from '@/assets/registry.json'
import { type InjectionKey, type WritableComputedRef } from 'vue'
import { useNuxtApp } from '#imports'
import { monthsNames } from '#imports'

const key = Symbol('useBook') as InjectionKey<{
  item: ComputedRef<(typeof books)[number]>
  date: WritableComputedRef<Date>
  chapter: ComputedRef<
    | {
        day: string
        title: string
        verse: string
        content: string
      }
    | undefined
  >
  loading: Ref<boolean>
  day: ComputedRef<number>
  month: ComputedRef<string>
  url: ComputedRef<string>
  next: (prev: boolean) => void
}>

export function useBook() {
  let data = inject(key, null)

  if (data) return data

  const { $router } = useNuxtApp()

  const item = computed(() => {
    return books.find(
      (item) => item.id === $router.currentRoute.value.params.id
    ) as (typeof books)[number]
  })

  const date = computed({
    get() {
      const { date } = $router.currentRoute.value.params

      return date == 'today' ? new Date() : new Date(date as string)
    },
    set(date) {
      $router.push(
        `/books/${$router.currentRoute.value.params.id}/${date
          .toISOString()
          .slice(0, 10)}`
      )
    },
  })

  const url = computed(
    () =>
      `${window.location.origin}/books/${item.value.id}/${date.value
        .toISOString()
        .slice(0, 10)}`
  )

  const id = computed(() => $router.currentRoute.value.params.id)

  const loading = ref(false)

  const text = asyncComputed(
    async () => {
      const response = await fetch(`/books/${id.value}/text.txt`)

      return parseText(await response.text())
    },
    null,
    { evaluating: loading }
  )

  const chapter = computed(() => {
    const day = getDayOfYear(date.value)

    return text.value?.[day - 1]
  })

  data = {
    item,
    date,
    chapter,
    loading,
    day: computed(() => date.value.getDate()),
    month: computed(() => monthsNames[date.value.getMonth()]),
    url,
    next,
  }

  provide(key, data)

  function next(prev: boolean) {
    const newDate = new Date(+date.value + (-1) ** +prev * 24 * 60 * 60 * 1000)
    date.value = newDate
  }
  return data
}

function getDayOfYear(date: Date) {
  const start = new Date(date.getFullYear(), 0, 0)
  const diff = date.getTime() - start.getTime()
  const oneDay = 1000 * 60 * 60 * 24
  let day = Math.floor(diff / oneDay)
  // adjust for non leap years
  if (day >= 60 && date.getFullYear() % 4 !== 0) return (day += 1)
  return day
}

function parseText(text: string) {
  return text.split('\n\n\n').map(parseChapter)
}

function parseChapter(text: string) {
  const rx = /(?<day>\d+\s+[а-я]+)\n+(?<title>[^\n]+)\n+(?<verse>[^\)]+\)\.?)/im
  const {
    groups: { day, title, verse },
  } = text.match(rx) ?? ({} as any)
  text = text
    .replace(rx, '')
    .split('\n\n')
    .map((p) => `<p>${p}</p>`)
    .join('')
  return {
    day,
    title,
    verse,
    content: text,
  }
}
