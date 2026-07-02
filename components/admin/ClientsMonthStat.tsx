"use client"

import { useMemo, useState } from "react"
import {
  format,
  isSameMonth,
  startOfMonth,
  subMonths,
} from "date-fns"
import { ptBR } from "date-fns/locale"
import { CalendarDays, ChevronDown } from "lucide-react"
import type { EarningEntry } from "@/lib/admin/types"
import { sumClientsForMonth } from "@/lib/admin/stats"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { cn } from "@/lib/utils"

type ClientsMonthStatProps = {
  entries: EarningEntry[]
}

export default function ClientsMonthStat({ entries }: ClientsMonthStatProps) {
  const [open, setOpen] = useState(false)
  const [selectedMonth, setSelectedMonth] = useState(() =>
    startOfMonth(new Date())
  )

  const monthOptions = useMemo(
    () =>
      Array.from({ length: 12 }, (_, i) => startOfMonth(subMonths(new Date(), i))),
    []
  )

  const count = useMemo(
    () => sumClientsForMonth(entries, selectedMonth),
    [entries, selectedMonth]
  )

  const isCurrentMonth = isSameMonth(selectedMonth, new Date())
  const monthLabel = format(selectedMonth, "MMMM yyyy", { locale: ptBR })

  function selectMonth(month: Date) {
    setSelectedMonth(month)
    setOpen(false)
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          className="flex w-full items-center gap-3 rounded-xl border border-[var(--admin-border)] bg-[var(--admin-input)] px-4 py-3 text-left transition-colors hover:border-[var(--admin-gold-border-muted)] hover:bg-[var(--admin-hover)] focus:outline-none focus:border-[var(--admin-gold-border)]"
        >
          <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-black/5">
            <CalendarDays className="size-4 text-[var(--admin-gold)]" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-[10px] uppercase tracking-widest text-[var(--admin-text-faint)]">
              Clientes no mês
            </p>
            <p className="mt-0.5 truncate text-base font-bold text-[var(--admin-text)]">
              {count}
            </p>
            <p className="text-[11px] capitalize text-[var(--admin-text-dim)]">
              {isCurrentMonth ? "Mês atual" : monthLabel}
              {" · "}
              <span className="text-[var(--admin-gold)]">Trocar mês</span>
            </p>
          </div>
          <ChevronDown
            className={cn(
              "size-4 shrink-0 text-[var(--admin-text-muted)] transition-transform",
              open && "rotate-180"
            )}
          />
        </button>
      </PopoverTrigger>

      <PopoverContent
        align="start"
        className="w-72 border-[var(--admin-border-muted)] bg-[var(--admin-surface)] p-4"
      >
        <p className="mb-3 text-xs font-semibold uppercase tracking-[0.15em] text-[var(--admin-text-faint)]">
          Selecionar mês
        </p>
        <div className="grid grid-cols-3 gap-1.5">
          {monthOptions.map((month) => {
            const selected = isSameMonth(month, selectedMonth)
            const isCurrent = isSameMonth(month, new Date())
            const label = format(month, "MMM yy", { locale: ptBR })
            const monthCount = sumClientsForMonth(entries, month)

            return (
              <button
                key={month.toISOString()}
                type="button"
                onClick={() => selectMonth(month)}
                className={cn(
                  "rounded-lg border px-2 py-2 text-center transition-all",
                  selected
                    ? "border-[var(--admin-gold-border)] bg-[var(--admin-gold-bg)] text-[var(--admin-gold)]"
                    : "border-[var(--admin-border)] bg-[var(--admin-input)] text-[var(--admin-text-dim)] hover:border-[var(--admin-gold-border-muted)] hover:text-[var(--admin-text)]",
                  isCurrent && !selected && "ring-1 ring-[var(--admin-gold-border-muted)]"
                )}
              >
                <span className="block text-xs font-semibold capitalize">
                  {label.replace(".", "")}
                </span>
                <span className="mt-0.5 block text-[10px] font-medium opacity-80">
                  {monthCount} {monthCount === 1 ? "cliente" : "clientes"}
                </span>
              </button>
            )
          })}
        </div>
        {!isCurrentMonth && (
          <button
            type="button"
            onClick={() => selectMonth(startOfMonth(new Date()))}
            className="mt-3 w-full rounded-lg border border-[var(--admin-border)] py-1.5 text-xs font-semibold text-[var(--admin-text-dim)] transition-colors hover:border-[var(--admin-gold-border)] hover:text-[var(--admin-gold)]"
          >
            Voltar ao mês atual
          </button>
        )}
      </PopoverContent>
    </Popover>
  )
}
