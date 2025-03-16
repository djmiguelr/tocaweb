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
  const currentStreamUrlRef = useRef('');
  const gainNodeRef = useRef(null);
  const audioContextRef = useRef(null);
  const hlsRef = useRef(null);

  const { selectedCity } = useCity();

  // Inicializar Web Audio API
  const initAudioContext = useCallback(() => {
    if (!audioContextRef.current) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      audioContextRef.current = new AudioContext();
      gainNodeRef.current = audioContextRef.current.createGain();
      gainNodeRef.current.connect(audioContextRef.current.destination);
    }
  }, []);

  // Conectar audio al contexto
  const connectAudioToContext = useCallback((audioElement) => {
    if (!audioContextRef.current) {
      initAudioContext();
    }

    const source = audioContextRef.current.createMediaElementSource(audioElement);
    source.connect(gainNodeRef.current);
  }, [initAudioContext]);

  // Cleanup function
  const cleanup = useCallback(() => {
    if (hlsRef.current) {
      hlsRef.current.destroy();
      hlsRef.current = null;
    }
    if (audioRef.current) {
      audioRef.current.removeAttribute('src');
      audioRef.current.load();
    }
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

  // Play live stream
  const playLiveStream = useCallback(async (city) => {
    if (!city?.stream_url) {
      setError('Esta ciudad no tiene transmisión en vivo disponible');
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      // Crear o reutilizar elemento de audio
      let audio = audioRef.current;
      
      if (!audio) {
        audio = new Audio();
        audio.preload = 'auto';
        audioRef.current = audio;
      }

      // Configurar source solo si es diferente
      if (audio.src !== city.stream_url) {
        audio.src = city.stream_url;
      }

      // Mantener el volumen actual
      audio.volume = volume;
      audio.muted = isMuted;

      try {
        await audio.play();
        setIsPlaying(true);
        setIsLiveStream(true);
        setCurrentTrack(null);
        currentStreamUrlRef.current = city.stream_url;
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
  }, [volume, isMuted]);

  // Play track
  const playTrack = useCallback(async (track) => {
    if (!track?.audio?.url) {
      setError('Esta canción no tiene audio disponible');
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      // Crear o reutilizar elemento de audio
      let audio = audioRef.current;
      
      if (!audio) {
        audio = new Audio();
        audio.preload = 'auto';
        audioRef.current = audio;
      }

      // Configurar source solo si es diferente
      if (audio.src !== track.audio.url) {
        audio.src = track.audio.url;
      }

      // Mantener el volumen actual
      audio.volume = volume;
      audio.muted = isMuted;

      try {
        await audio.play();
        setIsPlaying(true);
        setIsLiveStream(false);
        setCurrentTrack(track);
        currentStreamUrlRef.current = '';
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
  }, [volume, isMuted]);

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

  // Configurar MediaSession
  const updateMediaSession = useCallback(() => {
    if ('mediaSession' in navigator) {
      navigator.mediaSession.metadata = new MediaMetadata({
        title: isLiveStream 
          ? `${selectedCity?.name || 'Toca Stereo'} - En vivo`
          : currentTrack?.title || '',
        artist: isLiveStream 
          ? selectedCity?.frequency || ''
          : currentTrack?.artist || '',
        artwork: [
          {
            src: isLiveStream
              ? (selectedCity?.coverlog?.url || '')
              : (currentTrack?.cover?.url || ''),
            sizes: '512x512',
            type: 'image/jpeg'
          }
        ]
      });

      navigator.mediaSession.setActionHandler('play', () => {
        if (!isPlaying) togglePlay();
      });

      navigator.mediaSession.setActionHandler('pause', () => {
        if (isPlaying) togglePlay();
      });

      // Actualizar el estado de reproducción
      navigator.mediaSession.playbackState = isPlaying ? 'playing' : 'paused';
    }
  }, [isLiveStream, selectedCity, currentTrack, isPlaying, togglePlay]);

  // Actualizar MediaSession cuando cambie el estado
  useEffect(() => {
    updateMediaSession();
  }, [updateMediaSession, isLiveStream, selectedCity, currentTrack, isPlaying]);

  // Configurar eventos del audio
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

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

    audio.addEventListener('play', handlePlay);
    audio.addEventListener('pause', handlePause);

    return () => {
      audio.removeEventListener('play', handlePlay);
      audio.removeEventListener('pause', handlePause);
    };
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return cleanup;
  }, [cleanup]);

  // Handle city change
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
    handleVolumeChange,
    toggleMute,
    playLiveStream,
    playTrack,
  };

  return (
    <PlayerContext.Provider value={value}>
      {children}
    </PlayerContext.Provider>
  );
}
