import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useCity } from '../../context/CityContext';
import { constants } from '../../services/api';
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
import { CitySelector } from '../Shared/CitySelector';
import { usePlayer } from '../../context/PlayerContext';
import { MdRadio } from 'react-icons/md';
import { IoMdClose } from 'react-icons/io';
import { useHeader } from '../../context/HeaderContext';

export function Player() {
  const { 
    currentTrack, 
    isLiveStream,
    isPlaying,
    isLoading,
    error,
    returnToLive,
    togglePlay,
    audioRef,
    autoplayBlocked,
    handleFirstInteraction,
    setIsPlaying,
    setError
  } = usePlayer();

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
  const volumeBarRef = useRef(null);
  const [isVolumeDragging, setIsVolumeDragging] = useState(false);
  const [showCitySelector, setShowCitySelector] = useState(false);
  
  const { selectedCity, cities, setSelectedCity } = useCity();
  
  const { headerInfo } = useHeader();

  const handleVolumeChange = useCallback((e) => {
    let newVolume;
    
    if (typeof e === 'number') {
      newVolume = e;
    } else if (e.type === 'mousemove' || e.type === 'click') {
      const rect = volumeBarRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const percentage = Math.max(0, Math.min(1, x / rect.width));
      newVolume = Math.round(percentage * 100);
    } else {
      return;
    }

    const isMutedState = newVolume === 0;
    
    if (!isMutedState) {
      previousVolume.current = newVolume;
    }

    setVolume(newVolume);
    setIsMuted(isMutedState);
    
    if (audioRef?.current) {
      audioRef.current.volume = newVolume / 100;
    }

    localStorage.setItem('playerVolume', newVolume);
    localStorage.setItem('playerMuted', isMutedState);
  }, [audioRef]);

  const toggleMute = useCallback(() => {
    if (!audioRef?.current) return;

    if (isMuted) {
      const volumeToRestore = previousVolume.current || 100;
      handleVolumeChange(volumeToRestore);
    } else {
      previousVolume.current = volume;
      handleVolumeChange(0);
    }
  }, [isMuted, volume, handleVolumeChange, audioRef]);

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
    if (audioRef?.current) {
      audioRef.current.volume = volume / 100;
    }
  }, [audioRef, volume]);

  useEffect(() => {
    if (!audioRef?.current) return;

    const handleTimeUpdate = () => {
      if (audioRef.current) {
        setCurrentTime(audioRef.current.currentTime);
      }
    };

    const handleLoadedMetadata = () => {
      if ('mediaSession' in navigator && !isLiveStream && audioRef.current) {
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
      if (audioRef.current) {
        audioRef.current.removeEventListener('timeupdate', handleTimeUpdate);
        audioRef.current.removeEventListener('loadedmetadata', handleLoadedMetadata);
        audioRef.current.removeEventListener('play', handlePlay);
        audioRef.current.removeEventListener('pause', handlePause);
      }
    };
  }, [isLiveStream, setIsPlaying]);

  useEffect(() => {
    if ('mediaSession' in navigator) {
      navigator.mediaSession.setActionHandler('play', () => togglePlay());
      navigator.mediaSession.setActionHandler('pause', () => togglePlay());
      
      if (!isLiveStream) {
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
        navigator.mediaSession.setActionHandler('seekto', null);
      }
    }
  }, [isPlaying, togglePlay, isLiveStream]);

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
      if (!selectedCity.stream_url) {
        setError('Esta ciudad no tiene transmisión en vivo disponible');
        return;
      }

      returnToLive(selectedCity).catch(error => {
        console.error('Error initializing live stream:', error);
        setError('La transmisión en vivo no está disponible en este momento');
      });
    }
  }, [selectedCity, isLiveStream, returnToLive]);

  // Efecto para manejar el drag del volumen
  useEffect(() => {
    const handleMouseMove = (e) => {
      if (isVolumeDragging) {
        handleVolumeChange(e);
      }
    };

    const handleMouseUp = () => {
      setIsVolumeDragging(false);
    };

    if (isVolumeDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isVolumeDragging, handleVolumeChange]);

  // Función para cambiar de ciudad
  const handleCityChange = useCallback((city) => {
    if (!city) return;
    setSelectedCity(city);
    setShowCitySelector(false);
  }, [setSelectedCity]);

  if (!selectedCity) return null;

  return (
    <>
      {/* Player fijo en la parte inferior */}
      <div className="fixed bottom-0 left-0 right-0 bg-black/95 backdrop-blur-lg border-t border-white/10 z-50">
        <div className="container mx-auto px-4">
          <div className="flex items-center h-20">
            {/* Información de la ciudad/emisora */}
            <div className="flex items-center flex-1 min-w-0">
              <button
                onClick={() => setShowCitySelector(true)}
                className="flex items-center gap-4 hover:bg-white/5 p-2 rounded-lg transition-colors"
              >
                <div className="w-12 h-12 rounded-lg overflow-hidden bg-white/5 flex-shrink-0">
                  {selectedCity?.logo_url ? (
                    <img 
                      src={selectedCity.logo_url} 
                      alt={selectedCity.name}
                      className="w-full h-full object-cover"
                    />
                  ) : headerInfo?.cover?.url ? (
                    <img 
                      src={headerInfo.cover.url}
                      alt={headerInfo.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-white/30">
                      <MdRadio size={24} />
                    </div>
                  )}
                </div>
                <div className="min-w-0">
                  <h3 className="text-white font-medium truncate flex items-center gap-2">
                    {selectedCity?.name || headerInfo?.title || 'Selecciona una ciudad'}
                    <BiMap className="text-white/60" />
                  </h3>
                  <p className="text-white/60 text-sm truncate">
                    {selectedCity?.frequency || headerInfo?.description || ''}
                  </p>
                </div>
              </button>
            </div>

            {/* Controles */}
            <div className="flex items-center gap-4">
              {/* Botón de volver al directo (solo visible cuando se reproduce una canción) */}
              {!isLiveStream && (
                <button
                  onClick={() => returnToLive(selectedCity)}
                  className="hidden md:flex items-center gap-2 px-4 py-2 bg-white/10 rounded-lg hover:bg-white/20 transition-colors text-white"
                >
                  <BiRadio className="w-5 h-5" />
                  <span>Volver al directo</span>
                </button>
              )}

              {/* Control de volumen */}
              <div className="hidden md:flex items-center gap-2">
                <button
                  onClick={() => handleVolumeChange(volume === 0 ? 100 : 0)}
                  className="text-white/60 hover:text-white transition-colors"
                >
                  {volume === 0 ? (
                    <BiVolumeMute size={24} />
                  ) : (
                    <BiVolumeFull size={24} />
                  )}
                </button>
                <div
                  ref={volumeBarRef}
                  className="w-24 h-1 bg-white/20 rounded-full cursor-pointer"
                  onClick={handleVolumeChange}
                  onMouseDown={() => setIsVolumeDragging(true)}
                >
                  <div
                    className="h-full bg-primary rounded-full relative"
                    style={{ width: `${volume}%` }}
                  >
                    <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-primary rounded-full" />
                  </div>
                </div>
              </div>

              {/* Botón de play/pause */}
              <button
                onClick={() => {
                  if (autoplayBlocked) {
                    handleFirstInteraction();
                  } else {
                    togglePlay();
                  }
                }}
                disabled={isLoading}
                className={`w-12 h-12 rounded-full flex items-center justify-center text-white transition-colors ${
                  isLoading ? 'bg-primary/50 cursor-wait' : 'bg-primary hover:bg-primary/80'
                }`}
              >
                {isLoading ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : autoplayBlocked ? (
                  <BiPlay size={24} className="ml-1" />
                ) : isPlaying ? (
                  <BiPause size={24} />
                ) : (
                  <BiPlay size={24} className="ml-1" />
                )}
              </button>

              {/* Información de reproducción actual */}
              {currentTrack && !isLiveStream && (
                <div className="hidden md:block min-w-0 ml-4">
                  <p className="text-white font-medium truncate">
                    {currentTrack.title}
                  </p>
                  <p className="text-white/60 text-sm truncate">
                    {currentTrack.artist}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Selector de ciudad (móvil y escritorio) */}
      <AnimatePresence>
        {showCitySelector && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/95 backdrop-blur-sm z-50 flex items-center justify-center"
          >
            <div className="container max-w-lg mx-auto p-6">
              <div className="bg-[#1C1C1C] rounded-2xl overflow-hidden">
                <div className="p-6">
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold text-white">Elige tu ciudad</h2>
                    <button
                      onClick={() => setShowCitySelector(false)}
                      className="text-white/60 hover:text-white p-2"
                    >
                      <IoMdClose size={24} />
                    </button>
                  </div>
                  
                  <div className="grid gap-4">
                    {cities.map((city) => (
                      <button
                        key={city.id}
                        onClick={() => handleCityChange(city)}
                        className={`p-4 rounded-xl flex items-center gap-4 transition-colors ${
                          selectedCity?.id === city.id
                            ? 'bg-primary text-white'
                            : 'bg-white/5 text-white/60 hover:bg-white/10'
                        }`}
                      >
                        <div className="w-12 h-12 rounded-lg overflow-hidden bg-black/20">
                          {city.logo_url ? (
                            <img
                              src={city.logo_url}
                              alt={city.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <MdRadio size={24} />
                            </div>
                          )}
                        </div>
                        <div className="flex-1 text-left">
                          <h3 className="font-medium">{city.name}</h3>
                          <p className="text-sm opacity-60">{city.frequency}</p>
                        </div>
                        {selectedCity?.id === city.id && (
                          <div className="w-3 h-3 rounded-full bg-white animate-pulse" />
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Botón flotante para cambiar ciudad (solo móvil) */}
      <div className="fixed right-4 bottom-24 md:hidden z-50">
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => setShowCitySelector(true)}
          className="w-14 h-14 rounded-full bg-primary text-white shadow-lg flex items-center justify-center"
        >
          <MdRadio size={24} />
        </motion.button>
      </div>

      {/* Mensaje de autoplay bloqueado */}
      {autoplayBlocked && (
        <div className="fixed top-4 right-4 bg-primary text-white px-4 py-2 rounded-lg shadow-lg">
          Haz clic en reproducir para comenzar
        </div>
      )}
    </>
  );
}

export default Player;