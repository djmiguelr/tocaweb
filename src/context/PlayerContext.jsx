import { createContext, useContext, useState, useRef, useCallback, useEffect } from 'react';
import { constants } from '../services/api';

// Crear el contexto
const PlayerContext = createContext(null);

// Hook personalizado
function usePlayer() {
  const context = useContext(PlayerContext);
  if (!context) {
    throw new Error('usePlayer debe usarse dentro de un PlayerProvider');
  }
  return context;
}

// Provider Component
export function PlayerProvider({ children }) {
  // Estados
  const [currentTrack, setCurrentTrack] = useState(null);
  const [isLiveStream, setIsLiveStream] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [queue, setQueue] = useState([]);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);

  // Referencias
  const audioRef = useRef(null);

  // Añadir estado para controlar si hubo interacción
  const [hasUserInteracted, setHasUserInteracted] = useState(false);
  const [autoplayBlocked, setAutoplayBlocked] = useState(false);

  // Inicializar el reproductor de audio
  useEffect(() => {
    if (!audioRef.current) {
      audioRef.current = new Audio();
      audioRef.current.preload = 'auto';
      
      // Configurar eventos del audio
      audioRef.current.addEventListener('playing', () => setIsPlaying(true));
      audioRef.current.addEventListener('pause', () => setIsPlaying(false));
      audioRef.current.addEventListener('ended', () => {
        setIsPlaying(false);
        setCurrentTrack(null);
      });
      audioRef.current.addEventListener('error', (e) => {
        console.error('Error en audio:', e);
        if (!hasUserInteracted) {
          setAutoplayBlocked(true);
        } else {
          setError('Error al reproducir el audio');
        }
        setIsPlaying(false);
      });
    }

    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = '';
        audioRef.current = null;
      }
    };
  }, [hasUserInteracted]);

  // Función para volver a la transmisión en vivo
  const returnToLive = useCallback(async (city) => {
    if (!city?.stream_url) {
      setError('URL de stream no disponible');
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      // Asegurarse de que audioRef existe
      if (!audioRef.current) {
        audioRef.current = new Audio();
        audioRef.current.preload = 'auto';
      }

      // Detener cualquier reproducción actual
      audioRef.current.pause();
      audioRef.current.src = '';

      // Configurar nuevo stream
      audioRef.current.src = city.stream_url;

      if (hasUserInteracted) {
        await audioRef.current.play();
        setIsPlaying(true);
      } else {
        setAutoplayBlocked(true);
      }
      
      setIsLiveStream(true);
      setCurrentTrack(null);
    } catch (err) {
      console.error('Error al volver al stream:', err);
      if (err.name === 'NotAllowedError') {
        setAutoplayBlocked(true);
      } else {
        setError('No se pudo conectar al stream en vivo');
      }
    } finally {
      setIsLoading(false);
    }
  }, [hasUserInteracted]);

  // Función para reproducir una pista
  const playTrack = useCallback(async (track) => {
    if (!audioRef.current || !track?.song?.url) {
      throw new Error('No se puede reproducir la pista');
    }

    try {
      setIsLoading(true);
      setError(null);

      // Detener cualquier reproducción actual
      audioRef.current.pause();
      audioRef.current.src = '';

      // Configurar el nuevo audio
      audioRef.current.src = track.song.url;
      await audioRef.current.play();

      setCurrentTrack(track);
      setIsLiveStream(false);
      setIsPlaying(true);
    } catch (err) {
      console.error('Error al reproducir track:', err);
      setError('Error al reproducir la pista');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Función para alternar play/pause
  const togglePlay = useCallback(async () => {
    if (!audioRef.current) return;

    try {
      if (isPlaying) {
        audioRef.current.pause();
        setIsPlaying(false);
      } else {
        const playPromise = audioRef.current.play();
        if (playPromise !== undefined) {
          await playPromise;
          setIsPlaying(true);
        }
      }
    } catch (err) {
      console.error('Error al reproducir:', err);
      setError('Error al reproducir audio');
    }
  }, [isPlaying]);

  // Implementar playPreviousTrack si lo necesitas
  const playPreviousTrack = useCallback(() => {
    // Implementar lógica para reproducir la pista anterior
    console.log('Función playPreviousTrack no implementada');
  }, []);

  // Implementar playNextTrack si lo necesitas
  const playNextTrack = useCallback(() => {
    // Implementar lógica para reproducir la siguiente pista
    console.log('Función playNextTrack no implementada');
  }, []);

  // Función para manejar la primera interacción
  const handleFirstInteraction = useCallback(async () => {
    setHasUserInteracted(true);
    setAutoplayBlocked(false);
    
    if (audioRef.current && audioRef.current.src && !isPlaying) {
      try {
        await audioRef.current.play();
        setIsPlaying(true);
      } catch (err) {
        console.error('Error al reproducir después de interacción:', err);
        setError('Error al reproducir el audio');
      }
    }
  }, [isPlaying]);

  const value = {
    currentTrack,
    setCurrentTrack,
    isLiveStream,
    setIsLiveStream,
    isPlaying,
    setIsPlaying,
    isLoading,
    setIsLoading,
    error,
    setError,
    queue,
    setQueue,
    progress,
    setProgress,
    duration,
    setDuration,
    audioRef,
    playTrack,
    togglePlay,
    returnToLive,
    playPreviousTrack,
    playNextTrack,
    autoplayBlocked,
    handleFirstInteraction,
    hasUserInteracted
  };

  return <PlayerContext.Provider value={value}>{children}</PlayerContext.Provider>;
}

// Exportar todo junto
export { usePlayer };
