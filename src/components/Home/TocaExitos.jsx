import React, { useState, useEffect, useMemo, useCallback, memo } from 'react';
import { useCity } from '../../context/CityContext';
import { apiService, constants } from '../../services/api';
import { motion } from 'framer-motion';
import { BiPlay, BiPause } from 'react-icons/bi';
import { usePlayer } from '../../context/PlayerContext';
import { Link } from 'react-router-dom';

export const TocaExitos = memo(function TocaExitos() {
  const { selectedCity } = useCity();
  const { 
    playTrack, 
    currentTrack, 
    isPlaying, 
    togglePlay, 
    isLoading: isPlayerLoading 
  } = usePlayer();
  
  const [loadingTrackId, setLoadingTrackId] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchTocaExitos = async () => {
      if (!selectedCity?.documentId) {
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setError(null);

        const city = await apiService.getCity(selectedCity.documentId);
        selectedCity.TocaExitos = city.TocaExitos;
        
      } catch (err) {
        console.error('Error loading TocaExitos:', err);
        setError(err.message || 'Error loading songs');
      } finally {
        setIsLoading(false);
      }
    };

    fetchTocaExitos();
  }, [selectedCity?.documentId]);

  // Usar TocaExitos de la ciudad o los globales
  const tocaExitos = useMemo(() => {
    if (!selectedCity?.TocaExitos) {
      return [];
    }

    const filteredExitos = selectedCity.TocaExitos
      .filter(item => item.title && item.artist && item.song?.url)
      .sort((a, b) => (a.rank || 0) - (b.rank || 0))
      .slice(0, 5);

    setIsLoading(false);
    return filteredExitos;
  }, [selectedCity?.TocaExitos]);

  // Memorizar la función handlePlay
  const handlePlay = useCallback(async (track) => {
    if (!track.song?.url) {
      console.warn('Track sin URL de audio:', track);
      return;
    }
    
    if (currentTrack?.documentId === track.documentId) {
      togglePlay();
      return;
    }

    try {
      setLoadingTrackId(track.documentId);
      await playTrack(track);
    } catch (err) {
      console.error('Error reproduciendo track:', err);
    } finally {
      setLoadingTrackId(null);
    }
  }, [currentTrack?.documentId, togglePlay, playTrack]);

  if (isLoading) {
    return (
      <div className="bg-[#1C1C1C] rounded-xl p-6">
        <div className="animate-pulse flex space-x-4">
          <div className="flex-1 space-y-4 py-1">
            <div className="h-4 bg-gray-700 rounded w-3/4"></div>
            <div className="space-y-3">
              <div className="h-4 bg-gray-700 rounded"></div>
              <div className="h-4 bg-gray-700 rounded w-5/6"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!tocaExitos.length) {
    return (
      <div className="bg-[#1C1C1C] rounded-xl p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-white">TocaExitos</h2>
          <Link to="/toca-exitos" className="text-sm text-primary hover:text-primary-hover transition-colors">
            Ver todos
          </Link>
        </div>
        <div className="text-center py-8">
          <p className="text-gray-400">No hay canciones disponibles en este momento</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#1C1C1C] rounded-xl p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-white">TocaExitos</h2>
        <Link to="/toca-exitos" className="text-sm text-primary hover:text-primary-hover transition-colors">
          Ver todos
        </Link>
      </div>

      <div className="relative overflow-x-auto pb-4 -mx-6 px-6">
        <div className="flex gap-4 snap-x snap-mandatory overflow-x-auto scrollbar-hide">
          {selectedCity?.TocaExitos?.map((exito, index) => (
            <motion.div
              key={`${exito.id}-${index}`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="flex-none w-[calc(50%-8px)] sm:w-[calc(50%-8px)] md:w-[calc(33.33%-11px)] lg:w-[calc(25%-12px)] xl:w-[calc(20%-13px)] snap-start"
            >
              <div className="bg-white/5 rounded-lg overflow-hidden hover:bg-white/10 transition-all duration-300 h-full">
                <div className="p-4">
                  <div className="relative aspect-square mb-4">
                    <img
                      src={exito.cover?.url || '/placeholder-cover.jpg'}
                      alt={exito.title}
                      className="w-full h-full object-cover rounded-lg"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 hover:opacity-100 transition-opacity rounded-lg">
                      <button
                        onClick={() => handlePlay(exito)}
                        disabled={isPlayerLoading || loadingTrackId === exito.documentId}
                        className={`transform hover:scale-110 transition-all duration-300 ${(isPlayerLoading || loadingTrackId === exito.documentId) ? 'opacity-50 cursor-wait' : ''}`}
                      >
                        {loadingTrackId === exito.documentId ? (
                          <div className="w-12 h-12 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        ) : currentTrack?.documentId === exito.documentId && isPlaying ? (
                          <BiPause className="w-12 h-12 text-white" />
                        ) : (
                          <BiPlay className="w-12 h-12 text-white ml-1" />
                        )}
                      </button>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="text-3xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                      #{exito.rank || index + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-white font-medium truncate">{exito.title}</h3>
                      <p className="text-gray-400 text-sm truncate">{exito.artist}</p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
});