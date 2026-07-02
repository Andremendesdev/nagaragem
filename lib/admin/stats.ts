import {
  differenceInCalendarDays,
  eachDayOfInterval,
  endOfMonth,
  format,
  getDay,
  isSameDay,
  isSameMonth,
  startOfDay,
  startOfMonth,
  subDays,
} from "date-fns"
import { ptBR } from "date-fns/locale"
import type { EarningCategory, EarningEntry, ExpenseEntry } from "./types"
import { EARNING_CATEGORIES } from "./types"

type MoneyEntry = { amount: number; createdAt: string }

export type DayTotal = {
  date: string
  label: string
  total: number
}

export type CategoryTotal = {
  category: EarningCategory
  label: string
  emoji: string
  total: number
  count: number
  percent: number
}

export type DashboardStats = {
  today: number
  yesterday: number
  todayVsYesterday: number
  thisMonth: number
  lastMonth: number
  monthVsLastMonth: number
  thisYear: number
  lastYear: number
  yearVsLastYear: number
  monthlyGoal: number
  goalProgress: number
  monthlyProjection: number
  daysLeftInMonth: number
  dailyAverageThisMonth: number
  streak: number
  bestWeekday: string
  personalRecord: number
  personalRecordDate: string | null
  entriesToday: number
  clientsThisMonth: number
  ticketMedio: number
  last7Days: DayTotal[]
  monthDays: DayTotal[]
  categoryBreakdown: CategoryTotal[]
  expensesToday: number
  expensesThisMonth: number
  expensesThisYear: number
  profitToday: number
  profitYesterday: number
  profitThisMonth: number
  profitThisYear: number
  profitTodayVsYesterday: number
  insight: string
  mood: "fire" | "good" | "neutral" | "slow"
}

function sumMoneyForDay(items: MoneyEntry[], day: Date) {
  return items
    .filter((e) => isSameDay(new Date(e.createdAt), day))
    .reduce((acc, e) => acc + e.amount, 0)
}

function sumMoneyForMonth(items: MoneyEntry[], date: Date) {
  return items
    .filter((e) => isSameMonth(new Date(e.createdAt), date))
    .reduce((acc, e) => acc + e.amount, 0)
}

function sumMoneyForYearUpToDate(items: MoneyEntry[], refDate: Date) {
  const year = refDate.getFullYear()
  const end = startOfDay(refDate)

  return items
    .filter((e) => {
      const date = startOfDay(new Date(e.createdAt))
      return date.getFullYear() === year && date <= end
    })
    .reduce((acc, e) => acc + e.amount, 0)
}

function clientsOf(entry: EarningEntry) {
  return entry.clientCount ?? 1
}

function sumClientsForDay(entries: EarningEntry[], day: Date) {
  return entries
    .filter((e) => isSameDay(new Date(e.createdAt), day))
    .reduce((acc, e) => acc + clientsOf(e), 0)
}

function sumForDay(entries: EarningEntry[], day: Date) {
  return sumMoneyForDay(entries, day)
}

function sumForMonth(entries: EarningEntry[], date: Date) {
  return sumMoneyForMonth(entries, date)
}

export function sumEarningsForMonth(entries: EarningEntry[], date: Date) {
  return sumForMonth(entries, date)
}

export function sumClientsForMonth(entries: EarningEntry[], date: Date) {
  return entries
    .filter((e) => isSameMonth(new Date(e.createdAt), date))
    .reduce((acc, e) => acc + clientsOf(e), 0)
}

function percentChange(current: number, previous: number) {
  if (previous === 0) return current > 0 ? 100 : 0
  return ((current - previous) / previous) * 100
}

function calcStreak(entries: EarningEntry[], today: Date) {
  let streak = 0
  let cursor = startOfDay(today)

  while (true) {
    const total = sumForDay(entries, cursor)
    if (total <= 0) break
    streak += 1
    cursor = subDays(cursor, 1)
  }

  return streak
}

function sumForYearUpToDate(entries: EarningEntry[], refDate: Date) {
  return sumMoneyForYearUpToDate(entries, refDate)
}

