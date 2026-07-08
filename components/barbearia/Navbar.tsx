"use client";
import { useState, useEffect } from "react";
import Image from "next/image";
import { Menu, X } from "lucide-react";
import { motion } from "framer-motion";
import StatusBadge from "./StatusBadge";

export default function Navbar({ statusOverride = "auto" }: { statusOverride?: string }) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const hero = document.getElementById("hero");
    if (!hero) {
      const handleScroll = () => setIsScrolled(window.scrollY > 50);
      window.addEventListener("scroll", handleScroll);
      return () => window.removeEventListener("scroll", handleScroll);
    }

    const observer = new IntersectionObserver(
      ([entry]) => setIsScrolled(!entry.isIntersecting),
      { threshold: 0, rootMargin: "-1px 0px 0px 0px" }
    );

    observer.observe(hero);
    return () => observer.disconnect();
  }, []);

  return (
    <motion.nav
      className={`fixed w-full z-50 transition-all duration-300 ${
        isScrolled
          ? "border-b border-white/5 bg-black/80 backdrop-blur-md"
          : "bg-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Adicionado 'relative' aqui para ancorar o menu centralizado */}
        <div className="relative flex justify-between items-center h-20 text-white">
          {/* Lado Esquerdo: Logo */}
          <a
            href="#hero"
            onClick={(e) => {
              e.preventDefault();
              document.getElementById("hero")?.scrollIntoView({ behavior: "smooth" });
            }}
            className="flex shrink-0 items-center"
            aria-label="Na Garage Barbearia — início"
          >
            <Image
              src="/logo1.png"
              alt="Na Garage Barbearia"
              width={80}
              height={80}
              className="h-16 w-16 object-contain sm:h-[4.5rem] sm:w-[4.5rem]"
              priority
            />
          </a>
          {/* CENTRO (Desktop): Links de navegação cravados no meio */}
          <div className="hidden md:flex absolute left-1/2 -translate-x-1/2 items-center">
            <div className="flex gap-8 font-medium text-sm uppercase tracking-wide">
              <a
                className="hover:text-yellow-500 transition-colors cursor-pointer"
                onClick={() => {
                  document
                    .getElementById("gallery")
                    ?.scrollIntoView({ behavior: "smooth" });
                }}
              >
                Galeria
              </a>

              <a
                className="hover:text-yellow-500 transition-colors cursor-pointer"
                onClick={() => {
                  document
                    .getElementById("services")
                    ?.scrollIntoView({ behavior: "smooth" });
                }}
              >
                Serviços
              </a>

              <a
                className="hover:text-yellow-500 transition-colors cursor-pointer"
                onClick={() => {
                  document
                    .getElementById("mapsection")
                    ?.scrollIntoView({ behavior: "smooth" });
                }}
              >
                Localização
              </a>
            </div>
          </div>

          {/* Lado Direito Desktop: Apenas o StatusBadge */}
          <div className="hidden md:flex items-center">
            <StatusBadge statusOverride={statusOverride} />
          </div>

          {/* Mobile: Alinhado e com espaço correto */}
          <div className="flex items-center gap-4 md:hidden">
            <StatusBadge inline statusOverride={statusOverride} />
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="p-2 hover:bg-white/10 rounded-full transition-colors"
            >
              {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Menu Mobile Corrigido */}
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="md:hidden bg-black/95 text-white border-t border-gray-800"
        >
          <div className="flex flex-col p-6 gap-6 text-center text-lg">
            <a
              className="cursor-pointer"
              onClick={() => {
                document
                  .getElementById("gallery")
                  ?.scrollIntoView({ behavior: "smooth" });

                setIsOpen(false);
              }}
            >
              Galeria
            </a>

            <a
              className="cursor-pointer"
              onClick={() => {
                document
                  .getElementById("services")
                  ?.scrollIntoView({ behavior: "smooth" });

                setIsOpen(false);
              }}
            >
              Serviços
            </a>

            <a
              className="cursor-pointer"
              onClick={() => {
                document
                  .getElementById("mapsection")
                  ?.scrollIntoView({ behavior: "smooth" });

                setIsOpen(false);
              }}
            >
              Localização
            </a>
          </div>
        </motion.div>
      )}
    </motion.nav>
  );
}
