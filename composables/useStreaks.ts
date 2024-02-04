import useToday from './useToday'

const oldStorage = useLocalStorage('read', {
  days: defaultStreak().data,
  migrated: true,
})

const storage = useLocalStorage('streak', defaultStreak())

// TODO: migrate old storage; remove someday
if (!oldStorage.value.migrated) {
  storage.value.data = oldStorage.value.days
  oldStorage.value.migrated = true
}

const { index, date, year } = useToday()

// reset storage on new year
watch(
  index,
  (index) => {
    // detect new year
    if (index) return

    // already reset
    if (
      date.value.getFullYear() ===
      new Date(storage.value.createdAt).getFullYear()
    )
      return

    storage.value = defaultStreak()
  },
  {
    immediate: true,
  }
)

const today = useStreakDay()

const streaks = computed(() => {
  // today should be excluded if not done
  const i = index.value + (unref(today.done) ? 1 : 0)
  const data = storage.value.data.slice(0, i)
  return [0].concat(data.split(/-+/).map((e) => e.length))
})

const stats = reactive({
  current: computed(() => streaks.value.at(-1)),
  longest: computed(() => Math.max(...streaks.value)),
})

export const datesRanges = computed(() => {
  const startOfYear = new Date(year.value, 0, 1)
  return storage.value.data
    .split('')
    .map((e, i) => {
      if (e !== '+') return
      return new Date(+startOfYear + i * 24 * 60 * 60 * 1000)
    })
    .filter(Boolean)
})

export default useStreaks

export { useStreakDay, useStreaks }

function useStreaks(streakDayIndex?: MaybeRef<number>) {
  return {
    week: useWeek(),
    streaks,
    stats,
  }
}

function useStreakDay(dayIndex: MaybeRef<number> = index) {
  return {
    done: computed<boolean>({
      get() {
        return storage.value.data[unref(dayIndex)] === '+'
      },
      set(value) {
        setDone(unref(dayIndex), value)
      },
    }),
  }
}

function defaultStreak() {
  const createdAt = new Date()
  return {
    createdAt,
    data: Array(366).fill('-').join(''),
  }
}

function setDone(index: number, value: boolean) {
  storage.value.data = storage.value.data
    .split('')
    .with(index, value ? '+' : '-')
    .join('')
}

export function isDone(index: number | Date) {
  if (index instanceof Date) index = getDayOfYear(index) - 1
  return storage.value.data[index] === '+'
}

function useWeek() {
  const daysNames = weekDaysNames(date.value)
  const book = useLastBook()
  const { $router } = useNuxtApp()

  const week = computed(() => {
    const dates = getWeekDates(date.value)
    const days = dates.map((date, i) => {
      const dayIndex = getDayOfYear(date) - 1
      const to = {
        name: 'books-id-date',
        params: {
          id: book.value?.id,
          date:
            dayIndex == unref(index)
              ? 'today'
              : date.toISOString().slice(0, 10),
        },
      }
      return {
        index: dayIndex,
        date,
        name: daysNames[i],
        read: isDone(dayIndex),
        to,
        go() {
          $router.push(to)
        },
      }
    })

    const today = days.find(
      (e) => e.index == unref(index)
    ) as (typeof days)[number]

    return {
      days,
      today,
    }
  })

  return week
}
