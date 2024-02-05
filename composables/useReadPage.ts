import books from '@/assets/registry.json'
import { useNuxtApp, useToday } from '#imports'
import { getDayOfYear, toSelfProvidingHook } from '@/utils'
import { d as $d } from '@/plugins/i18n'

function useReadPage() {
  const { id, date, day, month, next } = useReadRoute()

  const { book, loading, content } = useBook(id as any)

  const url = computed(
    () =>
      `${window.location.origin}/books/${book.value?.id}/${date.value
        .toISOString()
        .slice(0, 10)}`
  )

  const index = computed(() => getDayOfYear(date.value) - 1)

  const chapter = computed(() => content.value?.[index.value])

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

function useReadRoute() {
  const { $router } = useNuxtApp()
  const lastBook = useLastBook()
  const id = computed(() => $router.currentRoute.value.params.id)
  const date = useRouteDate()
  const day = computed(() => date.value.getDate())
  const month = computed(() => $d(date.value, 'month'))

  watchEffect(() => lastBook.set(id.value as any))

  function next(prev: boolean) {
    const newDate = new Date(+date.value + (-1) ** +prev * 24 * 60 * 60 * 1000)
    date.value = newDate
  }

  return { id, date, day, month, next }
}

function useRouteDate() {
  const { $router } = useNuxtApp()

  const today = useToday()

  return computed({
    get() {
      const { date } = $router.currentRoute.value.params

      return date == 'today' ? today.date.value : new Date(date as string)
    },
    set(date) {
      $router.push(
        `/books/${$router.currentRoute.value.params.id}/${date
          .toISOString()
          .slice(0, 10)}`
      )
    },
  })
}

function useBook(id: MaybeRef<(typeof books)[number]['id']>) {
  const book = computed<(typeof books)[number] | undefined>(() =>
    books.find((item) => item.id === unref(id))
  )

  const loading = ref(false)

  const content = asyncComputed(
    async () => {
      if (!book.value) return

      const response = await fetch(`/books/${book.value.id}/text.json`)

      return response.json()
    },
    null,
    { evaluating: loading }
  )

  return {
    book,
    loading: readonly(loading),
    content,
  }
}
