import { useState, useRef, useEffect, useCallback } from 'react';
import { useCity } from '../../context/CityContext';
import { BASE_URL } from '../../services/api';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  BiPlay, 
  BiPause,
  BiVolumeFull,
  BiVolumeMute,
  BiMap,
  BiRadio,
  BiSkipNext,
  BiSkipPrevious,
  BiTime
} from 'react-icons/bi';
import { CitySelector } from '../Home/CitySelector';
import { usePlayer } from '../../context/PlayerContext';

export function Player() {
  const [volume, setVolume] = useState(() => {
    const savedVolume = localStorage.getItem('playerVolume');
    return savedVolume !== null ? parseInt(savedVolume) : 100;
  });
  
  const [isMuted, setIsMuted] = useState(() => {
    const savedMuted = localStorage.getItem('playerMuted');
    return savedMuted === 'true';
  });
  
  const [showVolumeSlider, setShowVolumeSlider] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const volumeControlRef = useRef(null);
  const previousVolume = useRef(volume);
  const volumeTimeoutRef = useRef(null);
  
  const { selectedCity } = useCity();
  
  const { 
    currentTrack, 
    isLiveStream, 
    isPlaying,
    isLoading,
    error,
    progress,
    duration,
    audioRef,
    returnToLive,
    togglePlay,
    playNextTrack,
    playPreviousTrack,
    setIsPlaying,
    setError
  } = usePlayer();

  const [showCitySelector, setShowCitySelector] = useState(false);

  const handleVolumeChange = useCallback((value) => {
    const newVolume = parseInt(value);
    const isMutedState = newVolume === 0;
    
    if (!isMutedState) {
      previousVolume.current = newVolume;
    }

    setVolume(newVolume);
    setIsMuted(isMutedState);
    
    if (audioRef.current) {
      audioRef.current.volume = newVolume / 100;
    }

    localStorage.setItem('playerVolume', newVolume);
    localStorage.setItem('playerMuted', isMutedState);
  }, []);

  const toggleMute = useCallback(() => {
    if (!audioRef.current) return;

    if (isMuted) {
      const volumeToRestore = previousVolume.current || 100;
      handleVolumeChange(volumeToRestore);
    } else {
      previousVolume.current = volume;
      handleVolumeChange(0);
    }
  }, [isMuted, volume, handleVolumeChange]);

  const handleReturnToLive = useCallback(() => {
    if (!selectedCity) return;
    returnToLive(selectedCity);
  }, [selectedCity, returnToLive]);

  useEffect(() => {
    return () => {
      if (volumeTimeoutRef.current) {
        clearTimeout(volumeTimeoutRef.current);
      }
    };
  }, []);

  useEffect(() => {
    localStorage.setItem('playerVolume', volume);
    localStorage.setItem('playerMuted', isMuted);

    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : volume / 100;
    }
  }, [volume, isMuted]);

  useEffect(() => {
    if (!audioRef.current) return;

    const handleTimeUpdate = () => {
      setCurrentTime(audioRef.current.currentTime);
    };

    const handleLoadedMetadata = () => {
      if ('mediaSession' in navigator && !isLiveStream) {
        navigator.mediaSession.setPositionState({
          duration: audioRef.current.duration,
          playbackRate: audioRef.current.playbackRate,
          position: audioRef.current.currentTime
        });
      }
    };

    const handlePlay = () => {
      setIsPlaying(true);
      if ('mediaSession' in navigator) {
        navigator.mediaSession.playbackState = 'playing';
      }
    };

    const handlePause = () => {
      setIsPlaying(false);
      if ('mediaSession' in navigator) {
        navigator.mediaSession.playbackState = 'paused';
      }
    };

    audioRef.current.addEventListener('timeupdate', handleTimeUpdate);
    audioRef.current.addEventListener('loadedmetadata', handleLoadedMetadata);
    audioRef.current.addEventListener('play', handlePlay);
    audioRef.current.addEventListener('pause', handlePause);

    return () => {
      if (!audioRef.current) return;
      audioRef.current.removeEventListener('timeupdate', handleTimeUpdate);
      audioRef.current.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audioRef.current.removeEventListener('play', handlePlay);
      audioRef.current.removeEventListener('pause', handlePause);
    };
  }, [isLiveStream, setIsPlaying]);

  useEffect(() => {
    if ('mediaSession' in navigator) {
      navigator.mediaSession.setActionHandler('play', () => {
        if (!isPlaying) togglePlay();
      });
      navigator.mediaSession.setActionHandler('pause', () => {
        if (isPlaying) togglePlay();
      });
      
      if (!isLiveStream) {
        navigator.mediaSession.setActionHandler('previoustrack', playPreviousTrack);
        navigator.mediaSession.setActionHandler('nexttrack', playNextTrack);
        navigator.mediaSession.setActionHandler('seekto', (details) => {
          if (!audioRef.current) return;
          if (details.fastSeek && 'fastSeek' in audioRef.current) {
            audioRef.current.fastSeek(details.seekTime);
            return;
          }
          audioRef.current.currentTime = details.seekTime;
          navigator.mediaSession.setPositionState({
            duration: audioRef.current.duration,
            playbackRate: audioRef.current.playbackRate,
            position: details.seekTime
          });
        });
      } else {
        navigator.mediaSession.setActionHandler('previoustrack', null);
        navigator.mediaSession.setActionHandler('nexttrack', null);
        navigator.mediaSession.setActionHandler('seekto', null);
      }
    }
  }, [isPlaying, togglePlay, isLiveStream, playPreviousTrack, playNextTrack]);

  useEffect(() => {
    if ('mediaSession' in navigator) {
      if (isLiveStream && selectedCity) {
        navigator.mediaSession.metadata = new MediaMetadata({
          title: selectedCity.name,
          artist: selectedCity.frequency || 'En vivo',
          album: 'Radio en vivo',
          artwork: selectedCity.coverlog?.url ? [
            { src: selectedCity.coverlog.url, sizes: '96x96', type: 'image/jpeg' },
            { src: selectedCity.coverlog.url, sizes: '128x128', type: 'image/jpeg' },
            { src: selectedCity.coverlog.url, sizes: '192x192', type: 'image/jpeg' },
            { src: selectedCity.coverlog.url, sizes: '256x256', type: 'image/jpeg' },
            { src: selectedCity.coverlog.url, sizes: '384x384', type: 'image/jpeg' },
            { src: selectedCity.coverlog.url, sizes: '512x512', type: 'image/jpeg' }
          ] : []
        });
      } else if (currentTrack) {
        navigator.mediaSession.metadata = new MediaMetadata({
          title: currentTrack.title,
          artist: currentTrack.artist,
          album: 'TocaExitos',
          artwork: currentTrack.cover?.url ? [
            { src: currentTrack.cover.url, sizes: '96x96', type: 'image/jpeg' },
            { src: currentTrack.cover.url, sizes: '128x128', type: 'image/jpeg' },
            { src: currentTrack.cover.url, sizes: '192x192', type: 'image/jpeg' },
            { src: currentTrack.cover.url, sizes: '256x256', type: 'image/jpeg' },
            { src: currentTrack.cover.url, sizes: '384x384', type: 'image/jpeg' },
            { src: currentTrack.cover.url, sizes: '512x512', type: 'image/jpeg' }
          ] : []
        });
      }
    }
  }, [isLiveStream, selectedCity, currentTrack]);

  useEffect(() => {
    if (selectedCity && isLiveStream) {
      returnToLive(selectedCity).catch(error => {
        console.error('Error initializing live stream:', error);
      });
    }
  }, [selectedCity, isLiveStream, returnToLive]);

  if (!selectedCity) return null;

  return (
    <motion.div 
      className="fixed bottom-0 left-0 right-0 bg-gradient-to-r from-[#1C1C1C] to-[#2C2C2C] backdrop-blur-lg border-t border-white/10 h-24 z-[9999] shadow-2xl"
      role="region"
      aria-label="Reproductor de música">
      <div className="absolute top-0 left-0 right-0 h-1 bg-white/10">
        {!isLiveStream && (
          <motion.div 
            className="h-full bg-green-500"
            style={{ width: `${duration ? (progress / duration) * 100 : 0}%` }}
            animate={{ width: `${duration ? (progress / duration) * 100 : 0}%` }}
            transition={{ duration: 0.1 }}
          />
        )}
      </div>

      <div className="container mx-auto h-full">
        <div className="flex items-center justify-between h-full px-4">
          <div 
            className="flex items-center flex-1 md:flex-none md:w-[300px] gap-4"
            role="complementary"
            aria-label="Información de la reproducción actual">
            {isLiveStream ? (
              <>
                <div className="relative w-16 h-16 rounded-xl overflow-hidden bg-white/10 group">
                  {selectedCity?.coverlog?.url && (
                    <motion.img
                      animate={isPlaying ? { scale: 1.1 } : { scale: 1 }}
                      src={selectedCity.coverlog.url}
                      alt={`Logo de la radio ${selectedCity.name}`}
                      className="w-full h-full object-cover transition-all duration-300 group-hover:scale-110"
                    />
                  )}
                </div>
                <div>
                  <h3 
                    className="text-white font-medium"
                    aria-label={`Emisora: ${selectedCity?.name}`}>
                    {selectedCity?.name}
                  </h3>
                  <p 
                    className="text-sm text-gray-400"
                    aria-label={`Frecuencia: ${selectedCity?.frequency}`}>
                    {selectedCity?.frequency}
                  </p>
                </div>
              </>
            ) : (
              <>
                <div className="relative w-16 h-16 rounded-xl overflow-hidden">
                  {currentTrack?.cover?.url && (
                    <img
                      src={currentTrack.cover.url}
                      alt={currentTrack.title}
                      className="w-full h-full object-cover"
                    />
                  )}
                </div>
                <div>
                  <h3 className="text-white font-medium">{currentTrack?.title}</h3>
                  <p className="text-sm text-gray-400">{currentTrack?.artist}</p>
                </div>
              </>
            )}
          </div>

          <div className="flex items-center gap-4">
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={togglePlay}
              disabled={isLoading}
              className={`w-16 h-16 rounded-full flex items-center justify-center transition-colors ${
                isLoading ? 'bg-primary/50' : 'bg-primary hover:bg-primary-hover'
              }`}
              aria-label={isPlaying ? 'Pausar' : 'Reproducir'}
              title={`${isPlaying ? 'Pausar' : 'Reproducir'} (Espacio o K)`}
            >
              {isLoading ? (
                <div 
                  className="w-8 h-8 border-4 border-white/20 border-t-white rounded-full animate-spin"
                  role="status"
                  aria-label="Cargando" />
              ) : isPlaying ? (
                <BiPause className="w-8 h-8 text-white" aria-hidden="true" />
              ) : (
                <BiPlay className="w-8 h-8 text-white translate-x-0.5" aria-hidden="true" />
              )}
            </motion.button>
          </div>

          <div className="hidden md:flex items-center gap-4 w-[250px] justify-end">
            <div 
              ref={volumeControlRef} 
              className="hidden lg:flex items-center space-x-2 relative"
              role="group"
              aria-label="Control de volumen">
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => {
                  toggleMute();
                  setShowVolumeSlider(true);
                }}
                className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                aria-label={volume === 0 ? 'Activar sonido' : 'Silenciar'}
                title={`${volume === 0 ? 'Activar sonido' : 'Silenciar'} (M)`}
                aria-pressed={volume === 0}
              >
                {volume === 0 ? (
                  <BiVolumeMute className="w-6 h-6 text-white/60" aria-hidden="true" />
                ) : (
                  <BiVolumeFull className="w-6 h-6 text-white/60" aria-hidden="true" />
                )}
              </motion.button>
              
              <motion.div
                initial={false}
                animate={{ 
                  width: showVolumeSlider ? 100 : 0,
                  opacity: showVolumeSlider ? 1 : 0
                }}
                className="overflow-hidden"
              >
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={volume}
                  onChange={(e) => {
                    handleVolumeChange(e.target.value);
                  }}
                  className="w-full accent-primary"
                  id="volume-slider"
                  aria-label="Control de volumen"
                  aria-valuemin="0"
                  aria-valuemax="100"
                  aria-valuenow={volume}
                  aria-valuetext={`Volumen ${volume}%`}
                  title="Usa las flechas arriba/abajo para ajustar"
                />
              </motion.div>
            </div>
            
            {isLiveStream ? (
              <div className="relative">
                <button
                  onClick={() => setShowCitySelector(!showCitySelector)}
                  className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
                >
                  <BiMap className="w-5 h-5" />
                  <span className="text-sm">{selectedCity?.name}</span>
                </button>

                <AnimatePresence>
                  {showCitySelector && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      className="absolute bottom-full right-0 mb-2 w-64 bg-[#2C2C2C] rounded-lg shadow-xl overflow-hidden"
                    >
                      <CitySelector 
                        variant="player" 
                        onClose={() => setShowCitySelector(false)}
                      />
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleReturnToLive}
                className="flex items-center gap-2 px-4 py-2 rounded-full bg-primary hover:bg-primary-hover text-white text-sm"
                aria-label="Volver a la radio en vivo"
                title="Cambiar a transmisión en vivo"
              >
                <BiRadio className="w-5 h-5" aria-hidden="true" />
                <span>Volver al directo</span>
              </motion.button>
            )}
          </div>
        </div>
      </div>

      <AnimatePresence>
        {!isLiveStream && (
          <motion.button
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            onClick={handleReturnToLive}
            className="md:hidden fixed bottom-28 right-4 flex items-center gap-2 px-4 py-2 rounded-full bg-primary hover:bg-primary-hover text-white text-sm shadow-lg"
            aria-label="Volver a la radio en vivo"
            title="Cambiar a transmisión en vivo"
          >
            <BiRadio className="w-5 h-5" aria-hidden="true" />
            <span>Volver al directo</span>
          </motion.button>
        )}
      </AnimatePresence>

      {isLiveStream && !audioRef.current?.src && (
        <div className="absolute top-0 left-0 right-0 bg-red-500 text-white text-sm py-1 px-4 text-center">
          Error conectando con la transmisión en vivo. Intentando reconectar...
        </div>
      )}

      <audio
        ref={audioRef}
        preload="none"
        crossOrigin="anonymous"
      />
    </motion.div>
  );
}