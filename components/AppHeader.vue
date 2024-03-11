<script lang="ts" setup>
import { displayName } from '@@/package.json'
import { useDevMode } from '~/composables/useDevMode'
const dev = reactive(useDevMode())
</script>

<template>
  <header class="app-header z-10 flex justify-between text-white p-6">
    <NuxtLink to="/" class="flex items-center gap-2 leading-[0] uppercase">
      <i @click="dev.attemptToggle()" class="i-app-logo !w-6 !h-6" />
      {{ displayName }}
    </NuxtLink>
    <nav class="-m-2 items-center flex gap-2">
      <Button variant="ghost" size="sm" as-child>
        <LangSwitcher variant="ghost" size="sm" />
      </Button>
      <Button variant="ghost" size="icon" as-child>
        <ThemeSwitcher variant="ghost" size="icon" />
      </Button>
    </nav>
  </header>
</template>

<style></style>
