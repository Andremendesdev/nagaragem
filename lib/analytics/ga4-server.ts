import { BetaAnalyticsDataClient } from "@google-analytics/data"
import { format, parseISO, startOfMonth, subDays } from "date-fns"
import { ptBR } from "date-fns/locale"
import type {
  DailyPoint,
  PeriodStats,
  TrafficSource,
  VisitsAnalytics,
} from "./types"

const EMPTY_PERIOD: PeriodStats = {
  visits: 0,
  leads: 0,
  conversionRate: 0,
}

const EMPTY_ANALYTICS: VisitsAnalytics = {
  configured: false,
  today: EMPTY_PERIOD,
  month: EMPTY_PERIOD,
  daily: [],
  sources: [],
}

type SourceBucket = "Google" | "Direto" | "Instagram" | "Outros"

function conversionRate(visits: number, leads: number) {
  if (visits <= 0) return 0
  return (leads / visits) * 100
}

function mapSource(sessionSource: string): SourceBucket {
  const s = sessionSource.toLowerCase()
  if (s === "(direct)" || s === "direct") return "Direto"
  if (s.includes("google")) return "Google"
  if (s.includes("instagram")) return "Instagram"
  return "Outros"
}

function parseGa4Date(value: string) {
  const year = value.slice(0, 4)
  const month = value.slice(4, 6)
  const day = value.slice(6, 8)
  return `${year}-${month}-${day}`
}

function getGa4Config() {
  const propertyId = process.env.GA4_PROPERTY_ID?.trim()
  const json = process.env.GA4_SERVICE_ACCOUNT_JSON?.trim()

  if (!propertyId || !json) return null

  try {
    const credentials = JSON.parse(json) as Record<string, unknown>
    const client = new BetaAnalyticsDataClient({ credentials })
    return { client, property: `properties/${propertyId}` }
  } catch {
    return null
  }
}

async function fetchSessions(
  client: BetaAnalyticsDataClient,
  property: string,
  startDate: string,
  endDate: string
) {
  const [response] = await client.runReport({
    property,
    dateRanges: [{ startDate, endDate }],
    metrics: [{ name: "sessions" }],
  })

  return Number(response.rows?.[0]?.metricValues?.[0]?.value ?? 0)
}

async function fetchLeads(
  client: BetaAnalyticsDataClient,
  property: string,
  startDate: string,
  endDate: string
) {
  const [response] = await client.runReport({
    property,
    dateRanges: [{ startDate, endDate }],
    metrics: [{ name: "eventCount" }],
    dimensionFilter: {
      filter: {
        fieldName: "eventName",
        stringFilter: { matchType: "EXACT", value: "generate_lead" },
      },
    },
  })

  return Number(response.rows?.[0]?.metricValues?.[0]?.value ?? 0)
}

async function fetchPeriodStats(
  client: BetaAnalyticsDataClient,
  property: string,
  startDate: string,
  endDate: string
): Promise<PeriodStats> {
  const [visits, leads] = await Promise.all([
    fetchSessions(client, property, startDate, endDate),
    fetchLeads(client, property, startDate, endDate),
  ])

  return {
    visits,
    leads,
    conversionRate: conversionRate(visits, leads),
  }
}

async function fetchDailySessions(
  client: BetaAnalyticsDataClient,
  property: string,
  startDate: string,
  endDate: string
) {
  const [response] = await client.runReport({
    property,
    dateRanges: [{ startDate, endDate }],
    dimensions: [{ name: "date" }],
    metrics: [{ name: "sessions" }],
    orderBys: [{ dimension: { dimensionName: "date" } }],
  })

  const map = new Map<string, number>()
  for (const row of response.rows ?? []) {
    const date = row.dimensionValues?.[0]?.value
    if (!date) continue
    map.set(parseGa4Date(date), Number(row.metricValues?.[0]?.value ?? 0))
  }
  return map
}

async function fetchDailyLeads(
  client: BetaAnalyticsDataClient,
  property: string,
  startDate: string,
  endDate: string
) {
  const [response] = await client.runReport({
    property,
    dateRanges: [{ startDate, endDate }],
    dimensions: [{ name: "date" }],
    metrics: [{ name: "eventCount" }],
    dimensionFilter: {
      filter: {
        fieldName: "eventName",
        stringFilter: { matchType: "EXACT", value: "generate_lead" },
      },
    },
    orderBys: [{ dimension: { dimensionName: "date" } }],
  })

  const map = new Map<string, number>()
  for (const row of response.rows ?? []) {
    const date = row.dimensionValues?.[0]?.value
    if (!date) continue
    map.set(parseGa4Date(date), Number(row.metricValues?.[0]?.value ?? 0))
  }
  return map
}

function buildDailySeries(
  visitsMap: Map<string, number>,
  leadsMap: Map<string, number>
): DailyPoint[] {
  const today = new Date()
  return Array.from({ length: 30 }, (_, i) => {
    const date = format(subDays(today, 29 - i), "yyyy-MM-dd")
    const parsed = parseISO(date)
    return {
      date,
      label: format(parsed, "dd/MM", { locale: ptBR }),
      visits: visitsMap.get(date) ?? 0,
      leads: leadsMap.get(date) ?? 0,
    }
  })
}

async function fetchTrafficSources(
  client: BetaAnalyticsDataClient,
  property: string,
  startDate: string,
  endDate: string
): Promise<TrafficSource[]> {
  const [response] = await client.runReport({
    property,
    dateRanges: [{ startDate, endDate }],
    dimensions: [{ name: "sessionSource" }],
    metrics: [{ name: "sessions" }],
    orderBys: [{ metric: { metricName: "sessions" }, desc: true }],
    limit: 50,
  })

  const buckets = new Map<SourceBucket, number>()

  for (const row of response.rows ?? []) {
    const source = row.dimensionValues?.[0]?.value ?? ""
    const sessions = Number(row.metricValues?.[0]?.value ?? 0)
    const bucket = mapSource(source)
    buckets.set(bucket, (buckets.get(bucket) ?? 0) + sessions)
  }

  const ordered: SourceBucket[] = ["Google", "Direto", "Instagram", "Outros"]
  const total = ordered.reduce((sum, key) => sum + (buckets.get(key) ?? 0), 0)

  return ordered
    .map((name) => ({
      name,
      visits: buckets.get(name) ?? 0,
      percent: total > 0 ? ((buckets.get(name) ?? 0) / total) * 100 : 0,
    }))
    .filter((s) => s.visits > 0)
}

export async function fetchVisitsAnalytics(): Promise<VisitsAnalytics> {
  const config = getGa4Config()
  if (!config) return EMPTY_ANALYTICS

  const { client, property } = config
  const today = format(new Date(), "yyyy-MM-dd")
  const monthStart = format(startOfMonth(new Date()), "yyyy-MM-dd")

  try {
    const [todayStats, monthStats, visitsMap, leadsMap, sources] =
      await Promise.all([
        fetchPeriodStats(client, property, "today", "today"),
        fetchPeriodStats(client, property, monthStart, today),
        fetchDailySessions(client, property, "30daysAgo", "today"),
        fetchDailyLeads(client, property, "30daysAgo", "today"),
        fetchTrafficSources(client, property, "30daysAgo", "today"),
      ])

    return {
      configured: true,
      today: todayStats,
      month: monthStats,
      daily: buildDailySeries(visitsMap, leadsMap),
      sources,
    }
  } catch (error) {
    console.error("[GA4]", error)
    throw new Error(
      error instanceof Error
        ? error.message
        : "Erro ao buscar dados do Google Analytics"
    )
  }
}

export type { VisitsAnalytics } from "./types"
