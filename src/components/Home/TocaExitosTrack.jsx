import React, { memo } from 'react';
import { motion } from 'framer-motion';
import { BiPlay, BiPause } from 'react-icons/bi';
import { BASE_URL } from '../../services/api';

export const TocaExitosTrack = memo(function TocaExitosTrack({
  item,
  index,
  currentTrack,
  isPlaying,
  isPlayerLoading,
  loadingTrackId,
  onPlay
}) {
  return (
    <motion.div
      key={item.documentId}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      className="relative group w-full sm:w-full md:w-full lg:w-full xl:w-full flex-shrink-0 bg-white/5 rounded-lg overflow-hidden hover:bg-white/10 transition-colors duration-300"
    >
      <div className="flex flex-col p-4">
        {/* Image Container */}
        <div className="relative w-full aspect-square mb-4 overflow-hidden rounded-lg">
          <img
            src={item.cover?.url ? `${BASE_URL}${item.cover.url}` : '/placeholder-cover.jpg'}
            alt={item.title}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
            onError={(e) => {
              e.target.src = '/placeholder-cover.jpg';
            }}
            loading="lazy"
          />
          
          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/40 rounded-lg">
            <button
              onClick={() => onPlay(item)}
              disabled={isPlayerLoading || loadingTrackId === item.documentId}
              className={`absolute bottom-4 right-4 w-12 h-12 rounded-full 
                ${currentTrack?.documentId === item.documentId && isPlaying ? 'bg-green-500' : 'bg-white'} 
                flex items-center justify-center shadow-lg transform 
                translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 
                transition-all duration-300
                ${(isPlayerLoading || loadingTrackId === item.documentId) ? 'opacity-50 cursor-wait' : ''}`}
            >
              {loadingTrackId === item.documentId ? (
                <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin" />
              ) : currentTrack?.documentId === item.documentId && isPlaying ? (
                <BiPause className="w-6 h-6 text-black" />
              ) : (
                <BiPlay className="w-6 h-6 text-black ml-1" />
              )}
            </button>
          </div>
        </div>
        
        <div className="flex-grow flex items-start gap-4">
          <div className="text-4xl font-bold text-primary/80">{item.rank}</div>
          <div className="flex-1">
            <h3 className="text-white font-medium truncate">{item.title}</h3>
            <p className="text-sm text-gray-400 truncate">{item.artist}</p>
          </div>
        </div>
      </div>
    </motion.div>
  );
});