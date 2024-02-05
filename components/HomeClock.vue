<script lang="tsx" setup>
const { time } = useToday()
</script>
<template>
  <div>
    <span>{{ time.padded.hours }}:{{ time.padded.minutes }}</span>
    <span class="text-base capitalize">
      {{ time.day }}, {{ time.date }} {{ time.month }}
    </span>
  </div>
</template>
<style></style>
