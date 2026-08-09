import React from 'react';
import { Bookmark, Film, Trash2, Star } from 'lucide-react';
import MovieCard from './MovieCard';

export default function WatchlistView({ watchlist, onSelectMovie, watchlistMap, onToggleWatchlist, onDiscover }) {
  if (!watchlist || watchlist.length === 0) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-4 py-16 space-y-4">
        <div className="w-16 h-16 rounded-full bg-red-950/60 border border-[#E50914]/30 flex items-center justify-center text-[#E50914] shadow-xl">
          <Bookmark className="w-8 h-8" />
        </div>
        <h2 className="text-2xl sm:text-3xl font-bold font-serif text-white">
          Your Watchlist is Empty
        </h2>
        <p className="text-sm text-gray-400 max-w-md">
          Explore our recommendations, click "+ My List" on any movie to save it for later viewing!
        </p>
        <button
          onClick={onDiscover}
          className="bg-[#E50914] hover:bg-red-700 text-white font-bold px-6 py-2.5 rounded-lg transition-all shadow-lg shadow-red-600/30 cursor-pointer"
        >
          Discover Trending Movies
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div className="flex items-center space-x-3 border-b border-white/10 pb-4">
        <Bookmark className="w-6 h-6 text-[#E50914]" />
        <h2 className="text-2xl sm:text-3xl font-bold font-serif text-white">
          My Watchlist
        </h2>
        <span className="text-sm text-gray-400 bg-white/10 px-2.5 py-0.5 rounded-full font-bold">
          {watchlist.length} Saved
        </span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-6">
        {watchlist.map((movie) => (
          <MovieCard
            key={movie.id}
            movie={movie}
            onSelectMovie={onSelectMovie}
            isWatchlisted={true}
            onToggleWatchlist={onToggleWatchlist}
          />
        ))}
      </div>
    </div>
  );
}
