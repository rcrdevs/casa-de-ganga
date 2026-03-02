import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import { banners } from '../data/banners';

export const HeroBannerSlider = () => {
  const [current, setCurrent] = useState(0);
  const timeoutRef = useRef(null);

  const next = useCallback(() => setCurrent((prev) => (prev + 1) % banners.length), []);
  const prev = () => setCurrent((prev) => (prev - 1 + banners.length) % banners.length);
  const goTo = (index) => setCurrent(index);

  useEffect(() => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(next, 8000);
    return () => clearTimeout(timeoutRef.current);
  }, [current, next]);

  const handleCTA = (targetId) => {
    document.getElementById(targetId)?.scrollIntoView({ behavior: 'smooth' });
  };

  const banner = banners[current];

  return (
    // Altura grande restaurada, com padding (px-4) para criar as bordas laterais
    <div className="w-full h-[85vh] md:h-[90vh] px-4 md:px-8 py-6 relative group">
      
      {/* Container do Banner - Borda preta e fundo preto */}
      <div className="overflow-hidden rounded-xl border-2 border-ganga-black bg-ganga-black h-full relative shadow-2xl">
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={banner.id}
            initial={{ opacity: 0, scale: 1.02 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
            className="relative h-full w-full"
          >
            <img
              src={banner.image}
              alt={`Banner ${banner.id}`}
              className="absolute inset-0 w-full h-full object-cover opacity-90"
            />
            {/* Gradiente preto para escurecer a imagem e destacar o botão */}
            <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black/40 pointer-events-none" />
            
            {/* Botão Modificado */}
            <div className="absolute bottom-12 left-1/2 -translate-x-1/2 flex justify-center z-20">
              <button
                className="px-12 py-4 bg-ganga-red hover:bg-ganga-red-light text-white rounded-md transition-all duration-300 relative overflow-hidden group shadow-[0_0_15px_rgba(0,0,0,0.8)]"
                onClick={() => handleCTA(banner.targetId)}
              >
                {/* Fonte alterada para Draculitos e texto para "Ver catálogo" */}
                <span className="relative z-10 font-draculitos text-2xl md:text-3xl tracking-widest uppercase">
                  Ver catálogo
                </span>
                <span className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-sm"></span>
              </button>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Setas de Navegação */}
        <button
          onClick={prev}
          className="absolute left-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-black/80 text-white hover:bg-ganga-red transition-all z-20"
        >
          <FaChevronLeft size={16} />
        </button>
        <button
          onClick={next}
          className="absolute right-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-black/80 text-white hover:bg-ganga-red transition-all z-20"
        >
          <FaChevronRight size={16} />
        </button>

        {/* Dots Vermelhos e Brancos */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex justify-center gap-3 z-20">
          {banners.map((b, index) => (
            <button
              key={b.id}
              onClick={() => goTo(index)}
              className={`h-1.5 rounded-full transition-all duration-500 ${
                index === current ? 'w-8 bg-ganga-red' : 'w-2 bg-white/50 hover:bg-white'
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
};