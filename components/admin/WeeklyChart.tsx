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
    color: "#ffea00",
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
            <div className="flex items-center gap-2 rounded-lg bg-[#ffea00]/8 px-3 py-1.5">
              <div className="size-2 rounded-full bg-[#ffea00]" />
              <span className="text-xs text-[#ffea00]">Ganhos</span>
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
                  <stop offset="5%" stopColor="#ffea00" stopOpacity={0.18} />
                  <stop offset="95%" stopColor="#ffea00" stopOpacity={0.02} />
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
                cursor={{ stroke: "#ffea00", strokeWidth: 1, strokeOpacity: 0.2 }}
                content={
                  <ChartTooltipContent
                    formatter={(value) => formatCurrency(Number(value))}
                  />
                }
              />
              <Area
                type="monotone"
                dataKey="total"
                stroke="#ffea00"
                strokeWidth={2}
                fill="url(#goldGradient)"
                dot={{ fill: "#ffea00", strokeWidth: 0, r: 4 }}
                activeDot={{ fill: "#ffea00", r: 5, strokeWidth: 2, stroke: "#000" }}
              />
            </AreaChart>
          </ChartContainer>
        )}
      </div>
    </div>
  )
}
