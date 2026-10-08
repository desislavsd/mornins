import books from '@/assets/registry.json'
import { useNuxtApp, useRoute, useToday } from '#imports'
import { getDayOfYear, toSelfProvidingHook } from '@/utils'
import { d as $d } from '@/plugins/i18n'

function useReadPage() {
  const { id, date, day, month, next, index } = useReadRoute()

  // const formatter = computed(() => new Intl.DateTimeFormat('en-US', {
  //   month: 'long',
  //   day: 'numeric',
  // }))

  const { book, loading, content } = useBook(id as any)

  const url = computed(
    () =>
      `${window.location.origin}/books/${book.value?.id}/${date.value
        .toISOString()
        .slice(0, 10)}`,
  )

  const chapter = computed(() => {
    const chapter = content.value?.[index.value]
    if (!chapter) return

    return {
      ...chapter,
      day: $d(unref(date), 'readDay'),
    }
  })

  const { done: read } = useStreakDay(index)

  return {
    book,
    date,
    chapter,
    loading,
    url,
    read,
    day,
    month,
    next,
  }
}

export default toSelfProvidingHook(useReadPage)

export function useReadRoute() {
  // Nuxt's useRoute() is page-scoped: a leaving page keeps seeing the route it
  // was rendered with, so params don't go undefined mid-navigation.
  const route = useRoute()
  const lastBook = useLastBook()
  const id = computed(() => route.params.id as string)
  const date = useRouteDate()
  const day = computed(() => date.value.getDate())
  const month = computed(() => $d(date.value, 'month'))
  const index = computed(() => getDayOfYear(date.value) - 1)

  watchEffect(() => lastBook.set(id.value as any))

  function next(prev: boolean) {
    const newDate = new Date(+date.value + (-1) ** +prev * 24 * 60 * 60 * 1000)
    date.value = newDate
  }

  return { id, date, day, month, index, next }
}

export function useRouteDate() {
  const { $router } = useNuxtApp()
  const route = useRoute()

  const today = useToday()

  return computed({
    get() {
      const { date } = route.params
      return !date || date == 'today'
        ? today.date.value
        : new Date(date as string)
    },
    set(date) {
      $router.push({
        params: {
          id: route.params.id,
          date: date.toISOString().slice(0, 10),
        },
      })
    },
  })
}

export function useBook(
  id: MaybeRef<(typeof books)[number]['id']>,
  en: boolean = false,
) {
  const book = computed<(typeof books)[number] | undefined>(() =>
    books.find((item) => item.id === unref(id)),
  )

  const loading = ref(false)

  const content = asyncComputed<Chapter[]>(
    async () => {
      if (!book.value) return

      const response = await fetch(
        `/books/${book.value.id}/${en ? 'en' : 'bg'}.json`,
      )

      return response.json()
    },
    undefined,
    { evaluating: loading },
  )

  return {
    book,
    loading: readonly(loading),
    content,
  }
}

type Chapter = (typeof import('@/public/books/toc/bg.json'))[number]
