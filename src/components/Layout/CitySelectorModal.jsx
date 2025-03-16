import { motion, AnimatePresence } from 'framer-motion';
import { useCity } from '../../context/CityContext';
import { useHeader } from '../../context/HeaderContext';
import { MdRadio } from 'react-icons/md';
import { BiX } from 'react-icons/bi';

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

  const { headerInfo } = useHeader();

  const renderLogo = () => {
    if (headerInfo?.logo?.url) {
      return (
        <img
          src={headerInfo.logo.url}
          alt={headerInfo.title}
          className="h-20 md:h-28 w-auto"
        />
      );
    }

    return (
      <span className="text-3xl md:text-4xl font-bold">{headerInfo?.title || 'Toca Stereo'}</span>
    );
  };

  return (
    <AnimatePresence>
      {showCitySelector && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
          {/* Overlay de fondo */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/90 backdrop-blur-md"
            onClick={() => setShowCitySelector(false)}
          />
          
          {/* Modal */}
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            transition={{ type: 'spring', duration: 0.5, bounce: 0.3 }}
            className="relative w-full max-w-2xl bg-[#1C1C1C] rounded-2xl shadow-2xl overflow-hidden"
          >
            {/* Header */}
            <div className="relative px-4 pt-6 pb-4 border-b border-white/10 text-center">
              <div className="absolute right-2 top-2">
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setShowCitySelector(false)}
                  className="p-2 text-white/60 hover:text-white transition-colors"
                >
                  <BiX className="w-6 h-6" />
                </motion.button>
              </div>
              
              <div className="flex flex-col items-center gap-4">
                <motion.div
                  initial={{ scale: 0.95 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', bounce: 0.4 }}
                >
                  {renderLogo()}
                </motion.div>
                <h2 className="text-2xl md:text-3xl font-bold text-white">
                  Selecciona tu ciudad
                </h2>
              </div>
            </div>

            {/* Contenido */}
            <div className="p-4 max-h-[60vh] overflow-y-auto">
              {isLoading ? (
                <div className="flex flex-col items-center justify-center py-8 text-white/60">
                  <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mb-3" />
                  <p>Cargando ciudades...</p>
                </div>
              ) : error ? (
                <div className="text-center py-8">
                  <div className="text-red-500 text-lg mb-2">
                    {error}
                  </div>
                  <button
                    onClick={() => window.location.reload()}
                    className="text-primary hover:text-primary-hover transition-colors"
                  >
                    Intentar de nuevo
                  </button>
                </div>
              ) : cities.length === 0 ? (
                <div className="text-center py-8 text-white/60">
                  No hay ciudades disponibles
                </div>
              ) : (
                <div className="grid gap-3 grid-cols-1 sm:grid-cols-2">
                  {cities.map((city) => (
                    <motion.button
                      key={city.id}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => {
                        setSelectedCity(city);
                        setShowCitySelector(false);
                      }}
                      className={`group p-3 rounded-xl border transition-all duration-300 ${
                        selectedCity?.id === city.id
                          ? 'border-primary bg-primary/10 shadow-lg shadow-primary/20'
                          : 'border-white/10 hover:border-white/20 hover:bg-white/5'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        {city.coverlog?.url ? (
                          <div className="w-14 h-14 rounded-lg overflow-hidden">
                            <img
                              src={city.coverlog.url}
                              alt={city.name}
                              className="w-full h-full object-cover transform transition-transform group-hover:scale-110"
                            />
                          </div>
                        ) : (
                          <div className="w-14 h-14 rounded-lg bg-white/5 flex items-center justify-center">
                            <MdRadio className="w-7 h-7 text-white/40" />
                          </div>
                        )}
                        <div className="text-left flex-1 min-w-0">
                          <h3 className="font-medium text-white text-lg truncate">
                            {city.name}
                          </h3>
                          <p className="text-white/60 truncate">
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
        </div>
      )}
    </AnimatePresence>
  );
}