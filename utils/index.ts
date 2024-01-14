import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { camelize, getCurrentInstance, toHandlerKey } from 'vue'

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