function sumForMonthUpToDay(
  entries: EarningEntry[],
  year: number,
  month: number,
  upToDay: number
) {
  return entries
    .filter((e) => {
      const d = new Date(e.createdAt)
      return (
        d.getFullYear() === year &&
        d.getMonth() === month &&
        d.getDate() <= upToDay
      )
    })
    .reduce((acc, e) => acc + e.amount, 0)
}

function calcBestWeekday(entries: EarningEntry[]) {
  const totals = [0, 0, 0, 0, 0, 0, 0]

  entries.forEach((entry) => {
    const day = getDay(new Date(entry.createdAt))
    totals[day] += entry.amount
  })

  let bestDay = 0
  let bestTotal = 0

  totals.forEach((total, index) => {
    if (total > bestTotal) {
      bestTotal = total
      bestDay = index
    }
  })

  if (bestTotal <= 0) return "—"

  const names = [
    "domingo",
    "segunda",
    "terça",
    "quarta",
    "quinta",
    "sexta",
    "sábado",
  ]
  return names[bestDay] ?? "—"
}

function calcPersonalRecord(entries: EarningEntry[]) {
  const byDay = new Map<string, number>()

  entries.forEach((entry) => {
    const key = format(startOfDay(new Date(entry.createdAt)), "yyyy-MM-dd")
    byDay.set(key, (byDay.get(key) ?? 0) + entry.amount)
  })

  let record = 0
  let recordDate: string | null = null

  byDay.forEach((total, date) => {
    if (total > record) {
      record = total
      recordDate = date
    }
  })

  return { record, recordDate }
}

function buildInsight(stats: Omit<DashboardStats, "insight" | "mood">) {
  if (stats.profitThisMonth < 0) {
    return "Despesas acima dos ganhos este mês — vale revisar os custos."
  }
  if (stats.profitToday > stats.profitYesterday && stats.profitYesterday > 0) {
    return "Lucro de hoje está acima de ontem. Bom sinal!"
  }
  if (stats.todayVsYesterday >= 30) {
    return "Dia forte! Você está acima de ontem — mantém o ritmo."
  }
  if (stats.todayVsYesterday <= -20 && stats.yesterday > 0) {
    return "Hoje está mais calmo. Amanhã é outro dia na cadeira."
  }
  if (stats.goalProgress >= 100) {
    return "Meta do mês batida! Hora de subir a barra ou comemorar."
  }
  if (stats.streak >= 5) {
    return `${stats.streak} dias seguidos faturando. Consistência é ouro.`
  }
  if (stats.monthlyProjection > stats.monthlyGoal * 1.1) {
    return "No ritmo atual, você passa a meta antes do fim do mês."
  }
  if (stats.entriesToday >= 8) {
    return "Salão movimentado hoje — volume alto de atendimentos."
  }
  return "Registre cada corte e barba para ver o painel ficar mais inteligente."
}

function calcMood(stats: Omit<DashboardStats, "insight" | "mood">) {
  if (stats.todayVsYesterday >= 20 || stats.goalProgress >= 90) return "fire"
  if (stats.todayVsYesterday >= 0 || stats.thisMonth > stats.lastMonth) return "good"
  if (stats.today === 0) return "slow"
  return "neutral"
}

