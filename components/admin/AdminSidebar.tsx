"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { BarChart3, LayoutDashboard, Scissors } from "lucide-react"
import { cn } from "@/lib/utils"

const NAV_ITEMS = [
  {
    href: "/admin",
    label: "Dashboard",
    icon: LayoutDashboard,
    exact: true,
  },
  {
    href: "/admin/visitas",
    label: "Visitas",
    icon: BarChart3,
    exact: false,
  },
] as const

function isActive(pathname: string, href: string, exact: boolean) {
  if (exact) return pathname === href
  return pathname === href || pathname.startsWith(`${href}/`)
}

type AdminSidebarProps = {
  onNavigate?: () => void
  className?: string
}

export default function AdminSidebar({ onNavigate, className }: AdminSidebarProps) {
  const pathname = usePathname()

  return (
    <aside
      className={cn(
        "flex h-full w-64 shrink-0 flex-col border-r border-[var(--admin-border-subtle)] bg-[var(--admin-bg-elevated)]",
        className
      )}
    >
      <div className="border-b border-[var(--admin-border-subtle)] px-5 py-5">
        <div className="flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-xl bg-[#ffea00]/15">
            <Scissors className="size-5 text-[#ffea00]" />
          </div>
          <div>
            <p className="text-sm font-bold text-white">Na Garage</p>
            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[var(--admin-text-faint)]">
              Admin
            </p>
          </div>
        </div>
      </div>

      <nav className="flex-1 space-y-1 p-3">
        <p className="px-3 pb-2 text-[10px] font-semibold uppercase tracking-[0.2em] text-[var(--admin-text-muted)]">
          Menu
        </p>
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon
          const active = isActive(pathname, item.href, item.exact)

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onNavigate}
              className={cn(
                "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all",
                active
                  ? "bg-[#ffea00]/10 text-[#ffea00]"
                  : "text-[var(--admin-text-dim)] hover:bg-[var(--admin-hover)] hover:text-white"
              )}
            >
              <Icon className={cn("size-4 shrink-0", active && "text-[#ffea00]")} />
              {item.label}
            </Link>
          )
        })}
      </nav>

      <div className="border-t border-[var(--admin-border-subtle)] p-4">
        <p className="text-[11px] leading-relaxed text-[var(--admin-text-muted)]">
          Painel interno da barbearia. Dados financeiros e visitas do site.
        </p>
      </div>
    </aside>
  )
}
