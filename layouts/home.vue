<template>
  <NuxtPage
    :page-key="(r) => String(r.name)"
    class="layout-home bg-background relative z-20 rounded-b-md"
  />
</template>
<style>
:root:has(.layout-home) {
  @apply bg-dark;
}
</style>
