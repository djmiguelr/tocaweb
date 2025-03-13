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
    if (!city?.stream_url) {
      setError('Esta ciudad no tiene transmisión en vivo disponible');
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
      audioRef.current = new Audio(city.stream_url);
      audioRef.current.volume = isMuted ? 0 : volume;

      await audioRef.current.play();
      setIsPlaying(true);
      setIsLiveStream(true);
      setCurrentTrack(null);
    } catch (error) {
      console.error('Error playing live stream:', error);
      setError('Error al reproducir la transmisión en vivo');
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
