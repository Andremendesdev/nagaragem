"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import type {
  AdminSettings,
  EarningCategory,
  EarningEntry,
  ExpenseCategory,
  ExpenseEntry,
} from "@/lib/admin/types"
import {
  deleteEntry,
  fetchEntries,
  fetchSettings,
  importEntries,
  insertEntry,
  updateSettings,
} from "@/lib/admin/db"
import {
  deleteExpense,
  fetchExpenses,
  insertExpense,
} from "@/lib/admin/expenses-db"
import {
  clearLocalAdminData,
  loadLocalEntries,
  loadLocalSettings,
} from "@/lib/admin/storage"
import { computeStats } from "@/lib/admin/stats"
import { useAuth } from "@/hooks/useAuth"

export function useFinances() {
  const { user, loading: authLoading } = useAuth()
  const [entries, setEntries] = useState<EarningEntry[]>([])
  const [expenses, setExpenses] = useState<ExpenseEntry[]>([])
  const [settings, setSettings] = useState<AdminSettings>({ monthlyGoal: 8000 })
  const [ready, setReady] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (authLoading) return
    if (!user) {
      setReady(true)
      return
    }

    let cancelled = false

    async function load() {
      setReady(false)
      try {
        let [remoteEntries, remoteExpenses, remoteSettings] = await Promise.all([
          fetchEntries(),
          fetchExpenses(),
          fetchSettings(),
        ])

        const localEntries = loadLocalEntries()
        const localSettings = loadLocalSettings()

        if (remoteEntries.length === 0 && localEntries.length > 0) {
          await importEntries(localEntries)
          remoteEntries = await fetchEntries()
          clearLocalAdminData()
        }

        if (localSettings && remoteSettings.monthlyGoal === 8000) {
          remoteSettings = await updateSettings(localSettings)
          clearLocalAdminData()
        }

        if (!cancelled) {
          setEntries(remoteEntries)
          setExpenses(remoteExpenses)
          setSettings(remoteSettings)
          setError(null)
        }
      } catch (err) {
        if (!cancelled) {
          const message =
            err instanceof Error ? err.message : "Erro ao carregar dados"
          setError(message)
        }
      } finally {
        if (!cancelled) setReady(true)
      }
    }

    load()
    return () => {
      cancelled = true
    }
  }, [authLoading, user])

  const stats = useMemo(
    () => computeStats(entries, settings.monthlyGoal, expenses),
    [entries, expenses, settings.monthlyGoal]
  )

  const addEntry = useCallback(
    async (
      amount: number,
      category: EarningCategory,
      clientCount: number,
      note?: string,
      entryDate?: Date
    ) => {
      try {
        const entry = await insertEntry(
          amount,
          category,
          clientCount,
          note,
          entryDate
        )
        setEntries((prev) => [entry, ...prev])
        setError(null)
      } catch (err) {
        const message = err instanceof Error ? err.message : "Erro ao salvar ganho"
        setError(message)
        throw err
      }
    },
    []
  )

  const removeEntry = useCallback(async (id: string) => {
    try {
      await deleteEntry(id)
      setEntries((prev) => prev.filter((e) => e.id !== id))
      setError(null)
    } catch (err) {
      const message = err instanceof Error ? err.message : "Erro ao remover ganho"
      setError(message)
      throw err
    }
  }, [])

  const addExpense = useCallback(
    async (amount: number, category: ExpenseCategory, note?: string) => {
      try {
        const expense = await insertExpense(amount, category, note)
        setExpenses((prev) => [expense, ...prev])
        setError(null)
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Erro ao salvar despesa"
        setError(message)
        throw err
      }
    },
    []
  )

  const removeExpense = useCallback(async (id: string) => {
    try {
      await deleteExpense(id)
      setExpenses((prev) => prev.filter((e) => e.id !== id))
      setError(null)
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Erro ao remover despesa"
      setError(message)
      throw err
    }
  }, [])

  const updateGoal = useCallback(async (monthlyGoal: number) => {
    try {
      const next = await updateSettings({ monthlyGoal })
      setSettings(next)
      setError(null)
    } catch (err) {
      const message = err instanceof Error ? err.message : "Erro ao salvar meta"
      setError(message)
      throw err
    }
  }, [])

  return {
    entries,
    expenses,
    settings,
    stats,
    ready: ready && !authLoading,
    error,
    addEntry,
    removeEntry,
    addExpense,
    removeExpense,
    updateGoal,
  }
}

/** @deprecated use useFinances */
export const useEarnings = useFinances
