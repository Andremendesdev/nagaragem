"use client"

import { useState } from "react"
import { format, startOfDay } from "date-fns"
import { ptBR } from "date-fns/locale"
import { CalendarIcon } from "lucide-react"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import { clampToToday } from "@/lib/admin/dates"

type AdminDatePickerProps = {
  value: Date
  onChange: (date: Date) => void
  className?: string
  showTodayButton?: boolean
  placeholder?: string
  active?: boolean
}

export default function AdminDatePicker({
  value,
  onChange,
  className,
  showTodayButton = true,
  placeholder,
  active = true,
}: AdminDatePickerProps) {
  const [open, setOpen] = useState(false)
  const today = startOfDay(new Date())
  const maxDate = today

  function handleSelect(date: Date | undefined) {
    if (!date) return
    onChange(clampToToday(startOfDay(date)))
    setOpen(false)
  }

  function handleToday() {
    onChange(today)
    setOpen(false)
  }

  return (
    <div className={cn("flex gap-2", className)}>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <button
            type="button"
            className={cn(
              "flex h-12 flex-1 items-center gap-2 rounded-lg border bg-[var(--admin-input)] px-3 text-left text-sm transition-colors hover:border-[#ffea00]/40 focus:outline-none focus:border-[#ffea00]/50",
              active
                ? "border-[#ffea00]/40 text-[var(--admin-text)]"
                : "border-[var(--admin-border-muted)] text-[var(--admin-text-dim)]"
            )}
          >
            <CalendarIcon className="size-4 shrink-0 text-[var(--admin-text-faint)]" />
            <span className={cn("font-medium capitalize", !active && placeholder && "normal-case font-normal")}>
              {active || !placeholder
                ? format(value, "dd MMM yyyy", { locale: ptBR })
                : placeholder}
            </span>
          </button>
        </PopoverTrigger>
        <PopoverContent
          className="w-auto border-[var(--admin-border-muted)] bg-[var(--admin-surface)] p-0 text-[var(--admin-text)]"
          align="start"
        >
          <Calendar
            mode="single"
            selected={value}
            onSelect={handleSelect}
            disabled={{ after: maxDate }}
            defaultMonth={value}
            locale={ptBR}
            className="rounded-lg"
          />
        </PopoverContent>
      </Popover>

      {showTodayButton && (
        <button
          type="button"
          onClick={handleToday}
          className="shrink-0 rounded-lg border border-[var(--admin-border)] bg-[var(--admin-bg)] px-3 text-xs font-semibold text-[var(--admin-text-dim)] transition-colors hover:border-[#ffea00]/40 hover:text-[#ffea00]"
        >
          Hoje
        </button>
      )}
    </div>
  )
}
