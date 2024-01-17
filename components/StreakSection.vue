<script lang="tsx" setup>
import { storage } from '@/composables/useBook'
import { getWeekDates } from '@/utils'
import books from '@/assets/registry.json'
const { $router } = useNuxtApp()

const now = useTimestamp({ interval: 1000 * 60 })

const state = computed(() => {
  const date = new Date(now.value)
  const dates = getWeekDates(date)
  const daysNames = weekDaysNames(date)
  const todayIndex = getDayOfYear(date) - 1

  const streaks = [0].concat(
    storage.value.days
      .slice(0, todayIndex + 1)
      .split(/-+/)
      .map((e) => e.length)
  )

  const book = books.find((e) => e.id == storage.value.book) || books[0]

  const items = dates.map((date, i) => {
    const index = getDayOfYear(date) - 1
    return {
      index,
      date,
      name: daysNames[i],
      read: storage.value.days[index] == '+',
      to: {
        name: 'books-id-date',
        params: {
          id: book.id,
          date: date.toISOString().slice(0, 10),
        },
      },
    }
  })

  return {
    date,
    todayIndex,
    streaks,
    items,
    item: items.find((e) => e.index == todayIndex),
    book,
  }
})

function next() {
  const to = state.value.item?.to
  to && $router.push(to)
}
</script>
<template>
  <div>
    <div class="leading-[1] flex items-center justify-between">
      <div>
        <span class="text-[6rem]">{{ state.streaks.at(-1) }} </span>
        <span class="text-4xl ml-2 relative">
          {{ state.streaks.at(-1) == 1 ? 'Day' : 'Days' }}
        </span>
      </div>
      <Button @click="next()" variant="ghost" class="mt-2">
        Today
        <i
          class="ml-2"
          :class="
            state.item?.read ? 'i-carbon-checkmark' : 'i-carbon-arrow-right'
          "
        ></i>
      </Button>
    </div>
    <div class="flex justify-between mt-2">
      <Button
        class="aspect-square grid place-items-center"
        as-child
        v-for="(item, i) in state.items"
        :variant="item.read ? 'default' : 'outline'"
      >
        <NuxtLink :to="item.to">
          {{ item.name }}
        </NuxtLink>
      </Button>
    </div>
    <p class="mt-2">
      Keep pushing, you previous record was {{ state.streaks.at(-2) }} days.
    </p>
  </div>
</template>
<style></style>
