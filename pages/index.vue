<script lang="tsx" setup>
import books from '@/assets/registry.json'
import cover from '@/assets/imgs/cover.webp'
const scroll = useWindowScroll()
</script>
<template>
  <div style="--cut: 7%; --ycut: calc(var(--cut) * 12 / 9)">
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
    <div class="relative aspect-[9/12] overflow-hidden">
      <img
        :src="cover"
        :style="`--top: ${scroll.y.value / 2}`"
        class="intro-cover absolute inset-0 h-full object-cover"
      />
      <div
        class="absolute bottom-[var(--cut)] left-0 w-full flex justify-end p-6"
      >
        <p class="font-light text-white opacity-50 text-right text-xs">
          Daily dose <br />of divine inspiration
        </p>
      </div>
    </div>

    <div
      class="relative z-10 p-6 bg-background -mt-[calc(var(--ycut))]"
      :style="`
        clip-path: polygon(0 0, 100% var(--cut), 100% 100%, 0 100%);
      `"
    >
      <!-- STREAK -->
      <StreakSection />

      <!-- BOOKS -->
      <div class="mt-10">
        <BookCard v-for="item in books" v-bind="{ item }" />
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
