import React, { createContext, useContext, useState, useRef, useEffect, useCallback } from 'react';
import { useCity } from './CityContext';
import Hls from 'hls.js';

const PlayerContext = createContext();

// Función auxiliar para actualizar los metadatos de Media Session
const updateMediaSession = (data) => {
  if ('mediaSession' in navigator) {
    navigator.mediaSession.metadata = new MediaMetadata({
      title: data.title || 'En vivo',
      artist: data.artist || 'Toca Stereo',
      album: data.city || 'Radio en vivo',
      artwork: [
        {
          src: data.artwork || '/logo.png',
          sizes: '512x512',
          type: 'image/png'
        }
      ]
    });
  }
};

// Función auxiliar para configurar los controles de Media Session
const setupMediaSessionHandlers = (handlers) => {
  if ('mediaSession' in navigator) {
    navigator.mediaSession.setActionHandler('play', handlers.play || null);
    navigator.mediaSession.setActionHandler('pause', handlers.pause || null);
    navigator.mediaSession.setActionHandler('stop', handlers.stop || null);
  }
};

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
  const [isInitialized, setIsInitialized] = useState(false);

  const audioRef = useRef(null);
  const hlsRef = useRef(null);
  const { selectedCity } = useCity();

  // Cleanup function
  const cleanup = useCallback(() => {
    if (hlsRef.current) {
      hlsRef.current.destroy();
      hlsRef.current = null;
    }
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
    setVolume(newVolume);
    localStorage.setItem('playerVolume', newVolume);
  }, []);

  // Toggle mute
  const toggleMute = useCallback(() => {
    setIsMuted(prev => !prev);
    localStorage.setItem('playerMuted', !isMuted);
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

      // Configurar propiedades iniciales
      audio.preload = 'auto';
      audio.crossOrigin = 'anonymous';
    }

    return audio;
  }, []);

  // Efecto para manejar cambios de volumen
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
  }, [volume]);

  // Efecto para manejar cambios de mute
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.muted = isMuted;
    }
  }, [isMuted]);

  // Efecto para manejar los controles de Media Session
  useEffect(() => {
    const handlers = {
      play: async () => {
        try {
          if (audioRef.current) {
            await audioRef.current.play();
            setIsPlaying(true);
          }
        } catch (error) {
          console.error('Error playing from media session:', error);
        }
      },
      pause: () => {
        if (audioRef.current) {
          audioRef.current.pause();
          setIsPlaying(false);
        }
      },
      stop: () => {
        cleanup();
      }
    };

    setupMediaSessionHandlers(handlers);

    return () => {
      // Limpiar handlers al desmontar
      setupMediaSessionHandlers({});
    };
  }, [cleanup]);

  // Efecto para actualizar los metadatos de Media Session
  useEffect(() => {
    if (isPlaying) {
      if (isLiveStream && selectedCity) {
        updateMediaSession({
          title: `${selectedCity.name} - En vivo`,
          artist: selectedCity.frequency,
          city: selectedCity.name,
          artwork: selectedCity.coverlog?.formats?.small?.url || selectedCity.coverlog?.url
        });
      } else if (currentTrack) {
        updateMediaSession({
          title: currentTrack.title,
          artist: currentTrack.artist,
          artwork: currentTrack.cover?.url
        });
      }

      // Actualizar el estado de reproducción
      if ('mediaSession' in navigator) {
        navigator.mediaSession.playbackState = 'playing';
      }
    } else {
      if ('mediaSession' in navigator) {
        navigator.mediaSession.playbackState = 'paused';
      }
    }
  }, [isPlaying, isLiveStream, selectedCity, currentTrack]);

  // Setup HLS
  const setupHLS = useCallback((url, audio) => {
    if (hlsRef.current) {
      hlsRef.current.destroy();
    }

    const hls = new Hls({
      enableWorker: true,
      lowLatencyMode: true,
      backBufferLength: 90,
      maxBufferLength: 30,
      maxMaxBufferLength: 600,
      maxBufferSize: 60 * 1000 * 1000,
      maxBufferHole: 0.5,
      liveSyncDurationCount: 3,
      liveMaxLatencyDurationCount: 10,
      liveDurationInfinity: true,
      highBufferWatchdogPeriod: 2,
      nudgeOffset: 0.2,
    });

    hls.attachMedia(audio);
    hls.on(Hls.Events.MEDIA_ATTACHED, () => {
      console.log('HLS Media attached');
      hls.loadSource(url);
    });

    hls.on(Hls.Events.MANIFEST_PARSED, () => {
      console.log('HLS Manifest parsed');
    });

    hls.on(Hls.Events.ERROR, (event, data) => {
      if (data.fatal) {
        switch (data.type) {
          case Hls.ErrorTypes.NETWORK_ERROR:
            console.error('HLS Network Error:', data);
            hls.startLoad();
            break;
          case Hls.ErrorTypes.MEDIA_ERROR:
            console.error('HLS Media Error:', data);
            hls.recoverMediaError();
            break;
          default:
            console.error('HLS Fatal Error:', data);
            cleanup();
            break;
        }
      }
    });

    hlsRef.current = hls;
    return hls;
  }, [cleanup]);

  // Play live stream
  const playLiveStream = useCallback(async (city) => {
    if (!city?.stream_url) {
      setError('Esta ciudad no tiene transmisión en vivo disponible');
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      // Limpiar reproductor anterior si existe y es diferente URL
      if (audioRef.current && audioRef.current.src !== city.stream_url) {
        cleanup();
      }

      let audio = audioRef.current;
      
      // Solo crear nuevo elemento de audio si no existe
      if (!audio) {
        audio = setupAudioElement(city.stream_url);
        // Aplicar volumen y mute iniciales
        audio.volume = volume;
        audio.muted = isMuted;
      }
      
      // Intentar reproducir con HLS.js si es un stream .m3u8
      if (city.stream_url.includes('.m3u8')) {
        if (Hls.isSupported()) {
          console.log('Using HLS.js for playback');
          const hls = setupHLS(city.stream_url, audio);
          
          try {
            await audio.play();
            setIsPlaying(true);
            setIsLiveStream(true);
            setCurrentTrack(null);
          } catch (error) {
            console.error('Error reproduciendo HLS stream:', error);
            setError('Error al reproducir el audio');
            setIsPlaying(false);
          }
        } else if (audio.canPlayType('application/vnd.apple.mpegurl')) {
          console.log('Using native HLS playback');
          audio.src = city.stream_url;
          try {
            await audio.play();
            setIsPlaying(true);
            setIsLiveStream(true);
            setCurrentTrack(null);
          } catch (error) {
            console.error('Error reproduciendo native HLS:', error);
            setError('Error al reproducir el audio');
            setIsPlaying(false);
          }
        } else {
          setError('Tu navegador no soporta la reproducción de este stream');
          return;
        }
      } else {
        // Stream normal (mp3, aac, etc)
        console.log('Using regular audio playback');
        if (audio.src !== city.stream_url) {
          audio.src = city.stream_url;
        }
        try {
          await audio.play();
          setIsPlaying(true);
          setIsLiveStream(true);
          setCurrentTrack(null);
        } catch (error) {
          console.error('Error reproduciendo stream:', error);
          setError('Error al reproducir el audio');
          setIsPlaying(false);
        }
      }
    } catch (error) {
      console.error('Error general:', error);
      setError('Error al inicializar la transmisión');
      setIsPlaying(false);
    } finally {
      setIsLoading(false);
    }
  }, [cleanup, setupAudioElement, setupHLS, volume, isMuted]);

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
      audio.src = track.audio.url;

      try {
        await audio.play();
        setIsPlaying(true);
        setIsLiveStream(false);
        setCurrentTrack(track);
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
    
    if (!audioRef.current || !audioRef.current.src) {
      console.log('No audio element or no source, initializing stream');
      if (selectedCity) {
        await playLiveStream(selectedCity);
      }
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
  }, [isPlaying, selectedCity, playLiveStream]);

  // Cleanup on unmount
  useEffect(() => {
    return cleanup;
  }, [cleanup]);

  // Inicializar reproductor cuando se carga la página
  useEffect(() => {
    if (!isInitialized && selectedCity && isLiveStream) {
      console.log('Initializing player with selected city:', selectedCity);
      setIsInitialized(true);
      playLiveStream(selectedCity);
    }
  }, [selectedCity, isLiveStream, isInitialized, playLiveStream]);

  // Auto-play cuando se cambia de ciudad
  useEffect(() => {
    if (isInitialized && selectedCity && isLiveStream) {
      console.log('City changed, updating stream:', selectedCity);
      playLiveStream(selectedCity);
    }
  }, [selectedCity, isLiveStream, isInitialized, playLiveStream]);

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
};
