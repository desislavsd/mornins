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
    const startOfYear = new Date(unref(year), 0, 1)
    const startOfMonth = new Date(unref(year), i, 1)
    // Calculate the difference in milliseconds
    const diff = startOfMonth - startOfYear

    // Convert the difference to weeks (1 week = 604800000 milliseconds)
    const weeks = Math.floor(diff / 604800000)

    return {
      name: formatter.format(new Date(0, i)),
      // offset: new Date(year.value, i, 1).getDay(),
      offset: weeks + 1,
    }
  })
})

function getStyle(i) {
  if (i > unref(index)) return 'bg-foreground/5'
  return isDone(i) ? 'bg-foreground' : 'bg-foreground/15'
}
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
        <div
          v-for="(n, i) in daysCount"
          :key="n"
          class="w-3 h-3 rounded-sm"
          :class="[
            getStyle(i),
            i == index && 'ring-1 ring-offset-1 ring-foreground',
          ]"
          :style="n == 1 ? `grid-row-start: ${offset}` : ''"
        ></div>
      </div>
      <ScrollBar orientation="horizontal" />
    </ScrollArea>
  </div>
</template>
<style></style>
