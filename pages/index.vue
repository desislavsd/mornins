<script lang="tsx" setup>
import books from '@/assets/registry.json'
</script>
<template>
  <div class="grid place-items-center min-h-screen p-6">
    <div class="flex flex-col items-center gap-1 w-full">
      <!-- <Avatar size="base" class="border border-forground"> -->
      <i class="i-carbon-book !w-10 !h-10"></i>
      <!-- </Avatar> -->
      <h1 class="uppercase">MornIns</h1>

      <hr class="mt-40" />
      <div class="w-full">
        <div class="flex justify-between text-sm mb-4">
          <p class="">
            <i class="i-carbon-sun"></i> Pick your daily dose of morning
            inspiration
          </p>
          <p>{{ books.length }} pcs.</p>
        </div>

        <template v-for="item in books">
          <BookCard v-bind="{ item }" />
        </template>
      </div>
      <!-- <ThemeSwitcher /> -->
    </div>
  </div>
</template>
<style></style>
