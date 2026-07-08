"use client"

import { useMemo, useState } from "react"
import { ChevronLeft, ChevronRight, Search, SlidersHorizontal, Trash2, X } from "lucide-react"
import { format, startOfDay, subDays } from "date-fns"
import { ptBR } from "date-fns/locale"
import type { EarningEntry } from "@/lib/admin/types"
import { EARNING_CATEGORIES } from "@/lib/admin/types"
import { formatCurrencyDetailed } from "@/lib/admin/format"
import {
  dayKeyFromDate,
  entryDayKey,
  isEntryInMonth,
  isEntryOnDay,
  parseEntryCalendarDate,
} from "@/lib/admin/dates"
import AdminDatePicker from "@/components/admin/AdminDatePicker"
import { cn } from "@/lib/utils"

const PAGE_SIZE = 10

type Period = "all" | "today" | "7d" | "month"
const PERIODS: { value: Period; label: string }[] = [
  { value: "all", label: "Tudo" },
  { value: "today", label: "Hoje" },
  { value: "7d", label: "7 dias" },
  { value: "month", label: "Mês" },
]

type RecentEntriesProps = {
  entries: EarningEntry[]
  onRemove: (id: string) => void | Promise<void>
}

export default function RecentEntries({ entries, onRemove }: RecentEntriesProps) {
  const [search, setSearch] = useState("")
  const [category, setCategory] = useState("all")
  const [period, setPeriod] = useState<Period>("all")
  const [selectedDay, setSelectedDay] = useState<Date | null>(null)
  const [page, setPage] = useState(1)
  const [removingId, setRemovingId] = useState<string | null>(null)

  const now = new Date()

  const filtered = useMemo(() => {
    const todayKey = dayKeyFromDate(now)
    const weekCutoffKey = format(subDays(now, 7), "yyyy-MM-dd")

    return entries.filter((e) => {
      if (search && !e.note?.toLowerCase().includes(search.toLowerCase())) return false
      if (category !== "all" && e.category !== category) return false

      if (selectedDay) {
        if (!isEntryOnDay(e.createdAt, selectedDay)) return false
      } else if (period === "today") {
        if (entryDayKey(e.createdAt) !== todayKey) return false
      } else if (period === "7d") {
        if (entryDayKey(e.createdAt) < weekCutoffKey) return false
      } else if (period === "month") {
        if (!isEntryInMonth(e.createdAt, now)) return false
      }

      return true
    })
  }, [entries, search, category, period, selectedDay, now])

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const safePage = Math.min(page, totalPages)
  const paginated = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE)

  function resetFilters() {
    setSearch("")
    setCategory("all")
    setPeriod("all")
    setSelectedDay(null)
    setPage(1)
  }

  function handlePeriodChange(next: Period) {
    setPeriod(next)
    setSelectedDay(null)
    setPage(1)
  }

  function handleDayChange(day: Date) {
    setSelectedDay(startOfDay(day))
    setPeriod("all")
    setPage(1)
  }

  function clearSelectedDay() {
    setSelectedDay(null)
    setPage(1)
  }

  const hasFilters = search || category !== "all" || period !== "all" || selectedDay !== null

  async function handleRemove(id: string) {
    setRemovingId(id)
    try {
      await onRemove(id)
    } finally {
      setRemovingId(null)
    }
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-[var(--admin-border-muted)] bg-[var(--admin-surface)]">
      {/* header */}
      <div className="border-b border-[var(--admin-border)] px-6 py-4">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h2 className="text-base font-bold text-[var(--admin-text)]">Registros de ganhos</h2>
            <p className="text-xs text-[var(--admin-text-faint)]">
              {filtered.length} de {entries.length} entradas
            </p>
          </div>
          {hasFilters && (
            <button
              onClick={resetFilters}
              className="flex items-center gap-1.5 rounded-lg border border-[var(--admin-border-muted)] px-3 py-1.5 text-xs text-[var(--admin-text-dim)] transition-colors hover:border-[var(--admin-border-muted)] hover:text-[var(--admin-text)]"
            >
              <X className="size-3" />
              Limpar filtros
            </button>
          )}
        </div>
      </div>

      {/* filters */}
      <div className="border-b border-[var(--admin-track)] px-6 py-3">
        <div className="flex flex-col gap-3">
          <div className="flex flex-col gap-3 sm:flex-row">
            {/* search */}
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-[var(--admin-text-muted)]" />
              <input
                type="text"
                placeholder="Buscar por observação..."
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1) }}
                className="h-9 w-full rounded-lg border border-[var(--admin-border)] bg-[var(--admin-input)] pl-9 pr-3 text-sm text-[var(--admin-text)] placeholder:text-[var(--admin-text-faint)] outline-none focus:border-[var(--admin-gold-border)]"
              />
            </div>

            {/* period pills */}
            <div className="flex items-center gap-1">
              {PERIODS.map((p) => (
                <button
                  key={p.value}
                  onClick={() => handlePeriodChange(p.value)}
                  className={cn(
                    "rounded-lg px-3 py-1.5 text-xs font-semibold transition-all",
                    period === p.value && !selectedDay
                      ? "border border-[var(--admin-gold-border-muted)] bg-[var(--admin-gold-bg)] text-[var(--admin-gold)]"
                      : "text-[var(--admin-text-faint)] hover:text-[var(--admin-text-dim)]"
                  )}
                >
                  {p.label}
                </button>
              ))}
            </div>

            {/* category filter */}
            <div className="relative flex items-center gap-1.5">
              <SlidersHorizontal className="size-4 shrink-0 text-[var(--admin-text-muted)]" />
              <select
                value={category}
                onChange={(e) => { setCategory(e.target.value); setPage(1) }}
                className="h-9 rounded-lg border border-[var(--admin-border)] bg-[var(--admin-input)] pr-2 pl-2 text-xs text-[var(--admin-text-dim)] outline-none focus:border-[var(--admin-gold-border)] cursor-pointer"
              >
                <option value="all">Todas categorias</option>
                {EARNING_CATEGORIES.map((c) => (
                  <option key={c.value} value={c.value}>
                    {c.emoji} {c.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* filtro por dia específico */}
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <span className="text-[10px] font-semibold uppercase tracking-[0.15em] text-[var(--admin-text-faint)]">
              Filtrar por dia
            </span>
            <div className="flex flex-1 flex-wrap items-center gap-2">
              <AdminDatePicker
                value={selectedDay ?? startOfDay(now)}
                onChange={handleDayChange}
                showTodayButton={false}
                placeholder="Escolher dia..."
                active={selectedDay !== null}
                className="max-w-xs"
              />
              {selectedDay && (
                <button
                  type="button"
                  onClick={clearSelectedDay}
                  className="rounded-lg border border-[var(--admin-border)] px-3 py-2 text-xs font-semibold text-[var(--admin-text-dim)] transition-colors hover:border-[var(--admin-gold-border)] hover:text-[var(--admin-gold)]"
                >
                  Ver todos os dias
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* table */}
      {paginated.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-2 py-14 text-center">
          <p className="text-sm font-medium text-[var(--admin-text-faint)]">
            {hasFilters ? "Nenhum resultado para esses filtros" : "Nenhum ganho registrado ainda"}
          </p>
          {hasFilters && (
            <button onClick={resetFilters} className="text-xs text-[var(--admin-gold)] hover:underline">
              Limpar filtros
            </button>
          )}
        </div>
      ) : (
        <>
          <div className="divide-y divide-[var(--admin-border-subtle)]">
            {/* table head */}
            <div className="hidden grid-cols-[2fr_1fr_1fr_1fr_40px] gap-4 px-6 py-2 sm:grid">
              <span className="text-[10px] font-semibold uppercase tracking-widest text-[var(--admin-text-muted)]">Categoria / Observação</span>
              <span className="text-[10px] font-semibold uppercase tracking-widest text-[var(--admin-text-muted)]">Clientes</span>
              <span className="text-[10px] font-semibold uppercase tracking-widest text-[var(--admin-text-muted)]">Data</span>
              <span className="text-right text-[10px] font-semibold uppercase tracking-widest text-[var(--admin-text-muted)]">Valor</span>
              <span />
            </div>

            {paginated.map((entry) => {
              const cat = EARNING_CATEGORIES.find((c) => c.value === entry.category)
              const clients = entry.clientCount ?? 1
              const isRemoving = removingId === entry.id
              return (
                <div
                  key={entry.id}
                  className={cn(
                    "group grid grid-cols-[1fr_40px] gap-3 px-6 py-3.5 transition-colors hover:bg-black/[0.04] sm:grid-cols-[2fr_1fr_1fr_1fr_40px]",
                    isRemoving && "opacity-50"
                  )}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-[var(--admin-gold-bg-subtle)] text-base">
                      {cat?.emoji ?? "📌"}
                    </span>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-[var(--admin-gold)]">
                        {formatCurrencyDetailed(entry.amount)}
                        <span className="ml-2 text-xs font-normal text-[var(--admin-text-faint)] sm:hidden">
                          · {clients} {clients === 1 ? "cliente" : "clientes"}
                        </span>
                      </p>
                      <p className="truncate text-xs text-[var(--admin-text-faint)]">
                        {entry.note || cat?.label}
                      </p>
                    </div>
                  </div>

                  <div className="hidden items-center sm:flex">
                    <span className="rounded-full bg-black/5 px-2 py-0.5 text-xs font-medium text-[var(--admin-text-dim)]">
                      {clients} {clients === 1 ? "cliente" : "clientes"}
                    </span>
                  </div>

                  <div className="hidden items-center sm:flex">
                    <span className="text-xs text-[var(--admin-text-faint)]">
                      {selectedDay
                        ? format(parseEntryCalendarDate(entry.createdAt), "dd MMM yyyy", {
                            locale: ptBR,
                          })
                        : format(parseEntryCalendarDate(entry.createdAt), "dd MMM · HH:mm", {
                            locale: ptBR,
                          })}
                    </span>
                  </div>

                  <div className="hidden items-center justify-end sm:flex">
                    <span className="text-sm font-bold text-[var(--admin-text)]">
                      {formatCurrencyDetailed(entry.amount)}
                    </span>
                  </div>

                  {/* remove */}
                  <div className="flex items-center justify-end">
                    <button
                      disabled={isRemoving}
                      onClick={() => handleRemove(entry.id)}
                      className="rounded-lg p-1.5 text-[var(--admin-text-muted)] transition-all hover:bg-red-500/10 hover:text-red-400 disabled:opacity-30"
                    >
                      <Trash2 className="size-3.5" />
                    </button>
                  </div>
                </div>
              )
            })}
          </div>

          {/* pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between border-t border-[var(--admin-track)] px-6 py-3">
              <span className="text-xs text-[var(--admin-text-faint)]">
                Página {safePage} de {totalPages}
              </span>
              <div className="flex items-center gap-1">
                <button
                  disabled={safePage === 1}
                  onClick={() => setPage(safePage - 1)}
                  className="flex size-8 items-center justify-center rounded-lg border border-[var(--admin-border)] text-[var(--admin-text-faint)] transition-colors hover:border-[var(--admin-border-muted)] hover:text-[var(--admin-text)] disabled:opacity-30"
                >
                  <ChevronLeft className="size-4" />
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1)
                  .filter((p) => p === 1 || p === totalPages || Math.abs(p - safePage) <= 1)
                  .reduce<(number | "…")[]>((acc, p, idx, arr) => {
                    if (idx > 0 && (p as number) - (arr[idx - 1] as number) > 1) acc.push("…")
                    acc.push(p)
                    return acc
                  }, [])
                  .map((p, i) =>
                    p === "…" ? (
                      <span key={`ellipsis-${i}`} className="px-1 text-xs text-[var(--admin-text-muted)]">…</span>
                    ) : (
                      <button
                        key={p}
                        onClick={() => setPage(p as number)}
                        className={cn(
                          "flex size-8 items-center justify-center rounded-lg text-xs font-semibold transition-all",
                          safePage === p
                            ? "border border-[var(--admin-gold-border-muted)] bg-[var(--admin-gold-bg)] text-[var(--admin-gold)]"
                            : "border border-[var(--admin-border)] text-[var(--admin-text-faint)] hover:border-[var(--admin-border-muted)] hover:text-[var(--admin-text)]"
                        )}
                      >
                        {p}
                      </button>
                    )
                  )}
                <button
                  disabled={safePage === totalPages}
                  onClick={() => setPage(safePage + 1)}
                  className="flex size-8 items-center justify-center rounded-lg border border-[var(--admin-border)] text-[var(--admin-text-faint)] transition-colors hover:border-[var(--admin-border-muted)] hover:text-[var(--admin-text)] disabled:opacity-30"
                >
                  <ChevronRight className="size-4" />
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}
