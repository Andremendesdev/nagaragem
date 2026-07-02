"use client"

import {
  Area,
  AreaChart,
  CartesianGrid,
  XAxis,
  YAxis,
} from "recharts"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart"
import type { DayTotal } from "@/lib/admin/stats"
import { formatCurrency } from "@/lib/admin/format"

const chartConfig = {
  total: {
    label: "Ganhos",
    color: "#d4b800",
  },
} satisfies ChartConfig

type WeeklyChartProps = {
  data: DayTotal[]
}

export default function WeeklyChart({ data }: WeeklyChartProps) {
  const hasData = data.some((d) => d.total > 0)

  return (
    <div className="overflow-hidden rounded-2xl border border-[var(--admin-border-muted)] bg-[var(--admin-surface)]">
      <div className="border-b border-[var(--admin-border)] px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-[var(--admin-text)]">Últimos 7 dias</h2>
            <p className="text-xs text-[var(--admin-text-faint)]">Evolução diária dos ganhos</p>
          </div>
          {hasData && (
            <div className="flex items-center gap-2 rounded-lg bg-[var(--admin-gold-bg-subtle)] px-3 py-1.5">
              <div className="size-2 rounded-full bg-[var(--admin-gold-vivid)]" />
              <span className="text-xs text-[var(--admin-gold)]">Ganhos</span>
            </div>
          )}
        </div>
      </div>

      <div className="px-6 py-5">
        {!hasData ? (
          <div className="flex h-[200px] items-center justify-center text-sm text-[var(--admin-text-muted)]">
            Registre ganhos para ver a evolução
          </div>
        ) : (
          <ChartContainer config={chartConfig} className="h-[200px] w-full">
            <AreaChart data={data} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
              <defs>
                <linearGradient id="goldGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#d4b800" stopOpacity={0.35} />
                  <stop offset="95%" stopColor="#d4b800" stopOpacity={0.05} />
                </linearGradient>
              </defs>
              <CartesianGrid vertical={false} stroke="var(--admin-chart-grid)" />
              <XAxis
                dataKey="label"
                tickLine={false}
                axisLine={false}
                tick={{ fill: "var(--admin-chart-tick)", fontSize: 12 }}
              />
              <YAxis
                tickLine={false}
                axisLine={false}
                tick={{ fill: "var(--admin-chart-tick-muted)", fontSize: 11 }}
                tickFormatter={(v) => `R$${v}`}
              />
              <ChartTooltip
                cursor={{ stroke: "#d4b800", strokeWidth: 1, strokeOpacity: 0.35 }}
                content={
                  <ChartTooltipContent
                    formatter={(value) => formatCurrency(Number(value))}
                  />
                }
              />
              <Area
                type="monotone"
                dataKey="total"
                stroke="#d4b800"
                strokeWidth={2}
                fill="url(#goldGradient)"
                dot={{ fill: "#d4b800", strokeWidth: 0, r: 4 }}
                activeDot={{ fill: "#d4b800", r: 5, strokeWidth: 2, stroke: "#fff" }}
              />
            </AreaChart>
          </ChartContainer>
        )}
      </div>
    </div>
  )
}
