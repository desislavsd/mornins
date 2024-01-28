<script lang="tsx" setup>
import useReadPage from '@/composables/useReadPage'
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
const { chapter, loading, next, read } = useReadPage()

const bounds = ref()

const content = computed(() => {
  if (!chapter.value) return ''
  return chapter.value.content.map((e: any) => `<p>${e}</p>`).join('')
})

watch(chapter, async () => {
  if (document.documentElement.scrollTop < 50) return
  await sleep(500)
  document.documentElement.scrollTo({ top: 0, behavior: 'smooth' })
})
</script>
<template>
  <div ref="el">
    <AriaBoundaries v-model="bounds" #default="bounds">
      <BookIntro :shrinked="!bounds.start"></BookIntro>
      <template v-if="chapter">
        <div class="prose pt-10 pb-12 px-6 text-justify mx-auto" :class="size">
          <template v-if="content.length">
            <h3 class="text-center font-bold">
              {{ chapter.title }}
            </h3>
            <div class="block italic text-center mb-8 opacity-50">
              {{ chapter.day }}
            </div>
            <div class="relative">
              <ProgressDetector
                :model-value="read"
                @update:modelValue="read = $event || read"
                :key="chapter?.day"
                class="absolute inset-0"
              />
              <blockquote>{{ chapter.verse }}</blockquote>
              <div v-html="content"></div>
            </div>
          </template>
          <p v-else class="text-center">
            This book has no data for this day
            <i class="i-carbon-face-dissatisfied"></i>
          </p>
        </div>
      </template>
      <div v-else-if="loading" class="text-center h-20 grid place-items-center">
        <i class="i-svg-spinners-3-dots-scale !h-8 !w-8"></i>
      </div>
      <div class="flex fixed bottom-6 left-0 w-full justify-center">
        <BookToolbar v-model:size="size" />
      </div>
    </AriaBoundaries>
  </div>
</template>
<style></style>
