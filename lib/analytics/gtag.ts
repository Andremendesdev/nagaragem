type GtagCommand = "event" | "config" | "js" | "set"

declare global {
  interface Window {
    gtag?: (
      command: GtagCommand,
      targetOrEventName: string,
      params?: Record<string, unknown>
    ) => void
  }
}

function trackEvent(name: string, params?: Record<string, unknown>) {
  if (process.env.NODE_ENV !== "production") {
    console.debug("[GA4]", name, params)
    return
  }

  if (typeof window === "undefined" || !window.gtag) return

  window.gtag("event", name, params)
}

export type LeadSource = "hero" | "floating" | "services"

export function trackGenerateLead(
  source: LeadSource,
  extra?: Record<string, string>
) {
  trackEvent("generate_lead", {
    currency: "BRL",
    lead_source: source,
    ...extra,
  })
}

export function trackInstagramClick() {
  trackEvent("instagram_click", {
    link_location: "hero",
  })
}
