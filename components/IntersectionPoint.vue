<script lang="tsx" setup>
const el = ref(null)
const model = defineModel()

useIntersectionObserver(el, ([{ isIntersecting }]) => {
  model.value = isIntersecting
})
</script>
<template>
  <div ref="el"><slot /></div>
</template>
<style></style>
