"use client"

import { useMemo, useState } from "react"
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  XAxis,
  YAxis,
} from "recharts"
import { format, startOfMonth, subMonths } from "date-fns"
import { ptBR } from "date-fns/locale"
import { GitCompare, X } from "lucide-react"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart"
import { formatCurrency, formatPercent } from "@/lib/admin/format"
import { sumEarningsForMonth } from "@/lib/admin/stats"
import type { EarningEntry } from "@/lib/admin/types"
import { cn } from "@/lib/utils"

const chartConfig = {
  total: {
    label: "Mês",
    color: "#d4b800",
  },
} satisfies ChartConfig

const COMPARE_COLORS = ["#d4b800", "#2563eb", "#059669", "#db2777", "#ea580c", "#7c3aed"]

type MonthPoint = { month: string; total: number; index: number }

type YearOverviewProps = {
  data: { month: string; total: number }[]
  yearTotal: number
  entries: EarningEntry[]
}

function buildMonthPoints(data: YearOverviewProps["data"]): MonthPoint[] {
  return data.map((point, index) => ({ ...point, index }))
}

function monthKey(date: Date) {
  return format(date, "yyyy-MM")
}

function monthKeyFromIndex(year: number, index: number) {
  return format(new Date(year, index, 1), "yyyy-MM")
}

function parseMonthKey(key: string) {
  const [y, m] = key.split("-").map(Number)
  return new Date(y, m - 1, 1)
}

function labelForMonthKey(key: string) {
  return format(parseMonthKey(key), "MMM yyyy", { locale: ptBR })
}

function sortMonthKeys(keys: string[]) {
  return [...keys].sort()
}

function percentChange(from: number, to: number) {
  if (from <= 0) return to > 0 ? 100 : 0
  return ((to - from) / from) * 100
}

