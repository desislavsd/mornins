<script lang="tsx" setup>
import { useBook } from '@/composables/useBook'
import { sleep } from '#imports'

const el = ref(null)
let swipeStartAt = 0

const swipe = useSwipe(el, {
  onSwipeStart(e) {
    swipeStartAt = Date.now()
  },
  onSwipeEnd(e, dir) {
    // ignore vertical swipes
    if (Math.abs(swipe.lengthX.value) <= Math.abs(swipe.lengthY.value)) return
    // ignore slow swipes
    if (Date.now() - swipeStartAt > 300) return
    // ignore short swipes
    if (Math.abs(swipe.lengthX.value) < 80) return

    if (!['left', 'right'].includes(dir)) return

    next(dir == 'right')
  },
})
const size = useLocalStorage('size', 'prose-sm')
const { item, date, chapter, loading, next, read } = useBook()

const bounds = ref()

watch(chapter, async () => {
  if (document.documentElement.scrollTop < 50) return
  await sleep(500)
  document.documentElement.scrollTo({ top: 0, behavior: 'smooth' })
})
</script>
<template>
  <div ref="el">
    <!-- <span class="fixed bottom-0 right-0 m-4">{{ read ? '✔︎' : '' }}</span> -->
    <AriaBoundaries v-model="bounds" #default="bounds">
      <BookIntro :shrinked="!bounds.start"></BookIntro>
      <template v-if="chapter">
        <div class="prose pt-10 pb-12 px-6 text-justify mx-auto" :class="size">
          <h3 class="text-center font-bold">
            {{ chapter.title }}
          </h3>
          <div class="block italic text-center mb-8 opacity-50">
            {{ chapter.day }}
          </div>
          <div class="relative">
            <ProgressDetector
              v-model="read"
              :key="chapter?.day"
              class="absolute inset-0"
            />
            <blockquote>{{ chapter.verse }}</blockquote>
            <div v-html="chapter.content"></div>
          </div>
        </div>
      </template>
      <div v-else-if="loading" class="text-center h-20 grid place-items-center">
        <i class="i-svg-spinners-3-dots-scale !h-8 !w-8"></i>
      </div>
      <div class="flex fixed bottom-6 left-0 w-full justify-center">
        <BookToolbar v-bind="{ item, date }" v-model:size="size" />
      </div>
    </AriaBoundaries>
  </div>
</template>
<style></style>
