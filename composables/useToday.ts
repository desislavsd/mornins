const timestamp = useTimestamp({
  interval: 1000 * 60 * 60,
})
const date = computed(() => new Date(timestamp.value))
const index = computed(() => getDayOfYear(timestamp.value) - 1)

export default function useToday() {
  return {
    timestamp,
    date,
    index,
  }
}
