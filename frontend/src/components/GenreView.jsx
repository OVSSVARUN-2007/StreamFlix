import React, { useState, useEffect } from 'react';
import { fetchGenres, fetchMoviesByGenre } from '../services/api';
import MovieCard from './MovieCard';
import { Film, Filter } from 'lucide-react';

export default function GenreView({ onSelectMovie, watchlistMap, onToggleWatchlist }) {
  const [genres, setGenres] = useState([]);
  const [selectedGenre, setSelectedGenre] = useState('Action');
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchGenres()
      .then((data) => {
        setGenres(data);
        if (data.length > 0) setSelectedGenre(data[0].name);
      })
      .catch(console.error);
  }, []);

  useEffect(() => {
    if (!selectedGenre) return;
    setLoading(true);
    fetchMoviesByGenre(selectedGenre, 24)
      .then((data) => {
        setMovies(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, [selectedGenre]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-white/10 pb-4">
        <div className="flex items-center space-x-3">
          <Filter className="w-6 h-6 text-[#E50914]" />
          <h2 className="text-2xl sm:text-3xl font-bold font-serif text-white">
            Browse by Genre
          </h2>
        </div>
      </div>

      {/* Genre Pills Row */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-2">
        {genres.map((g) => (
          <button
            key={g.name}
            onClick={() => setSelectedGenre(g.name)}
            className={`px-4 py-2 rounded-full text-xs sm:text-sm font-semibold whitespace-nowrap transition-all cursor-pointer ${
              selectedGenre === g.name
                ? 'bg-[#E50914] text-white shadow-lg shadow-red-600/40 scale-105'
                : 'bg-white/10 text-gray-300 hover:bg-white/20 border border-white/10'
            }`}
          >
            {g.name} <span className="opacity-70 text-[10px]">({g.count})</span>
          </button>
        ))}
      </div>

      {/* Grid of Movies */}
      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 sm:gap-6">
          {[...Array(12)].map((_, i) => (
            <div key={i} className="aspect-[2/3] rounded-xl animate-shimmer"></div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 sm:gap-6">
          {movies.map((movie) => (
            <MovieCard
              key={movie.id}
              movie={movie}
              onSelectMovie={onSelectMovie}
              isWatchlisted={!!watchlistMap[movie.id]}
              onToggleWatchlist={onToggleWatchlist}
            />
          ))}
        </div>
      )}
    </div>
  );
}
