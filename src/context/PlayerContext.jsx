import React, { createContext, useContext, useState, useRef, useEffect, useCallback } from 'react';
import { useCity } from './CityContext';

const PlayerContext = createContext();

export function usePlayer() {
  return useContext(PlayerContext);
}

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
  const { selectedCity } = useCity();

  // Cleanup function
  const cleanup = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.src = '';
      audioRef.current.load();
    }
    setIsPlaying(false);
    setIsLoading(false);
  }, []);

  // Handle volume changes
  const handleVolumeChange = useCallback((newVolume) => {
    if (audioRef.current) {
      audioRef.current.volume = newVolume;
    }
    setVolume(newVolume);
    localStorage.setItem('playerVolume', newVolume);
  }, []);

  // Toggle mute
  const toggleMute = useCallback(() => {
    const newMuted = !isMuted;
    if (audioRef.current) {
      audioRef.current.muted = newMuted;
    }
    setIsMuted(newMuted);
    localStorage.setItem('playerMuted', newMuted);
  }, [isMuted]);

  // Configurar audio element
  const setupAudioElement = useCallback((url) => {
    let audio = audioRef.current;
    
    if (!audio) {
      audio = new Audio();
      audioRef.current = audio;

      // Configurar eventos
      audio.addEventListener('ended', () => {
        console.log('Audio ended');
        setIsPlaying(false);
      });
      
      audio.addEventListener('error', (e) => {
        console.error('Error en reproducción:', e);
        setError('Error en la reproducción de audio');
        setIsPlaying(false);
        setIsLoading(false);
      });
      
      audio.addEventListener('waiting', () => {
        console.log('Audio waiting');
        setIsLoading(true);
      });
      
      audio.addEventListener('playing', () => {
        console.log('Audio playing');
        setIsLoading(false);
        setIsPlaying(true);
      });

      audio.addEventListener('pause', () => {
        console.log('Audio paused');
        setIsPlaying(false);
      });
    }

    // Configurar source y propiedades
    audio.src = url;
    audio.volume = volume;
    audio.muted = isMuted;
    audio.preload = 'auto';

    return audio;
  }, [volume, isMuted]);

  // Play live stream
  const playLiveStream = useCallback(async (city) => {
    if (!city?.stream_url) {
      setError('Esta ciudad no tiene transmisión en vivo disponible');
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      // Limpiar reproductor anterior
      cleanup();

      const audio = setupAudioElement(city.stream_url);
      
      try {
        const playPromise = audio.play();
        if (playPromise !== undefined) {
          await playPromise;
          setIsPlaying(true);
          setIsLiveStream(true);
          setCurrentTrack(null);
        }
      } catch (error) {
        console.error('Error reproduciendo stream:', error);
        setError('Error al reproducir el audio');
        setIsPlaying(false);
      }
    } catch (error) {
      console.error('Error general:', error);
      setError('Error al inicializar la transmisión');
      setIsPlaying(false);
    } finally {
      setIsLoading(false);
    }
  }, [cleanup, setupAudioElement]);

  // Play track
  const playTrack = useCallback(async (track) => {
    if (!track?.audio?.url) {
      setError('Esta canción no tiene audio disponible');
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      // Limpiar reproductor anterior
      cleanup();

      const audio = setupAudioElement(track.audio.url);

      try {
        const playPromise = audio.play();
        if (playPromise !== undefined) {
          await playPromise;
          setIsPlaying(true);
          setIsLiveStream(false);
          setCurrentTrack(track);
        }
      } catch (error) {
        console.error('Error reproduciendo track:', error);
        setError('Error al reproducir el audio');
        setIsPlaying(false);
      }
    } catch (error) {
      console.error('Error general:', error);
      setError('Error al inicializar la reproducción');
      setIsPlaying(false);
    } finally {
      setIsLoading(false);
    }
  }, [cleanup, setupAudioElement]);

  // Toggle play/pause
  const togglePlay = useCallback(async () => {
    console.log('Toggle play called, current state:', { isPlaying, audioRef: audioRef.current });
    
    if (!audioRef.current) {
      console.log('No audio element');
      return;
    }

    try {
      if (isPlaying) {
        console.log('Pausing audio');
        audioRef.current.pause();
      } else {
        console.log('Playing audio');
        const playPromise = audioRef.current.play();
        if (playPromise !== undefined) {
          await playPromise;
        }
      }
    } catch (error) {
      console.error('Error toggling play state:', error);
      setError('Error al reproducir el audio');
      setIsPlaying(false);
    }
  }, [isPlaying]);

  // Cleanup on unmount
  useEffect(() => {
    return cleanup;
  }, [cleanup]);

  // Auto-play cuando se selecciona una ciudad
  useEffect(() => {
    if (selectedCity && isLiveStream) {
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
    playTrack,
    playLiveStream,
    handleVolumeChange,
    toggleMute,
    cleanup
  };

  return (
    <PlayerContext.Provider value={value}>
      {children}
    </PlayerContext.Provider>
  );
}
