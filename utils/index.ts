import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'
import {
  camelize,
  getCurrentInstance,
  toHandlerKey,
  type InjectionKey,
} from 'vue'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function sleep(ms: number) {
  return new Promise((resolve) => {
    const timeout = setTimeout(resolve, ms)
  })
}

export const getMonthNamesInBG = () => {
  const formatter = new Intl.DateTimeFormat('bg-BG', {
    month: 'long',
    timeZone: 'UTC',
  })
  return Array.from({ length: 12 }, (_, i) =>
    formatter.format(new Date(2022, i + 1, 1))
  )
}

export const monthsNames = getMonthNamesInBG()

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

export const dayFormatterShort = new Intl.DateTimeFormat('en-US', {
  weekday: 'narrow',
})

export const dayFormatterLong = new Intl.DateTimeFormat('en-US', {
  weekday: 'long',
})

export const monthFormatterLong = new Intl.DateTimeFormat('en-US', {
  month: 'long',
})

export function weekDaysNames(d = new Date()) {
  return getWeekDates(d).map((date) => dayFormatterShort.format(date))
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

function useMe() {
  return {
    value: ref(false),
  }
}
