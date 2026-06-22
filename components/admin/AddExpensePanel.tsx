"use client"

import { useState } from "react"
import { CheckCircle, Loader2, Minus, Zap } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  EXPENSE_CATEGORIES,
  QUICK_EXPENSE_AMOUNTS,
  type ExpenseCategory,
} from "@/lib/admin/types"
import { formatCurrency } from "@/lib/admin/format"
import { cn } from "@/lib/utils"

type AddExpensePanelProps = {
  onAdd: (amount: number, category: ExpenseCategory, note?: string) => void | Promise<void>
}

export default function AddExpensePanel({ onAdd }: AddExpensePanelProps) {
  const [amount, setAmount] = useState("")
  const [category, setCategory] = useState<ExpenseCategory>("produtos")
  const [note, setNote] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)
  const [amountError, setAmountError] = useState("")

  function showSuccess() {
    setSuccess(true)
    setTimeout(() => setSuccess(false), 2000)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const parsed = Number(amount.replace(",", "."))

    if (!parsed || parsed <= 0) {
      setAmountError("Informe um valor maior que zero.")
      return
    }

    setAmountError("")
    setSubmitting(true)
    try {
      await onAdd(parsed, category, note.trim() || undefined)
      setAmount("")
      setNote("")
      showSuccess()
    } finally {
      setSubmitting(false)
    }
  }

  async function quickAdd(value: number) {
    if (submitting) return
    setSubmitting(true)
    try {
      await onAdd(value, category)
      showSuccess()
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-red-500/15 bg-[var(--admin-surface)]">
      <div className="border-b border-[var(--admin-border)] px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="flex size-9 items-center justify-center rounded-xl bg-red-500/10">
            <Minus className="size-4 text-red-400" />
          </div>
          <div>
            <h2 className="text-base font-bold text-white">Registrar despesa</h2>
            <p className="text-xs text-[var(--admin-text-faint)]">Aluguel, produtos, contas...</p>
          </div>
          {success && (
            <div className="ml-auto flex items-center gap-1.5 rounded-full bg-emerald-500/15 px-3 py-1 text-xs font-semibold text-emerald-400">
              <CheckCircle className="size-3" />
              Salvo!
            </div>
          )}
        </div>
      </div>

      <div className="p-6">
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.15em] text-[var(--admin-text-faint)]">
              Valor (R$)
            </label>
            <div className="relative">
              <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm font-semibold text-[var(--admin-text-faint)]">
                R$
              </span>
              <Input
                type="number"
                min="0.01"
                step="0.01"
                placeholder="0,00"
                value={amount}
                onChange={(e) => {
                  setAmount(e.target.value)
                  if (amountError) setAmountError("")
                }}
                className={cn(
                  "h-12 border-[var(--admin-border-muted)] bg-[var(--admin-input)] pl-9 text-lg font-bold text-white placeholder:text-[var(--admin-border)] focus:border-red-500/50",
                  amountError && "border-red-500/50"
                )}
              />
            </div>
            {amountError && (
              <p className="mt-1 text-xs text-red-400">{amountError}</p>
            )}
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.15em] text-[var(--admin-text-faint)]">
              Categoria
            </label>
            <div className="grid grid-cols-2 gap-1.5 sm:grid-cols-4">
              {EXPENSE_CATEGORIES.map((cat) => (
                <button
                  key={cat.value}
                  type="button"
                  onClick={() => setCategory(cat.value)}
                  className={cn(
                    "rounded-xl border py-2.5 text-center text-xs font-medium transition-all",
                    category === cat.value
                      ? "border-red-400/60 bg-red-500/10 text-red-300"
                      : "border-[var(--admin-border)] bg-[var(--admin-input)] text-[var(--admin-text-faint)] hover:border-[#333] hover:text-[#999]"
                  )}
                >
                  <span className="block text-base leading-none">{cat.emoji}</span>
                  <span className="mt-1 block">{cat.label}</span>
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.15em] text-[var(--admin-text-faint)]">
              Obs. <span className="normal-case tracking-normal text-[var(--admin-text-muted)]">(opcional)</span>
            </label>
            <Input
              placeholder="Conta de luz, pomada fixadora..."
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="border-[var(--admin-border-muted)] bg-[var(--admin-input)] text-white placeholder:text-[var(--admin-border)] focus:border-red-500/50"
            />
          </div>

          <Button
            type="submit"
            disabled={submitting}
            variant="destructive"
            className="h-11 w-full font-bold disabled:opacity-50"
          >
            {submitting ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <Minus className="size-4" />
            )}
            {submitting ? "Salvando..." : "Adicionar despesa"}
          </Button>
        </form>

        <div className="mt-5 border-t border-[var(--admin-track)] pt-4">
          <p className="mb-2.5 flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.2em] text-[var(--admin-text-faint)]">
            <Zap className="size-3 text-red-400" />
            Atalhos rápidos
          </p>
          <div className="flex flex-wrap gap-1.5">
            {QUICK_EXPENSE_AMOUNTS.map((v) => (
              <button
                key={v}
                type="button"
                disabled={submitting}
                onClick={() => quickAdd(v)}
                className="rounded-lg border border-[var(--admin-border)] bg-[var(--admin-bg)] px-3 py-1.5 text-xs font-semibold text-[var(--admin-text-dim)] transition-all hover:border-red-500/30 hover:text-red-300 disabled:opacity-40"
              >
                {formatCurrency(v)}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