export function computeStats(
  entries: EarningEntry[],
  monthlyGoal: number,
  expenses: ExpenseEntry[] = [],
  now = new Date()
): DashboardStats {
  const today = startOfDay(now)
  const yesterday = subDays(today, 1)
  const monthStart = startOfMonth(today)
  const lastMonthRef = subDays(monthStart, 1)
  const lastYearSameDay = new Date(
    today.getFullYear() - 1,
    today.getMonth(),
    today.getDate()
  )
  const dayOfMonth = today.getDate()

  const todayTotal = sumForDay(entries, today)
  const yesterdayTotal = sumForDay(entries, yesterday)
  const thisMonthTotal = sumForMonth(entries, today)
  const lastMonthTotal = sumForMonthUpToDay(
    entries,
    lastMonthRef.getFullYear(),
    lastMonthRef.getMonth(),
    Math.min(dayOfMonth, lastMonthRef.getDate())
  )
  const thisYearTotal = sumForYearUpToDate(entries, today)
  const lastYearTotal = sumForYearUpToDate(entries, lastYearSameDay)

  const daysInMonthSoFar = differenceInCalendarDays(today, monthStart) + 1
  const daysLeftInMonth =
    differenceInCalendarDays(endOfMonth(today), today)
  const dailyAverage = thisMonthTotal / daysInMonthSoFar
  const monthlyProjection = dailyAverage * (daysInMonthSoFar + daysLeftInMonth)

  const clientsToday = sumClientsForDay(entries, today)
  const ticketMedio = clientsToday > 0 ? todayTotal / clientsToday : 0

  const last7Days: DayTotal[] = Array.from({ length: 7 }, (_, i) => {
    const date = subDays(today, 6 - i)
    return {
      date: format(date, "yyyy-MM-dd"),
      label: format(date, "EEE", { locale: ptBR }),
      total: sumForDay(entries, date),
    }
  })

  const monthDays: DayTotal[] = eachDayOfInterval({
    start: monthStart,
    end: endOfMonth(today),
  }).map((date) => ({
    date: format(date, "yyyy-MM-dd"),
    label: format(date, "d"),
    total: sumForDay(entries, date),
  }))

  const monthEntries = entries.filter((e) =>
    isSameMonth(new Date(e.createdAt), today)
  )
  const categoryMap = new Map<EarningCategory, { total: number; count: number }>()

  monthEntries.forEach((entry) => {
    const current = categoryMap.get(entry.category) ?? { total: 0, count: 0 }
    categoryMap.set(entry.category, {
      total: current.total + entry.amount,
      count: current.count + clientsOf(entry),
    })
  })

  const categoryBreakdown: CategoryTotal[] = EARNING_CATEGORIES.map((cat) => {
    const data = categoryMap.get(cat.value) ?? { total: 0, count: 0 }
    return {
      category: cat.value,
      label: cat.label,
      emoji: cat.emoji,
      total: data.total,
      count: data.count,
      percent: thisMonthTotal > 0 ? (data.total / thisMonthTotal) * 100 : 0,
    }
  }).filter((c) => c.total > 0)

  const { record, recordDate } = calcPersonalRecord(entries)

  const expensesToday = sumMoneyForDay(expenses, today)
  const expensesYesterday = sumMoneyForDay(expenses, yesterday)
  const expensesThisMonth = sumMoneyForMonth(expenses, today)
  const expensesThisYear = sumMoneyForYearUpToDate(expenses, today)

  const profitToday = todayTotal - expensesToday
  const profitYesterday = yesterdayTotal - expensesYesterday
  const profitThisMonth = thisMonthTotal - expensesThisMonth
  const profitThisYear = thisYearTotal - expensesThisYear

  const base = {
    today: todayTotal,
    yesterday: yesterdayTotal,
    todayVsYesterday: percentChange(todayTotal, yesterdayTotal),
    thisMonth: thisMonthTotal,
    lastMonth: lastMonthTotal,
    monthVsLastMonth: percentChange(thisMonthTotal, lastMonthTotal),
    thisYear: thisYearTotal,
    lastYear: lastYearTotal,
    yearVsLastYear: percentChange(thisYearTotal, lastYearTotal),
    monthlyGoal,
    goalProgress: monthlyGoal > 0 ? (thisMonthTotal / monthlyGoal) * 100 : 0,
    monthlyProjection,
    daysLeftInMonth,
    dailyAverageThisMonth: dailyAverage,
    streak: calcStreak(entries, today),
    bestWeekday: calcBestWeekday(entries),
    personalRecord: record,
    personalRecordDate: recordDate,
    entriesToday: clientsToday,
    clientsThisMonth: sumClientsForMonth(entries, today),
    ticketMedio,
    last7Days,
    monthDays,
    categoryBreakdown,
    expensesToday,
    expensesThisMonth,
    expensesThisYear,
    profitToday,
    profitYesterday,
    profitThisMonth,
    profitThisYear,
    profitTodayVsYesterday: percentChange(profitToday, profitYesterday),
  }

  return {
    ...base,
    insight: buildInsight(base),
    mood: calcMood(base),
  }
}

export function getYearMonths(entries: EarningEntry[], year: number) {
  return Array.from({ length: 12 }, (_, month) => {
    const date = new Date(year, month, 1)
    return {
      month: format(date, "MMM", { locale: ptBR }),
      total: sumForMonth(entries, date),
    }
  })
}
