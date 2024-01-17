<script lang="tsx" setup>
const model = defineModel()
const DEBOUNCE = 100
const value = reactive({
  start: false,
  end: false,
})

const bounds = reactive(
  Object.fromEntries(
    Object.entries(value).map(([key]) => [
      key,
      debouncedRef(toRef(value, key as keyof typeof value), DEBOUNCE),
    ])
  )
)

watchEffect(() => {
  model.value = bounds
})

provide('bounds', bounds)
</script>
<template>
  <div>
    <IntersectionPoint v-model="value.start" />
    <slot v-bind="bounds" />
    <IntersectionPoint v-model="value.end"> &nbsp; </IntersectionPoint>
  </div>
</template>
<style></style>