export default function YearOverview({ data, yearTotal, entries }: YearOverviewProps) {
  const currentMonth = new Date().getMonth()
  const year = new Date().getFullYear()
  const [selectedMonthKeys, setSelectedMonthKeys] = useState<string[]>([])

  const months = useMemo(() => buildMonthPoints(data), [data])
  const hasData = months.some((d) => d.total > 0)
  const hasSelection = selectedMonthKeys.length > 0

  const monthLabels = useMemo(
    () =>
      Array.from({ length: 12 }, (_, i) =>
        format(new Date(year, i, 1), "MMM", { locale: ptBR })
      ),
    [year]
  )

  function toggleMonth(index: number) {
    const key = monthKeyFromIndex(year, index)
    setSelectedMonthKeys((prev) =>
      prev.includes(key)
        ? prev.filter((k) => k !== key)
        : sortMonthKeys([...prev, key])
    )
  }

  function selectCurrentMonth() {
    setSelectedMonthKeys([monthKey(startOfMonth(new Date()))])
  }

  function selectLastThreeMonths() {
    const today = new Date()
    const keys = Array.from({ length: 3 }, (_, i) =>
      monthKey(startOfMonth(subMonths(today, 2 - i)))
    )
    setSelectedMonthKeys(keys)
  }

  function clearSelection() {
    setSelectedMonthKeys([])
  }

  const comparison = useMemo(() => {
    if (selectedMonthKeys.length < 2) return null

    const points = selectedMonthKeys.map((key) => ({
      key,
      label: labelForMonthKey(key),
      total: sumEarningsForMonth(entries, parseMonthKey(key)),
    }))

    const totals = points.map((p) => p.total)
    const max = Math.max(...totals)
    const min = Math.min(...totals)
    const avg = totals.reduce((a, b) => a + b, 0) / totals.length
    const best = points.find((p) => p.total === max)!
    const worst = points.find((p) => p.total === min)!

    return { points, max, min, avg, best, worst }
  }, [selectedMonthKeys, entries])

  const hasOffChartSelection = selectedMonthKeys.some(
    (key) => parseMonthKey(key).getFullYear() !== year
  )

  function barOpacity(index: number) {
    const key = monthKeyFromIndex(year, index)
    if (!hasSelection) return index === currentMonth ? 1 : 0.55
    return selectedMonthKeys.includes(key) ? 1 : 0.2
  }

  function barColor(index: number) {
    const key = monthKeyFromIndex(year, index)
    if (!hasSelection) return "#d4b800"
    const pos = selectedMonthKeys.indexOf(key)
    if (pos === -1) return "#d4b800"
    return COMPARE_COLORS[pos % COMPARE_COLORS.length]
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-[var(--admin-border-muted)] bg-[var(--admin-surface)]">
      <div className="border-b border-[var(--admin-border)] px-6 py-4">
        <div className="flex items-end justify-between gap-4">
          <div>
            <h2 className="text-base font-bold text-[var(--admin-text)]">Visão anual</h2>
            <p className="text-xs text-[var(--admin-text-faint)]">
              Faturamento mês a mês · selecione meses para comparar
            </p>
          </div>
          <div className="text-right">
            <p className="text-xs text-[var(--admin-text-faint)]">Total {year}</p>
            <p className="text-xl font-bold text-[var(--admin-gold)]">
              {formatCurrency(yearTotal)}
            </p>
          </div>
        </div>
      </div>

      <div className="border-b border-[var(--admin-border)] px-6 py-4">
        <div className="mb-3 flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={selectCurrentMonth}
            className="rounded-lg border border-[var(--admin-border)] bg-[var(--admin-bg)] px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-[var(--admin-text-dim)] transition-colors hover:border-[var(--admin-gold-border)] hover:text-[var(--admin-gold)]"
          >
            Este mês
          </button>
          <button
            type="button"
            onClick={selectLastThreeMonths}
            className="rounded-lg border border-[var(--admin-border)] bg-[var(--admin-bg)] px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-[var(--admin-text-dim)] transition-colors hover:border-[var(--admin-gold-border)] hover:text-[var(--admin-gold)]"
          >
            Últimos 3 meses
          </button>
          {hasSelection && (
            <button
              type="button"
              onClick={clearSelection}
              className="inline-flex items-center gap-1 rounded-lg border border-[var(--admin-border)] px-2.5 py-1 text-[10px] font-semibold text-[var(--admin-text-dim)] transition-colors hover:border-red-500/30 hover:text-red-300"
            >
              <X className="size-3" />
              Limpar
            </button>
          )}
        </div>

        <div className="grid grid-cols-4 gap-1.5 sm:grid-cols-6">
          {monthLabels.map((label, index) => {
            const key = monthKeyFromIndex(year, index)
            const selected = selectedMonthKeys.includes(key)
            const isCurrent = index === currentMonth

            return (
              <button
                key={label}
                type="button"
                onClick={() => toggleMonth(index)}
                className={cn(
                  "rounded-lg border px-2 py-2 text-center text-xs font-semibold capitalize transition-all",
                  selected
                    ? "border border-[var(--admin-gold-border-muted)] bg-[var(--admin-gold-bg)] text-[var(--admin-gold)]"
                    : "border-[var(--admin-border)] bg-[var(--admin-input)] text-[var(--admin-text-faint)] hover:border-[var(--admin-gold-border)] hover:text-[var(--admin-text)]",
                  isCurrent && !selected && "ring-1 ring-[var(--admin-gold-border-muted)]"
                )}
              >
                {label.replace(".", "")}
              </button>
            )
          })}
        </div>

        {hasOffChartSelection && (
          <p className="mt-3 text-[11px] text-[var(--admin-text-faint)]">
            Meses de{" "}
            {year - 1} incluídos na comparação · o gráfico mostra só {year}
          </p>
        )}
      </div>

      {comparison && (
        <div className="border-b border-[var(--admin-border)] bg-[var(--admin-bg)]/40 px-6 py-4">
          <div className="mb-3 flex items-center gap-2">
            <GitCompare className="size-4 text-[var(--admin-gold)]" />
            <p className="text-xs font-semibold uppercase tracking-[0.15em] text-[var(--admin-text-faint)]">
              Comparação ({comparison.points.length} meses)
            </p>
          </div>

          <div className="mb-3 grid gap-2 sm:grid-cols-3">
            <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 px-3 py-2">
              <p className="text-[10px] uppercase tracking-wide text-emerald-400/80">Melhor</p>
              <p className="text-sm font-bold capitalize text-[var(--admin-text)]">{comparison.best.label.replace(".", "")}</p>
              <p className="text-sm font-semibold text-emerald-400">{formatCurrency(comparison.best.total)}</p>
            </div>
            <div className="rounded-xl border border-[var(--admin-border)] bg-[var(--admin-input)] px-3 py-2">
              <p className="text-[10px] uppercase tracking-wide text-[var(--admin-text-faint)]">Média</p>
              <p className="text-sm font-bold text-[var(--admin-text)]">Selecionados</p>
              <p className="text-sm font-semibold text-[var(--admin-gold)]">{formatCurrency(comparison.avg)}</p>
            </div>
            <div className="rounded-xl border border-red-500/20 bg-red-500/5 px-3 py-2">
              <p className="text-[10px] uppercase tracking-wide text-red-400/80">Menor</p>
              <p className="text-sm font-bold capitalize text-[var(--admin-text)]">{comparison.worst.label.replace(".", "")}</p>
              <p className="text-sm font-semibold text-red-400">{formatCurrency(comparison.worst.total)}</p>
            </div>
          </div>

          <div className="space-y-2">
            {comparison.points.map((point, i) => {
              const color = COMPARE_COLORS[i % COMPARE_COLORS.length]
              const vsAvg = percentChange(comparison.avg, point.total)
              const vsFirst =
                i === 0
                  ? null
                  : percentChange(comparison.points[0].total, point.total)

              return (
                <div
                  key={point.key}
                  className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-[var(--admin-border)] bg-[var(--admin-surface)] px-3 py-2"
                >
                  <div className="flex items-center gap-2">
                    <span
                      className="size-2.5 rounded-full"
                      style={{ background: color }}
                    />
                    <span className="text-sm font-semibold capitalize text-[var(--admin-text)]">
                      {point.label.replace(".", "")}
                    </span>
                  </div>
                  <div className="flex flex-wrap items-center gap-3 text-xs">
                    <span className="font-bold text-[var(--admin-gold)]">
                      {formatCurrency(point.total)}
                    </span>
                    <span
                      className={cn(
                        "font-medium",
                        vsAvg >= 0 ? "text-emerald-400" : "text-red-400"
                      )}
                    >
                      {formatPercent(vsAvg)} vs média
                    </span>
                    {vsFirst !== null && (
                      <span className="text-[var(--admin-text-faint)]">
                        {formatPercent(vsFirst)} vs 1º mês
                      </span>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {hasSelection && selectedMonthKeys.length === 1 && (
        <div className="border-b border-[var(--admin-border)] bg-[var(--admin-bg)]/40 px-6 py-3">
          <p className="text-xs text-[var(--admin-text-faint)]">
            <span className="font-semibold capitalize text-[var(--admin-text)]">
              {labelForMonthKey(selectedMonthKeys[0]).replace(".", "")}
            </span>
            {" · "}
            {formatCurrency(
              sumEarningsForMonth(entries, parseMonthKey(selectedMonthKeys[0]))
            )}
            {" · "}
            Selecione mais um mês para comparar
          </p>
        </div>
      )}

      <div className="px-6 py-5">
        {!hasData ? (
          <div className="flex h-[180px] items-center justify-center text-sm text-[var(--admin-text-muted)]">
            Sem dados para o ano atual
          </div>
        ) : (
          <ChartContainer config={chartConfig} className="h-[180px] w-full">
            <BarChart data={months} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
              <CartesianGrid vertical={false} stroke="var(--admin-chart-grid)" />
              <XAxis
                dataKey="month"
                tickLine={false}
                axisLine={false}
                tick={{ fill: "var(--admin-chart-tick)", fontSize: 11 }}
              />
              <YAxis
                tickLine={false}
                axisLine={false}
                tick={{ fill: "var(--admin-chart-tick-muted)", fontSize: 10 }}
                tickFormatter={(v) =>
                  v >= 1000 ? `${(v / 1000).toFixed(0)}k` : String(v)
                }
              />
              <ChartTooltip
                cursor={{ fill: "rgba(255,234,0,0.05)" }}
                content={
                  <ChartTooltipContent
                    formatter={(value) => formatCurrency(Number(value))}
                  />
                }
              />
              <Bar dataKey="total" radius={[4, 4, 0, 0]} maxBarSize={28}>
                {months.map((entry) => (
                  <Cell
                    key={entry.index}
                    fill={barColor(entry.index)}
                    opacity={barOpacity(entry.index)}
                  />
                ))}
              </Bar>
            </BarChart>
          </ChartContainer>
        )}
      </div>
    </div>
  )
}
