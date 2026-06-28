"use client"

import { cn } from "@/lib/utils"
import { TrendingDown, TrendingUp, type LucideIcon } from "lucide-react"
import { formatPercent } from "@/lib/admin/format"

type Variant = "default" | "gold" | "profit" | "loss" | "neutral"

type StatCardProps = {
  label: string
  value: string
  sublabel?: string
  change?: number
  variant?: Variant
  icon?: LucideIcon
  className?: string
}

const variantStyles: Record<Variant, { card: string; value: string; bar: string }> = {
  default: {
    card: "border-[var(--admin-border-muted)] bg-[var(--admin-surface)] hover:border-[var(--admin-border-muted)]",
    value: "text-[var(--admin-text)]",
    bar: "bg-[var(--admin-border-muted)]",
  },
  gold: {
    card: "border-[#ffea00]/30 bg-gradient-to-br from-[var(--admin-surface)] to-[#fffbeb] hover:border-[#ffea00]/50",
    value: "text-[#ffea00]",
    bar: "bg-[#ffea00]",
  },
  profit: {
    card: "border-emerald-500/20 bg-gradient-to-br from-[var(--admin-surface)] to-[#ecfdf5] hover:border-emerald-500/40",
    value: "text-emerald-600",
    bar: "bg-emerald-500",
  },
  loss: {
    card: "border-red-500/20 bg-gradient-to-br from-[var(--admin-surface)] to-[#fef2f2] hover:border-red-500/40",
    value: "text-red-600",
    bar: "bg-red-500",
  },
  neutral: {
    card: "border-[var(--admin-border-muted)] bg-[var(--admin-surface)] hover:border-[var(--admin-border-muted)]",
    value: "text-[var(--admin-text-dim)]",
    bar: "bg-[var(--admin-border-muted)]",
  },
}

export default function StatCard({
  label,
  value,
  sublabel,
  change,
  variant = "default",
  icon: Icon,
  className,
}: StatCardProps) {
  const s = variantStyles[variant]
  const isPositive = change !== undefined && change >= 0
  const showChange = change !== undefined && !Number.isNaN(change)

  return (
    <div
      className={cn(
        "group relative overflow-hidden rounded-2xl border p-5 transition-all duration-200",
        s.card,
        className
      )}
    >
      {/* top accent bar */}
      <div className={cn("absolute inset-x-0 top-0 h-0.5", s.bar)} />

      <div className="flex items-start justify-between gap-3">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--admin-text-faint)]">
          {label}
        </p>
        {Icon && (
          <div className="rounded-lg bg-black/5 p-1.5">
            <Icon className={cn("size-4", s.value)} />
          </div>
        )}
      </div>

      <p className={cn("mt-3 text-3xl font-bold tracking-tight", s.value)}>
        {value}
      </p>

      <div className="mt-2 flex flex-wrap items-center gap-2">
        {showChange && (
          <span
            className={cn(
              "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold",
              isPositive
                ? "bg-emerald-500/15 text-emerald-400"
                : "bg-red-500/15 text-red-400"
            )}
          >
            {isPositive ? (
              <TrendingUp className="size-3" />
            ) : (
              <TrendingDown className="size-3" />
            )}
            {formatPercent(change)}
          </span>
        )}
        {sublabel && (
          <span className="text-xs text-[var(--admin-text-faint)]">{sublabel}</span>
        )}
      </div>
    </div>
  )
}

export function MiniStat({
  label,
  value,
  hint,
  icon: Icon,
}: {
  label: string
  value: string
  hint?: string
  icon?: LucideIcon
}) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-[var(--admin-border)] bg-[var(--admin-input)] px-4 py-3">
      {Icon && (
        <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-black/5">
          <Icon className="size-4 text-[var(--admin-text-faint)]" />
        </div>
      )}
      <div className="min-w-0">
        <p className="text-[10px] uppercase tracking-widest text-[var(--admin-text-faint)]">{label}</p>
        <p className="mt-0.5 truncate text-base font-bold text-[var(--admin-text)]">{value}</p>
        {hint && <p className="text-[11px] text-[var(--admin-text-faint)]">{hint}</p>}
      </div>
    </div>
  )
}
