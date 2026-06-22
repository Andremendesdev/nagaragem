"use client"

import type { CategoryTotal } from "@/lib/admin/stats"
import { formatCurrency } from "@/lib/admin/format"

type CategoryBreakdownProps = {
  categories: CategoryTotal[]
  monthTotal: number
}

export default function CategoryBreakdown({
  categories,
  monthTotal,
}: CategoryBreakdownProps) {
  const sorted = [...categories].sort((a, b) => b.total - a.total)

  return (
    <div className="overflow-hidden rounded-2xl border border-[var(--admin-border-muted)] bg-[var(--admin-surface)]">
      <div className="border-b border-[var(--admin-border)] px-6 py-4">
        <h2 className="text-base font-bold text-white">Por categoria</h2>
        <p className="text-xs text-[var(--admin-text-faint)]">
          Mix do mês · {formatCurrency(monthTotal)}
        </p>
      </div>

      <div className="p-6">
        {sorted.length === 0 ? (
          <p className="py-6 text-center text-sm text-[var(--admin-text-muted)]">
            Sem dados para o mês atual
          </p>
        ) : (
          <div className="space-y-4">
            {sorted.map((cat, idx) => (
              <div key={cat.category}>
                <div className="mb-2 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="shrink-0">{cat.emoji}</span>
                    <span className="truncate text-sm text-[#ccc]">{cat.label}</span>
                    <span className="shrink-0 rounded-full bg-white/5 px-1.5 py-0.5 text-[10px] text-[var(--admin-text-faint)]">
                      {cat.count} {cat.count === 1 ? "cliente" : "clientes"}
                    </span>
                  </div>
                  <span className="shrink-0 text-sm font-semibold text-white">
                    {formatCurrency(cat.total)}
                  </span>
                </div>

                {/* custom progress bar */}
                <div className="h-1.5 w-full overflow-hidden rounded-full bg-[var(--admin-track)]">
                  <div
                    className="h-full rounded-full transition-all"
                    style={{
                      width: `${cat.percent}%`,
                      background:
                        idx === 0
                          ? "#ffea00"
                          : idx === 1
                          ? "#ffea0099"
                          : "#ffea0055",
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
