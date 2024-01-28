<script lang="tsx" setup>
import books from '@/assets/registry.json'
import cover from '@/assets/imgs/cover.webp'
const scroll = useWindowScroll()
const lastBook = useLastBook()
const sortedBooks = computed(() =>
  books.slice().sort((a, b) => (lastBook.value.id == a.id ? -1 : 1))
)
</script>
<template>
  <div
    style="--cut: 7%; --ycut: calc(var(--cut) * 12 / 9)"
    class="lg:max-w-xl mx-auto grid lg:place-items-center"
  >
    <div
      class="lg:border lg:rounded-lg lg:overflow-hidden lg:shadow landscape:max-lg:grid landscape:max-lg:grid-cols-2"
    >
      <div class="relative">
        <!-- HEADER -->
        <header
          class="absolute top-0 left-0 w-full z-10 flex justify-between text-white z-10 p-6"
        >
          <h1 class="flex items-center gap-2">
            <i class="i-carbon-book !w-6 !h-6"></i>
            <span>MORNINS</span>
          </h1>
          <nav>
            <ThemeSwitcher />
          </nav>
        </header>
        <!-- COVER -->
        <div
          class="relative aspect-[9/12] landscape:max-lg:aspect-auto landscape:max-lg:h-full overflow-hidden"
        >
          <img
            :src="cover"
            :style="`--top: ${scroll.y.value / 2}`"
            class="intro-cover absolute inset-0 h-full object-cover"
          />
          <div
            class="absolute bottom-[var(--cut)] left-0 w-full flex justify-end p-6 landscape:max-lg:bottom-0"
          >
            <p class="font-light text-white opacity-50 text-right text-xs">
              Daily dose <br />of divine inspiration
            </p>
          </div>
        </div>
      </div>

      <div
        class="relative z-10 grid gap-6 content-start p-6 bg-background -mt-[calc(var(--ycut))] landscape:max-lg:mt-0 landscape:max-lg:[clip-path:none] landscape:max-lg:overflow-auto"
        :style="`
        clip-path: polygon(0 0, 100% var(--cut), 100% 100%, 0 100%);
      `"
      >
        <!-- STREAK -->
        <StreakSection />

        <!-- BOOKS -->
        <div class="grid gap-3">
          <BookCard v-for="item in sortedBooks" v-bind="{ item }" />
        </div>
      </div>
    </div>
  </div>
</template>
<style>
.intro-cover {
  transform-origin: left center;
  translate: 0 min(200px, var(--top) * 1px);
}
</style>
