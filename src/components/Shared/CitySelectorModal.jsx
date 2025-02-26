import { useEffect } from 'react';
import { useCity } from '../../context/CityContext';
import { motion, AnimatePresence } from 'framer-motion';
import { CitySelector } from './CitySelector';

export function CitySelectorModal() {
  const { showCitySelector, setShowCitySelector, isLoading, error } = useCity();

  useEffect(() => {
    if (showCitySelector) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [showCitySelector]);

  if (!showCitySelector) return null;

  if (isLoading) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="text-white mt-4">Cargando ciudades...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm">
        <div className="text-center">
          <p className="text-red-500 text-lg">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm"
      >
        <div className="w-full max-w-6xl mx-auto px-4 py-8 md:py-12">
          <div className="text-center mb-8 md:mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Selecciona tu Ciudad
            </h2>
            <p className="text-gray-300 text-lg">
              Escoge tu ciudad para disfrutar del mejor contenido
            </p>
          </div>
          <CitySelector variant="modal" onClose={() => setShowCitySelector(false)} />
        </div>
      </motion.div>
    </AnimatePresence>
  );
}