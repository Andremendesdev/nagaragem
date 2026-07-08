"use client";

import { useEffect, useState } from "react";

interface StatusInfo {
  open: boolean;
  label: string;
}

function getStatus(override: string = "auto"): StatusInfo {
  if (override === "open") return { open: true, label: "Aberto" };
  if (override === "closed") return { open: false, label: "Fechado" };

  const now = new Date();
  const day = now.getDay(); // 0=Dom, 1=Seg...6=Sab
  const hour = now.getHours();

  const open =
    (day >= 1 && day <= 5 && hour >= 8 && hour < 19) ||
    (day === 6 && hour >= 8 && hour < 16);

  return {
    open,
    label: open ? "Aberto" : "Fechado",
  };
}

interface StatusBadgeProps {
  /** @deprecated mantido por compatibilidade — estilo é igual em todos os usos */
  inline?: boolean;
  statusOverride?: string;
}

export default function StatusBadge({
  statusOverride = "auto",
}: StatusBadgeProps) {
  const [status, setStatus] = useState<StatusInfo>({
    open: false,
    label: "Verificando...",
  });

  useEffect(() => {
    setStatus(getStatus(statusOverride));
    if (statusOverride !== "auto") return;
    const interval = setInterval(() => setStatus(getStatus(statusOverride)), 60_000);
    return () => clearInterval(interval);
  }, [statusOverride]);

  return (
    <span
      className="rounded-xl border px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.22em] backdrop-blur-md sm:px-4 sm:py-2 sm:text-xs"
      style={{
        color: status.open ? "#4ade80" : "#f87171",
        borderColor: status.open ? "#4ade80" : "#f87171",
        background: status.open
          ? "rgba(34,197,94,0.1)"
          : "rgba(248,113,113,0.1)",
        boxShadow: status.open
          ? "0 0 16px rgba(34,197,94,0.25)"
          : "0 0 16px rgba(248,113,113,0.25)",
      }}
    >
      {status.label}
    </span>
  );
}
