"use client"

import { useCallback, useEffect, useState } from "react"
import type { VisitsAnalytics } from "@/lib/analytics/types"
import { useAuth } from "@/hooks/useAuth"

export function useAnalytics() {
  const { user, loading: authLoading } = useAuth()
  const [data, setData] = useState<VisitsAnalytics | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch("/api/admin/analytics")
      const json = (await res.json()) as {
        ok: boolean
        data?: VisitsAnalytics
        error?: string
      }

      if (!res.ok || !json.ok) {
        throw new Error(json.error ?? "Erro ao carregar visitas")
      }

      setData(json.data ?? null)
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao carregar visitas")
      setData(null)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (authLoading) return
    if (!user) {
      setLoading(false)
      return
    }
    load()
  }, [authLoading, user, load])

  return {
    data,
    loading: loading || authLoading,
    error,
    refresh: load,
  }
}
