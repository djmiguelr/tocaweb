import { createContext, useContext, useState, useRef, useCallback, useEffect } from 'react';
import { BASE_URL } from '../services/api';

// Create context
const PlayerContext = createContext(null);

// Create provider component
const PlayerProvider = ({ children }) => {
  // States
  const [currentTrack, setCurrentTrack] = useState(null);
  const [isLiveStream, setIsLiveStream] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [queue, setQueue] = useState([]);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);

  // Refs
  const audioRef = useRef(null);
  const playPromiseRef = useRef(null);
  const hasInteractedRef = useRef(false);

  const setupAudio = useCallback(async (url, options = {}) => {
    try {
      if (!url) {
        throw new Error('URL de audio no válida');
      }

      setIsLoading(true);
      setError(null);

      const currentAudio = audioRef.current;
      if (!currentAudio) {
        throw new Error('Reproductor de audio no inicializado');
      }

      // Ensure URL is properly formatted
      const formattedUrl = url.startsWith('http') ? url : `${BASE_URL}${url.startsWith('/') ? '' : '/'}${url}`;
      currentAudio.src = formattedUrl;
      currentAudio.crossOrigin = 'anonymous';
      
      // Add event listeners for error handling
      const errorHandler = (e) => {
        console.error('Audio error:', e);
        setError('Error en la reproducción del audio');
        setIsPlaying(false);
      };
      
      currentAudio.addEventListener('error', errorHandler);
      await currentAudio.load();
      currentAudio.removeEventListener('error', errorHandler);
      
      if (options.autoplay && hasInteractedRef.current) {
        try {
          playPromiseRef.current = currentAudio.play();
          await playPromiseRef.current;
          setIsPlaying(true);
        } catch (playError) {
          if (playError.name === 'NotAllowedError') {
            throw new Error('Reproducción bloqueada. Haz clic para reproducir.');
          } else if (playError.name === 'AbortError') {
            throw new Error('La conexión al stream fue interrumpida. Intente nuevamente.');
          }
          throw playError;
        }
      }
    } catch (error) {
      console.error('Error setting up audio:', error);
      setError(error.message || 'Error al reproducir el audio');
      setIsPlaying(false);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const playTrack = useCallback(async (track) => {
    try {
      if (!track?.song?.url) {
        throw new Error('URL de canción no válida');
      }

      setCurrentTrack(track);
      setIsLiveStream(false);
      
      const audioUrl = track.song.url.startsWith('http') 
        ? track.song.url 
        : `${BASE_URL}${track.song.url.startsWith('/') ? '' : '/'}${track.song.url}`;
      
      await setupAudio(audioUrl, { 
        crossOrigin: 'anonymous',
        autoplay: true 
      });
    } catch (error) {
      console.error('Error reproduciendo track:', error);
      setError(error.message);
      throw error;
    }
  }, [setupAudio]);

  const togglePlay = useCallback(async () => {
    if (!audioRef.current?.src) return;
    hasInteractedRef.current = true;

    try {
      setError(null);
      
      if (isPlaying) {
        audioRef.current.pause();
        setIsPlaying(false);
      } else {
        setIsLoading(true);
        try {
          playPromiseRef.current = audioRef.current.play();
          await playPromiseRef.current;
          setIsPlaying(true);
        } catch (playError) {
          if (playError.name === 'NotAllowedError') {
            throw new Error('Reproducción bloqueada. Haz clic para reproducir.');
          }
          throw playError;
        } finally {
          setIsLoading(false);
        }
      }
    } catch (error) {
      console.error('Error en toggle play/pause:', error);
      setError(error.message || 'Error al reproducir');
      setIsPlaying(false);
    }
  }, [isPlaying]);

  const returnToLive = useCallback(async (city) => {
    try {
      if (!city?.stream_url) {
        throw new Error('URL de transmisión no válida');
      }

      setCurrentTrack(null);
      setIsLiveStream(true);
      
      // Handle stream URL formatting
      const streamUrl = city.stream_url.startsWith('http')
        ? city.stream_url
        : `${BASE_URL}${city.stream_url.startsWith('/') ? '' : '/'}${city.stream_url}`;

      await setupAudio(streamUrl, { 
        crossOrigin: 'anonymous',
        autoplay: true 
      });
    } catch (error) {
      console.error('Error conectando al stream en vivo:', error);
      setError(error.message);
      throw error;
    }
  }, [setupAudio]);

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
    playPromiseRef,
    hasInteractedRef,
    playTrack,
    togglePlay,
    setupAudio,
    returnToLive
  };

  return <PlayerContext.Provider value={value}>{children}</PlayerContext.Provider>;
}

// Create custom hook for using the context
const usePlayer = () => {
  const context = useContext(PlayerContext);
  if (!context) {
    throw new Error('usePlayer must be used within a PlayerProvider');
  }
  return context;
};

export { PlayerContext, PlayerProvider, usePlayer };
