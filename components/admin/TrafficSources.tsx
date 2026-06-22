"use client"

import type { TrafficSource } from "@/lib/analytics/types"
import { formatConversionRate } from "@/lib/analytics/types"

type TrafficSourcesProps = {
  sources: TrafficSource[]
}

const SOURCE_COLORS: Record<string, string> = {
  Google: "#ffea00",
  Direto: "#60a5fa",
  Instagram: "#f472b6",
  Outros: "#666",
}

export default function TrafficSources({ sources }: TrafficSourcesProps) {
  const mainSources = sources.filter((s) =>
    ["Google", "Direto", "Instagram"].includes(s.name)
  )
  const display = mainSources.length > 0 ? mainSources : sources
  const maxVisits = Math.max(...display.map((s) => s.visits), 1)

  return (
    <div className="overflow-hidden rounded-2xl border border-[var(--admin-border-muted)] bg-[var(--admin-surface)]">
      <div className="border-b border-[var(--admin-border)] px-6 py-4">
        <h2 className="text-base font-bold text-white">Origem dos visitantes</h2>
        <p className="text-xs text-[var(--admin-text-faint)]">Últimos 30 dias · sessões por fonte</p>
      </div>

      <div className="p-6">
        {display.length === 0 ? (
          <p className="py-8 text-center text-sm text-[var(--admin-text-muted)]">
            Sem dados de origem ainda
          </p>
        ) : (
          <div className="space-y-5">
            {display.map((source) => {
              const color = SOURCE_COLORS[source.name] ?? "#666"
              return (
                <div key={source.name}>
                  <div className="mb-2 flex items-center justify-between gap-3">
                    <span className="text-sm font-medium text-[#ccc]">
                      {source.name}
                    </span>
                    <div className="text-right">
                      <span className="text-sm font-bold text-white">
                        {source.visits}
                      </span>
                      <span className="ml-2 text-xs text-[var(--admin-text-faint)]">
                        {formatConversionRate(source.percent)}%
                      </span>
                    </div>
                  </div>
                  <div className="h-2 w-full overflow-hidden rounded-full bg-[var(--admin-track)]">
                    <div
                      className="h-full rounded-full transition-all"
                      style={{
                        width: `${(source.visits / maxVisits) * 100}%`,
                        background: color,
                      }}
                    />
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
