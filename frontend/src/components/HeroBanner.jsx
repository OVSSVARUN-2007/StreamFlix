import React from 'react';
import { Play, Info, Plus, Check, Star, Clock } from 'lucide-react';

export default function HeroBanner({ movie, onSelectMovie, onPlayTrailer, isWatchlisted, onToggleWatchlist }) {
  if (!movie) return null;

  return (
    <div className="relative w-full h-[70vh] sm:h-[80vh] md:h-[85vh] text-white overflow-hidden">
      {/* Backdrop Background Image */}
      <div 
        className="absolute inset-0 bg-cover bg-center transition-all duration-700 scale-105"
        style={{ backgroundImage: `url(${movie.backdrop_url || movie.poster_url})` }}
      >
        {/* Cinematic Gradient Overlays */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#141414] via-[#141414]/50 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#141414] via-[#141414]/70 to-transparent" />
      </div>

      {/* Content Container */}
      <div className="relative max-w-7xl mx-auto h-full px-4 sm:px-6 lg:px-8 flex flex-col justify-end pb-16 sm:pb-20 z-10">
        <div className="max-w-2xl space-y-4">
          
          {/* Metadata Badges */}
          <div className="flex items-center space-x-3 text-xs sm:text-sm font-semibold">
            <span className="bg-[#E50914] text-white px-2.5 py-0.5 rounded font-bold uppercase tracking-wider text-[10px] sm:text-xs shadow-md shadow-red-900/40">
              #1 Featured
            </span>
            <span className="flex items-center text-amber-400 font-bold bg-black/50 backdrop-blur-md px-2.5 py-0.5 rounded border border-white/10">
              <Star className="w-3.5 h-3.5 fill-current mr-1 text-amber-400" />
              {movie.vote_average.toFixed(1)} / 10
            </span>
            <span className="text-gray-300 bg-black/40 px-2 py-0.5 rounded border border-white/10">
              {movie.release_year}
            </span>
            {movie.runtime > 0 && (
              <span className="text-gray-300 flex items-center space-x-1 bg-black/40 px-2 py-0.5 rounded border border-white/10">
                <Clock className="w-3 h-3 text-gray-400" />
                <span>{movie.runtime} m</span>
              </span>
            )}
          </div>

          {/* Title */}
          <h1 className="text-3xl sm:text-5xl md:text-6xl font-black tracking-tight drop-shadow-2xl font-serif text-white">
            {movie.title}
          </h1>

          {/* Genres */}
          {movie.genres && movie.genres.length > 0 && (
            <div className="flex flex-wrap gap-2 pt-1">
              {movie.genres.slice(0, 4).map((genre) => (
                <span 
                  key={genre}
                  className="text-xs bg-white/10 backdrop-blur-md text-gray-200 px-3 py-1 rounded-full font-medium border border-white/10 hover:bg-white/20 transition-colors"
                >
                  {genre}
                </span>
              ))}
            </div>
          )}

          {/* Tagline or Plot Overview */}
          <p className="text-sm sm:text-base text-gray-300 line-clamp-3 leading-relaxed drop-shadow max-w-xl font-normal">
            {movie.tagline ? `"${movie.tagline}" — ` : ''}{movie.overview}
          </p>

          {/* Action Buttons */}
          <div className="flex items-center space-x-3 sm:space-x-4 pt-4">
            <button
              onClick={() => onPlayTrailer(movie)}
              className="flex items-center space-x-2 bg-white text-black font-bold px-5 sm:px-7 py-2.5 sm:py-3 rounded-lg hover:bg-white/90 active:scale-95 transition-all shadow-xl shadow-white/10 cursor-pointer"
            >
              <Play className="w-5 h-5 fill-current text-black" />
              <span className="text-sm sm:text-base">Play Trailer</span>
            </button>

            <button
              onClick={() => onSelectMovie(movie)}
              className="flex items-center space-x-2 bg-white/20 hover:bg-white/30 text-white font-bold px-5 sm:px-6 py-2.5 sm:py-3 rounded-lg backdrop-blur-md border border-white/20 active:scale-95 transition-all cursor-pointer"
            >
              <Info className="w-5 h-5 text-white" />
              <span className="text-sm sm:text-base">More Info</span>
            </button>

            <button
              onClick={() => onToggleWatchlist(movie)}
              className={`p-2.5 sm:p-3 rounded-lg border backdrop-blur-md transition-all active:scale-95 cursor-pointer ${
                isWatchlisted
                  ? 'bg-[#E50914] border-[#E50914] text-white shadow-lg shadow-red-600/40'
                  : 'bg-black/50 border-white/20 text-white hover:bg-white/20'
              }`}
              title={isWatchlisted ? 'Remove from Watchlist' : 'Add to Watchlist'}
            >
              {isWatchlisted ? <Check className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}
