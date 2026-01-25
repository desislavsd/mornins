<script setup lang="ts">
import Toaster from '@/components/ui/toast/Toaster.vue'
</script>
<template>
  <TooltipProvider disableHoverableContent>
    <NuxtLayout class="mx-auto min-h-screen" />
    <Toaster />
  </TooltipProvider>
</template>
