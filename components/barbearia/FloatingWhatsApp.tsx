"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { trackGenerateLead } from "@/lib/analytics/gtag";

const WHATSAPP_MSG =
  "Olá! Vocês estão atendendo hoje? Tô pensando em passar aí — é por ordem de chegada?";

export default function FloatingWhatsApp() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const hero = document.getElementById("hero");
    if (!hero) {
      setVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => setVisible(!entry.isIntersecting),
      { threshold: 0 }
    );

    observer.observe(hero);
    return () => observer.disconnect();
  }, []);

  const handleClick = () => {
    trackGenerateLead("floating");
    const url = `https://wa.me/5514997216010?text=${encodeURIComponent(WHATSAPP_MSG)}`;
    window.open(url, "_blank");
  };

  return (
    <motion.button
      onClick={handleClick}
      initial={false}
      animate={{
        opacity: visible ? 1 : 0,
        scale: visible ? 1 : 0.8,
      }}
      transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
      whileHover={visible ? { scale: 1.12 } : undefined}
      whileTap={visible ? { scale: 0.95 } : undefined}
      aria-label="Contato via WhatsApp"
      aria-hidden={!visible}
      tabIndex={visible ? 0 : -1}
      className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full transition-all duration-300"
      style={{
        background: "#0a0a0a",
        border: "2px solid #ffea00",
        boxShadow: "0 0 16px rgba(255,234,0,0.3)",
        pointerEvents: visible ? "auto" : "none",
      }}
      onMouseEnter={(e) => {
        const el = e.currentTarget;
        el.style.background = "#ffea00";
        el.style.boxShadow = "0 0 28px rgba(255,234,0,0.5)";
      }}
      onMouseLeave={(e) => {
        const el = e.currentTarget;
        el.style.background = "#0a0a0a";
        el.style.boxShadow = "0 0 16px rgba(255,234,0,0.3)";
      }}
    >
      <svg
        viewBox="0 0 448 512"
        className="h-6 w-6 transition-colors duration-300"
        style={{ fill: "#ffea00" }}
        aria-hidden="true"
      >
        <path d="M380.9 97.1C339 55.1 283.2 32 223.9 32c-122.4 0-221.7 99.3-221.7 221.7 0 39.1 10.2 77.3 29.6 111L0 480l118.7-30.9c32.6 17.8 69.5 27.2 107.2 27.2h.1c122.4 0 221.7-99.3 221.7-221.7 0-59.3-23.1-115-65-157zM223.9 438.6c-33.5 0-66.2-9-94.7-26l-6.8-4-70.4 18.3 18.8-68.6-4.4-7c-18.6-29.6-28.4-63.7-28.4-98.6 0-101.7 82.8-184.5 184.5-184.5 49.3 0 95.6 19.2 130.4 54.1 34.9 34.9 54.1 81.2 54.1 130.4 0 101.7-82.8 184.5-184.5 184.5zm101.3-138.2c-5.5-2.8-32.5-16-37.6-17.8-5.1-1.9-8.8-2.8-12.6 2.8-3.7 5.5-14.4 17.8-17.7 21.5-3.2 3.7-6.5 4.2-12 1.4-32.6-16.3-53.9-29.1-75.4-66-5.7-9.8 5.7-9.1 16.3-30.3 1.8-3.7.9-6.9-.5-9.7-1.4-2.8-12.6-30.4-17.3-41.6-4.5-10.8-9.1-9.3-12.6-9.5-3.2-.1-6.9-.1-10.6-.1s-9.7 1.4-14.8 6.9c-5.1 5.5-19.5 19-19.5 46.3s20 53.8 22.8 57.5c2.8 3.7 39.4 60.2 95.5 84.4 13.4 5.8 23.9 9.3 32 11.9 13.4 4.3 25.6 3.7 35.3 2.2 10.8-1.6 32.5-13.3 37.1-26.2 4.6-12.9 4.6-24 3.2-26.2-1.3-2.3-5-3.7-10.5-6.5z" />
      </svg>
    </motion.button>
  );
}
