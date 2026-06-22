import { isAfter, startOfDay } from "date-fns"

/** Meio-dia local — evita mudança de dia ao serializar em UTC */
export function normalizeEntryDate(date: Date): Date {
  const day = startOfDay(date)
  day.setHours(12, 0, 0, 0)
  return day
}

export function toEntryIso(date: Date): string {
  return normalizeEntryDate(date).toISOString()
}

export function isFutureDate(date: Date): boolean {
  return isAfter(startOfDay(date), startOfDay(new Date()))
}

export function clampToToday(date: Date): Date {
  if (isFutureDate(date)) return startOfDay(new Date())
  return date
}
