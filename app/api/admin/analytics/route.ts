import { NextResponse } from "next/server"
import { fetchVisitsAnalytics } from "@/lib/analytics/ga4-server"
import { getAdminEmail, isAdminEmail } from "@/lib/auth/admin"
import { createClient } from "@/lib/supabase/server"

export const dynamic = "force-dynamic"

export async function GET() {
  if (!getAdminEmail()) {
    return NextResponse.json(
      { ok: false, error: "admin_not_configured" },
      { status: 503 }
    )
  }

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user || !isAdminEmail(user.email)) {
    return NextResponse.json(
      { ok: false, error: "unauthorized" },
      { status: 403 }
    )
  }

  try {
    const data = await fetchVisitsAnalytics()

    return NextResponse.json(
      { ok: true, data },
      {
        headers: {
          "Cache-Control": "private, max-age=300",
        },
      }
    )
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Erro ao buscar analytics"
    return NextResponse.json({ ok: false, error: message }, { status: 502 })
  }
}
