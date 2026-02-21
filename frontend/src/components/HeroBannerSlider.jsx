import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import { banners } from '../data/banners';

export const HeroBannerSlider = () => {
  const [current, setCurrent] = useState(0);
  const timeoutRef = useRef(null);

  const next = useCallback(() => {
    setCurrent((prev) => (prev + 1) % banners.length);
  }, []);

  const prev = () => {
    setCurrent((prev) => (prev - 1 + banners.length) % banners.length);
  };

  const goTo = (index) => {
    setCurrent(index);
  };

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
    <div className="w-full h-full relative">
      <div className="overflow-hidden rounded-2xl border border-gray-800 bg-black h-full">
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={banner.id}
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -40 }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
            className="relative h-full w-full"
          >
            <img
              src={banner.image}
              alt={`Banner ${banner.id}`}
              className="absolute inset-0 w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20 pointer-events-none" />
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex justify-center">
              <button
                className="px-8 py-3 bg-red-900 hover:bg-red-800 text-white rounded-lg font-semibold transition-all duration-300 relative overflow-hidden group border border-red-700/50"
                onClick={() => handleCTA(banner.targetId)}
              >
                <span className="relative z-10">Ver catálogo</span>
                <span className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-md"></span>
              </button>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      <button
        onClick={prev}
        className="absolute left-3 md:left-5 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/50 border border-red-800/60 text-white hover:bg-black/70 hover:border-red-600 shadow-lg transition z-10"
        aria-label="Slide anterior"
      >
        <FaChevronLeft />
      </button>
      <button
        onClick={next}
        className="absolute right-3 md:right-5 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/50 border border-red-800/60 text-white hover:bg-black/70 hover:border-red-600 shadow-lg transition z-10"
        aria-label="Próximo slide"
      >
        <FaChevronRight />
      </button>

      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex justify-center gap-2 z-10">
        {banners.map((b, index) => (
          <button
            key={b.id}
            onClick={() => goTo(index)}
            className={`h-2 rounded-full transition-all ${
              index === current ? 'w-6 bg-red-600' : 'w-2 bg-gray-600 hover:bg-red-500'
            }`}
            aria-label={`Ir para slide ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
};