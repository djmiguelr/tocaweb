import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { motion } from 'framer-motion';
import { apiService } from '../services/api';
import { BiMusic, BiPlay, BiPause } from 'react-icons/bi';
import { usePlayer } from '../context/PlayerContext';
import { useCity } from '../context/CityContext';

export function TocaExitosPage() {
  const { selectedCity } = useCity();
  const { playTrack, currentTrack, isPlaying, togglePlay, isLoading: isPlayerLoading } = usePlayer();
  
  const [tocaExitos, setTocaExitos] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [loadingTrackId, setLoadingTrackId] = useState(null);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

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
        if (city?.TocaExitos) {
          setTocaExitos(city.TocaExitos);
        } else {
          setError('No hay canciones disponibles');
        }
      } catch (err) {
        console.error('Error loading TocaExitos:', err);
        setError(err.message || 'Error al cargar las canciones');
      } finally {
        setIsLoading(false);
      }
    };

    fetchTocaExitos();
  }, [selectedCity?.documentId]);

  const filteredTocaExitos = useMemo(() => {
    if (!tocaExitos.length) return [];

    return tocaExitos
      .filter(item => item.title && item.artist && item.song?.url)
      .sort((a, b) => (a.rank || 0) - (b.rank || 0));
  }, [tocaExitos]);

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
      <div className="min-h-screen pt-20 pb-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="animate-pulse bg-white/5 rounded-xl overflow-hidden">
                <div className="aspect-square bg-white/10" />
                <div className="p-6 space-y-3">
                  <div className="h-4 bg-white/10 rounded w-1/4" />
                  <div className="h-6 bg-white/10 rounded w-3/4" />
                  <div className="h-4 bg-white/10 rounded w-full" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen pt-20 pb-12">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="bg-red-500/10 border border-red-500 rounded-xl p-6 text-center">
              <p className="text-red-500 font-medium">{error}</p>
              <button 
                onClick={() => window.location.reload()}
                className="mt-4 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
              >
                Recargar página
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-20 pb-12 bg-gradient-to-b from-black/0 via-black/5 to-black/10">
      <div className="container mx-auto px-4">
        <header className="py-12 text-center">
          <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-white via-white to-primary bg-clip-text text-transparent mb-4">
            Toca Éxitos
          </h1>
          <p className="text-gray-400 text-lg md:text-xl max-w-2xl mx-auto">
            Descubre las canciones más populares del momento
          </p>
        </header>

        {filteredTocaExitos.length > 0 && (
          <div className="space-y-12">
            {/* Featured Track - Rank #1 */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary/10 via-white/5 to-white/0 backdrop-blur-sm"
            >
              <div className="flex flex-col md:flex-row gap-8 p-8">
                {/* Cover Art */}
                <div className="relative w-full md:w-1/3 aspect-square rounded-2xl overflow-hidden group">
                  {filteredTocaExitos[0].cover?.url ? (
                    <img
                      src={filteredTocaExitos[0].cover.url}
                      alt={filteredTocaExitos[0].title}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
                      <BiMusic className="w-20 h-20 text-primary/50" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  <button
                    onClick={() => handlePlay(filteredTocaExitos[0])}
                    disabled={isPlayerLoading || loadingTrackId === filteredTocaExitos[0].documentId}
                    className={`absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity ${currentTrack?.documentId === filteredTocaExitos[0].documentId ? 'text-primary' : 'text-white'}`}
                  >
                    {loadingTrackId === filteredTocaExitos[0].documentId ? (
                      <div className="w-16 h-16 border-3 border-white border-t-transparent rounded-full animate-spin" />
                    ) : currentTrack?.documentId === filteredTocaExitos[0].documentId && isPlaying ? (
                      <BiPause className="w-24 h-24" />
                    ) : (
                      <BiPlay className="w-24 h-24 ml-4" />
                    )}
                  </button>
                </div>

                {/* Track Info */}
                <div className="flex-1 flex flex-col justify-center">
                  <div className="flex items-start gap-6 mb-6">
                    <div className="text-8xl md:text-9xl font-bold bg-gradient-to-br from-primary via-primary/80 to-primary/60 bg-clip-text text-transparent">
                      #1
                    </div>
                    <div className="flex-1">
                      <h2 className="text-3xl md:text-4xl font-bold text-white mb-2 line-clamp-2">
                        {filteredTocaExitos[0].title}
                      </h2>
                      <p className="text-xl text-gray-400">
                        {filteredTocaExitos[0].artist}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => handlePlay(filteredTocaExitos[0])}
                    disabled={isPlayerLoading || loadingTrackId === filteredTocaExitos[0].documentId}
                    className={`md:hidden w-full py-4 px-6 rounded-xl ${currentTrack?.documentId === filteredTocaExitos[0].documentId ? 'bg-primary text-white' : 'bg-white/10 text-white hover:bg-white/20'} transition-colors flex items-center justify-center gap-3`}
                  >
                    {loadingTrackId === filteredTocaExitos[0].documentId ? (
                      <div className="w-6 h-6 border-2 border-current border-t-transparent rounded-full animate-spin" />
                    ) : currentTrack?.documentId === filteredTocaExitos[0].documentId && isPlaying ? (
                      <>
                        <BiPause className="w-6 h-6" />
                        <span>Pausar</span>
                      </>
                    ) : (
                      <>
                        <BiPlay className="w-6 h-6 ml-1" />
                        <span>Reproducir</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </motion.div>

            {/* Remaining Tracks Grid */}
            {filteredTocaExitos.length > 1 && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredTocaExitos.slice(1).map((item, index) => (
                  <motion.article
                    key={item.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="group bg-white/5 backdrop-blur-sm rounded-2xl overflow-hidden hover:bg-white/10 transition-all duration-300 transform hover:scale-[1.02] hover:shadow-xl hover:shadow-black/20"
                  >
                    <div className="p-4 flex items-center gap-4">
                      {/* Rank Number */}
                      <div className="text-3xl font-bold bg-gradient-to-br from-primary via-primary/80 to-primary/60 bg-clip-text text-transparent">
                        #{item.rank}
                      </div>

                      {/* Title and Artist */}
                      <div className="flex-1 min-w-0">
                        <h3 className="text-lg font-bold text-white line-clamp-1 group-hover:text-primary transition-colors">
                          {item.title}
                        </h3>
                        <p className="text-sm text-gray-400 line-clamp-1">
                          {item.artist}
                        </p>
                      </div>

                      {/* Cover Art and Play Button */}
                      <div className="relative w-16 h-16 flex-shrink-0 rounded-lg overflow-hidden">
                        {item.cover?.url ? (
                          <img
                            src={item.cover.url}
                            alt={item.title}
                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                          />
                        ) : (
                          <div className="w-full h-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
                            <BiMusic className="w-8 h-8 text-primary/50" />
                          </div>
                        )}
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <button
                            onClick={() => handlePlay(item)}
                            disabled={isPlayerLoading || loadingTrackId === item.documentId}
                            className={`transform transition-all duration-300 ${currentTrack?.documentId === item.documentId ? 'text-primary' : 'text-white'} ${(isPlayerLoading || loadingTrackId === item.documentId) ? 'opacity-50 cursor-wait' : ''}`}
                          >
                            {loadingTrackId === item.documentId ? (
                              <div className="w-8 h-8 border-2 border-current border-t-transparent rounded-full animate-spin" />
                            ) : currentTrack?.documentId === item.documentId && isPlaying ? (
                              <BiPause className="w-8 h-8" />
                            ) : (
                              <BiPlay className="w-8 h-8 ml-1" />
                            )}
                          </button>
                        </div>
                      </div>
                    </div>
                  </motion.article>
                ))}                
              </div>
            )}
          </div>
        )}

        {tocaExitos.length === 0 && !isLoading && (
          <div className="text-center py-20">
            <div className="bg-white/5 rounded-2xl p-8 max-w-2xl mx-auto">
              <BiMusic className="w-16 h-16 text-primary/50 mx-auto mb-4" />
              <p className="text-gray-400 text-lg mb-4">
                No hay canciones disponibles en este momento.
              </p>
              <button
                onClick={() => window.location.reload()}
                className="px-6 py-2 bg-primary text-white rounded-full hover:bg-primary-dark transition-colors"
              >
                Recargar página
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}