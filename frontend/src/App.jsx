import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import HeroBanner from './components/HeroBanner';
import MovieRow from './components/MovieRow';
import MovieModal from './components/MovieModal';
import TrailerModal from './components/TrailerModal';
import WatchlistView from './components/WatchlistView';
import GenreView from './components/GenreView';
import { HeroSkeleton, RowSkeleton } from './components/SkeletonLoader';

import {
  fetchHeroMovie,
  fetchTrendingMovies,
  fetchPopularMovies,
  fetchMoviesByGenre
} from './services/api';

export default function App() {
  const [activeTab, setActiveTab] = useState('home');
  const [heroMovie, setHeroMovie] = useState(null);
  const [trendingMovies, setTrendingMovies] = useState([]);
  const [popularMovies, setPopularMovies] = useState([]);
  const [actionMovies, setActionMovies] = useState([]);
  const [sciFiMovies, setSciFiMovies] = useState([]);
  const [animationMovies, setAnimationMovies] = useState([]);
  const [selectedMovie, setSelectedMovie] = useState(null);
  const [trailerMovie, setTrailerMovie] = useState(null);
  const [loading, setLoading] = useState(true);

  // Watchlist state initialized from localStorage
  const [watchlistMap, setWatchlistMap] = useState(() => {
    try {
      const saved = localStorage.getItem('streamflix_watchlist') || localStorage.getItem('netflix_watchlist');
      return saved ? JSON.parse(saved) : {};
    } catch (e) {
      return {};
    }
  });

  // Sync watchlist to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('streamflix_watchlist', JSON.stringify(watchlistMap));
    } catch (e) {
      console.error('Failed to save watchlist to localStorage:', e);
    }
  }, [watchlistMap]);

  const toggleWatchlist = (movie) => {
    if (!movie) return;
    setWatchlistMap((prev) => {
      const next = { ...prev };
      if (next[movie.id]) {
        delete next[movie.id];
      } else {
        next[movie.id] = movie;
      }
      return next;
    });
  };

  const watchlistList = Object.values(watchlistMap);

  // Initial Data Fetching
  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        const [hero, trending, popular, action, scifi, animation] = await Promise.all([
          fetchHeroMovie(),
          fetchTrendingMovies(),
          fetchPopularMovies(),
          fetchMoviesByGenre('Action', 18),
          fetchMoviesByGenre('Science Fiction', 18),
          fetchMoviesByGenre('Animation', 18)
        ]);

        setHeroMovie(hero);
        setTrendingMovies(trending);
        setPopularMovies(popular);
        setActionMovies(action);
        setSciFiMovies(scifi);
        setAnimationMovies(animation);
      } catch (err) {
        console.error('Error fetching StreamFlix homepage movies:', err);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

  return (
    <div className="min-h-screen bg-[#141414] text-white flex flex-col font-sans selection:bg-[#E50914] selection:text-white">
      {/* Navigation Header */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onSelectMovie={setSelectedMovie}
        watchlistCount={watchlistList.length}
      />

      {/* Main View Router */}
      <main className="flex-1 pb-16">
        {activeTab === 'home' && (
          <>
            {loading ? (
              <>
                <HeroSkeleton />
                <RowSkeleton />
                <RowSkeleton />
              </>
            ) : (
              <>
                {/* Hero Banner */}
                <HeroBanner
                  movie={heroMovie}
                  onSelectMovie={setSelectedMovie}
                  onPlayTrailer={setTrailerMovie}
                  isWatchlisted={!!(heroMovie && watchlistMap[heroMovie.id])}
                  onToggleWatchlist={toggleWatchlist}
                />

                {/* Movie Rows */}
                <div className="space-y-4 -mt-10 sm:-mt-16 z-20 relative">
                  <MovieRow
                    title="Trending Now (IMDB Top Rated)"
                    movies={trendingMovies}
                    onSelectMovie={setSelectedMovie}
                    watchlistMap={watchlistMap}
                    onToggleWatchlist={toggleWatchlist}
                  />

                  <MovieRow
                    title="Popular Blockbusters"
                    movies={popularMovies}
                    onSelectMovie={setSelectedMovie}
                    watchlistMap={watchlistMap}
                    onToggleWatchlist={toggleWatchlist}
                  />

                  <MovieRow
                    title="Action & High-Octane Thrillers"
                    movies={actionMovies}
                    onSelectMovie={setSelectedMovie}
                    watchlistMap={watchlistMap}
                    onToggleWatchlist={toggleWatchlist}
                  />

                  <MovieRow
                    title="Sci-Fi & Cosmic Marvels"
                    movies={sciFiMovies}
                    onSelectMovie={setSelectedMovie}
                    watchlistMap={watchlistMap}
                    onToggleWatchlist={toggleWatchlist}
                  />

                  <MovieRow
                    title="Top Animated Adventures"
                    movies={animationMovies}
                    onSelectMovie={setSelectedMovie}
                    watchlistMap={watchlistMap}
                    onToggleWatchlist={toggleWatchlist}
                  />
                </div>
              </>
            )}
          </>
        )}

        {activeTab === 'trending' && (
          <div className="pt-20">
            <MovieRow
              title="Top Rated & Trending Movies"
              movies={trendingMovies}
              onSelectMovie={setSelectedMovie}
              watchlistMap={watchlistMap}
              onToggleWatchlist={toggleWatchlist}
            />
            <MovieRow
              title="Most Popular Box Office Hits"
              movies={popularMovies}
              onSelectMovie={setSelectedMovie}
              watchlistMap={watchlistMap}
              onToggleWatchlist={toggleWatchlist}
            />
          </div>
        )}

        {activeTab === 'genres' && (
          <div className="pt-20">
            <GenreView
              onSelectMovie={setSelectedMovie}
              watchlistMap={watchlistMap}
              onToggleWatchlist={toggleWatchlist}
            />
          </div>
        )}

        {activeTab === 'watchlist' && (
          <div className="pt-20">
            <WatchlistView
              watchlist={watchlistList}
              onSelectMovie={setSelectedMovie}
              watchlistMap={watchlistMap}
              onToggleWatchlist={toggleWatchlist}
              onDiscover={() => setActiveTab('home')}
            />
          </div>
        )}
      </main>

      {/* Movie Details Modal Popover */}
      {selectedMovie && (
        <MovieModal
          movie={selectedMovie}
          onClose={() => setSelectedMovie(null)}
          onSelectMovie={setSelectedMovie}
          watchlistMap={watchlistMap}
          onToggleWatchlist={toggleWatchlist}
          onPlayTrailer={(m) => {
            setSelectedMovie(null);
            setTrailerMovie(m);
          }}
        />
      )}

      {/* Video Trailer Modal */}
      {trailerMovie && (
        <TrailerModal
          movie={trailerMovie}
          onClose={() => setTrailerMovie(null)}
        />
      )}

      {/* StreamFlix Footer */}
      <footer className="border-t border-white/10 bg-black/60 py-10 text-gray-500 text-xs text-center space-y-3">
        <div className="flex justify-center space-x-6">
          <span className="text-[#E50914] font-bold">STREAMFLIX RECOMMENDATION SYSTEM</span>
          <span>•</span>
          <span>Powered by FastAPI & scikit-learn</span>
          <span>•</span>
          <span>TMDB / IMDB Dataset</span>
        </div>
        <p>© 2026 StreamFlix Movie Recommendation System. Built with React + Tailwind CSS.</p>
      </footer>
    </div>
  );
}
