import { dayFormatterLong, monthFormatterLong } from '#imports'
const timestamp = useTimestamp({
  interval: 1000,
})
const date = computed(() => new Date(timestamp.value))
const index = computed(() => getDayOfYear(timestamp.value) - 1)
const time = computed(() => {
  const hours = date.value.getHours()
  const minutes = date.value.getMinutes()
  const month = date.value.getMonth()
  return {
    hours,
    minutes,
    date: date.value.getDate(),
    day: dayFormatterLong.format(date.value),
    month: monthFormatterLong.format(date.value),
    padded: {
      hours: hours.toString().padStart(2, '0'),
      minutes: minutes.toString().padStart(2, '0'),
    },
  }
})
export default function useToday() {
  return {
    timestamp,
    date,
    index,
    time,
  }
}
