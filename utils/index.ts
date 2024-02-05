import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { type InjectionKey } from 'vue'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function sleep(ms: number) {
  return new Promise((resolve) => {
    const timeout = setTimeout(resolve, ms)
  })
}

export function getDayOfYear(date: Date | number) {
  date = new Date(date)
  const start = new Date(date.getFullYear(), 0, 0)
  const diff = date.getTime() - start.getTime()
  const oneDay = 1000 * 60 * 60 * 24
  let day = Math.floor(diff / oneDay)
  // adjust for non leap years
  if (day >= 60 && date.getFullYear() % 4 !== 0) return (day += 1)
  return day
}

export function getWeekDates(d: Date = new Date()) {
  return Array.from({ length: 7 }, (_, i) => {
    const date = new Date(d)

    date.setDate(date.getDate() - date.getDay() + i)
    return date
  })
}

export function toSelfProvidingHook<TArgs extends unknown[], TReturn>(
  hook: (...args: TArgs) => TReturn,
  key?: string
) {
  const injectionKey: InjectionKey<TReturn | null> = Symbol(key)

  return function (...args: TArgs) {
    let data = inject<TReturn | null>(injectionKey, null)
    if (data) return data
    data = hook(...args)
    provide(injectionKey, data)
    return data
  }
}

export function capitalize(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1)
}
