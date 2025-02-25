import { useState, useEffect, useMemo, useCallback } from 'react';
import { useCity } from '../context/CityContext';
import { BASE_URL } from '../services/api';
import { motion } from 'framer-motion';
import { 
  BiPlay, 
  BiPause, 
  BiTime, 
  BiTrendingUp,
  BiGridAlt,
  BiListUl,
  BiChevronRight 
} from 'react-icons/bi';
import { usePlayer } from '../context/PlayerContext';
import { FilterButton } from '../components/Shared/FilterButton';
import { ViewButton } from '../components/Shared/ViewButton';

export function TocaExitosPage() {
  const { selectedCity, setSelectedCity } = useCity();
  const { 
    playTrack, 
    currentTrack, 
    isPlaying, 
    togglePlay, 
    isLoading: isPlayerLoading 
  } = usePlayer();
  
  const [sortBy, setSortBy] = useState('rank');
  const [view, setView] = useState('grid');
  const [isLoading, setIsLoading] = useState(true);
  const [loadingTrackId, setLoadingTrackId] = useState(null);
  const [error, setError] = useState(null);

  // Memorizar la función de fetch para evitar recreaciones
  const fetchCityData = useCallback(async () => {
    if (!selectedCity?.documentId) {
      setIsLoading(false);
      setError('Ciudad no seleccionada');
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch(
        `${BASE_URL}/api/ciudades?filters[documentId][$eq]=${selectedCity.documentId}&populate[TocaExitos][populate]=*`
      );

      if (!response.ok) {
        throw new Error(`Error de servidor: ${response.status}`);
      }

      const data = await response.json();
      
      if (!data?.data?.[0]) {
        throw new Error('No se encontró la ciudad seleccionada');
      }
      
      if (!data?.data?.[0]?.attributes) {
        setError('No hay contenido disponible para esta ciudad');
        setIsLoading(false);
        return;
      }

      const cityData = data.data[0].attributes;
      const tocaExitosData = cityData.TocaExitos?.data || [];

      if (tocaExitosData.length === 0) {
        setError('No hay canciones disponibles para esta ciudad');
        return;
      }
      
      setSelectedCity(prev => ({
        ...prev,
        TocaExitos: tocaExitosData.map(item => ({
          id: item.id,
          documentId: item.attributes?.documentId || `toca-${item.id}`,
          title: item.attributes?.title,
          artist: item.attributes?.artist,
          rank: item.attributes?.rank || 0,
          cover: item.attributes?.cover?.data?.attributes ? {
            url: item.attributes.cover.data.attributes.url,
            documentId: item.attributes.cover.data.attributes.documentId
          } : null,
          song: item.attributes?.song?.data?.attributes ? {
            url: item.attributes.song.data.attributes.url,
            documentId: item.attributes.song.data.attributes.documentId
          } : null
        }))
      }));
    } catch (err) {
      console.error('Error cargando TocaExitos:', err);
      setError(err.message || 'Error cargando las canciones');
    } finally {
      setIsLoading(false);
    }
  }, [selectedCity?.documentId, setSelectedCity]);

  // Efecto para cargar datos solo cuando cambie la ciudad
  useEffect(() => {
    fetchCityData();
  }, [fetchCityData]);

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
      await playTrack({
        id: track.id,
        documentId: track.documentId,
        title: track.title,
        artist: track.artist,
        cover: {
          url: track.cover?.url ? `${BASE_URL}${track.cover.url}` : null,
          documentId: track.cover?.documentId
        },
        song: {
          url: `${BASE_URL}${track.song.url}`,
          documentId: track.song?.documentId
        }
      });
    } catch (err) {
      console.error('Error reproduciendo track:', err);
    } finally {
      setLoadingTrackId(null);
    }
  }, [currentTrack?.documentId, togglePlay, playTrack]);

  // Memorizar el procesamiento de TocaExitos
  const tocaExitos = useMemo(() => {
    if (!selectedCity?.TocaExitos?.length) return [];
    
    const filteredTracks = selectedCity.TocaExitos
      .filter(item => item.title && item.artist && item.song?.url);

    return filteredTracks.sort((a, b) => {
      if (sortBy === 'rank') {
        return (a.rank || 0) - (b.rank || 0);
      }
      return new Date(b.createdAt) - new Date(a.createdAt);
    });
  }, [selectedCity?.TocaExitos, sortBy]);

  if (isLoading) {
    return <div className="text-white text-center py-8">Cargando TocaExitos...</div>;
  }

  if (error) {
    return <div className="text-red-500 text-center py-8">{error}</div>;
  }

  if (!selectedCity || tocaExitos.length === 0) {
    return <div className="text-gray-400 text-center py-8">No hay canciones disponibles</div>;
  };

  return (
    <div className="min-h-screen pt-20 pb-32 bg-gradient-to-b from-black/0 via-black/5 to-black/10">
      <div className="container mx-auto px-4">
        <header className="py-8 border-b border-white/10">
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
            TocaExitos
          </h1>
          <p className="text-gray-400 mt-3 text-lg">
            Las canciones más populares de {selectedCity?.name}
          </p>
        </header>

        {/* Controles */}
        <div className="flex flex-wrap gap-6 items-center justify-between py-8">
          <div className="flex gap-3">
            <FilterButton
              active={sortBy === 'rank'}
              onClick={() => setSortBy('rank')}
              icon={<BiTrendingUp className="w-6 h-6" />}
              label="Top Ranking"
              className="px-6 py-3 text-lg"
            />
            <FilterButton
              active={sortBy === 'recent'}
              onClick={() => setSortBy('recent')}
              icon={<BiTime className="w-6 h-6" />}
              label="Más Recientes"
              className="px-6 py-3 text-lg"
            />
          </div>
          <div className="flex gap-3">
            <ViewButton
              active={view === 'grid'}
              onClick={() => setView('grid')}
              icon={<BiGridAlt className="w-6 h-6" />}
              className="p-3 bg-white/10 rounded-lg hover:bg-white/20 transition-colors"
            />
            <ViewButton
              active={view === 'list'}
              onClick={() => setView('list')}
              icon={<BiListUl className="w-6 h-6" />}
              className="p-3 bg-white/10 rounded-lg hover:bg-white/20 transition-colors"
            />
          </div>
        </div>

        {/* Lista de canciones */}
        <div className={view === 'grid' ? "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6 w-full" : "flex flex-col gap-4"}>
          {tocaExitos.map((item) => (
            <motion.div
              key={item.documentId}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <div className="relative group bg-white/5 rounded-lg overflow-hidden hover:bg-white/10 transition-colors duration-300">
                <div className="flex flex-col p-4">
                  {/* Image Container */}
                  <div className="relative w-full aspect-square mb-4">
                    <img
                      src={
                        item.cover?.url
                          ? `${BASE_URL}${item.cover.url}`
                          : '/placeholder-cover.jpg'
                      }
                      alt={item.title}
                      className="w-full h-full object-cover rounded-lg shadow-lg"
                      onError={(e) => {
                        e.target.src = '/placeholder-cover.jpg';
                      }}
                      loading="lazy"
                    />
                    
                    {/* Play Button Overlay */}
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/40 rounded-lg">
                      <button
                        onClick={() => handlePlay(item)}
                        disabled={isPlayerLoading || loadingTrackId === item.documentId}
                        className={`transform hover:scale-110 transition-all duration-300
                          ${(isPlayerLoading || loadingTrackId === item.documentId) ? 'opacity-50 cursor-wait' : ''}`}
                      >
                        {loadingTrackId === item.documentId ? (
                          <div className="w-12 h-12 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        ) : currentTrack?.documentId === item.documentId && isPlaying ? (
                          <BiPause className="w-12 h-12 text-white" />
                        ) : (
                          <BiPlay className="w-12 h-12 text-white ml-1" />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Track Info with Rank */}
                  <div className="flex-grow flex items-start gap-4">
                    {sortBy === 'rank' && (
                      <div className="text-4xl font-bold text-primary/80">{item.rank}</div>
                    )}
                    <div className="flex-1">
                      <h3 className="text-white font-bold text-lg truncate mb-1 uppercase">{item.title}</h3>
                      <p className="text-gray-400 text-sm truncate uppercase">{item.artist}</p>
                    </div>
                  </div>

                  {/* Mini Play Button (Mobile) */}
                  <button
                    onClick={() => handlePlay(item)}
                    disabled={isPlayerLoading || loadingTrackId === item.documentId}
                    className={`md:hidden mt-3 w-full py-2 px-4 rounded-lg flex items-center justify-center gap-2
                      ${currentTrack?.documentId === item.documentId && isPlaying ? 'bg-primary text-white' : 'bg-white/10 text-white hover:bg-white/20'} 
                      transition-colors ${(isPlayerLoading || loadingTrackId === item.documentId) ? 'opacity-50 cursor-wait' : ''}`}
                  >
                    {loadingTrackId === item.documentId ? (
                      <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                    ) : currentTrack?.documentId === item.documentId && isPlaying ? (
                      <>
                        <BiPause className="w-5 h-5" />
                        <span>Pausar</span>
                      </>
                    ) : (
                      <>
                        <BiPlay className="w-5 h-5 ml-0.5" />
                        <span>Reproducir</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}