import React from 'react';
import { BiPlay, BiPause } from 'react-icons/bi';
import { usePlayer } from '../../context/PlayerContext';

export function TocaExitosTrack({ track, rank }) {
  const { currentTrack, isPlaying, playTrack, togglePlay } = usePlayer();

  const isCurrentTrack = currentTrack?.documentId === track.documentId;
  const isThisPlaying = isCurrentTrack && isPlaying;

  const handleClick = () => {
    if (isCurrentTrack) {
      togglePlay();
    } else {
      playTrack(track);
    }
  };

  return (
    <div 
      className={`group relative flex items-center gap-4 p-4 rounded-xl transition-colors ${
        isCurrentTrack ? 'bg-primary/20' : 'hover:bg-white/5'
      }`}
    >
      {/* Rank */}
      <div className="w-12 h-12 bg-white/5 rounded-lg flex items-center justify-center text-2xl font-bold text-white">
        {rank}
      </div>

      {/* Cover */}
      <div className="relative w-12 h-12 rounded-lg overflow-hidden bg-white/5">
        <img
          src={track.cover?.url}
          alt={track.title}
          className="w-full h-full object-cover"
        />
        <button
          onClick={handleClick}
          className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity"
        >
          {isThisPlaying ? (
            <BiPause className="w-6 h-6 text-white" />
          ) : (
            <BiPlay className="w-6 h-6 text-white ml-1" />
          )}
        </button>
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <h3 className="font-medium text-white truncate">{track.title}</h3>
        <p className="text-sm text-white/60 truncate">{track.artist}</p>
      </div>

      {/* Playing Indicator */}
      {isThisPlaying && (
        <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
      )}
    </div>
  );
}