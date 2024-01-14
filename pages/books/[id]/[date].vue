<script lang="tsx" setup>
import { useBook } from '@/composables/useBook'

const size = useLocalStorage('size', 'prose-sm')

const { item, date, chapter, loading } = useBook()
</script>
<template>
  <div>
    <!-- <div class="flex">
      <img
        :src="`/books/${route.params.id}/img.webp`"
        class="w-10 object-cover rounded-md"
      />
    </div> -->
    <AriaBoundaries #default="bounds">
      <BookIntro
        v-bind="{ item }"
        v-model:date="date"
        :shrinked="!bounds.start"
      ></BookIntro>
      <template v-if="chapter">
        <div class="container py-14 px-6 text-justify">
          <h1 class="text-xl text-center font-bold">
            {{ chapter.title }}
          </h1>
          <div class="block italic text-center mb-8 opacity-50">
            {{ chapter.day }}
          </div>
          <div class="prose" :class="size">
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
