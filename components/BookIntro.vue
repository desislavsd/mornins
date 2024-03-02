<script lang="ts" setup>
import useReadPage from '@/composables/useReadPage'
import { datesRanges } from '@/composables/useStreaks'

const { book, date, day, month, read } = useReadPage()
const transition =
  'transition-all duration-300 [will-change:padding] transition-delay-1000'
const calendarAttrs = computed(() => [
  {
    key: 'today',
    dot: true,
    dates: datesRanges.value,
  },
])
</script>
<template>
  <Card class="sticky w-full left-0 top-0 rounded-none z-10 p-6 py-2">
    <div class="flex justify-between items-center">
      <CardHeader class="p-0">
        <CardTitle
          class="whitespace-nowrap overflow-hidden [text-overflow:ellipsis]"
        >
          {{ book?.name }}
        </CardTitle>
      </CardHeader>
      <!-- <CardContent class="pt-6">
        <img
          :src="`/books/${item.id}/img.webp`"
          class="w-10 object-cover rounded-md"
        />
      </CardContent> -->
      <CardFooter class="p-0">
        <Popover>
          <PopoverTrigger as-child>
            <Button class="relative flex items-center gap-2">
              <div class="text-base">
                {{ day }}
              </div>
              <span class="font-normal capitalize">{{ month }}</span>
              <Badge
                v-if="read"
                class="animate-in zoom-in absolute top-0 right-0 -m-1 ring-background ring-[2px] rounded-full aspect-square p-0"
              >
                <i class="i-carbon-checkmark text-lg"></i>
              </Badge>
            </Button>
          </PopoverTrigger>
          <PopoverContent class="w-auto p-0">
            <Calendar v-model="date" :attributes="calendarAttrs" />
          </PopoverContent>
        </Popover>
      </CardFooter>
    </div>
    <div
      class="progressbar absolute bottom-0 w-full h-[3px] bg-foreground left-0"
    ></div>
  </Card>
</template>
<style>
.progressbar {
  transform-origin: left center;
  animation: progress linear both alternate;
  animation-duration: 1ms; /* Firefox requires this to apply the animation */
  animation-direction: alternate;
  animation-timeline: scroll(block nearest);
}
@keyframes progress {
  from {
    scale: 0 1;
  }
  to {
    scale: 1 1;
  }
}
</style>
