<script lang="ts" setup>
import { useBook } from '@/composables/useBook'
const props = defineProps<{
  shrinked: boolean
}>()
const { item, date, day, month } = useBook()
const transition =
  'transition-all duration-300 [will-change:padding] transition-delay-1000'
</script>
<template>
  <Card
    :class="([
          `sticky top-0 rounded-none bg-background z-10 p-6 ${transition}`,
          { 'py-2': shrinked },
        ] as any)"
  >
    <div class="flex justify-between items-center">
      <CardHeader class="p-0">
        <CardTitle
          class="whitespace-nowrap overflow-hidden [text-overflow:ellipsis]"
          >{{ item.name }}</CardTitle
        >
        <transition>
          <CardDescription v-show="!shrinked">{{
            item.author
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
              class="flex items-center"
              :class="shrinked ? 'gap-2' : 'flex-col aspect-square h-auto py-0'"
            >
              <div :class="shrinked ? 'text-base' : 'text-xl'">
                {{ day }}
              </div>
              <span class="font-normal capitalize">{{ month }}</span>
              <!-- <transition>
              </transition> -->
            </Button>
          </PopoverTrigger>
          <PopoverContent class="w-auto p-0">
            <Calendar v-model="date" />
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
