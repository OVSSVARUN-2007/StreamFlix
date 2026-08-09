import React, { useState, useEffect, useRef } from 'react';
import { Search, Bookmark, Film, X, Star, Menu } from 'lucide-react';
import { searchMovies } from '../services/api';

export default function Navbar({ activeTab, setActiveTab, onSelectMovie, watchlistCount }) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const searchRef = useRef(null);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 50) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Live autocomplete search handler
  useEffect(() => {
    const timer = setTimeout(async () => {
      if (searchQuery.trim().length > 0) {
        setIsSearching(true);
        try {
          const results = await searchMovies(searchQuery);
          setSearchResults(results);
          setShowDropdown(true);
        } catch (err) {
          console.error(err);
        } finally {
          setIsSearching(false);
        }
      } else {
        setSearchResults([]);
        setShowDropdown(false);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Close search dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isScrolled ? 'bg-[#141414]/95 backdrop-blur-md shadow-xl border-b border-white/5 py-3' : 'bg-gradient-to-b from-black/90 via-black/40 to-transparent py-4'}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
        
        {/* StreamFlix Brand Logo */}
        <div className="flex items-center space-x-8">
          <button 
            onClick={() => setActiveTab('home')}
            className="flex items-center space-x-2 group cursor-pointer"
          >
            <div className="w-9 h-9 rounded-lg bg-[#E50914] flex items-center justify-center font-black text-white text-xl tracking-tighter shadow-lg shadow-[#E50914]/30 group-hover:scale-105 transition-transform">
              S
            </div>
            <span className="text-2xl font-black tracking-wider bg-clip-text text-transparent bg-gradient-to-r from-[#E50914] via-red-500 to-amber-500 font-serif">
              STREAMFLIX
            </span>
          </button>

          {/* Desktop Nav Items */}
          <div className="hidden md:flex items-center space-x-6">
            <button 
              onClick={() => setActiveTab('home')}
              className={`text-sm font-medium transition-colors ${activeTab === 'home' ? 'text-white font-bold' : 'text-gray-400 hover:text-gray-200'}`}
            >
              Home
            </button>
            <button 
              onClick={() => setActiveTab('trending')}
              className={`text-sm font-medium transition-colors ${activeTab === 'trending' ? 'text-white font-bold' : 'text-gray-400 hover:text-gray-200'}`}
            >
              Trending
            </button>
            <button 
              onClick={() => setActiveTab('genres')}
              className={`text-sm font-medium transition-colors ${activeTab === 'genres' ? 'text-white font-bold' : 'text-gray-400 hover:text-gray-200'}`}
            >
              Genres
            </button>
            <button 
              onClick={() => setActiveTab('watchlist')}
              className={`text-sm font-medium transition-colors flex items-center space-x-1.5 ${activeTab === 'watchlist' ? 'text-white font-bold' : 'text-gray-400 hover:text-gray-200'}`}
            >
              <span>Watchlist</span>
              {watchlistCount > 0 && (
                <span className="bg-[#E50914] text-white text-xs px-1.5 py-0.5 rounded-full font-bold">
                  {watchlistCount}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Right Controls: Live Search & Profile */}
        <div className="flex items-center space-x-4">
          
          {/* Live Search Input with Dropdown */}
          <div className="relative" ref={searchRef}>
            <div className="relative flex items-center">
              <Search className="absolute left-3 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search movies, directors, actors..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => searchQuery.length > 0 && setShowDropdown(true)}
                className="w-48 sm:w-64 md:w-80 bg-black/60 border border-white/15 focus:border-[#E50914] text-sm text-white placeholder-gray-400 rounded-full pl-9 pr-8 py-1.5 outline-none transition-all duration-200 focus:w-64 sm:focus:w-80 md:focus:w-96 shadow-inner"
              />
              {searchQuery && (
                <button 
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 text-gray-400 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Live Autocomplete Search Dropdown */}
            {showDropdown && (
              <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-[#181818] border border-white/10 rounded-xl shadow-2xl overflow-hidden z-50 max-h-96 overflow-y-auto custom-scrollbar">
                {isSearching ? (
                  <div className="p-4 text-center text-gray-400 text-sm flex items-center justify-center space-x-2">
                    <div className="w-4 h-4 border-2 border-[#E50914] border-t-transparent rounded-full animate-spin"></div>
                    <span>Searching database...</span>
                  </div>
                ) : searchResults.length > 0 ? (
                  <div className="divide-y divide-white/5">
                    {searchResults.map((movie) => (
                      <div
                        key={movie.id}
                        onClick={() => {
                          onSelectMovie(movie);
                          setShowDropdown(false);
                        }}
                        className="p-3 hover:bg-white/10 cursor-pointer flex items-center space-x-3 transition-colors group"
                      >
                        <img 
                          src={movie.poster_url} 
                          alt={movie.title} 
                          className="w-10 h-14 object-cover rounded shadow group-hover:scale-105 transition-transform"
                        />
                        <div className="flex-1 min-w-0">
                          <h4 className="text-sm font-semibold text-white truncate group-hover:text-[#E50914] transition-colors">
                            {movie.title}
                          </h4>
                          <div className="flex items-center space-x-2 mt-1 text-xs text-gray-400">
                            <span>{movie.release_year}</span>
                            <span>•</span>
                            <span className="flex items-center text-amber-400 font-medium">
                              <Star className="w-3 h-3 fill-current mr-0.5" />
                              {movie.vote_average.toFixed(1)}
                            </span>
                            <span>•</span>
                            <span className="truncate">{movie.genres[0] || 'Movie'}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-4 text-center text-gray-400 text-sm">
                    No movies found for "{searchQuery}"
                  </div>
                )}
              </div>
            )}
          </div>

          {/* User Profile Avatar */}
          <div className="w-8 h-8 rounded-md bg-gradient-to-tr from-red-600 to-amber-500 flex items-center justify-center font-bold text-white text-xs cursor-pointer shadow hover:opacity-90 transition-opacity">
            SF
          </div>

          {/* Mobile Menu Toggle */}
          <button 
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden text-gray-300 hover:text-white"
          >
            <Menu className="w-6 h-6" />
          </button>

        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-[#141414] border-b border-white/10 px-4 py-3 space-y-2 mt-2">
          <button 
            onClick={() => { setActiveTab('home'); setIsMobileMenuOpen(false); }}
            className={`block w-full text-left py-2 text-sm font-medium ${activeTab === 'home' ? 'text-[#E50914]' : 'text-gray-300'}`}
          >
            Home
          </button>
          <button 
            onClick={() => { setActiveTab('trending'); setIsMobileMenuOpen(false); }}
            className={`block w-full text-left py-2 text-sm font-medium ${activeTab === 'trending' ? 'text-[#E50914]' : 'text-gray-300'}`}
          >
            Trending Now
          </button>
          <button 
            onClick={() => { setActiveTab('genres'); setIsMobileMenuOpen(false); }}
            className={`block w-full text-left py-2 text-sm font-medium ${activeTab === 'genres' ? 'text-[#E50914]' : 'text-gray-300'}`}
          >
            Browse Genres
          </button>
          <button 
            onClick={() => { setActiveTab('watchlist'); setIsMobileMenuOpen(false); }}
            className={`block w-full text-left py-2 text-sm font-medium ${activeTab === 'watchlist' ? 'text-[#E50914]' : 'text-gray-300'}`}
          >
            My Watchlist ({watchlistCount})
          </button>
        </div>
      )}
    </nav>
  );
}
