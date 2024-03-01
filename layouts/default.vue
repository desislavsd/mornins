<template>
  <div class="layout-default">
    <NuxtPage
      :page-key="(r) => String(r.name)"
      class="bg-background relative z-20 rounded-b-md"
    />
    <AppFooter />
  </div>
</template>
<style>
:root:has(.layout-default) {
  @apply bg-dark;
}
</style>
