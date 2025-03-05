import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCity } from '../../context/CityContext';
import { BiX } from 'react-icons/bi';

export function LocutoresSection() {
  const { selectedCity } = useCity();
  const [selectedLocutor, setSelectedLocutor] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Handle keyboard events for modal
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isModalOpen) {
        setIsModalOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isModalOpen]);

  // Handle modal open
  const handleLocutorClick = useCallback((locutor) => {
    setSelectedLocutor(locutor);
    setIsModalOpen(true);
  }, []);

  // Handle modal close
  const handleCloseModal = useCallback(() => {
    setIsModalOpen(false);
    setTimeout(() => setSelectedLocutor(null), 300); // Clear after animation
  }, []);

  if (!selectedCity?.Locutor?.length) {
    return null;
  }

  return (
    <>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {selectedCity.Locutor.map((locutor) => (
          <motion.button
            key={locutor.id}
            onClick={() => handleLocutorClick(locutor)}
            className="group relative rounded-xl overflow-hidden transition-all duration-300"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <div className="relative pb-[125%]">
              {locutor.coverdj?.url ? (
                <img
                  src={locutor.coverdj.url}
                  alt={locutor.name}
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                  loading="lazy"
                />
              ) : (
                <div className="absolute inset-0 w-full h-full flex items-center justify-center bg-white/5">
                  <span className="text-lg font-medium text-white/30">{locutor.name}</span>
                </div>
              )}
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent p-4 md:p-6">
                <div className="flex flex-col items-center justify-center min-h-[2.5em]">
                  <p className="text-white text-center font-bold text-base md:text-xl lg:text-2xl mb-1">{locutor.name}</p>
                  {locutor.cargo && (
                    <p className="text-white/90 text-center text-sm md:text-base font-medium">{locutor.cargo}</p>
                  )}
                </div>
              </div>
            </div>
          </motion.button>
        ))}
      </div>

      <AnimatePresence>
        {isModalOpen && selectedLocutor && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[9999] flex items-center justify-center p-4 md:p-6 bg-black/95 backdrop-blur-md overscroll-none"
            onClick={handleCloseModal}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              transition={{ type: 'spring', damping: 30, stiffness: 350 }}
              className="bg-gradient-to-b from-[#2C2C2C] to-[#1C1C1C] rounded-2xl overflow-hidden w-full max-w-3xl max-h-[85vh] shadow-2xl relative border border-white/10"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header with close button */}
              <div className="relative h-16 flex items-center justify-between px-6 border-b border-white/10">
                <h3 className="text-xl font-bold text-white">Perfil del Locutor</h3>
                <button
                  onClick={handleCloseModal}
                  className="p-2 rounded-full bg-white/5 text-white hover:bg-white/10 transition-all hover:scale-105 active:scale-95 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-[#1C1C1C]"
                  aria-label="Cerrar modal"
                >
                  <BiX className="w-6 h-6" />
                </button>
              </div>

              {/* Content area with custom scrollbar */}
              <div className="overflow-y-auto max-h-[calc(85vh-4rem)] scrollbar-thin scrollbar-track-white/5 scrollbar-thumb-white/20 hover:scrollbar-thumb-white/30">
                <div className="p-6 md:p-8">
                  <div className="flex flex-col md:flex-row gap-8 items-start">
                    {/* Image section */}
                    {selectedLocutor.coverdj?.url ? (
                      <motion.div 
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.2 }}
                        className="w-48 aspect-[4/5] md:w-72 rounded-xl overflow-hidden ring-2 ring-white/10 shadow-2xl flex-shrink-0 mx-auto md:mx-0 group"
                      >
                        <img
                          src={selectedLocutor.coverdj.url}
                          alt={selectedLocutor.name}
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                        />
                      </motion.div>
                    ) : (
                      <motion.div 
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.2 }}
                        className="w-48 aspect-[4/5] md:w-72 rounded-xl bg-gradient-to-b from-primary/30 to-primary/5 ring-2 ring-white/10 shadow-2xl flex items-center justify-center flex-shrink-0 mx-auto md:mx-0"
                      >
                        <span className="text-3xl font-bold text-white/70">{selectedLocutor.name[0]}</span>
                      </motion.div>
                    )}

                    {/* Content section */}
                    <div className="flex-1 min-w-0">
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                      >
                        <h2 className="text-2xl md:text-3xl font-bold text-white mb-2">{selectedLocutor.name}</h2>
                        <div className="space-y-4">
                          {selectedLocutor.biodj.split('\n').map((paragraph, index) => (
                            <motion.p 
                              key={index}
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: 0.4 + index * 0.1 }}
                              className="text-gray-300 leading-relaxed text-base md:text-lg"
                            >
                              {paragraph}
                            </motion.p>
                          ))}
                        </div>
                      </motion.div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}