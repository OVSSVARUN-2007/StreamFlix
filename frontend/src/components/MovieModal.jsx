import React, { useState, useEffect } from 'react';
import { X, Play, Plus, Check, Star, Clock, Calendar, User, Film, Sparkles, Award } from 'lucide-react';
import { fetchRecommendations } from '../services/api';
import MovieRow from './MovieRow';

export default function MovieModal({ movie, onClose, onSelectMovie, watchlistMap, onToggleWatchlist, onPlayTrailer }) {
  const [recommendations, setRecommendations] = useState([]);
  const [loadingRecs, setLoadingRecs] = useState(true);

  useEffect(() => {
    if (!movie) return;

    let isMounted = true;
    setLoadingRecs(true);

    fetchRecommendations(movie.id, 12)
      .then((data) => {
        if (isMounted) {
          setRecommendations(data);
          setLoadingRecs(false);
        }
      })
      .catch((err) => {
        console.error('Failed to load recommendations:', err);
        if (isMounted) setLoadingRecs(false);
      });

    return () => {
      isMounted = false;
    };
  }, [movie]);

  if (!movie) return null;

  const isWatchlisted = !!watchlistMap[movie.id];

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/85 backdrop-blur-xl flex items-center justify-center p-2 sm:p-4 md:p-6 animate-fadeIn">
      {/* Modal Card Container */}
      <div 
        className="relative w-full max-w-4xl bg-[#181818] border border-white/10 rounded-2xl shadow-2xl overflow-hidden text-white my-8 max-h-[90vh] flex flex-col custom-scrollbar"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-50 bg-black/70 hover:bg-[#E50914] text-white p-2 rounded-full backdrop-blur-md transition-all cursor-pointer shadow-lg border border-white/10"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header: Backdrop Image */}
        <div className="relative w-full h-64 sm:h-80 md:h-96 flex-shrink-0 bg-zinc-900">
          <img 
            src={movie.backdrop_url || movie.poster_url} 
            alt={movie.title} 
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#181818] via-[#181818]/60 to-transparent" />
          
          {/* Header Title Overlay */}
          <div className="absolute bottom-6 left-6 right-6 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div className="space-y-2 max-w-2xl">
              <div className="flex items-center space-x-3 text-xs sm:text-sm font-semibold">
                <span className="bg-[#E50914] text-white px-2.5 py-0.5 rounded font-bold uppercase tracking-wider text-[10px]">
                  Movie Details
                </span>
                <span className="flex items-center text-amber-400 font-bold bg-black/60 px-2 py-0.5 rounded border border-white/10">
                  <Star className="w-3.5 h-3.5 fill-current mr-1 text-amber-400" />
                  {movie.vote_average ? movie.vote_average.toFixed(1) : 'N/A'} / 10
                </span>
                <span className="text-gray-300 bg-black/60 px-2 py-0.5 rounded border border-white/10">
                  {movie.release_year}
                </span>
                {movie.runtime > 0 && (
                  <span className="text-gray-300 flex items-center space-x-1 bg-black/60 px-2 py-0.5 rounded border border-white/10">
                    <Clock className="w-3 h-3 text-gray-400" />
                    <span>{movie.runtime}m</span>
                  </span>
                )}
              </div>

              <h2 className="text-2xl sm:text-4xl font-black tracking-tight font-serif drop-shadow-lg text-white">
                {movie.title}
              </h2>

              {movie.tagline && (
                <p className="text-xs sm:text-sm text-red-400 italic font-medium">
                  "{movie.tagline}"
                </p>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex items-center space-x-3">
              <button
                onClick={() => onPlayTrailer(movie)}
                className="flex items-center space-x-2 bg-white text-black font-bold px-4 sm:px-5 py-2.5 rounded-lg hover:bg-white/90 active:scale-95 transition-all shadow-lg cursor-pointer"
              >
                <Play className="w-4 h-4 fill-current text-black" />
                <span className="text-xs sm:text-sm">Trailer</span>
              </button>

              <button
                onClick={() => onToggleWatchlist(movie)}
                className={`p-2.5 rounded-lg border backdrop-blur-md transition-all active:scale-95 cursor-pointer ${
                  isWatchlisted
                    ? 'bg-[#E50914] border-[#E50914] text-white shadow-lg shadow-red-600/40'
                    : 'bg-black/60 border-white/20 text-white hover:bg-white/20'
                }`}
                title={isWatchlisted ? 'Remove from Watchlist' : 'Add to Watchlist'}
              >
                {isWatchlisted ? <Check className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>

        {/* Modal Body Content */}
        <div className="p-6 space-y-8 overflow-y-auto custom-scrollbar">
          
          {/* Main Info Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Left Column: Poster & Quick Specs */}
            <div className="flex flex-col items-center sm:items-start space-y-4">
              <img 
                src={movie.poster_url} 
                alt={movie.title} 
                className="w-44 sm:w-48 rounded-xl shadow-2xl border border-white/10 object-cover aspect-[2/3]"
              />

              <div className="w-full bg-zinc-900/90 rounded-xl p-4 border border-white/5 space-y-2 text-xs text-gray-300">
                {movie.director && (
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400 font-medium">Director:</span>
                    <span className="text-white font-bold">{movie.director}</span>
                  </div>
                )}
                {movie.weighted_rating && (
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400 font-medium">IMDB Score:</span>
                    <span className="text-amber-400 font-bold flex items-center">
                      <Award className="w-3.5 h-3.5 mr-1" />
                      {movie.weighted_rating.toFixed(1)} / 10
                    </span>
                  </div>
                )}
                {movie.vote_count > 0 && (
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400 font-medium">Total Votes:</span>
                    <span className="text-gray-200">{movie.vote_count.toLocaleString()}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Right 2 Columns: Overview, Genres, Cast */}
            <div className="md:col-span-2 space-y-6">
              
              {/* Overview */}
              <div>
                <h3 className="text-sm font-bold uppercase tracking-wider text-gray-400 mb-2">
                  Storyline
                </h3>
                <p className="text-sm sm:text-base text-gray-200 leading-relaxed font-normal">
                  {movie.overview || 'No storyline overview available.'}
                </p>
              </div>

              {/* Genres */}
              {movie.genres && movie.genres.length > 0 && (
                <div>
                  <h3 className="text-sm font-bold uppercase tracking-wider text-gray-400 mb-2">
                    Genres
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {movie.genres.map((g) => (
                      <span 
                        key={g} 
                        className="bg-white/10 border border-white/10 text-gray-200 text-xs px-3 py-1 rounded-full font-medium"
                      >
                        {g}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Cast */}
              {movie.top_cast && movie.top_cast.length > 0 && (
                <div>
                  <h3 className="text-sm font-bold uppercase tracking-wider text-gray-400 mb-2 flex items-center space-x-2">
                    <User className="w-4 h-4 text-[#E50914]" />
                    <span>Top Cast</span>
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {movie.top_cast.map((actor, idx) => (
                      <span 
                        key={idx} 
                        className="bg-zinc-800 text-gray-300 text-xs px-3 py-1.5 rounded-lg border border-white/5 font-medium flex items-center space-x-1.5"
                      >
                        <div className="w-2 h-2 rounded-full bg-red-500"></div>
                        <span>{actor}</span>
                      </span>
                    ))}
                  </div>
                </div>
              )}

            </div>
          </div>

          {/* Machine Learning Recommendations Carousel */}
          <div className="pt-6 border-t border-white/10 space-y-4">
            <div className="flex items-center space-x-2">
              <Sparkles className="w-5 h-5 text-[#E50914] animate-pulse" />
              <h3 className="text-lg font-bold text-white font-serif">
                Because You Liked <span className="text-[#E50914]">{movie.title}</span>
              </h3>
            </div>
            
            <p className="text-xs text-gray-400">
              Cosine similarity matches computed across plot summaries, genres, director, and cast vector space:
            </p>

            {loadingRecs ? (
              <div className="flex space-x-4 overflow-x-auto py-2">
                {[1, 2, 3, 4].map((n) => (
                  <div key={n} className="w-36 h-56 rounded-xl animate-shimmer flex-shrink-0"></div>
                ))}
              </div>
            ) : (
              <MovieRow
                title=""
                movies={recommendations}
                onSelectMovie={onSelectMovie}
                watchlistMap={watchlistMap}
                onToggleWatchlist={onToggleWatchlist}
                showExplanation={true}
              />
            )}
          </div>

        </div>
      </div>
    </div>
  );
}
