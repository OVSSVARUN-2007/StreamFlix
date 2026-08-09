import React from 'react';
import { Star, Plus, Check, Play, Info } from 'lucide-react';

export default function MovieCard({ movie, onSelectMovie, isWatchlisted, onToggleWatchlist, showExplanation }) {
  if (!movie) return null;

  return (
    <div className="group relative flex-shrink-0 w-36 sm:w-44 md:w-52 transition-all duration-300 transform hover:scale-105 hover:z-30 cursor-pointer">
      {/* Poster Image Container */}
      <div 
        onClick={() => onSelectMovie(movie)}
        className="relative aspect-[2/3] w-full rounded-xl overflow-hidden bg-zinc-900 shadow-xl border border-white/5 group-hover:border-[#E50914]/50 group-hover:shadow-2xl group-hover:shadow-[#E50914]/20 transition-all duration-300"
      >
        <img 
          src={movie.poster_url} 
          alt={movie.title}
          loading="lazy" 
          className="w-full h-full object-cover group-hover:opacity-90 transition-opacity"
        />

        {/* Rating Pill Badge */}
        <div className="absolute top-2 left-2 bg-black/70 backdrop-blur-md text-amber-400 text-xs font-bold px-2 py-0.5 rounded-md flex items-center border border-white/10 shadow">
          <Star className="w-3 h-3 fill-current mr-1" />
          {movie.vote_average ? movie.vote_average.toFixed(1) : 'N/A'}
        </div>

        {/* Watchlist Quick Toggle Button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onToggleWatchlist(movie);
          }}
          className={`absolute top-2 right-2 p-1.5 rounded-full backdrop-blur-md transition-all shadow-md active:scale-90 ${
            isWatchlisted
              ? 'bg-[#E50914] text-white shadow-red-600/50'
              : 'bg-black/60 text-white hover:bg-[#E50914] border border-white/15'
          }`}
          title={isWatchlisted ? 'Remove from Watchlist' : 'Add to Watchlist'}
        >
          {isWatchlisted ? <Check className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
        </button>

        {/* Hover Overlay with Quick Info */}
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-3 text-white">
          <div className="flex items-center space-x-2 mb-1">
            <span className="text-[10px] font-bold text-emerald-400 bg-emerald-950/80 px-1.5 py-0.5 rounded border border-emerald-500/30">
              {movie.release_year}
            </span>
            <span className="text-[10px] text-gray-300 truncate">
              {movie.genres && movie.genres[0]}
            </span>
          </div>

          <h3 className="text-xs sm:text-sm font-bold truncate text-white leading-tight">
            {movie.title}
          </h3>

          {/* Similarity Explanation Tag */}
          {showExplanation && movie.explanation && (
            <p className="text-[10px] text-red-400 mt-1 line-clamp-2 leading-tight italic bg-black/60 p-1 rounded border border-red-500/20">
              {movie.explanation}
            </p>
          )}

          <div className="flex items-center justify-between mt-2 pt-2 border-t border-white/10">
            <span className="text-[10px] font-semibold text-gray-300 flex items-center space-x-1">
              <Info className="w-3 h-3 text-[#E50914]" />
              <span>Details</span>
            </span>
            <span className="text-[10px] text-amber-400 font-bold">
              ★ {movie.weighted_rating ? movie.weighted_rating.toFixed(1) : movie.vote_average.toFixed(1)}
            </span>
          </div>
        </div>
      </div>

      {/* Static Title under Poster for scannability */}
      <div className="mt-2 px-0.5">
        <h4 className="text-xs sm:text-sm font-semibold text-gray-200 truncate group-hover:text-[#E50914] transition-colors">
          {movie.title}
        </h4>
        <div className="flex items-center space-x-2 text-[11px] text-gray-400 mt-0.5">
          <span>{movie.release_year}</span>
          <span>•</span>
          <span className="truncate">{movie.genres && movie.genres[0]}</span>
        </div>
      </div>
    </div>
  );
}
