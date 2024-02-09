<script lang="tsx" setup>
import books from '@/assets/registry.json'
import cover from '@/assets/imgs/cover.webp'
import coverBig from '@/assets/imgs/cover-xl.webp'

const lastBook = useLastBook()
const sortedBooks = computed(() =>
  books
    .slice()
    .filter((e) => !e.hidden)
    .sort((a, b) => (lastBook.value.id == a.id ? -1 : 1))
)
const scroll = reactive({
  height: 0,
})

useResizeObserver(document.documentElement, () => {
  scroll.height = Math.max(
    (document.scrollingElement?.scrollHeight || 0) - window.screen.height,
    0
  )
})

useStyleTag(
  computed(
    () => `
      @keyframes fade {
        ${
          scroll.height
            ? (window.screen.availHeight / 3 / scroll.height) * 100
            : 0
        }% {
          opacity: 0;
        }
        100% {
          opacity: 0;
        }
      }
    `
  )
)
</script>
<template>
  <div
    class="min-h-screen landscape:max-md:pl-[40vw] md:pt-[calc(100vh/3*2)] md:bg-dark"
    :style="`--cut: 7%; --ycut: calc(var(--cut) * 12 / 9); --scroll-height: ${scroll.height}`"
  >
    <!-- INTRO -->
    <div
      class="max-md:pb-[var(--cut)] relative left-0 top-0 h-full w-full z-10 flex flex-col portrait:max-md:aspect-[9/12] portrait:max-md:[clip-path:polygon(0_0,100%_0,100%_100%,0_calc(100%-var(--cut)))] portrait:max-md:-mb-[var(--ycut)] landscape:max-md:fixed landscape:max-md:w-[40vw] md:fixed"
    >
      <!-- HEADER -->
      <AppHeader class="relative z-10 w-full" />
      <picture>
        <source :srcset="coverBig" media="(min-width: 768px)" />
        <img
          :src="cover"
          alt="cover"
          class="scroll-animation portrait:max-md:[animation-name:parallax] will-change-transform pointer-events-none absolute inset-0 w-full h-full object-cover filter grayscale"
        />
      </picture>
      <div
        class="p-6 flex-1 flex justify-between flex-col xl:flex-row xl:items-end"
      >
        <!-- clock -->
        <HomeClock
          class="scroll-animation md:max-xl:[animation-name:fade] relative max-md:opacity-0 flex-col leading-[1] text-[70px] text-light whitespace-nowrap max-xl:text-center z-30 md:inline-flex max-lg:opacity-[calc(1-var(--top)/50)]"
        />

        <!-- motivation -->
        <div class="xl:[align-self:start]">
          <p
            class="reltaive z-10 font-light text-white opacity-50 text-right text-xs"
            v-html="$t('messages.moto')"
          ></p>
        </div>
      </div>
    </div>
    <!-- CONTENT -->
    <div
      class="relative bg-background p-6 flex flex-col gap-6 mx-auto md:z-20 md:max-w-lg md:rounded-t-md xl:mr-6"
    >
      <StreakSection />
      <!-- BOOKS -->
      <div class="flex flex-col gap-3 overflow-hidden">
        <BookCard v-for="item in sortedBooks" v-bind="{ item }" />
      </div>
    </div>
  </div>
</template>
<style>
.scroll-animation {
  transform-origin: center center;
  animation-duration: 1ms; /* Firefox requires this to apply the animation */
  animation-direction: alternate;
  animation-timeline: scroll(block nearest);
  animation-timing-function: linear;
}
@keyframes parallax {
  to {
    transform: translateY(calc(var(--scroll-height) / 2 * 1px));
  }
}
</style>
