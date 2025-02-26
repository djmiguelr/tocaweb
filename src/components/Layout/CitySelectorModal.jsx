import { motion, AnimatePresence } from 'framer-motion';
import { useCity } from '../../context/CityContext';
import { constants } from '../../services/api';

export function CitySelectorModal() {
  const { 
    cities, 
    selectedCity, 
    setSelectedCity, 
    showCitySelector, 
    setShowCitySelector,
    isLoading,
    error 
  } = useCity();

  if (!showCitySelector) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[9999] flex items-center justify-center p-4"
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="bg-[#1C1C1C] rounded-xl shadow-xl max-w-lg w-full max-h-[80vh] overflow-hidden"
        >
          <div className="p-6 border-b border-white/10">
            <h2 className="text-2xl font-bold text-white">
              Selecciona tu ciudad
            </h2>
          </div>

          <div className="p-6 overflow-y-auto">
            {isLoading ? (
              <div className="text-center text-white/60">
                Cargando ciudades...
              </div>
            ) : error ? (
              <div className="text-center text-red-500">
                {error}
              </div>
            ) : cities.length === 0 ? (
              <div className="text-center text-white/60">
                No hay ciudades disponibles
              </div>
            ) : (
              <div className="grid gap-4 grid-cols-1 sm:grid-cols-2">
                {cities.map((city) => (
                  <motion.button
                    key={city.id}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => {
                      setSelectedCity(city);
                      setShowCitySelector(false);
                    }}
                    className={`p-4 rounded-lg border transition-colors ${
                      selectedCity?.id === city.id
                        ? 'border-primary bg-primary/10'
                        : 'border-white/10 hover:border-white/20 hover:bg-white/5'
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      {city.coverlog_url && (
                        <img
                          src={city.coverlog_url}
                          alt={city.name}
                          className="w-16 h-16 rounded-lg object-cover"
                        />
                      )}
                      <div className="text-left">
                        <h3 className="font-medium text-white">
                          {city.name}
                        </h3>
                        <p className="text-sm text-white/60">
                          {city.frequency}
                        </p>
                      </div>
                    </div>
                  </motion.button>
                ))}
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
} 