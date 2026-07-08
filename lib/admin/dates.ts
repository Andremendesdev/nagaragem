import { isAfter, isValid, parseISO, startOfDay } from "date-fns"

/** Fuso da barbearia — agrupamentos sempre por mês civil completo */
const BUSINESS_TZ = "America/Sao_Paulo"

/** Meio-dia SP serializado como 15:00 UTC (Brasil não usa horário de verão) */
const CANONICAL_UTC_HOUR = 15

type CalendarParts = { year: number; month: number; day: number }

function calendarPartsInTimeZone(date: Date, timeZone: string): CalendarParts {
  const formatter = new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  })

  const parts = formatter.formatToParts(date)
  const read = (type: Intl.DateTimeFormatPartTypes) =>
    Number(parts.find((part) => part.type === type)?.value ?? 0)

  return {
    year: read("year"),
    month: read("month"),
    day: read("day"),
  }
}

function partsFromIsoDatePrefix(iso: string): CalendarParts | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(iso.trim())
  if (!match) return null

  return {
    year: Number(match[1]),
    month: Number(match[2]),
    day: Number(match[3]),
  }
}

function isUtcMidnight(iso: string, parsed: Date) {
  return (
    /T00:00:00(?:\.\d{1,9})?(?:Z|[+-]00:?00)?$/i.test(iso.trim()) &&
    parsed.getUTCHours() === 0 &&
    parsed.getUTCMinutes() === 0
  )
}

function isCanonicalBusinessTimestamp(iso: string, parsed: Date) {
  return (
    parsed.getUTCHours() === CANONICAL_UTC_HOUR &&
    parsed.getUTCMinutes() === 0 &&
    parsed.getUTCSeconds() === 0
  )
}

/** Meio-dia civil no fuso da barbearia */
export function normalizeEntryDate(date: Date): Date {
  const { year, month, day } = calendarPartsInTimeZone(date, BUSINESS_TZ)
  return new Date(year, month - 1, day, 12, 0, 0, 0)
}

/** Salva sempre como data civil + 15:00 UTC (meio-dia em Piraju/SP) */
export function toEntryIso(date: Date): string {
  const { year, month, day } = calendarPartsInTimeZone(startOfDay(date), BUSINESS_TZ)
  const yyyy = String(year)
  const mm = String(month).padStart(2, "0")
  const dd = String(day).padStart(2, "0")
  return `${yyyy}-${mm}-${dd}T${String(CANONICAL_UTC_HOUR).padStart(2, "0")}:00:00.000Z`
}

export function isFutureDate(date: Date): boolean {
  return isAfter(startOfDay(date), startOfDay(new Date()))
}

export function clampToToday(date: Date): Date {
  if (isFutureDate(date)) return startOfDay(new Date())
  return date
}

/** Partes do dia civil no fuso da barbearia (Piraju/SP) */
export function entryCalendarParts(iso: string): CalendarParts {
  const trimmed = iso.trim()

  const dateOnly = /^(\d{4})-(\d{2})-(\d{2})$/.exec(trimmed)
  if (dateOnly) {
    return {
      year: Number(dateOnly[1]),
      month: Number(dateOnly[2]),
      day: Number(dateOnly[3]),
    }
  }

  const normalized = trimmed.replace(" ", "T")
  const parsed = parseISO(normalized)

  if (!isValid(parsed)) {
    const fallback = partsFromIsoDatePrefix(trimmed)
    if (fallback) return fallback
    return calendarPartsInTimeZone(normalizeEntryDate(new Date(trimmed)), BUSINESS_TZ)
  }

  // Meia-noite UTC ou timestamp canônico (15:00 UTC) → usa a data do prefixo YYYY-MM-DD
  if (isUtcMidnight(normalized, parsed) || isCanonicalBusinessTimestamp(normalized, parsed)) {
    const prefix = partsFromIsoDatePrefix(normalized)
    if (prefix) return prefix
  }

  return calendarPartsInTimeZone(parsed, BUSINESS_TZ)
}

/** Data civil do registro (meio-dia local) para exibição e agrupamentos */
export function parseEntryCalendarDate(iso: string): Date {
  const { year, month, day } = entryCalendarParts(iso)
  return new Date(year, month - 1, day, 12, 0, 0, 0)
}

export function entryMonthKey(iso: string): string {
  const { year, month } = entryCalendarParts(iso)
  return `${year}-${String(month).padStart(2, "0")}`
}

export function entryDayKey(iso: string): string {
  const { year, month, day } = entryCalendarParts(iso)
  return `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`
}

export function monthKeyFromDate(date: Date): string {
  const { year, month } = calendarPartsInTimeZone(date, BUSINESS_TZ)
  return `${year}-${String(month).padStart(2, "0")}`
}

export function dayKeyFromDate(date: Date): string {
  const { year, month, day } = calendarPartsInTimeZone(startOfDay(date), BUSINESS_TZ)
  return `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`
}

export function calendarPartsFromDate(date: Date): CalendarParts {
  return calendarPartsInTimeZone(date, BUSINESS_TZ)
}

export function isEntryInMonth(iso: string, ref: Date): boolean {
  return entryMonthKey(iso) === monthKeyFromDate(ref)
}

export function isEntryOnDay(iso: string, day: Date): boolean {
  return entryDayKey(iso) === dayKeyFromDate(day)
}
