import { useEffect } from 'react';
import { useCity } from '../../context/CityContext';
import { BASE_URL } from '../../services/api';
import { motion, AnimatePresence } from 'framer-motion';

export default function CitySelector() {
  const { cities, selectedCity, setSelectedCity, showCitySelector, setShowCitySelector, isLoading, error } = useCity();

  const handleCitySelect = (city) => {
    setSelectedCity(city);
    localStorage.setItem('selectedCity', JSON.stringify(city));
    setShowCitySelector(false);
  };

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

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {cities && cities.length > 0 ? (
              cities.map((city) => (
                <motion.button
                  key={city.id}
                  onClick={() => handleCitySelect(city)}
                  className="group relative overflow-hidden rounded-xl bg-white/5 p-4 transition-all hover:bg-white/10"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div className="aspect-video w-full overflow-hidden rounded-lg mb-4">
                    {city.coverlog?.url ? (
                      <img
                        src={city.coverlog.url}
                        alt={city.name}
                        className="h-full w-full object-cover transition-transform group-hover:scale-105"
                        onError={(e) => {
                          e.target.src = '/placeholder-city.jpg';
                        }}
                      />
                    ) : (
                      <div className="h-full w-full bg-gray-800 flex items-center justify-center">
                        <span className="text-gray-500">Sin imagen</span>
                      </div>
                    )}
                  </div>

                  <div className="text-center">
                    <h3 className="text-xl font-bold text-white mb-2">{city.name}</h3>
                    <p className="text-primary">{city.frequency}</p>
                  </div>

                  {selectedCity?.id === city.id && (
                    <div className="absolute inset-0 flex items-center justify-center bg-primary/20 backdrop-blur-sm">
                      <span className="text-white font-bold text-lg">Ciudad Seleccionada</span>
                    </div>
                  )}
                </motion.button>
              ))
            ) : (
              <div className="col-span-full text-center text-white text-lg">
                No hay ciudades disponibles
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}