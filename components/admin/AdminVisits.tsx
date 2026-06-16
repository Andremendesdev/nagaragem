"use client"

import dynamic from "next/dynamic"
import {
  BarChart3,
  ExternalLink,
  MousePointerClick,
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
    <div className="h-[320px] animate-pulse rounded-2xl border border-[#2a2a2a] bg-[#151515]" />
  ),
})

const GA_ID =
  process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID ?? "G-L48FSV5JG3"

const TRACKED_EVENTS = [
  { name: "generate_lead", description: "Clique no WhatsApp (Hero, flutuante ou serviços)" },
  { name: "instagram_click", description: "Clique no Instagram do Hero" },
]

function StatSkeleton() {
  return (
    <div className="rounded-2xl border border-[#2a2a2a] bg-[#151515] p-5">
      <div className="h-3 w-24 animate-pulse rounded bg-[#222]" />
      <div className="mt-3 h-8 w-16 animate-pulse rounded bg-[#1a1a1a]" />
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
            <h1 className="text-2xl font-bold text-white">Visitas</h1>
          </div>
          <p className="text-sm text-[#666]">
            Métricas do site via Google Analytics 4
          </p>
        </div>
        <button
          type="button"
          onClick={() => refresh()}
          disabled={loading}
          className="inline-flex items-center gap-2 self-start rounded-lg border border-[#333] px-4 py-2 text-sm text-[#888] transition-colors hover:border-[#ffea00]/40 hover:text-[#ffea00] disabled:opacity-50"
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
          <div className="space-y-3 p-6 text-sm text-[#888]">
            {error && <p className="text-red-300">{error}</p>}
            <p>Configure no Netlify (ou `.env.local`):</p>
            <ul className="list-inside list-disc space-y-1 text-xs text-[#666]">
              <li>
                <code className="text-[#ffea00]">GA4_PROPERTY_ID</code> — ID numérico da propriedade (Admin → Detalhes da propriedade)
              </li>
              <li>
                <code className="text-[#ffea00]">GA4_SERVICE_ACCOUNT_JSON</code> — JSON completo da service account com acesso de Leitor no GA4
              </li>
            </ul>
            <p className="text-xs text-[#555]">
              Measurement ID do site:{" "}
              <span className="font-mono text-[#ffea00]">{GA_ID}</span>
            </p>
          </div>
        </div>
      )}

      {/* Hoje */}
      <section className="mb-8">
        <h2 className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-[#555]">
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
        <h2 className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-[#555]">
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
            <div className="h-[320px] animate-pulse rounded-2xl border border-[#2a2a2a] bg-[#151515]" />
          ) : (
            <VisitsTrendChart data={[]} />
          )}
        </div>
        <div>
          {!loading && data?.configured ? (
            <TrafficSources sources={data.sources} />
          ) : loading ? (
            <div className="h-[320px] animate-pulse rounded-2xl border border-[#2a2a2a] bg-[#151515]" />
          ) : (
            <TrafficSources sources={[]} />
          )}
        </div>
      </div>

      {/* Info GA4 */}
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="overflow-hidden rounded-2xl border border-[#2a2a2a] bg-[#151515]">
          <div className="border-b border-[#222] px-6 py-4">
            <h2 className="text-base font-bold text-white">Google Analytics 4</h2>
            <p className="text-xs text-[#555]">Propriedade conectada ao site</p>
          </div>
          <div className="space-y-4 p-6">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#555]">
                Measurement ID
              </p>
              <p className="mt-1 font-mono text-sm text-[#ffea00]">{GA_ID}</p>
            </div>
            <a
              href="https://analytics.google.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-lg border border-[#333] px-4 py-2 text-sm text-[#ccc] transition-colors hover:border-[#ffea00]/40 hover:text-[#ffea00]"
            >
              Abrir GA4
              <ExternalLink className="size-3.5" />
            </a>
            <p className="text-xs leading-relaxed text-[#555]">
              Os dados podem ter atraso de algumas horas em relação ao Tempo real.
              Este painel atualiza a cada 5 minutos.
            </p>
          </div>
        </div>

        <div className="overflow-hidden rounded-2xl border border-[#2a2a2a] bg-[#151515]">
          <div className="border-b border-[#222] px-6 py-4">
            <div className="flex items-center gap-2">
              <MousePointerClick className="size-4 text-[#ffea00]" />
              <h2 className="text-base font-bold text-white">Eventos rastreados</h2>
            </div>
            <p className="text-xs text-[#555]">Configurados no site público</p>
          </div>
          <ul className="divide-y divide-[#1a1a1a]">
            {TRACKED_EVENTS.map((event) => (
              <li key={event.name} className="px-6 py-4">
                <p className="font-mono text-sm text-[#ffea00]">{event.name}</p>
                <p className="mt-1 text-xs text-[#666]">{event.description}</p>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  )
}
