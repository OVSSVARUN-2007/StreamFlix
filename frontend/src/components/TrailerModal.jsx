import React from 'react';
import { X, Film, Play } from 'lucide-react';

export default function TrailerModal({ movie, onClose }) {
  if (!movie) return null;

  // Real YouTube trailer embed URL mapping or search embed query
  const query = encodeURIComponent(`${movie.title} ${movie.release_year} official trailer`);
  const embedUrl = `https://www.youtube-nocookie.com/embed?listType=search&list=${query}&autoplay=1`;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/90 backdrop-blur-2xl flex items-center justify-center p-4 animate-fadeIn">
      <div className="relative w-full max-w-4xl bg-[#181818] border border-white/10 rounded-2xl shadow-2xl overflow-hidden text-white flex flex-col">
        {/* Header Bar */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-black/40">
          <div className="flex items-center space-x-2">
            <Film className="w-5 h-5 text-[#E50914]" />
            <h3 className="font-bold text-lg font-serif">
              {movie.title} — Official Trailer
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full bg-white/10 hover:bg-[#E50914] text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Trailer Video Iframe */}
        <div className="relative aspect-video w-full bg-black flex items-center justify-center">
          <iframe
            title={`${movie.title} Trailer`}
            src={embedUrl}
            className="w-full h-full border-0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>
      </div>
    </div>
  );
}
