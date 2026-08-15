"use client";

import { motion, useInView, AnimatePresence } from "framer-motion";
import { useRef, useState, useEffect } from "react";
import { X } from "lucide-react";
import { urlForImage } from "../../sanity/lib/image";

export type CanalhaPhotoType = {
  _id: string;
  image: any;
  alt: string;
};

function GalleryItem({
  photo,
  index,
}: {
  photo: CanalhaPhotoType;
  index: number;
}) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });
  const [isActive, setIsActive] = useState(false);
  const imageUrl = photo.image ? urlForImage(photo.image)?.url() : "";

  return (
    <motion.div
      ref={ref}
      className="relative overflow-hidden rounded-xl sm:rounded-2xl cursor-pointer aspect-square md:aspect-auto md:min-h-[280px]"
      initial={{ opacity: 0, scale: 0.96 }}
      animate={inView ? { opacity: 1, scale: 1 } : {}}
      transition={{
        duration: 0.7,
        ease: [0.22, 1, 0.36, 1],
        delay: index * 0.1,
      }}
      onHoverStart={() => setIsActive(true)}
      onHoverEnd={() => setIsActive(false)}
      onClick={() => setIsActive(!isActive)}
    >
      {imageUrl && (
        <motion.img
          src={imageUrl}
          alt={photo.alt}
          className="w-full h-full object-cover absolute inset-0 bg-zinc-800"
          animate={{
            scale: isActive ? 1.12 : 1,
            filter: isActive ? "grayscale(0%)" : "grayscale(100%)",
          }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        />
      )}
      <motion.div
        className="absolute inset-0"
        animate={{
          background: isActive
            ? "linear-gradient(to top, rgba(10,10,10,0.6) 0%, transparent 60%)"
            : "rgba(10,10,10,0.3)",
        }}
        transition={{ duration: 0.4 }}
      />
      <motion.div
        className="absolute inset-0 rounded-2xl pointer-events-none"
        animate={{
          boxShadow: isActive
            ? "inset 0 0 0 2px rgba(255,234,0,0.5)"
            : "inset 0 0 0 0px rgba(255,234,0,0)",
        }}
        transition={{ duration: 0.3 }}
      />
    </motion.div>
  );
}

export default function GalleryPic({ photos = [] }: { photos?: CanalhaPhotoType[] }) {
  const titleRef = useRef(null);
  const titleInView = useInView(titleRef, { once: true, margin: "-60px" });
  
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Travar o scroll do body quando o modal estiver aberto
  useEffect(() => {
    if (isModalOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isModalOpen]);

  const displayedPhotos = photos.slice(0, 3);
  const hasMorePhotos = photos.length > 3;

  return (
    <section
      id="clube-dos-canalhas"
      className="py-28 px-6"
      style={{ background: "#0a0a0a" }}
    >
      <div className="max-w-5xl mx-auto">
        {/* Heading */}
        <motion.div
          ref={titleRef}
          initial={{ opacity: 0, y: 32 }}
          animate={titleInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="text-center mb-16"
        >
          <span className="text-[10px] tracking-[0.35em] uppercase text-zinc-500 block mb-4">
            Nossa Galeria
          </span>
          <h2 className="font-serif text-4xl sm:text-5xl font-bold uppercase tracking-wide text-white">
            Clube dos{" "}
            <span
              style={{
                color: "#ffea00",
                textShadow: "0 0 10px rgba(255,234,0,0.3)",
              }}
            >
              Canalhas
            </span>
          </h2>
          <div
            className="mx-auto mt-6 h-px w-16"
            style={{
              background:
                "linear-gradient(to right, transparent, #ffea00, transparent)",
            }}
          />
        </motion.div>

        {photos.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-20 border border-zinc-800 rounded-2xl bg-zinc-900/30"
          >
            <p className="text-zinc-400 text-lg sm:text-xl uppercase tracking-widest font-serif">
              Em breve fotos dos Canalhas
            </p>
          </motion.div>
        ) : (
          <>
            <div className="grid grid-cols-3 gap-2 sm:gap-4">
              {displayedPhotos.map((photo, i) => (
                <GalleryItem key={photo._id || i} photo={photo} index={i} />
              ))}
            </div>

            {hasMorePhotos && (
              <div className="mt-12 flex justify-center">
                <button
                  onClick={() => setIsModalOpen(true)}
                  className="px-8 py-3 rounded-full border border-[#ffea00] text-[#ffea00] uppercase tracking-widest text-xs font-bold hover:bg-[#ffea00] hover:text-black transition-all duration-300"
                >
                  Ver Mais
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {/* Modal / Menu tela inteira com as fotos */}
      <AnimatePresence>
        {isModalOpen && (
          <motion.div
            initial={{ opacity: 0, y: "100%" }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: "100%" }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            className="fixed inset-0 z-50 bg-[#080808] flex flex-col"
          >
            {/* Header do Modal */}
            <div className="p-6 flex justify-between items-center bg-[#0a0a0a] border-b border-zinc-800 sticky top-0 z-10">
              <h3 className="font-serif text-2xl uppercase tracking-wide text-white">
                Clube dos <span className="text-[#ffea00]">Canalhas</span>
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-2 text-zinc-400 hover:text-[#ffea00] transition-colors"
              >
                <X size={28} />
              </button>
            </div>
            
            {/* Grid de fotos no modal: 3 colunas mobile e desktop */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6">
              <div className="max-w-7xl mx-auto">
                <div className="grid grid-cols-3 gap-2 sm:gap-4">
                  {photos.map((photo, i) => (
                    <div 
                      key={photo._id || i} 
                      className="relative overflow-hidden rounded-xl sm:rounded-2xl group cursor-pointer aspect-square md:aspect-auto md:min-h-[350px]"
                    >
                      {photo.image && (
                        <img
                          src={urlForImage(photo.image)?.url() || ""}
                          alt={photo.alt}
                          className="w-full h-full object-cover absolute inset-0 bg-zinc-800 transition-transform duration-700 group-hover:scale-110"
                        />
                      )}
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                      <div className="absolute inset-0 rounded-xl sm:rounded-2xl pointer-events-none box-border border-2 border-transparent group-hover:border-[#ffea00]/50 transition-colors duration-300" />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}

