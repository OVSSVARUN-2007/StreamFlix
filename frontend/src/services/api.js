const API_BASE = '/api';

export async function fetchHeroMovie() {
  const res = await fetch(`${API_BASE}/hero`);
  if (!res.ok) throw new Error('Failed to fetch hero movie');
  return res.json();
}

export async function fetchTrendingMovies() {
  const res = await fetch(`${API_BASE}/trending?limit=18`);
  if (!res.ok) throw new Error('Failed to fetch trending movies');
  return res.json();
}

export async function fetchPopularMovies() {
  const res = await fetch(`${API_BASE}/popular?limit=18`);
  if (!res.ok) throw new Error('Failed to fetch popular movies');
  return res.json();
}

export async function fetchGenres() {
  const res = await fetch(`${API_BASE}/genres`);
  if (!res.ok) throw new Error('Failed to fetch genres');
  return res.json();
}

export async function fetchMoviesByGenre(genre, limit = 18) {
  const res = await fetch(`${API_BASE}/genres/${encodeURIComponent(genre)}?limit=${limit}`);
  if (!res.ok) throw new Error(`Failed to fetch movies for genre ${genre}`);
  return res.json();
}

export async function fetchMovieById(id) {
  const res = await fetch(`${API_BASE}/movie/${id}`);
  if (!res.ok) throw new Error(`Failed to fetch movie ${id}`);
  return res.json();
}

export async function fetchRecommendations(id, limit = 12) {
  const res = await fetch(`${API_BASE}/recommend/${id}?limit=${limit}`);
  if (!res.ok) throw new Error(`Failed to fetch recommendations for ${id}`);
  return res.json();
}

export async function searchMovies(query) {
  if (!query || query.trim().length === 0) return [];
  const res = await fetch(`${API_BASE}/search?q=${encodeURIComponent(query)}&limit=8`);
  if (!res.ok) throw new Error('Failed to search movies');
  return res.json();
}
