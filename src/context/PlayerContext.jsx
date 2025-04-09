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
  const setupAudioElement = useCallback(() => {
    let audio = audioRef.current;
    
    if (!audio) {
      audio = new Audio();
      audioRef.current = audio;

      // Configurar opciones de audio
      audio.preload = 'auto';
      audio.crossOrigin = 'anonymous';
      
      // Manejar eventos de audio
      const handlers = {
        ended: () => setIsPlaying(false),
        playing: () => setIsPlaying(true),
        pause: () => setIsPlaying(false),
        waiting: () => setIsLoading(true),
        canplay: () => setIsLoading(false),
        error: (e) => {
          console.error('Error en reproducción:', e);
          let errorMessage = 'Error en la reproducción de audio';
          
          if (e.target.error) {
            switch (e.target.error.code) {
              case MediaError.MEDIA_ERR_ABORTED:
                errorMessage = 'La reproducción fue interrumpida';
                break;
              case MediaError.MEDIA_ERR_NETWORK:
                errorMessage = 'Error de conexión. Reintentando...';
                // Intentar reconectar
                if (audio.src) {
                  setTimeout(() => {
                    audio.load();
                    audio.play().catch((err) => {
                      console.error('Error al reconectar:', err);
                      setError('Error al reconectar');
                    });
                  }, 3000);
                }
                break;
              case MediaError.MEDIA_ERR_DECODE:
                errorMessage = 'Error al procesar el audio';
                break;
              case MediaError.MEDIA_ERR_SRC_NOT_SUPPORTED:
                errorMessage = 'Formato de audio no soportado';
                break;
            }
          }
          
          setError(errorMessage);
          setIsLoading(false);
          setIsPlaying(false);
        }
      };

      // Agregar todos los event listeners
      Object.entries(handlers).forEach(([event, handler]) => {
        audio.addEventListener(event, handler);
      });

      // Cleanup function para remover event listeners
      return () => {
        Object.entries(handlers).forEach(([event, handler]) => {
          audio?.removeEventListener(event, handler);
        });
      };
    }

    audio.volume = isMuted ? 0 : volume;
    return audio;
  }, [volume, isMuted]);

  // Configurar HLS
  const setupHLS = useCallback((url, audio) => {
    const hls = new Hls({
      debug: false,
      enableWorker: true,
      lowLatencyMode: true,
      backBufferLength: 90
    });

    hls.on(Hls.Events.ERROR, (event, data) => {
      if (data.fatal) {
        switch (data.type) {
          case Hls.ErrorTypes.NETWORK_ERROR:
            console.error('Error de red en HLS:', data);
            hls.startLoad();
            break;
          case Hls.ErrorTypes.MEDIA_ERROR:
            console.error('Error de medio en HLS:', data);
            hls.recoverMediaError();
            break;
          default:
            console.error('Error fatal en HLS:', data);
            cleanup();
            break;
        }
      }
    });

    return hls;
  }, [cleanup]);

  // Procesar URL del stream
  const processStreamUrl = useCallback((url) => {
    if (!url) return null;
    return url; // Usar la URL del stream directamente
  }, []);

  // Reproducir stream
  const playStream = useCallback(async () => {
    try {
      if (!audioRef.current) {
        throw new Error('No se encontró el elemento de audio');
      }

      setIsLoading(true);
      setError(null);

      // Asegurarse de que el audio esté cargado
      await new Promise((resolve, reject) => {
        const onCanPlay = () => {
          audioRef.current.removeEventListener('canplay', onCanPlay);
          audioRef.current.removeEventListener('error', onError);
          resolve();
        };

        const onError = (e) => {
          audioRef.current.removeEventListener('canplay', onCanPlay);
          audioRef.current.removeEventListener('error', onError);
          reject(e);
        };

        audioRef.current.addEventListener('canplay', onCanPlay);
        audioRef.current.addEventListener('error', onError);

        // Si ya está cargado, resolver inmediatamente
        if (audioRef.current.readyState >= 3) {
          onCanPlay();
        } else {
          audioRef.current.load();
        }
      });

      // Configurar el volumen antes de reproducir
      audioRef.current.volume = isMuted ? 0 : volume;

      // Intentar reproducir
      await audioRef.current.play();
      setIsPlaying(true);
      setIsLoading(false);
    } catch (error) {
      console.error('Error al reproducir stream:', error);
      setError('Error al reproducir el audio');
      setIsPlaying(false);
      setIsLoading(false);
      throw error;
    }
  }, [volume, isMuted]);

  // Play live stream
  const playLiveStream = useCallback(async (city) => {
    if (!city?.stream_url) {
      setError('Esta ciudad no tiene stream disponible');
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      cleanup();

      const processedUrl = processStreamUrl(city.stream_url);
      if (!processedUrl) {
        throw new Error('URL de stream inválida');
      }

      const audio = setupAudioElement();
      
      // Si es HLS y está soportado
      if (processedUrl.includes('.m3u8')) {
        if (Hls.isSupported()) {
          const hls = setupHLS(processedUrl, audio);
          hls.loadSource(processedUrl);
          hls.attachMedia(audio);
          hlsRef.current = hls;

          await new Promise((resolve, reject) => {
            const onManifestParsed = async () => {
              try {
                await playStream();
                resolve();
              } catch (error) {
                reject(error);
              }
            };

            const onError = (event, data) => {
              if (data.fatal) {
                reject(new Error('Error fatal de HLS'));
              }
            };

            hls.once(Hls.Events.MANIFEST_PARSED, onManifestParsed);
            hls.once(Hls.Events.ERROR, onError);
          });
        } else if (audio.canPlayType('application/vnd.apple.mpegurl')) {
          audio.src = processedUrl;
          await playStream();
        } else {
          throw new Error('HLS no soportado');
        }
      } else {
        audio.src = processedUrl;
        await playStream();
      }

      setIsPlaying(true);
      setIsLiveStream(true);
      setCurrentTrack(null);

      // Actualizar metadatos
      updateMediaSession({
        title: 'En vivo',
        artist: 'Toca Stereo',
        city: city.name
      });

    } catch (error) {
      console.error('Error al inicializar stream:', error);
      setError(error.message || 'Error al inicializar la transmisión');
      setIsPlaying(false);
    } finally {
      setIsLoading(false);
    }
  }, [cleanup, setupAudioElement, setupHLS, processStreamUrl, playStream]);

  // Play track
  const playTrack = useCallback(async (track) => {
    if (!track?.audio?.url) {
      setError('Esta canción no tiene audio disponible');
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      cleanup();

      const audio = setupAudioElement();
      audio.src = track.audio.url;
      audio.volume = isMuted ? 0 : volume;

      await audio.play();
      setIsPlaying(true);
      setIsLiveStream(false);
      setCurrentTrack(track);
    } catch (error) {
      setError('Error al reproducir la canción');
      console.error('Error general:', error);
      setError('Error al inicializar la reproducción');
      setIsPlaying(false);
    } finally {
      setIsLoading(false);
    }
  }, [cleanup, setupAudioElement]);

  // Toggle play/pause
  const togglePlay = useCallback(async () => {
    try {
      if (!audioRef.current || !audioRef.current.src) {
        if (selectedCity) {
          await playLiveStream(selectedCity);
        }
        return;
      }

      if (isPlaying) {
        audioRef.current.pause();
        setIsPlaying(false);
      } else {
        await playStream();
      }
    } catch (error) {
      console.error('Error toggling play state:', error);
      setError(error.message || 'Error al reproducir el audio');
      setIsPlaying(false);
    }
  }, [isPlaying, selectedCity, playLiveStream, playStream]);

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
}
