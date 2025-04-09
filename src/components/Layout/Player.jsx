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
  const audioRef = useRef(null);

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

  const handlePlayPauseClick = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    console.log('Play/Pause button clicked');
    
    if (!isPlaying && audioRef.current && currentTrack?.audio?.url) {
      audioRef.current.src = currentTrack.audio.url;
      audioRef.current.load();
      audioRef.current.play().catch(error => {
        console.error('Error al reproducir:', error);
      });
    } else if (audioRef.current) {
      audioRef.current.pause();
    }
    
    togglePlay();
  }, [isPlaying, togglePlay, currentTrack]);

  // Manejar errores y reconexión automática
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    let retryCount = 0;
    const maxRetries = 3;
    const retryDelay = 2000; // 2 segundos

    const handleError = async (error) => {
      console.error('Error en la reproducción:', error);
      
      if (!isPlaying || !currentTrack?.audio?.url) return;

      if (retryCount < maxRetries) {
        retryCount++;
        console.log(`Intento de reconexión ${retryCount}/${maxRetries}...`);

        setTimeout(async () => {
          try {
            // Intentar reconectar usando la URL actual del track
            audio.src = currentTrack.audio.url;
            audio.load();
            await audio.play();
            // Si tiene éxito, resetear el contador
            retryCount = 0;
          } catch (e) {
            console.error('Error al reconectar:', e);
            if (retryCount === maxRetries) {
              // Si alcanzamos el máximo de intentos, recargar el stream desde la API
              playLiveStream(selectedCity);
            }
          }
        }, retryDelay);
      }
    };

    const handleStalled = () => {
      console.log('Stream estancado, intentando reconectar...');
      handleError(new Error('Stream stalled'));
    };

    const handleEnded = () => {
      if (isPlaying && currentTrack?.audio?.url) {
        console.log('Stream terminado, intentando reconectar...');
        handleError(new Error('Stream ended'));
      }
    };

    audio.addEventListener('error', handleError);
    audio.addEventListener('stalled', handleStalled);
    audio.addEventListener('ended', handleEnded);

    return () => {
      audio.removeEventListener('error', handleError);
      audio.removeEventListener('stalled', handleStalled);
      audio.removeEventListener('ended', handleEnded);
    };
  }, [isPlaying, currentTrack, selectedCity, playLiveStream]);

  const handleCityClick = () => {
    setShowCitySelector(prev => !prev);
  };

  return (
    <>
      <div className="fixed bottom-0 left-0 right-0 bg-gradient-to-t from-black/95 to-black/90 backdrop-blur-xl border-t border-white/5 z-[100]">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between gap-6">
            {/* Info */}
            <div className="flex items-center gap-4 flex-1 min-w-0">
              <div className="relative group">
                {currentTrack?.cover?.url ? (
                  <img 
                    src={currentTrack.cover.url} 
                    alt={currentTrack.title}
                    className="w-14 h-14 rounded-xl object-cover ring-2 ring-white/10 group-hover:ring-primary/30 transition-all duration-300"
                  />
                ) : (
                  <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-white/10 to-white/5 ring-2 ring-white/10 group-hover:ring-primary/30 transition-all duration-300 flex items-center justify-center overflow-hidden">
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
                      <MdRadio className="w-7 h-7 text-white/40" />
                    )}
                  </div>
                )}
                {isPlaying && (
                  <div className="absolute -top-1 -right-1 w-3 h-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-primary"></span>
                  </div>
                )}
              </div>
              
              <div className="min-w-0">
                <h3 className="font-medium text-white truncate">
                  {isLiveStream ? (
                    <button
                      onClick={handleCityClick}
                      className="hover:text-primary transition-colors inline-flex items-center gap-2 group"
                    >
                      <span>{selectedCity?.name || 'Selecciona una ciudad'}</span>
                      <BiChevronDown className={`w-5 h-5 transition-transform duration-300 ${showCitySelector ? 'rotate-180' : ''} group-hover:text-primary`} />
                    </button>
                  ) : (
                    currentTrack?.title
                  )}
                </h3>
                <p className="text-sm text-white/60 truncate">
                  {isLiveStream ? (
                    <span className="inline-flex items-center gap-2">
                      <span className="inline-block w-1.5 h-1.5 rounded-full bg-primary"></span>
                      {selectedCity?.frequency}
                    </span>
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
                  className="hidden md:flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-primary to-primary-hover text-white hover:from-primary-hover hover:to-primary transition-all duration-300 shadow-lg shadow-primary/20"
                >
                  <MdRadio className="w-5 h-5" />
                  <span>Volver al directo</span>
                </button>
              )}

              <button
                onClick={handlePlayPauseClick}
                disabled={isLoading || (!isLiveStream && !currentTrack?.audio?.url)}
                className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 ${
                  isLoading 
                    ? 'bg-white/5 cursor-not-allowed' 
                    : 'bg-gradient-to-r from-primary to-primary-hover hover:from-primary-hover hover:to-primary shadow-lg shadow-primary/20'
                }`}
              >
                {isLoading ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : isPlaying ? (
                  <BiPause className="w-7 h-7 text-white" />
                ) : (
                  <BiPlay className="w-7 h-7 text-white translate-x-0.5" />
                )}
              </button>

              <div className="hidden md:flex items-center gap-3">
                <button
                  onClick={toggleMute}
                  className="text-white/60 hover:text-white transition-colors p-2 hover:bg-white/5 rounded-lg"
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
                  className="w-24 accent-primary cursor-pointer"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Floating Back to Live Button for Mobile/Tablet */}
      {!isLiveStream && selectedCity && (
        <div className="md:hidden fixed bottom-24 right-4 z-[90]">
          <button
            onClick={() => playLiveStream(selectedCity)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-full bg-gradient-to-r from-primary to-primary-hover hover:from-primary-hover hover:to-primary text-white transition-all duration-300 shadow-lg shadow-primary/20"
          >
            <MdRadio className="w-5 h-5" />
            <span>Volver al directo</span>
          </button>
        </div>
      )}

      <AnimatePresence>
        {showCitySelector && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[110] flex items-end md:items-center justify-center"
            onClick={() => setShowCitySelector(false)}
          >
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="w-full md:w-auto md:max-w-2xl max-h-[80vh] overflow-y-auto bg-gradient-to-b from-black/95 to-black/90 backdrop-blur-xl rounded-t-2xl md:rounded-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <CitySelector onClose={() => setShowCitySelector(false)} />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <audio
        ref={audioRef}
        preload="none"
      />
    </>
  );
}