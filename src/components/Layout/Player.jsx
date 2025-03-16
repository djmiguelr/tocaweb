import React, { useCallback, useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BiPlay, BiPause, BiVolumeFull, BiVolumeMute, BiChevronDown } from 'react-icons/bi';
import { MdRadio } from 'react-icons/md';
import { usePlayer } from '../../context/PlayerContext';
import { useCity } from '../../context/CityContext';
import { CitySelector } from '../CitySelector';

export function Player() {
  const { 
    currentTrack, 
    isLiveStream, 
    isPlaying, 
    isLoading,
    volume,
    isMuted,
    showCitySelector,
    setShowCitySelector,
    togglePlay,
    handleVolumeChange,
    toggleMute,
    playLiveStream
  } = usePlayer();

  const { selectedCity } = useCity();
  const [localVolume, setLocalVolume] = useState(volume);
  const volumeTimeoutRef = useRef(null);

  // Manejar cambios de volumen con debounce
  const handleVolumeInputChange = useCallback((e) => {
    const newVolume = parseFloat(e.target.value);
    setLocalVolume(newVolume);
    
    // Limpiar timeout anterior si existe
    if (volumeTimeoutRef.current) {
      clearTimeout(volumeTimeoutRef.current);
    }
    
    // Establecer nuevo timeout
    volumeTimeoutRef.current = setTimeout(() => {
      handleVolumeChange(newVolume);
    }, 200); // 200ms debounce
  }, [handleVolumeChange]);

  // Limpiar timeout al desmontar
  useEffect(() => {
    return () => {
      if (volumeTimeoutRef.current) {
        clearTimeout(volumeTimeoutRef.current);
      }
    };
  }, []);

  // Sincronizar volumen local cuando cambia el volumen global
  useEffect(() => {
    setLocalVolume(volume);
  }, [volume]);

  const handleCityClick = () => {
    setShowCitySelector(prev => !prev);
  };

  return (
    <>
      <div className="fixed bottom-0 left-0 right-0 bg-black/90 backdrop-blur-lg border-t border-white/10 z-[100]">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between gap-4">
            {/* Info */}
            <div className="flex items-center gap-4 flex-1">
              {currentTrack?.cover?.url ? (
                <img 
                  src={currentTrack.cover.url} 
                  alt={currentTrack.title}
                  className="w-12 h-12 rounded-lg object-cover"
                />
              ) : (
                <div className="w-12 h-12 rounded-lg bg-white/5 flex items-center justify-center overflow-hidden">
                  {selectedCity?.coverlog ? (
                    <img 
                      src={selectedCity.coverlog.formats?.thumbnail?.url || selectedCity.coverlog.url} 
                      alt={selectedCity.name}
                      className="w-full h-full object-cover"
                      loading="lazy"
                      width={selectedCity.coverlog.formats?.thumbnail?.width || selectedCity.coverlog.width}
                      height={selectedCity.coverlog.formats?.thumbnail?.height || selectedCity.coverlog.height}
                    />
                  ) : (
                    <MdRadio className="w-6 h-6 text-white/40" />
                  )}
                </div>
              )}
              
              <div>
                <h3 className="font-medium text-white">
                  {isLiveStream ? (
                    <button
                      onClick={handleCityClick}
                      className="hover:text-primary transition-colors inline-flex items-center gap-2"
                    >
                      {selectedCity?.name || 'Selecciona una ciudad'}
                      <BiChevronDown className={`w-5 h-5 transition-transform ${showCitySelector ? 'rotate-180' : ''}`} />
                    </button>
                  ) : (
                    currentTrack?.title
                  )}
                </h3>
                <p className="text-sm text-white/60">
                  {isLiveStream ? (
                    selectedCity?.frequency
                  ) : (
                    currentTrack?.artist
                  )}
                </p>
              </div>
            </div>

            {/* Controls */}
            <div className="flex items-center gap-6">
              {/* Back to Live Button for Desktop */}
              {!isLiveStream && selectedCity && (
                <button
                  onClick={() => playLiveStream(selectedCity)}
                  className="hidden md:flex items-center gap-2 px-4 py-2 rounded-full bg-primary text-white hover:bg-primary-hover transition-colors"
                >
                  <MdRadio className="w-5 h-5" />
                  <span>Volver al directo</span>
                </button>
              )}

              <button
                onClick={togglePlay}
                disabled={isLoading || (!isLiveStream && !currentTrack?.audio?.url)}
                className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${
                  isLoading ? 'bg-white/5 cursor-not-allowed' : 'bg-primary hover:bg-primary-hover'
                }`}
              >
                {isLoading ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : isPlaying ? (
                  <BiPause className="w-6 h-6 text-white" />
                ) : (
                  <BiPlay className="w-6 h-6 text-white translate-x-0.5" />
                )}
              </button>

              <div className="hidden md:flex items-center gap-3">
                <button
                  onClick={toggleMute}
                  className="text-white/60 hover:text-white transition-colors"
                >
                  {isMuted ? (
                    <BiVolumeMute className="w-6 h-6" />
                  ) : (
                    <BiVolumeFull className="w-6 h-6" />
                  )}
                </button>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.01"
                  value={localVolume}
                  onChange={handleVolumeInputChange}
                  className="w-24 accent-primary"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Floating Back to Live Button for Mobile/Tablet */}
      {!isLiveStream && selectedCity && (
        <div className="md:hidden fixed bottom-20 right-4 z-[90]">
          <button
            onClick={() => playLiveStream(selectedCity)}
            className="flex items-center gap-2 px-4 py-2 rounded-full bg-primary text-white hover:bg-primary-hover transition-colors shadow-lg"
          >
            <MdRadio className="w-5 h-5" />
            <span>Volver al directo</span>
          </button>
        </div>
      )}

      <AnimatePresence>
        {showCitySelector && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[110] flex items-end md:items-center justify-center"
            onClick={() => setShowCitySelector(false)}
          >
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              className="w-full md:w-auto md:max-w-2xl max-h-[80vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <CitySelector onClose={() => setShowCitySelector(false)} />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}