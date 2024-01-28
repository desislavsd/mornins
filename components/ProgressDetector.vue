<script lang="tsx" setup>
import { IDLE_AT, CHARACTERS_PER_SECOND } from '@/config'
const el = ref(null)
const model = defineModel()
const idle = useIdle(1000 * IDLE_AT)
const timer = useTimestamp({ controls: true, interval: 1000 })
let readAt = 0

const points = ref<{ intersecting: boolean; count: number }[]>([])
const endPoint = ref(false)
const dimentions = ref({ width: 0, height: 0 })

const allPointsRead = computed(
  () => points.value.length && points.value.every((e) => e.count >= readAt)
)

// control when timer is running
watch(idle.idle, (idle) => (idle ? timer.pause() : timer.resume()))

// update counters on each tick; counter is updated only if previous one is done
watch(timer.timestamp, (time) => {
  const point = points.value.find((e) => e.count < readAt)
  if (point?.intersecting) point.count++
})

watchEffect(() => {
  model.value = unref(allPointsRead) && endPoint.value
})

useResizeObserver(el, (entries) => {
  dimentions.value = entries[0].contentRect
})

watch([dimentions], () => {
  if (!el.value) return []
  const { height, width } = dimentions.value
  const style = getComputedStyle(el.value)
  const fontSize = ~~style.fontSize.replace('px', '')
  const lineHeight = ~~style.lineHeight.replace(/\D/g, '')
  const count = ~~(height / lineHeight / 3)

  readAt = ((width / fontSize) * 3) / CHARACTERS_PER_SECOND
  // ~~(height / READ_DETECTORS_DENSITY)
  points.value = Array.from({ length: count }, () => ({
    intersecting: false,
    count: 0,
  }))
  endPoint.value = false
})

function generatePoints() {}
</script>
<template>
  <div ref="el" class="pointer-events-none flex flex-col justify-around">
    <IntersectionPoint v-for="point in points" v-model="point.intersecting" />
    <IntersectionPoint
      @update:model-value="endPoint ||= $event"
      class="absolute bottom-0 left-0 right-0"
    />
  </div>
</template>
<style></style>
