"use client"

import dynamic from "next/dynamic"
import { useState } from "react"
import {
  BarChart3,
  DollarSign,
  LayoutDashboard,
  Scissors,
  TrendingUp,
  Wallet,
} from "lucide-react"
import { useFinances } from "@/hooks/use-finances"
import { formatCurrency } from "@/lib/admin/format"
import { getYearMonths } from "@/lib/admin/stats"
import AddEarningPanel from "./AddEarningPanel"
import AddExpensePanel from "./AddExpensePanel"
import StatCard from "./StatCard"
import CategoryBreakdown from "./CategoryBreakdown"
import MonthHeatmap from "./MonthHeatmap"
import RecentEntries from "./RecentEntries"
import RecentExpenses from "./RecentExpenses"
import InsightsPanel from "./InsightsPanel"
import { cn } from "@/lib/utils"

const WeeklyChart = dynamic(() => import("./WeeklyChart"), {
  ssr: false,
  loading: () => <ChartSkeleton />,
})

const YearOverview = dynamic(() => import("./YearOverview"), {
  ssr: false,
  loading: () => <ChartSkeleton />,
})

function ChartSkeleton() {
  return (
    <div className="overflow-hidden rounded-2xl border border-[#2a2a2a] bg-[#151515]">
      <div className="border-b border-[#222] px-6 py-4">
        <div className="h-4 w-32 animate-pulse rounded bg-[#222]" />
        <div className="mt-1.5 h-3 w-24 animate-pulse rounded bg-[#1a1a1a]" />
      </div>
      <div className="flex h-[220px] items-center justify-center text-sm text-[#333]">
        Carregando...
      </div>
    </div>
  )
}

type Tab = "overview" | "earnings" | "expenses"
const TABS: { id: Tab; label: string; icon: React.ElementType }[] = [
  { id: "overview", label: "Visão Geral", icon: LayoutDashboard },
  { id: "earnings", label: "Ganhos", icon: TrendingUp },
  { id: "expenses", label: "Despesas", icon: Wallet },
]

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState<Tab>("overview")

  const {
    entries,
    expenses,
    settings,
    stats,
    ready,
    error,
    addEntry,
    removeEntry,
    addExpense,
    removeExpense,
    updateGoal,
  } = useFinances()

  const yearMonths = getYearMonths(entries, new Date().getFullYear())

  if (!ready) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="flex flex-col items-center gap-4 text-center">
          <div className="flex size-16 items-center justify-center rounded-2xl bg-[#ffea00]/10">
            <Scissors className="size-8 animate-pulse text-[#ffea00]" />
          </div>
          <div>
            <p className="font-semibold text-white">Carregando painel...</p>
            <p className="text-sm text-[#555]">Conectando ao Supabase</p>
          </div>
        </div>
      </div>
    )
  }

  if (error && entries.length === 0) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center px-4">
        <div className="w-full max-w-md overflow-hidden rounded-2xl border border-red-500/20 bg-[#151515]">
          <div className="border-b border-red-500/10 bg-red-500/5 px-6 py-4">
            <p className="font-bold text-red-400">Erro ao conectar</p>
          </div>
          <div className="p-6">
            <p className="text-sm text-[#888]">{error}</p>
            <div className="mt-4 rounded-xl bg-[#0f0f0f] px-4 py-3 text-xs text-[#555]">
              Execute o SQL em{" "}
              <code className="text-[#ffea00]">supabase/migrations/001_admin.sql</code>{" "}
              no SQL Editor do Supabase.
            </div>
          </div>
        </div>
      </div>
    )
  }

  const profitVariant =
    stats.profitThisMonth > 0 ? "profit" : stats.profitThisMonth < 0 ? "loss" : "neutral"

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white">Dashboard</h1>
        <p className="text-sm text-[#666]">Financeiro · ganhos, despesas e metas</p>
      </div>

      {error && (
          <div className="mb-6 flex items-start gap-3 rounded-xl border border-red-500/20 bg-red-500/8 px-4 py-3 text-sm text-red-300">
            <span className="mt-0.5 shrink-0 text-red-400">⚠</span>
            {error}
          </div>
        )}

        {/* KPI row */}
        <div className="mb-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
          <StatCard
            icon={DollarSign}
            label="Faturamento hoje"
            value={formatCurrency(stats.today)}
            change={stats.todayVsYesterday}
            sublabel="vs ontem"
            variant="gold"
          />
          <StatCard
            icon={BarChart3}
            label="Lucro do mês"
            value={formatCurrency(stats.profitThisMonth)}
            sublabel={`despesas: ${formatCurrency(stats.expensesThisMonth)}`}
            variant={profitVariant}
          />
          <StatCard
            icon={TrendingUp}
            label="Faturamento mensal"
            value={formatCurrency(stats.thisMonth)}
            change={stats.monthVsLastMonth}
            sublabel="vs mês passado"
            variant="default"
          />
          <StatCard
            icon={Wallet}
            label="Faturamento anual"
            value={formatCurrency(stats.thisYear)}
            change={stats.yearVsLastYear}
            sublabel="vs ano passado"
            variant="default"
          />
        </div>

        {/* tabs */}
        <div className="mb-6 flex gap-1 rounded-xl border border-[#1a1a1a] bg-[#0f0f0f] p-1">
          {TABS.map((tab) => {
            const Icon = tab.icon
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  "flex flex-1 items-center justify-center gap-2 rounded-lg py-2.5 text-sm font-semibold transition-all",
                  activeTab === tab.id
                    ? "bg-[#1a1a1a] text-white shadow-sm"
                    : "text-[#555] hover:text-[#888]"
                )}
              >
                <Icon className="size-4" />
                <span className="hidden sm:inline">{tab.label}</span>
              </button>
            )
          })}
        </div>

        {/* tab: visão geral */}
        {activeTab === "overview" && (
          <div className="grid gap-6 lg:grid-cols-3">
            <div className="space-y-6 lg:col-span-1">
              <InsightsPanel
                stats={stats}
                monthlyGoal={settings.monthlyGoal}
                onGoalChange={updateGoal}
              />
            </div>

            <div className="space-y-6 lg:col-span-2">
              <WeeklyChart data={stats.last7Days} />

              <div className="grid gap-6 md:grid-cols-2">
                <CategoryBreakdown
                  categories={stats.categoryBreakdown}
                  monthTotal={stats.thisMonth}
                />
                <MonthHeatmap days={stats.monthDays} />
              </div>

              <YearOverview data={yearMonths} yearTotal={stats.thisYear} />
            </div>
          </div>
        )}

        {/* tab: ganhos */}
        {activeTab === "earnings" && (
          <div className="grid gap-6 lg:grid-cols-3">
            <div className="lg:col-span-1">
              <AddEarningPanel onAdd={addEntry} />
            </div>
            <div className="lg:col-span-2">
              <RecentEntries entries={entries} onRemove={removeEntry} />
            </div>
          </div>
        )}

        {/* tab: despesas */}
        {activeTab === "expenses" && (
          <div className="grid gap-6 lg:grid-cols-3">
            <div className="lg:col-span-1">
              <AddExpensePanel onAdd={addExpense} />
            </div>
            <div className="lg:col-span-2">
              <RecentExpenses expenses={expenses} onRemove={removeExpense} />
            </div>
          </div>
        )}
    </div>
  )
}
