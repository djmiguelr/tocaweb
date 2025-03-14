import React, { createContext, useContext, useState, useRef, useEffect, useCallback } from 'react';
import { useCity } from './CityContext';

const PlayerContext = createContext();

export function PlayerProvider({ children }) {
  const [currentTrack, setCurrentTrack] = useState(null);
  const [isLiveStream, setIsLiveStream] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showCitySelector, setShowCitySelector] = useState(false);
  const [volume, setVolume] = useState(() => {
    const savedVolume = localStorage.getItem('playerVolume');
    return savedVolume !== null ? parseFloat(savedVolume) : 1;
  });
  const [isMuted, setIsMuted] = useState(() => {
    const savedMuted = localStorage.getItem('playerMuted');
    return savedMuted === 'true';
  });

  const audioRef = useRef(null);
  const previousVolume = useRef(volume);

  const { selectedCity } = useCity();

  // Cleanup audio on unmount
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = '';
        audioRef.current = null;
      }
    };
  }, []);

  // MediaSession API setup
  useEffect(() => {
    if ('mediaSession' in navigator) {
      navigator.mediaSession.setActionHandler('play', () => {
        togglePlay();
      });
      navigator.mediaSession.setActionHandler('pause', () => {
        togglePlay();
      });
      navigator.mediaSession.setActionHandler('stop', () => {
        if (audioRef.current) {
          audioRef.current.pause();
          audioRef.current.currentTime = 0;
          setIsPlaying(false);
        }
      });
    }
  }, []);

  // Update MediaSession metadata when track changes
  useEffect(() => {
    if ('mediaSession' in navigator) {
      if (isLiveStream && selectedCity) {
        navigator.mediaSession.metadata = new MediaMetadata({
          title: selectedCity.name,
          artist: selectedCity.frequency,
          artwork: selectedCity.coverlog ? [
            { src: selectedCity.coverlog.url, sizes: '512x512', type: 'image/jpeg' }
          ] : []
        });
      } else if (currentTrack) {
        navigator.mediaSession.metadata = new MediaMetadata({
          title: currentTrack.title,
          artist: currentTrack.artist,
          artwork: currentTrack.cover ? [
            { src: currentTrack.cover.url, sizes: '512x512', type: 'image/jpeg' }
          ] : []
        });
      }
    }
  }, [currentTrack, isLiveStream, selectedCity]);

  // Handle volume changes
  const handleVolumeChange = useCallback((newVolume) => {
    if (!audioRef.current) return;
    
    const isMutedState = newVolume === 0;
    if (!isMutedState) {
      previousVolume.current = newVolume;
    }
    
    setVolume(newVolume);
    setIsMuted(isMutedState);
    audioRef.current.volume = isMutedState ? 0 : newVolume;
    
    localStorage.setItem('playerVolume', newVolume);
    localStorage.setItem('playerMuted', isMutedState);
  }, []);

  // Toggle mute
  const toggleMute = useCallback(() => {
    if (!audioRef.current) return;
    
    if (isMuted) {
      const volumeToRestore = previousVolume.current || 1;
      handleVolumeChange(volumeToRestore);
    } else {
      previousVolume.current = volume;
      handleVolumeChange(0);
    }
  }, [isMuted, volume, handleVolumeChange]);

  // Toggle play/pause
  const togglePlay = useCallback(async () => {
    if (!audioRef.current) return;

    try {
      if (isPlaying) {
        audioRef.current.pause();
        setIsPlaying(false);
      } else {
        await audioRef.current.play();
        setIsPlaying(true);
      }
    } catch (error) {
      console.error('Error toggling play state:', error);
      setError('Error al reproducir el audio');
      setIsPlaying(false);
    }
  }, [isPlaying]);

  // Play live stream
  const playLiveStream = useCallback(async (city) => {
    if (!city) {
      console.error('No city provided to playLiveStream');
      setError('No se ha seleccionado una ciudad');
      return;
    }

    if (!city.stream_url) {
      console.error('City has no stream_url:', city.name);
      setError('Esta ciudad no tiene transmisión en vivo disponible');
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      // Stop current audio if any
      if (audioRef.current) {
        try {
          audioRef.current.pause();
          audioRef.current.src = '';
          audioRef.current.load(); // Forzar liberación de recursos
        } catch (e) {
          console.warn('Error cleaning up previous audio:', e);
        }
      }

      // Create new audio instance
      const audio = new Audio();
      
      // Configuración inicial del audio
      audio.preload = 'none'; // Evitar carga automática
      audio.crossOrigin = 'anonymous'; // Permitir CORS
      
      // Add error handling for the audio element
      audio.onerror = (e) => {
        const error = e.target.error;
        console.error('Audio element error:', {
          code: error?.code,
          message: error?.message,
          name: error?.name
        });
        
        let errorMessage = 'Error al cargar el stream de audio';
        if (error) {
          switch (error.code) {
            case MediaError.MEDIA_ERR_ABORTED:
              errorMessage = 'La reproducción fue cancelada';
              break;
            case MediaError.MEDIA_ERR_NETWORK:
              errorMessage = 'Error de red al cargar el audio';
              break;
            case MediaError.MEDIA_ERR_DECODE:
              errorMessage = 'Error al decodificar el audio';
              break;
            case MediaError.MEDIA_ERR_SRC_NOT_SUPPORTED:
              errorMessage = 'El formato de audio no es compatible';
              break;
          }
        }
        
        setError(errorMessage);
        setIsPlaying(false);
        setIsLoading(false);
      };

      // Add loading handler
      audio.onloadstart = () => {
        console.log('Stream loading started for:', city.stream_url);
        setIsLoading(true);
      };

      // Add ready state handler
      audio.oncanplay = () => {
        console.log('Stream ready to play');
        setIsLoading(false);
      };

      // Add stalled handler
      audio.onstalled = () => {
        console.warn('Stream stalled');
        setError('La transmisión se ha detenido temporalmente');
      };

      // Add ended handler
      audio.onended = () => {
        console.log('Stream ended');
        setIsPlaying(false);
        // Intentar reconectar
        audio.load();
        audio.play().catch(console.error);
      };

      // Set source and volume
      audio.src = city.stream_url;
      audio.volume = isMuted ? 0 : volume;
      audioRef.current = audio;

      // Attempt to play
      try {
        await audio.load(); // Cargar explícitamente el stream
        await audio.play();
        console.log('Stream playback started successfully');
        setIsPlaying(true);
        setIsLiveStream(true);
        setCurrentTrack(null);
      } catch (playError) {
        console.error('Playback failed:', {
          name: playError?.name,
          message: playError?.message,
          stack: playError?.stack
        });
        
        if (playError?.name === 'NotAllowedError') {
          setError('El navegador bloqueó la reproducción automática. Por favor, intenta reproducir manualmente.');
        } else if (playError?.name === 'NotSupportedError') {
          setError('El formato de audio no es compatible con tu navegador');
        } else {
          setError(`Error al reproducir: ${playError?.message || 'Error desconocido'}`);
        }
        setIsPlaying(false);
      }
    } catch (error) {
      console.error('Error in playLiveStream:', {
        name: error?.name,
        message: error?.message,
        stack: error?.stack
      });
      setError('Error al inicializar la transmisión en vivo');
      setIsPlaying(false);
    } finally {
      setIsLoading(false);
    }
  }, [volume, isMuted]);

  // Play track
  const playTrack = useCallback(async (track) => {
    if (!track?.song?.url) {
      setError('Esta pista no tiene audio disponible');
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      // Stop current audio if any
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = '';
      }

      // Create new audio instance
      audioRef.current = new Audio(track.song.url);
      audioRef.current.volume = isMuted ? 0 : volume;

      await audioRef.current.play();
      setIsPlaying(true);
      setIsLiveStream(false);
      setCurrentTrack(track);
    } catch (error) {
      console.error('Error playing track:', error);
      setError('Error al reproducir la pista');
      setIsPlaying(false);
    } finally {
      setIsLoading(false);
    }
  }, [volume, isMuted]);

  // Update volume when it changes
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : volume;
    }
  }, [volume, isMuted]);

  // Initialize audio when city changes without auto-playing
  useEffect(() => {
    if (selectedCity?.stream_url) {
      // Stop current audio if any
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = '';
      }

      // Create new audio instance but don't autoplay
      audioRef.current = new Audio(selectedCity.stream_url);
      audioRef.current.volume = isMuted ? 0 : volume;
      setIsLiveStream(true);
      setCurrentTrack(null);
    }
  }, [volume, isMuted]);

  // Handle city change
  useEffect(() => {
    if (selectedCity?.stream_url && isLiveStream) {
      playLiveStream(selectedCity);
    }
  }, [selectedCity, isLiveStream, playLiveStream]);

  const value = {
    currentTrack,
    isLiveStream,
    isPlaying,
    isLoading,
    error,
    volume,
    isMuted,
    showCitySelector,
    setShowCitySelector,
    togglePlay,
    handleVolumeChange,
    toggleMute,
    playLiveStream,
    playTrack,
    setError
  };

  return (
    <PlayerContext.Provider value={value}>
      {children}
    </PlayerContext.Provider>
  );
}

export function usePlayer() {
  const context = useContext(PlayerContext);
  if (!context) {
    throw new Error('usePlayer must be used within a PlayerProvider');
  }
  return context;
}
