<template>
  <div class="layout-default flex flex-col min-h-screen">
    <AppHeader class="sticky top-0" />
    <NuxtPage
      :page-key="(r) => String(r.name)"
      class="bg-background relative z-20 rounded-b-md flex-1 shadow-dark shadow-lg"
    />
    <AppFooter />
  </div>
</template>
<style>
:root:has(.layout-default) {
  @apply bg-dark;
}
</style>
