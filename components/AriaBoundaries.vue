<script lang="tsx" setup>
const DEBOUNCE = 100
const start = templateRef('start')
const end = templateRef('end')
const appeared = {
  start: ref(false),
  end: ref(false),
}

useIntersectionObserver(
  start as any,
  ([{ isIntersecting }]) => (appeared.start.value = isIntersecting)
)
useIntersectionObserver(
  end as any,
  ([{ isIntersecting }]) => (appeared.end.value = isIntersecting)
)

const bounds = reactive({
  start: debouncedRef(appeared.start, DEBOUNCE),
  end: debouncedRef(appeared.end, DEBOUNCE),
})
provide('bounds', bounds)
</script>
<template>
  <div>
    <span ref="start"></span>
    <slot v-bind="bounds" />
    <span ref="end">&nbsp;</span>
  </div>
</template>
<style></style>
