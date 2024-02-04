<script lang="ts" setup>
import useReadPage from '@/composables/useReadPage'
import { datesRanges } from '@/composables/useStreaks'

defineProps<{
  shrinked: boolean
}>()
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
  <Card
    :class="`fixed w-full left-0 top-0 rounded-none bg-background z-10 p-6 ${transition} ${
      shrinked ? 'py-2' : ''
    }`"
  >
    <div class="flex justify-between items-center">
      <CardHeader class="p-0">
        <CardTitle
          class="whitespace-nowrap overflow-hidden [text-overflow:ellipsis]"
          >{{ book?.name }}</CardTitle
        >
        <transition>
          <CardDescription v-show="!shrinked">{{
            book?.author
          }}</CardDescription>
        </transition>
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
            <Button
              class="relative flex items-center"
              :class="shrinked ? 'gap-2' : 'flex-col aspect-square h-auto py-0'"
            >
              <div :class="shrinked ? 'text-base' : 'text-xl'">
                {{ day }}
              </div>
              <span class="font-normal capitalize">{{ month }}</span>
              <Badge
                v-if="read"
                class="animate-in zoom-in absolute top-0 right-0 -m-1 ring-background ring-[2px] rounded-full aspect-square p-0"
              >
                <i class="i-carbon-checkmark text-lg"></i>
              </Badge>
              <!-- <transition>
              </transition> -->
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
  <div style="height: 145px"></div>
</template>
<style>
.progressbar {
  transform-origin: left center;
  animation-name: progress;
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
