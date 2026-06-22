"use client"

import { cn } from "@/lib/utils"
import type { DayTotal } from "@/lib/admin/stats"
import { format, parseISO } from "date-fns"
import { ptBR } from "date-fns/locale"

type MonthHeatmapProps = {
  days: DayTotal[]
}

function intensity(total: number, max: number) {
  if (total <= 0) return 0
  if (max <= 0) return 0
  const ratio = total / max
  if (ratio >= 0.75) return 4
  if (ratio >= 0.5) return 3
  if (ratio >= 0.25) return 2
  return 1
}

export default function MonthHeatmap({ days }: MonthHeatmapProps) {
  const max = Math.max(...days.map((d) => d.total), 1)
  const firstDay = days[0]
    ? parseISO(days[0].date).getDay()
    : new Date().getDay()

  const today = format(new Date(), "yyyy-MM-dd")

  return (
    <div className="overflow-hidden rounded-2xl border border-[var(--admin-border-muted)] bg-[var(--admin-surface)]">
      <div className="border-b border-[var(--admin-border)] px-6 py-4">
        <h2 className="text-base font-bold text-white">Mapa do mês</h2>
        <p className="text-xs text-[var(--admin-text-faint)]">
          {format(new Date(), "MMMM yyyy", { locale: ptBR })} · dias mais fortes em destaque
        </p>
      </div>

      <div className="p-6">
        <div className="mb-2 grid grid-cols-7 gap-1 text-center">
          {["D", "S", "T", "Q", "Q", "S", "S"].map((d, i) => (
            <span key={`${d}-${i}`} className="text-[10px] font-semibold text-[var(--admin-text-muted)]">
              {d}
            </span>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-1.5">
          {Array.from({ length: firstDay }).map((_, i) => (
            <div key={`empty-${i}`} />
          ))}
          {days.map((day) => {
            const level = intensity(day.total, max)
            const isToday = day.date === today
            return (
              <div
                key={day.date}
                title={`${day.label}: R$ ${day.total.toFixed(0)}`}
                className={cn(
                  "flex aspect-square items-center justify-center rounded-lg text-[10px] font-semibold transition-all",
                  isToday && "ring-1 ring-[#ffea00]/60 ring-offset-1 ring-offset-[var(--admin-surface)]",
                  level === 0 && "bg-[var(--admin-heatmap-0)] text-[var(--admin-border)]",
                  level === 1 && "bg-[#ffea00]/15 text-[#ffea00]/70",
                  level === 2 && "bg-[#ffea00]/30 text-[#ffea00]",
                  level === 3 && "bg-[#ffea00]/55 text-black",
                  level === 4 && "bg-[#ffea00] text-black"
                )}
              >
                {format(parseISO(day.date), "d")}
              </div>
            )
          })}
        </div>

        {/* legend */}
        <div className="mt-4 flex items-center justify-end gap-2">
          <span className="text-[10px] text-[var(--admin-text-muted)]">menos</span>
          {[0, 1, 2, 3, 4].map((l) => (
            <div
              key={l}
              className={cn(
                "size-3 rounded-sm",
                l === 0 && "bg-[var(--admin-heatmap-0)]",
                l === 1 && "bg-[#ffea00]/15",
                l === 2 && "bg-[#ffea00]/30",
                l === 3 && "bg-[#ffea00]/55",
                l === 4 && "bg-[#ffea00]"
              )}
            />
          ))}
          <span className="text-[10px] text-[var(--admin-text-muted)]">mais</span>
        </div>
      </div>
    </div>
  )
}
