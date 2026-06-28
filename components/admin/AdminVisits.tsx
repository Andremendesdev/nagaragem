"use client"

import dynamic from "next/dynamic"
import {
  BarChart3,
  Percent,
  RefreshCw,
  Target,
  Users,
} from "lucide-react"
import StatCard from "./StatCard"
import TrafficSources from "./TrafficSources"
import { useAnalytics } from "@/hooks/use-analytics"
import { formatConversionRate } from "@/lib/analytics/types"

const VisitsTrendChart = dynamic(() => import("./VisitsTrendChart"), {
  ssr: false,
  loading: () => (
    <div className="h-[320px] animate-pulse rounded-2xl border border-[var(--admin-border-muted)] bg-[var(--admin-surface)]" />
  ),
})

function StatSkeleton() {
  return (
    <div className="rounded-2xl border border-[var(--admin-border-muted)] bg-[var(--admin-surface)] p-5">
      <div className="h-3 w-24 animate-pulse rounded bg-[var(--admin-skeleton)]" />
      <div className="mt-3 h-8 w-16 animate-pulse rounded bg-[var(--admin-hover)]" />
    </div>
  )
}

export default function AdminVisits() {
  const { data, loading, error, refresh } = useAnalytics()

  const notConfigured = data && !data.configured

  return (
    <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6">
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="mb-2 flex items-center gap-2">
            <BarChart3 className="size-5 text-[#ffea00]" />
            <h1 className="text-2xl font-bold text-[var(--admin-text)]">Visitas</h1>
          </div>
          <p className="text-sm text-[var(--admin-text-faint)]">
            Métricas do site via Google Analytics 4
          </p>
        </div>
        <button
          type="button"
          onClick={() => refresh()}
          disabled={loading}
          className="inline-flex items-center gap-2 self-start rounded-lg border border-[var(--admin-border)] px-4 py-2 text-sm text-[var(--admin-text-dim)] transition-colors hover:border-[#ffea00]/40 hover:text-[#ffea00] disabled:opacity-50"
        >
          <RefreshCw className={`size-4 ${loading ? "animate-spin" : ""}`} />
          Atualizar
        </button>
      </div>

      {(notConfigured || error) && (
        <div className="mb-6 overflow-hidden rounded-2xl border border-amber-500/20 bg-amber-500/5">
          <div className="border-b border-amber-500/10 px-6 py-4">
            <p className="font-semibold text-amber-300">
              {notConfigured ? "GA4 não configurado no servidor" : "Erro ao buscar dados"}
            </p>
          </div>
          <div className="space-y-3 p-6 text-sm text-[var(--admin-text-dim)]">
            {error && <p className="text-red-300">{error}</p>}
            <p>Configure no Netlify (ou `.env.local`):</p>
            <ul className="list-inside list-disc space-y-1 text-xs text-[var(--admin-text-faint)]">
              <li>
                <code className="text-[#ffea00]">GA4_PROPERTY_ID</code> — ID numérico da propriedade (Admin → Detalhes da propriedade)
              </li>
              <li>
                <code className="text-[#ffea00]">GA4_SERVICE_ACCOUNT_JSON</code> — JSON da service account em uma linha (Leitor no GA4)
              </li>
              <li>
                Ou <code className="text-[#ffea00]">GA4_CLIENT_EMAIL</code> +{" "}
                <code className="text-[#ffea00]">GA4_PRIVATE_KEY</code> — chave com{" "}
                <code className="text-[#ffea00]">\n</code> nas quebras (recomendado no Netlify)
              </li>
            </ul>
          </div>
        </div>
      )}

      {/* Hoje */}
      <section className="mb-8">
        <h2 className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-[var(--admin-text-faint)]">
          Hoje
        </h2>
        <div className="grid gap-3 sm:grid-cols-3">
          {loading ? (
            <>
              <StatSkeleton />
              <StatSkeleton />
              <StatSkeleton />
            </>
          ) : (
            <>
              <StatCard
                icon={Users}
                label="Visitas hoje"
                value={String(data?.today.visits ?? 0)}
                variant="gold"
              />
              <StatCard
                icon={Target}
                label="Leads hoje"
                value={String(data?.today.leads ?? 0)}
                sublabel="generate_lead"
                variant="profit"
              />
              <StatCard
                icon={Percent}
                label="Taxa de conversão hoje"
                value={`${formatConversionRate(data?.today.conversionRate ?? 0)}%`}
                sublabel="leads ÷ visitas"
                variant="default"
              />
            </>
          )}
        </div>
      </section>

      {/* Mês */}
      <section className="mb-8">
        <h2 className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-[var(--admin-text-faint)]">
          Mês
        </h2>
        <div className="grid gap-3 sm:grid-cols-3">
          {loading ? (
            <>
              <StatSkeleton />
              <StatSkeleton />
              <StatSkeleton />
            </>
          ) : (
            <>
              <StatCard
                icon={Users}
                label="Visitas mês"
                value={String(data?.month.visits ?? 0)}
                variant="default"
              />
              <StatCard
                icon={Target}
                label="Leads mês"
                value={String(data?.month.leads ?? 0)}
                sublabel="generate_lead"
                variant="profit"
              />
              <StatCard
                icon={Percent}
                label="Taxa de conversão mês"
                value={`${formatConversionRate(data?.month.conversionRate ?? 0)}%`}
                sublabel="leads ÷ visitas"
                variant="default"
              />
            </>
          )}
        </div>
      </section>

      {/* Gráfico + origem */}
      <div className="mb-8 grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          {!loading && data?.configured ? (
            <VisitsTrendChart data={data.daily} />
          ) : loading ? (
            <div className="h-[320px] animate-pulse rounded-2xl border border-[var(--admin-border-muted)] bg-[var(--admin-surface)]" />
          ) : (
            <VisitsTrendChart data={[]} />
          )}
        </div>
        <div>
          {!loading && data?.configured ? (
            <TrafficSources sources={data.sources} />
          ) : loading ? (
            <div className="h-[320px] animate-pulse rounded-2xl border border-[var(--admin-border-muted)] bg-[var(--admin-surface)]" />
          ) : (
            <TrafficSources sources={[]} />
          )}
        </div>
      </div>
    </div>
  )
}
