import React from 'react';
import { BiPlay, BiPause } from 'react-icons/bi';
import { usePlayer } from '../../context/PlayerContext';

export function TocaExitosCard({ track, rank, variant = 'vertical' }) {
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

  if (variant === 'button-only') {
    return (
      <button
        onClick={handleClick}
        className={`w-16 h-16 rounded-full flex items-center justify-center transition-colors ${
          isThisPlaying ? 'bg-primary text-white' : 'bg-white text-black hover:bg-primary hover:text-white'
        }`}
      >
        {isThisPlaying ? (
          <BiPause className="w-8 h-8" />
        ) : (
          <BiPlay className="w-8 h-8 ml-1" />
        )}
      </button>
    );
  }

  if (variant === 'horizontal') {
    return (
      <div className={`group relative flex items-center gap-6 p-4 rounded-xl bg-white/5 hover:bg-white/10 transition-all duration-300 ${
        isCurrentTrack ? 'ring-2 ring-primary' : ''
      }`}>
        {/* Rank */}
        <div className="text-4xl font-bold text-red-500 w-16 text-center">
          {rank}
        </div>

        {/* Cover */}
        <div className="relative w-20 h-20 rounded-lg overflow-hidden">
          <img
            src={track.cover?.url}
            alt={track.title}
            className="w-full h-full object-cover"
          />
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <h3 className="font-medium text-white text-lg truncate">{track.title}</h3>
          <p className="text-white/60 truncate">{track.artist}</p>
        </div>

        {/* Play Button */}
        <button
          onClick={handleClick}
          className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors ${
            isThisPlaying ? 'bg-primary text-white' : 'bg-white/10 text-white hover:bg-primary'
          }`}
        >
          {isThisPlaying ? (
            <BiPause className="w-6 h-6" />
          ) : (
            <BiPlay className="w-6 h-6 ml-1" />
          )}
        </button>
      </div>
    );
  }

  return (
    <div className={`group relative rounded-xl bg-white/5 hover:bg-white/10 transition-all duration-300 p-4 ${
      isCurrentTrack ? 'ring-2 ring-primary' : ''
    }`}>
      {/* Cover Container */}
      <div className="relative aspect-square rounded-lg overflow-hidden mb-4">
        <img
          src={track.cover?.url}
          alt={track.title}
          className="w-full h-full object-cover"
        />
        <button
          onClick={handleClick}
          className="absolute bottom-2 right-2 w-10 h-10 rounded-full bg-black/50 backdrop-blur-sm flex items-center justify-center text-white hover:bg-primary transition-colors"
        >
          {isThisPlaying ? (
            <BiPause className="w-5 h-5" />
          ) : (
            <BiPlay className="w-5 h-5 ml-0.5" />
          )}
        </button>
      </div>

      {/* Info Container */}
      <div className="flex items-start gap-3">
        <div className="text-2xl font-bold text-red-500">
          {rank}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-medium text-white truncate">{track.title}</h3>
          <p className="text-sm text-white/60 truncate">{track.artist}</p>
        </div>
      </div>
    </div>
  );
}