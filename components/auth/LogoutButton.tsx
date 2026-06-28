"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Loader2, LogOut } from "lucide-react"
import { useAuth } from "@/hooks/useAuth"
import { Button } from "@/components/ui/button"

export default function LogoutButton() {
  const router = useRouter()
  const { user, signOut } = useAuth()
  const [loading, setLoading] = useState(false)

  async function handleLogout() {
    setLoading(true)
    await signOut()
    router.push("/login")
    router.refresh()
  }

  if (!user) return null

  return (
    <Button
      type="button"
      variant="outline"
      disabled={loading}
      onClick={handleLogout}
      className="border-[var(--admin-border-muted)] bg-transparent text-[var(--admin-text-dim)] hover:border-red-500/50 hover:bg-red-500/10 hover:text-red-600"
    >
      {loading ? (
        <Loader2 className="size-4 animate-spin" />
      ) : (
        <LogOut className="size-4" />
      )}
      Sair
    </Button>
  )
}
