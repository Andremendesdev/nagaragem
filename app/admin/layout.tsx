import type { Metadata } from "next"
import { redirect } from "next/navigation"
import AdminShell from "@/components/admin/AdminShell"
import { getAdminEmail, isAdminEmail } from "@/lib/auth/admin"
import { createClient } from "@/lib/supabase/server"

export const metadata: Metadata = {
  title: "Admin | Na Garage",
  description: "Painel administrativo da barbearia",
}

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  if (!getAdminEmail()) {
    redirect("/login?error=admin_not_configured")
  }

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user || !isAdminEmail(user.email)) {
    redirect("/login")
  }

  return <AdminShell>{children}</AdminShell>
}
