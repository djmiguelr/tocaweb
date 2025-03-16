import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { TocaExitosCard } from '../components/Shared/TocaExitosCard';
import { SEO } from '../components/SEO';
import { useCity } from '../context/CityContext';
import { apiService } from '../services/api';

export function TocaExitosPage() {
  const [tocaExitos, setTocaExitos] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const { selectedCity } = useCity();

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
          setTocaExitos([]);
        }
      } catch (error) {
        console.error('Error fetching Toca Éxitos:', error);
        setError('Error cargando Toca Éxitos');
      } finally {
        setIsLoading(false);
        window.scrollTo(0, 0);
      }
    };

    fetchTocaExitos();
  }, [selectedCity?.documentId]);

  if (isLoading) {
    return (
      <div className="min-h-screen pt-24">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <div className="h-12 w-64 bg-white/10 rounded animate-pulse mx-auto" />
          </div>
          
          {/* Top track skeleton */}
          <div className="max-w-5xl mx-auto">
            <div className="aspect-[21/9] bg-white/5 rounded-2xl animate-pulse mb-12" />
          </div>
          
          {/* Second row skeletons */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
            {[...Array(2)].map((_, i) => (
              <div key={i} className="h-24 bg-white/5 rounded-xl animate-pulse" />
            ))}
          </div>
          
          {/* Rest of tracks skeletons */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {[...Array(7)].map((_, i) => (
              <div key={i} className="h-20 bg-white/5 rounded-xl animate-pulse" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen pt-24 flex items-center justify-center">
        <div className="text-center">
          <p className="text-xl text-white mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary-hover transition-colors"
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  if (!tocaExitos.length) {
    return (
      <div className="min-h-screen pt-24 flex items-center justify-center">
        <div className="text-center">
          <p className="text-xl text-white/60 mb-4">No hay canciones disponibles en este momento</p>
        </div>
      </div>
    );
  }

  const [firstTrack, secondTrack, thirdTrack, ...restTracks] = tocaExitos;

  return (
    <>
      <SEO 
        title="Toca Éxitos - Las canciones más escuchadas"
        description="Descubre las canciones más populares del momento en Toca Éxitos. Escucha los mejores hits y mantente al día con la música que está marcando tendencia."
      />

      <div className="min-h-screen pt-24">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h1 className="text-5xl md:text-6xl font-bold text-white">Toca Éxitos</h1>
            <p className="text-white/60 mt-4 text-lg">Las canciones más escuchadas de la semana</p>
          </div>

          {/* Rank 1 - Featured */}
          <div className="mb-8 md:mb-24 w-full">
            <div className="relative bg-gradient-to-br from-red-500/20 via-primary/20 to-purple-500/20 rounded-[2rem] overflow-hidden p-1">
              <div className="relative bg-black/40 backdrop-blur-xl rounded-[1.85rem] overflow-hidden group">
                <div className="absolute inset-0 bg-gradient-to-br from-red-500/10 via-primary/10 to-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                
                <div className="grid lg:grid-cols-[1fr,1.2fr] gap-4 md:gap-12 p-4 md:p-12">
                  {/* Left side - Image and Rank */}
                  <div className="relative aspect-square lg:aspect-auto order-2 lg:order-1">
                    <div className="relative z-10 w-full h-full rounded-2xl overflow-hidden shadow-2xl transform group-hover:scale-[1.02] transition-transform duration-500">
                      <img
                        src={firstTrack.cover?.url}
                        alt={firstTrack.title}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/0 to-black/0" />
                    </div>
                    
                    {/* Rank Badge */}
                    <div className="absolute -bottom-4 md:-bottom-8 -right-4 md:-right-8 w-20 md:w-32 h-20 md:h-32 bg-gradient-to-br from-red-500 to-red-600 rounded-3xl flex items-center justify-center transform rotate-12 shadow-xl z-20 group-hover:scale-110 group-hover:rotate-6 transition-all duration-500">
                      <span className="text-4xl md:text-7xl font-bold text-white transform -rotate-12 group-hover:rotate-0 transition-transform duration-500">#1</span>
                    </div>
                  </div>

                  {/* Right side - Content */}
                  <div className="flex flex-col justify-between py-1 md:py-6 relative z-10 order-1 lg:order-2">
                    <div>
                      <div className="flex items-center gap-3 mb-3 md:mb-8">
                        <div className="px-3 md:px-6 py-1 md:py-2 bg-gradient-to-r from-red-500 to-red-600 rounded-full shadow-lg transform group-hover:translate-y-1 transition-transform duration-500">
                          <span className="text-xs md:text-base text-white font-semibold tracking-wide">TocaÉxitos</span>
                        </div>
                        <div className="h-px flex-1 bg-gradient-to-r from-white/20 to-white/5" />
                      </div>
                      
                      <h2 className="text-2xl md:text-5xl lg:text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-white to-white/80 leading-tight mb-2 md:mb-6 break-words">
                        {firstTrack.title}
                      </h2>
                      
                      <p className="text-lg md:text-3xl lg:text-4xl text-white/80 mb-3 md:mb-10 break-words">
                        {firstTrack.artist}
                      </p>
                      
                      <div className="hidden md:block space-y-4 md:space-y-6 text-base md:text-lg text-white/60">
                        <p className="flex items-center gap-3 group-hover:translate-x-2 transition-transform duration-500">
                          <span className="w-6 h-px bg-gradient-to-r from-red-500 to-primary" />
                          Canción más escuchada esta semana
                        </p>
                      </div>
                    </div>
                    
                    <div className="mt-4 md:mt-12">
                      <TocaExitosCard
                        track={firstTrack}
                        rank={1}
                        variant="button-only"
                        className="w-full transform hover:scale-[1.02] transition-transform duration-500"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Rank 2 & 3 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 mb-8 md:mb-12">
            {[secondTrack, thirdTrack].map((track, index) => (
              <motion.div
                key={track.documentId}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <TocaExitosCard
                  track={track}
                  rank={index + 2}
                  variant="horizontal"
                  className="hover:scale-[1.02] transition-transform duration-300"
                />
              </motion.div>
            ))}
          </div>

          {/* Rest of tracks */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 md:gap-4">
            {restTracks.map((track, index) => (
              <motion.div
                key={track.documentId}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: (index + 2) * 0.1 }}
              >
                <TocaExitosCard
                  track={track}
                  rank={index + 4}
                  variant="horizontal"
                  className="hover:scale-[1.02] transition-transform duration-300"
                />
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}