import React, { useRef } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import MovieCard from './MovieCard';

export default function MovieRow({ title, movies, onSelectMovie, watchlistMap, onToggleWatchlist, showExplanation }) {
  const rowRef = useRef(null);

  const scroll = (direction) => {
    if (rowRef.current) {
      const { scrollLeft, clientWidth } = rowRef.current;
      const scrollTo = direction === 'left' ? scrollLeft - clientWidth * 0.75 : scrollLeft + clientWidth * 0.75;
      rowRef.current.scrollTo({ left: scrollTo, behavior: 'smooth' });
    }
  };

  if (!movies || movies.length === 0) return null;

  return (
    <div className="relative py-4 px-4 sm:px-6 lg:px-8 space-y-3 group">
      {/* Row Header */}
      <div className="flex items-center space-x-3">
        <div className="w-1.5 h-6 bg-[#E50914] rounded-full shadow-md shadow-red-600/50"></div>
        <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white font-serif">
          {title}
        </h2>
        <span className="text-xs text-gray-500 font-mono pl-2">({movies.length})</span>
      </div>

      {/* Horizontal Carousel Container */}
      <div className="relative">
        {/* Left Scroll Arrow */}
        <button
          onClick={() => scroll('left')}
          className="absolute left-0 top-1/2 -translate-y-1/2 z-40 bg-black/80 hover:bg-[#E50914] text-white p-2 sm:p-3 rounded-r-xl opacity-0 group-hover:opacity-100 transition-all duration-300 shadow-2xl backdrop-blur-md cursor-pointer -ml-4"
          aria-label="Scroll left"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>

        {/* Scrollable Movies List */}
        <div
          ref={rowRef}
          className="flex items-center space-x-4 sm:space-x-5 overflow-x-auto no-scrollbar py-3 px-1 scroll-smooth"
        >
          {movies.map((movie) => (
            <MovieCard
              key={movie.id}
              movie={movie}
              onSelectMovie={onSelectMovie}
              isWatchlisted={!!watchlistMap[movie.id]}
              onToggleWatchlist={onToggleWatchlist}
              showExplanation={showExplanation}
            />
          ))}
        </div>

        {/* Right Scroll Arrow */}
        <button
          onClick={() => scroll('right')}
          className="absolute right-0 top-1/2 -translate-y-1/2 z-40 bg-black/80 hover:bg-[#E50914] text-white p-2 sm:p-3 rounded-l-xl opacity-0 group-hover:opacity-100 transition-all duration-300 shadow-2xl backdrop-blur-md cursor-pointer -mr-4"
          aria-label="Scroll right"
        >
          <ChevronRight className="w-6 h-6" />
        </button>
      </div>
    </div>
  );
}
