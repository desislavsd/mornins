<script setup>
const { isLeapYear, year, index } = useToday()
import { isDone, dayToSlot } from '@/composables/useStreaks'
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

// center the current week in view (matters late in the year)
const scrollArea = ref()
function scrollToCurrentWeek() {
  const root = scrollArea.value?.$el
  const viewport = root?.querySelector('[data-radix-scroll-area-viewport]')
  const tile = root?.querySelector('[data-today]')
  if (!viewport || !tile) return
  const v = viewport.getBoundingClientRect()
  const t = tile.getBoundingClientRect()
  const delta = t.left + t.width / 2 - (v.left + v.width / 2)
  viewport.scrollLeft = Math.max(viewport.scrollLeft + delta, 0)
}
onMounted(() => nextTick(scrollToCurrentWeek))
watch(index, () => nextTick(scrollToCurrentWeek))

// One shared tooltip for all tiles, driven by event delegation on the grid,
// instead of a Tooltip component instance per tile.
const hovered = ref(null)
function tileFromEvent(e) {
  const el = e.target.closest?.('[data-day]')
  if (!el) return
  const rect = el.getBoundingClientRect()
  return {
    tile: tiles.value[+el.dataset.day],
    x: rect.left + rect.width / 2,
    y: rect.top,
  }
}
function onTileEnter(e) {
  hovered.value = tileFromEvent(e) ?? hovered.value
}
function onTileLeave(e) {
  if (!e.relatedTarget?.closest?.('[data-day]')) hovered.value = null
}

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

    // `index` is a storage slot, tiles are days of the year
    const slot = dayToSlot(i, unref(isLeapYear))
    const done = isDone(slot)
    const isToday = slot == unref(index)

    return {
      done,
      attrs: {
        class: [
          'block w-3 h-3 rounded-sm  transition-colors',
          slot > unref(index)
            ? 'bg-foreground/5 hover:bg-foreground/30'
            : done
              ? 'bg-foreground'
              : 'bg-foreground/15 hover:bg-foreground/30',
          isToday && 'ring-1 ring-offset-1 ring-foreground',
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
        'data-today': isToday ? '' : undefined,
        'data-day': i,
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
    <ScrollArea ref="scrollArea" class="my-4 p-2 -m-2">
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
        @pointerover="onTileEnter"
        @pointerout="onTileLeave"
        @focusin="onTileEnter"
        @focusout="onTileLeave"
      >
        <!-- Days -->
        <NuxtLink v-for="(tile, i) in tiles" :key="i" v-bind="tile.attrs" />
      </div>
      <Teleport to="body">
        <!-- positioning and animation on separate elements: animate-in owns `transform` -->
        <div
          v-if="hovered"
          role="tooltip"
          class="fixed z-50 pointer-events-none -translate-x-1/2 -translate-y-full -mt-2"
          :style="`left:${hovered.x}px;top:${hovered.y}px`"
        >
          <div
            :key="hovered.tile.date"
            class="origin-bottom rounded-md bg-primary px-3 py-1.5 text-xs text-primary-foreground whitespace-nowrap animate-in fade-in-0 zoom-in-95"
          >
            <i
              v-if="hovered.tile.done"
              class="i-carbon:checkmark-filled align-middle -mt-[2px]"
            ></i>
            {{ hovered.tile.date }}
          </div>
        </div>
      </Teleport>
      <ScrollBar orientation="horizontal" />
    </ScrollArea>
  </div>
</template>
<style></style>
