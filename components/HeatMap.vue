<script setup>
const { isLeapYear, year, index } = useToday()
import { isDone } from '@/composables/useStreaks'
import { useI18n } from 'vue-i18n'
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area'
const { week } = useStreaks()
const { locale } = useI18n()
const daysCount = computed(() => (unref(isLeapYear) ? 366 : 365))
const offset = computed(() => new Date(year.value, 0, 1).getDay())
const months = computed(() => {
  let formatter = new Intl.DateTimeFormat(unref(locale), {
    month: 'short',
  })

  return Array.from({ length: 12 }, (_, i) => {
    // Create a date object for the start of the year and the start of the month
    const startOfYear =
      new Date(unref(year), 0, 1) - unref(offset) * 24 * 60 * 60 * 1000
    const startOfMonth = new Date(unref(year), i, 1)
    // Calculate the difference in milliseconds
    const diff = startOfMonth - startOfYear

    // Convert the difference to weeks (1 week = 604800000 milliseconds)
    const weeks = Math.floor(diff / (7 * 24 * 60 * 60 * 1000))

    return {
      name: formatter.format(new Date(0, i)),
      // offset: new Date(year.value, i, 1).getDay(),
      offset: weeks + 1,
    }
  })
})

const book = useLastBook()

const tiles = computed(() => {
  const dateFormatter = new Intl.DateTimeFormat(unref(locale), {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })

  return Array.from({ length: unref(daysCount) }).map((_, i) => {
    // start of year
    let date = new Date(unref(year), 0, 1)
    // add i days
    date = new Date(date.getTime() + (i + 0.2) * 24 * 60 * 60 * 1000)

    const done = isDone(i)

    return {
      done,
      attrs: {
        class: [
          'block w-3 h-3 rounded-sm  transition-colors',
          i > unref(index)
            ? 'bg-foreground/5 hover:bg-foreground/30'
            : done
              ? 'bg-foreground'
              : 'bg-foreground/15 hover:bg-foreground/30',
          i == unref(index) && 'ring-1 ring-offset-1 ring-foreground',
          date.getDate() == 1 && '!rounded-full',
        ],
        to: {
          name: 'books-id-date',
          params: {
            id: book.value?.id,
            date: date.toISOString().slice(0, 10),
          },
        },
        style: i ? '' : `grid-row-start: ${unref(offset) + 1}`,
      },
      date: dateFormatter.format(date),
    }
  })
})
</script>
<template>
  <div class="flex items-end gap-1">
    <!-- Week days -->
    <div class="flex flex-col gap-1 z-10 rounded-sm py-1 bg-background">
      <small
        v-for="(day, i) in week.days"
        class="grid place-items-center sticky left-0 w-3 h-3"
        :style="`grid-column-start:1;grid-row-start:${i + 1}`"
      >
        <span class="absolute text-[8px] text-foreground/40 uppercase">{{
          day.name
        }}</span>
      </small>
    </div>
    <ScrollArea class="my-4 p-2 -m-2">
      <div
        class="relative grid [grid-template-columns:repeat(52,0.75rem)] gap-1"
      >
        <!-- Months -->
        <small
          v-for="({ name, weeks, offset }, i) in months"
          class="text-[8px] text-foreground/40 uppercase leading-[0] h-3 flex items-center"
          :style="`grid-column-start:${offset}; column-span:4`"
        >
          {{ name }}
        </small>
      </div>
      <div
        class="relative grid grid-cols-[52] grid-rows-7 gap-1 [grid-auto-flow:column] py-1"
      >
        <!-- Days -->
        <Tooltip v-for="(tile, i) in tiles" :key="i">
          <TooltipTrigger as-child>
            <NuxtLink v-bind="tile.attrs"></NuxtLink>
          </TooltipTrigger>
          <TooltipContent>
            <i
              v-if="tile.done"
              class="i-carbon:checkmark-filled align-middle -mt-[2px]"
            ></i>
            {{ tile.date }}
          </TooltipContent>
        </Tooltip>
      </div>
      <ScrollBar orientation="horizontal" />
    </ScrollArea>
  </div>
</template>
<style></style>
