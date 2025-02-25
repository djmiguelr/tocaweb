import React, { useState, useEffect, useMemo, memo } from 'react';
import { motion } from 'framer-motion';
import { BiPlay, BiPause } from 'react-icons/bi';
import { usePlayer } from '../../context/PlayerContext';
import { BASE_URL } from '../../services/api';

export const TocaExitosCard = memo(function TocaExitosCard({ 
  item, 
  showRank = true, 
  view = 'grid' 
}) {
  const { playTrack, currentTrack, isPlaying, togglePlay, isLoading: isPlayerLoading } = usePlayer();
  const [isLoadingTrack, setIsLoadingTrack] = useState(false);
  const [trackError, setTrackError] = useState(null);
  const isCurrentTrack = currentTrack?.documentId === item.documentId;

  console.log('Item en TocaExitosCard:', item);

  // Preparar el track para reproducción
  const trackData = useMemo(() => ({
    id: item.id,
    documentId: item.documentId,
    title: item.title,
    artist: item.artist,
    rank: item.rank,
    cover: {
      url: item.cover?.url ? `${BASE_URL}${item.cover.url}` : null,
      documentId: item.cover?.documentId
    },
    song: {
      url: item.song?.url || null,
      documentId: item.song?.documentId
    }
  }), [item]);

  // Manejar reproducción
  const handlePlay = async () => {
    if (!trackData.song?.url) {
      console.warn('Track sin URL de audio:', trackData);
      return;
    }

    if (isCurrentTrack) {
      togglePlay();
      return;
    }

    try {
      setIsLoadingTrack(true);
      setTrackError(null);
      await playTrack({
        ...trackData,
        cover: {
          ...trackData.cover,
          url: trackData.cover?.url ? `${BASE_URL}${trackData.cover.url}` : null
        },
        song: {
          ...trackData.song,
          url: `${BASE_URL}${trackData.song.url}`
        }
      });
    } catch (error) {
      console.error('Error reproduciendo track:', error);
      setTrackError('Error reproduciendo la canción');
    } finally {
      setIsLoadingTrack(false);
    }
  };

  // Obtener URL de la portada
  const coverUrl = useMemo(() => {
    if (!trackData.cover?.url) return '/placeholder-cover.jpg';
    return `${BASE_URL}${trackData.cover.url}`;
  }, [trackData.cover?.url]);

  return (
    <motion.div
      className={`relative group ${view === 'list' ? 'flex items-center gap-4' : 'w-full sm:w-[calc(50%-1rem)] md:w-[calc(33.333%-1rem)] lg:w-[calc(25%-1rem)] xl:w-[calc(20%-1rem)]'}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
    >
      <div className={`relative ${view === 'list' ? 'w-16 h-16' : 'aspect-square'} overflow-hidden rounded-lg bg-white/5`}>
        <img
          src={coverUrl}
          alt={trackData.title}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
          onError={(e) => {
            e.target.src = '/placeholder-cover.jpg';
          }}
          loading="lazy"
        />
        
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"/>
        
        <button
          onClick={handlePlay}
          disabled={isPlayerLoading || isLoadingTrack}
          className={`absolute bottom-4 right-4 w-12 h-12 rounded-full 
            ${isCurrentTrack && isPlaying ? 'bg-green-500' : 'bg-white'} 
            flex items-center justify-center shadow-lg transform 
            translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 
            transition-all duration-300
            ${(isPlayerLoading || isLoadingTrack) ? 'opacity-50 cursor-wait' : ''}`}
        >
          {isLoadingTrack ? (
            <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin" />
          ) : isCurrentTrack && isPlaying ? (
            <BiPause className="w-6 h-6 text-black" />
          ) : (
            <BiPlay className="w-6 h-6 text-black ml-1" />
          )}
        </button>
      </div>
      
      <div className={view === 'list' ? 'flex-1' : 'mt-3 px-4 pb-4'}>
        <h3 className="text-white font-medium truncate">{trackData.title}</h3>
        <p className="text-sm text-gray-400 truncate">{trackData.artist}</p>
      </div>

      {showRank && (
        <div className="absolute top-2 left-2">
          <span className="text-sm font-bold text-white/90">#{trackData.rank || '-'}</span>
        </div>
      )}

      {trackError && (
        <div className="absolute bottom-0 left-0 right-0 bg-red-500 text-white text-xs py-1 px-2">
          {trackError}
        </div>
      )}
    </motion.div>
  );
});