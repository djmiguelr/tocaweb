import { useEffect } from 'react';
import { useCity } from '../../context/CityContext';
import { motion, AnimatePresence } from 'framer-motion';
import { BASE_URL } from '../../services/api';

const MODAL_STYLES = {
  overlay: 'fixed inset-0 bg-black/90 backdrop-blur-lg z-[9999] flex items-center justify-center p-4',
  content: 'bg-gradient-to-br from-[#1C1C1C] to-[#2C2C2C] rounded-2xl w-full max-w-2xl p-8 shadow-2xl border border-white/10'
};

export function CitySelectorModal() {
  const { 
    cities, 
    selectedCity, 
    setSelectedCity, 
    isLoading, 
    error, 
    showCitySelector, 
    setShowCitySelector 
  } = useCity();

  // Prevent scroll when modal is open
  useEffect(() => {
    if (showCitySelector) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [showCitySelector]);

  const handleCitySelect = (city) => {
    if (!city) return;
    setSelectedCity(city);
    setShowCitySelector(false);
    localStorage.setItem('selectedCity', JSON.stringify(city));
  };

  if (!showCitySelector) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className={MODAL_STYLES.overlay}
        onClick={(e) => {
          if (e.target === e.currentTarget && selectedCity) {
            setShowCitySelector(false);
          }
        }}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          transition={{ type: "spring", duration: 0.5 }}
          className={MODAL_STYLES.content}
        >
          {isLoading ? (
            <div className="flex items-center justify-center h-40">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
          ) : error ? (
            <div className="text-center py-8">
              <p className="text-red-400 text-lg">{error}</p>
              <button
                onClick={() => window.location.reload()}
                className="mt-4 px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
              >
                Reintentar
              </button>
            </div>
          ) : (
            <>
              <div className="text-center mb-8">
                <motion.h2
                  initial={{ y: -20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.2 }}
                  className="text-3xl font-bold text-white mb-3"
                >
                  Bienvenido a TocaStereo
                </motion.h2>
                <motion.p
                  initial={{ y: -20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.3 }}
                  className="text-gray-400 text-lg"
                >
                  Selecciona tu ciudad para comenzar
                </motion.p>
              </div>

              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar"
              >
                {Array.isArray(cities) && cities.length > 0 ? (
                  cities.map((city, index) => {
                    const cityData = city.attributes || city;
                    const name = cityData.name;
                    const frequency = cityData.frequency;
                    const coverlogUrl = cityData.coverlog?.url || cityData.coverlog?.data?.attributes?.url || null;
                    
                    return (
                      <motion.button
                        key={city.id}
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ delay: 0.1 * index }}
                        onClick={() => handleCitySelect(city)}
                        className="flex items-center p-4 bg-white/5 hover:bg-white/10 rounded-xl transition-all"
                      >
                        <div className="relative w-16 h-16 rounded-lg overflow-hidden mr-4">
                          {coverlogUrl ? (
                            <img
                              src={coverlogUrl.startsWith('http') ? coverlogUrl : `${BASE_URL}${coverlogUrl}`}
                              alt={`Logo ${name}`}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                e.target.src = '/placeholder-cover.jpg';
                              }}
                            />
                          ) : (
                            <div className="w-full h-full bg-white/10 flex items-center justify-center">
                              <span className="text-white/50 text-xs">Sin imagen</span>
                            </div>
                          )}
                        </div>
                        <div className="text-left flex-grow">
                          <h3 className="text-lg font-semibold text-white mb-1">{name}</h3>
                          {frequency && (
                            <p className="text-gray-400 text-sm">{frequency}</p>
                          )}
                        </div>
                      </motion.button>
                    );
                  })
                ) : (
                  <div className="col-span-2 text-center text-gray-400 py-8">
                    No hay ciudades disponibles
                  </div>
                )}
              </motion.div>
            </>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}