<template>
  <header class="z-10 flex justify-between text-white p-6">
    <h1 class="flex items-center gap-2">
      <i class="i-app-logo !w-6 !h-6"></i>
      <span>MORNINS</span>
    </h1>
    <nav class="-m-3 items-center flex gap-2">
      <Button variant="ghost" size="sm" as-child>
        <LangSwitcher variant="ghost" size="sm" />
      </Button>
      <Button variant="ghost" size="icon" as-child>
        <ThemeSwitcher variant="ghost" size="icon" />
      </Button>
    </nav>
  </header>
</template>

<script lang="ts" setup></script>

<style></style>
