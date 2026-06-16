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
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart"
import type { DailyPoint } from "@/lib/analytics/types"

const chartConfig = {
  visits: {
    label: "Visitas",
    color: "#ffea00",
  },
  leads: {
    label: "Leads",
    color: "#34d399",
  },
} satisfies ChartConfig

type VisitsTrendChartProps = {
  data: DailyPoint[]
}

export default function VisitsTrendChart({ data }: VisitsTrendChartProps) {
  const hasData = data.some((d) => d.visits > 0 || d.leads > 0)

  return (
    <div className="overflow-hidden rounded-2xl border border-[#2a2a2a] bg-[#151515]">
      <div className="border-b border-[#222] px-6 py-4">
        <h2 className="text-base font-bold text-white">Últimos 30 dias</h2>
        <p className="text-xs text-[#555]">Visitas e leads (generate_lead) por dia</p>
      </div>

      <div className="px-6 py-5">
        {!hasData ? (
          <div className="flex h-[260px] items-center justify-center text-sm text-[#444]">
            Sem dados no período
          </div>
        ) : (
          <ChartContainer config={chartConfig} className="h-[260px] w-full">
            <AreaChart data={data} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
              <defs>
                <linearGradient id="visitsGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ffea00" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#ffea00" stopOpacity={0.02} />
                </linearGradient>
                <linearGradient id="leadsGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#34d399" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#34d399" stopOpacity={0.02} />
                </linearGradient>
              </defs>
              <CartesianGrid vertical={false} stroke="#1e1e1e" />
              <XAxis
                dataKey="label"
                tickLine={false}
                axisLine={false}
                tick={{ fill: "#555", fontSize: 10 }}
                interval="preserveStartEnd"
              />
              <YAxis
                tickLine={false}
                axisLine={false}
                tick={{ fill: "#444", fontSize: 11 }}
                allowDecimals={false}
              />
              <ChartTooltip content={<ChartTooltipContent />} />
              <ChartLegend content={<ChartLegendContent />} />
              <Area
                type="monotone"
                dataKey="visits"
                stroke="#ffea00"
                strokeWidth={2}
                fill="url(#visitsGradient)"
                dot={false}
              />
              <Area
                type="monotone"
                dataKey="leads"
                stroke="#34d399"
                strokeWidth={2}
                fill="url(#leadsGradient)"
                dot={false}
              />
            </AreaChart>
          </ChartContainer>
        )}
      </div>
    </div>
  )
}
