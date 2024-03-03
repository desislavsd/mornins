import { t, d } from '@/plugins/i18n'

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
    day: d(date.value, 'dayLong'),
    month: d(date.value, 'month'),
    padded: {
      hours: hours.toString().padStart(2, '0'),
      minutes: minutes.toString().padStart(2, '0'),
    },
  }
})
const year = computed(() => date.value.getFullYear())
const isLeapYear = computed(() => !year.value % 4)
export default function useToday() {
  return {
    timestamp,
    date,
    index,
    time,
    year,
    isLeapYear,
  }
}
