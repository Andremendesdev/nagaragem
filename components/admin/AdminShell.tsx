"use client"

import Link from "next/link"
import { useState } from "react"
import { ArrowLeft, Calendar, Menu, X } from "lucide-react"
import AdminSidebar from "./AdminSidebar"
import LogoutButton from "@/components/auth/LogoutButton"
import { cn } from "@/lib/utils"
import "@/app/admin/admin-theme.css"

export default function AdminShell({ children }: { children: React.ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <div className="admin-theme flex min-h-screen bg-[var(--admin-bg)] text-[var(--admin-text)]">
      {/* Desktop sidebar */}
      <div className="hidden lg:block">
        <AdminSidebar className="sticky top-0 h-screen" />
      </div>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 lg:hidden"
          onClick={() => setMobileOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Mobile sidebar drawer */}
      <div
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-64 transform transition-transform duration-200 lg:hidden",
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <AdminSidebar onNavigate={() => setMobileOpen(false)} className="h-full" />
      </div>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 border-b border-[var(--admin-border-subtle)] bg-[var(--admin-bg)]/95 backdrop-blur-sm">
          <div className="flex items-center gap-3 px-4 py-3 sm:px-6">
            <button
              type="button"
              onClick={() => setMobileOpen((v) => !v)}
              className="flex size-9 items-center justify-center rounded-lg border border-[var(--admin-border)] text-[var(--admin-text-dim)] transition-colors hover:text-[var(--admin-text)] lg:hidden"
              aria-label={mobileOpen ? "Fechar menu" : "Abrir menu"}
            >
              {mobileOpen ? <X className="size-5" /> : <Menu className="size-5" />}
            </button>

            <Link
              href="/"
              className="flex items-center gap-2 rounded-lg px-2 py-1.5 text-sm text-[var(--admin-text-faint)] transition-colors hover:text-[#ffea00]"
            >
              <ArrowLeft className="size-4" />
              <span className="hidden sm:inline">Voltar ao site</span>
            </Link>

            <div className="ml-auto flex items-center gap-3">
              <div className="hidden items-center gap-2 text-xs text-[var(--admin-text-faint)] sm:flex">
                <Calendar className="size-3.5" />
                {new Intl.DateTimeFormat("pt-BR", {
                  weekday: "short",
                  day: "numeric",
                  month: "short",
                }).format(new Date())}
              </div>
              <LogoutButton />
            </div>
          </div>
        </header>

        <main className="flex-1">{children}</main>
      </div>
    </div>
  )
}
