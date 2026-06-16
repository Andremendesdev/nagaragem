export type PeriodStats = {
  visits: number
  leads: number
  conversionRate: number
}

export type DailyPoint = {
  date: string
  label: string
  visits: number
  leads: number
}

export type TrafficSource = {
  name: string
  visits: number
  percent: number
}

export type VisitsAnalytics = {
  configured: boolean
  today: PeriodStats
  month: PeriodStats
  daily: DailyPoint[]
  sources: TrafficSource[]
}

export function formatConversionRate(value: number) {
  return new Intl.NumberFormat("pt-BR", {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  }).format(value)
}
