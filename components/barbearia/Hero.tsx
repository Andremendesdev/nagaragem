"use client";

import { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { trackGenerateLead, trackInstagramClick } from "@/lib/analytics/gtag";
import { usePageReady } from "@/components/barbearia/LoadingScreen";

const WHATSAPP_LINK =
  "https://wa.me/5514997216010?text=Ol%C3%A1!%20Voc%C3%AAs%20est%C3%A3o%20atendendo%20hoje%3F!";

const fadeUp = {
  hidden: { opacity: 0, y: 28 },
  visible: (delay = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1] as const, delay },
  }),
};

export default function Hero() {
  const { canPlayHeroVideo, markHeroVideoReady } = usePageReady();
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleReady = () => {
      markHeroVideoReady();
      void video.play().catch(() => {});
    };

    if (video.readyState >= HTMLMediaElement.HAVE_FUTURE_DATA) {
      handleReady();
      return;
    }

    video.addEventListener("canplay", handleReady, { once: true });
    video.addEventListener("error", handleReady, { once: true });

    return () => {
      video.removeEventListener("canplay", handleReady);
      video.removeEventListener("error", handleReady);
    };
  }, [markHeroVideoReady]);

  useEffect(() => {
    const video = videoRef.current;
    if (!canPlayHeroVideo || !video) return;

    video.currentTime = 0;
    void video.play().catch(() => {});
  }, [canPlayHeroVideo]);

  return (
    <section id="hero" className="relative flex min-h-screen flex-col overflow-hidden pt-40">
      {/* Vídeo de fundo cinematográfico */}
      <div className="absolute inset-0 z-0" aria-hidden="true">
        <video
          ref={videoRef}
          muted
          loop
          playsInline
          preload="auto"
          className="h-full w-full object-cover"
          src="/herovid.mp4"
        />
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(to bottom, rgba(10,10,10,0.38) 0%, rgba(10,10,10,0.52) 45%, rgba(10,10,10,0.78) 100%)",
          }}
        />
        <div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse at center, transparent 35%, rgba(10,10,10,0.28) 100%)",
          }}
        />
      </div>

      {/* Instagram button */}
      <motion.a
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.6 }}
        href="https://instagram.com/nagaragebarbearia"
        target="_blank"
        rel="noopener noreferrer"
        onClick={() => trackInstagramClick()}
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.95 }}
        className="absolute top-20 right-5 z-20 flex h-14 w-14 items-center justify-center rounded-full md:top-24 md:right-8"
        style={{
          border: "1.5px solid #ffea00",
          color: "#ffea00",
          background: "rgba(10,10,10,0.45)",
          boxShadow:
            "0 0 10px rgba(255,234,0,0.25), inset 0 0 10px rgba(255,234,0,0.05)",
          backdropFilter: "blur(8px)",
        }}
        onMouseEnter={(e) => {
          const el = e.currentTarget;
          el.style.background = "#ffea00";
          el.style.color = "#0a0a0a";
          el.style.boxShadow = "0 0 25px rgba(255,234,0,0.55)";
        }}
        onMouseLeave={(e) => {
          const el = e.currentTarget;
          el.style.background = "rgba(10,10,10,0.45)";
          el.style.color = "#ffea00";
          el.style.boxShadow =
            "0 0 10px rgba(255,234,0,0.25), inset 0 0 10px rgba(255,234,0,0.05)";
        }}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 448 512"
          className="w-[22px] h-[22px] fill-current"
        >
          <path d="M224.1 141c-63.6 0-115.1 51.5-115.1 115.1S160.5 371.2 224.1 371.2 339.2 319.7 339.2 256.1 287.7 141 224.1 141zm0 189.6c-41.1 0-74.5-33.4-74.5-74.5s33.4-74.5 74.5-74.5 74.5 33.4 74.5 74.5-33.4 74.5-74.5 74.5zm146.4-194.3c0 14.9-12 26.9-26.9 26.9-14.9 0-26.9-12-26.9-26.9 0-14.9 12-26.9 26.9-26.9 14.9 0 26.9 12 26.9 26.9zM398.8 80c-22.1-22.1-51.3-34.2-82.6-34.2H131.8c-64.4 0-116.8 52.4-116.8 116.8v184.3c0 31.3 12.2 60.5 34.2 82.6 22.1 22.1 51.3 34.2 82.6 34.2h184.3c64.4 0 116.8-52.4 116.8-116.8V162.6c0-31.3-12.1-60.5-34.1-82.6zM398 346.9c0 45.2-36.7 81.9-81.9 81.9H131.8c-21.9 0-42.4-8.5-57.9-24-15.5-15.5-24-36-24-57.9V162.6c0-45.2 36.7-81.9 81.9-81.9h184.3c21.9 0 42.4 8.5 57.9 24 15.5 15.5 24 36 24 57.9v184.3z" />
        </svg>
      </motion.a>

      {/* Conteúdo — centralizado no mobile, esquerda no desktop */}
      <div className="relative z-10 flex flex-col items-center justify-center px-5 pb-16 pt-8 text-center md:min-h-screen md:pt-0">
        <div className="w-full max-w-7xl md:mx-auto md:flex md:-translate-y-6 md:flex-col md:items-start md:px-6 md:text-left lg:px-8">
        {/* Eyebrow */}
        <motion.span
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          custom={0.1}
          className="gold-glow inline-block rounded-full border border-[#ffea00]/60 px-4 py-1.5 text-[9px] uppercase tracking-[0.3em] md:text-[10px] md:tracking-[0.35em] mb-5"
        >
          Desde 2019 · Piraju, SP
        </motion.span>

        {/* Main heading */}
        <motion.h1
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          custom={0.25}
          className="font-serif text-[2.75rem] font-bold leading-none tracking-tight mb-5 sm:text-6xl md:text-5xl lg:text-6xl"
        >
          NA GARAGE <span className="gold-glow block">BARBEARIA</span>
        </motion.h1>

        {/* Taglines */}
        <motion.div
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          custom={0.4}
          className="font-serif italic text-zinc-400 text-sm sm:text-base space-y-1 mb-9"
        >
          <p>Cortes sem frescura. Atendimento de respeito.</p>
          <p>Estilo sem enrolação.</p>
          <p className="text-zinc-300 not-italic font-medium mt-2">
            Se sair bonito, não foi por acaso.
          </p>
        </motion.div>

        {/* CTA */}
        <motion.a
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          custom={0.55}
          href={WHATSAPP_LINK}
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => trackGenerateLead("hero")}
          whileHover={{ scale: 1.04, y: -2 }}
          whileTap={{ scale: 0.97 }}
          className="inline-flex w-full max-w-xs items-center justify-center gap-2.5 rounded-3xl px-6 py-3.5 text-xs font-semibold uppercase tracking-widest backdrop-blur-md transition-all duration-300 sm:w-auto md:justify-start md:px-8 md:py-4 md:text-sm"
          style={{
            border: "2px solid #ffea00",
            color: "#ffea00",
            background: "rgba(10, 10, 10, 0.35)",
            backdropFilter: "blur(8px)",
            boxShadow:
              "0 0 12px rgba(255,234,0,0.25), inset 0 0 12px rgba(255,234,0,0.05)",
            textShadow: "0 0 10px #ffea00",
          }}
          onMouseEnter={(e) => {
            const el = e.currentTarget;
            el.style.background = "#ffea00";
            el.style.backdropFilter = "none";
            el.style.color = "#0a0a0a";
            el.style.textShadow = "none";
            el.style.boxShadow = "0 0 30px rgba(255,234,0,0.5)";
          }}
          onMouseLeave={(e) => {
            const el = e.currentTarget;
            el.style.background = "rgba(10, 10, 10, 0.35)";
            el.style.backdropFilter = "blur(8px)";
            el.style.color = "#ffea00";
            el.style.textShadow = "0 0 10px #ffea00";
            el.style.boxShadow =
              "0 0 12px rgba(255,234,0,0.25), inset 0 0 12px rgba(255,234,0,0.05)";
          }}
        >
          <svg
            viewBox="0 0 448 512"
            className="w-4 h-4 shrink-0 fill-current"
            aria-hidden="true"
          >
            <path d="M380.9 97.1C339 55.1 283.2 32 223.9 32c-122.4 0-221.7 99.3-221.7 221.7 0 39.1 10.2 77.3 29.6 111L0 480l118.7-30.9c32.6 17.8 69.5 27.2 107.2 27.2h.1c122.4 0 221.7-99.3 221.7-221.7 0-59.3-23.1-115-65-157zM223.9 438.6c-33.5 0-66.2-9-94.7-26l-6.8-4-70.4 18.3 18.8-68.6-4.4-7c-18.6-29.6-28.4-63.7-28.4-98.6 0-101.7 82.8-184.5 184.5-184.5 49.3 0 95.6 19.2 130.4 54.1 34.9 34.9 54.1 81.2 54.1 130.4 0 101.7-82.8 184.5-184.5 184.5zm101.3-138.2c-5.5-2.8-32.5-16-37.6-17.8-5.1-1.9-8.8-2.8-12.6 2.8-3.7 5.5-14.4 17.8-17.7 21.5-3.2 3.7-6.5 4.2-12 1.4-32.6-16.3-53.9-29.1-75.4-66-5.7-9.8 5.7-9.1 16.3-30.3 1.8-3.7.9-6.9-.5-9.7-1.4-2.8-12.6-30.4-17.3-41.6-4.5-10.8-9.1-9.3-12.6-9.5-3.2-.1-6.9-.1-10.6-.1s-9.7 1.4-14.8 6.9c-5.1 5.5-19.5 19-19.5 46.3s20 53.8 22.8 57.5c2.8 3.7 39.4 60.2 95.5 84.4 13.4 5.8 23.9 9.3 32 11.9 13.4 4.3 25.6 3.7 35.3 2.2 10.8-1.6 32.5-13.3 37.1-26.2 4.6-12.9 4.6-24 3.2-26.2-1.3-2.3-5-3.7-10.5-6.5z" />
          </svg>
          Atendimento por ordem de chegada
        </motion.a>
        </div>
      </div>

      {/* Scroll cue — só desktop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2, duration: 0.8 }}
        className="absolute bottom-6 left-1/2 z-10 hidden -translate-x-1/2 flex-col items-center gap-2 md:flex"
        aria-hidden="true"
      >
        <span className="text-[10px] tracking-widest text-zinc-600 uppercase">
          Rolar
        </span>
        <motion.div
          animate={{ y: [0, 6, 0] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
          className="w-px h-8 bg-gradient-to-b from-zinc-600 to-transparent"
        />
      </motion.div>

      {/* Bottom divider line */}
      <div
        className="absolute bottom-0 left-0 right-0 z-10 h-px"
        style={{
          background:
            "linear-gradient(to right, transparent, rgba(255,234,0,0.4), transparent)",
        }}
      />
    </section>
  );
}
