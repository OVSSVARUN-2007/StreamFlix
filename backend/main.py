import sys
import os
from contextlib import asynccontextmanager

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from fastapi import FastAPI, Query, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import Response
from pydantic import BaseModel
from typing import List, Optional
import sqlite3
import json
import html

from database import get_db_connection, init_db
from recommender import engine

@asynccontextmanager
async def lifespan(app: FastAPI):
    init_db()
    engine.load_and_fit()
    yield

app = FastAPI(
    title="StreamFlix Movie Recommendation API",
    description="Backend API powering TF-IDF recommendation engine & StreamFlix cinematic UI",
    version="1.0.0",
    lifespan=lifespan
)

# Enable CORS for frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

WATCHLIST_STORE = set()

class WatchlistRequest(BaseModel):
    movie_id: int

def row_to_dict(row):
    d = dict(row)
    if d.get("top_cast"):
        try:
            d["top_cast"] = json.loads(d["top_cast"])
        except Exception:
            d["top_cast"] = []
    if d.get("genres_str"):
        d["genres"] = [g.strip() for g in d["genres_str"].split(",") if g.strip()]
    else:
        d["genres"] = []
    if d.get("keywords_str"):
        d["keywords"] = [k.strip() for k in d["keywords_str"].split(",") if k.strip()]
    else:
        d["keywords"] = []
    return d

@app.get("/health")
def health_check():
    return {"status": "ok", "total_movies": len(engine.movie_ids)}

@app.get("/api/poster/{id}")
def generate_dynamic_poster(id: int):
    """Generates a high-impact, title-matched cinematic SVG poster."""
    conn = get_db_connection()
    c = conn.cursor()
    c.execute("SELECT title, release_year, genres_str, vote_average, director FROM movies WHERE id = ?", (id,))
    row = c.fetchone()
    conn.close()

    if not row:
        title = "MOVIE POSTER"
        year = ""
        genre = "CINEMA"
        rating = "8.0"
        director = ""
    else:
        title = html.escape(row["title"])
        year = str(row["release_year"]) if row["release_year"] else ""
        genres = [g.strip() for g in row["genres_str"].split(",") if g.strip()] if row["genres_str"] else []
        genre = html.escape(genres[0].upper()) if genres else "CINEMA"
        rating = f"{row['vote_average']:.1f}" if row["vote_average"] else "8.0"
        director = html.escape(row["director"]) if row["director"] else ""

    color_schemes = {
        "ACTION": ("#111827", "#7F1D1D", "#DC2626"),
        "SCIENCE FICTION": ("#0F172A", "#1E1B4B", "#4F46E5"),
        "SCI-FI": ("#0F172A", "#1E1B4B", "#4F46E5"),
        "COMEDY": ("#18181B", "#701A75", "#C026D3"),
        "DRAMA": ("#18181B", "#312E81", "#6366F1"),
        "HORROR": ("#09090B", "#450A0A", "#991B1B"),
        "ANIMATION": ("#0F172A", "#065F46", "#10B981"),
        "ADVENTURE": ("#172554", "#1E3A8A", "#2563EB")
    }
    bg1, bg2, accent = color_schemes.get(genre, ("#141414", "#27272A", "#E50914"))

    svg = f"""<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 500 750" width="100%" height="100%">
        <defs>
            <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stop-color="{bg1}" />
                <stop offset="50%" stop-color="{bg2}" />
                <stop offset="100%" stop-color="#000000" />
            </linearGradient>
            <linearGradient id="overlay" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stop-color="rgba(0,0,0,0.2)" />
                <stop offset="50%" stop-color="rgba(0,0,0,0.5)" />
                <stop offset="100%" stop-color="rgba(0,0,0,0.95)" />
            </linearGradient>
        </defs>

        <rect width="500" height="750" fill="url(#bgGrad)" />
        <circle cx="250" cy="280" r="180" fill="none" stroke="{accent}" stroke-width="2" opacity="0.2" />
        <polygon points="250,120 380,350 120,350" fill="none" stroke="{accent}" stroke-width="1.5" opacity="0.15" />
        <rect width="500" height="750" fill="url(#overlay)" />

        <rect x="30" y="30" width="90" height="28" rx="6" fill="{accent}" />
        <text x="75" y="49" font-family="Inter, sans-serif" font-size="12" font-weight="bold" fill="#ffffff" text-anchor="middle">{genre}</text>

        {f'<rect x="130" y="30" width="60" height="28" rx="6" fill="rgba(255,255,255,0.15)" stroke="rgba(255,255,255,0.2)" /><text x="160" y="49" font-family="Inter, sans-serif" font-size="12" font-weight="600" fill="#E5E7EB" text-anchor="middle">{year}</text>' if year else ''}

        <rect x="400" y="30" width="70" height="28" rx="6" fill="rgba(0,0,0,0.6)" stroke="rgba(255,255,255,0.1)" />
        <text x="435" y="49" font-family="Inter, sans-serif" font-size="13" font-weight="bold" fill="#FBBF24" text-anchor="middle">★ {rating}</text>

        {f'<text x="250" y="580" font-family="Inter, sans-serif" font-size="12" font-weight="500" fill="#9CA3AF" text-anchor="middle" letter-spacing="2">A FILM BY {director.upper()}</text>' if director else ''}

        <foreignObject x="30" y="595" width="440" height="110">
            <div xmlns="http://www.w3.org/1999/xhtml" style="color: white; font-family: 'Georgia', serif; font-weight: 900; font-size: 32px; text-align: center; text-transform: uppercase; line-height: 1.1; display: flex; align-items: center; justify-content: center; height: 100%; text-shadow: 0 4px 12px rgba(0,0,0,0.9);">
                {title}
            </div>
        </foreignObject>

        <rect x="200" y="720" width="100" height="3" rx="1.5" fill="{accent}" />
    </svg>"""

    return Response(content=svg, media_type="image/svg+xml")

@app.get("/api/hero")
def get_hero_movie():
    """Returns a featured top-tier movie for the StreamFlix hero banner."""
    conn = get_db_connection()
    c = conn.cursor()
    c.execute("""
        SELECT * FROM movies 
        WHERE vote_count > 1000
        ORDER BY weighted_rating DESC, popularity DESC 
        LIMIT 1
    """)
    row = c.fetchone()
    conn.close()
    if not row:
        raise HTTPException(status_code=404, detail="Hero movie not found")
    return row_to_dict(row)

@app.get("/api/trending")
def get_trending_movies(limit: int = 15):
    """Returns top trending & top rated movies based on IMDB weighted rating formula."""
    conn = get_db_connection()
    c = conn.cursor()
    c.execute("""
        SELECT * FROM movies 
        ORDER BY weighted_rating DESC, popularity DESC 
        LIMIT ?
    """, (limit,))
    rows = c.fetchall()
    conn.close()
    return [row_to_dict(r) for r in rows]

@app.get("/api/popular")
def get_popular_movies(limit: int = 15):
    """Returns movies ordered by popularity score."""
    conn = get_db_connection()
    c = conn.cursor()
    c.execute("""
        SELECT * FROM movies 
        ORDER BY popularity DESC 
        LIMIT ?
    """, (limit,))
    rows = c.fetchall()
    conn.close()
    return [row_to_dict(r) for r in rows]

@app.get("/api/search")
def search_movies(q: str = Query(..., min_length=1), limit: int = 10):
    """Live search with instant autocomplete suggestions."""
    conn = get_db_connection()
    c = conn.cursor()
    search_term = f"%{q.lower()}%"
    c.execute("""
        SELECT * FROM movies 
        WHERE search_content LIKE ? OR title LIKE ? 
        ORDER BY weighted_rating DESC, popularity DESC 
        LIMIT ?
    """, (search_term, search_term, limit))
    rows = c.fetchall()
    conn.close()
    return [row_to_dict(r) for r in rows]

@app.get("/api/movie/{id}")
def get_movie_by_id(id: int):
    """Full movie details by ID."""
    conn = get_db_connection()
    c = conn.cursor()
    c.execute("SELECT * FROM movies WHERE id = ?", (id,))
    row = c.fetchone()
    conn.close()
    if not row:
        raise HTTPException(status_code=404, detail="Movie not found")
    return row_to_dict(row)

@app.get("/api/recommend/{id}")
def get_recommendations(id: int, limit: int = 12):
    """Content-based recommendations with 'Because you watched X' explanations."""
    recs = engine.get_similar_movies(movie_id=id, top_n=limit)
    return recs

@app.get("/api/genres")
def get_all_genres():
    """Get all unique genres."""
    conn = get_db_connection()
    c = conn.cursor()
    c.execute("SELECT genres_str FROM movies WHERE genres_str != ''")
    rows = c.fetchall()
    conn.close()
    
    genre_counts = {}
    for r in rows:
        genres = [g.strip() for g in r["genres_str"].split(",") if g.strip()]
        for g in genres:
            genre_counts[g] = genre_counts.get(g, 0) + 1
            
    sorted_genres = sorted(genre_counts.items(), key=lambda x: x[1], reverse=True)
    return [{"name": g, "count": cnt} for g, cnt in sorted_genres]

@app.get("/api/genres/{genre}")
def get_movies_by_genre(genre: str, limit: int = 15):
    """Browse top movies for a specific genre."""
    conn = get_db_connection()
    c = conn.cursor()
    genre_term = f"%{genre}%"
    c.execute("""
        SELECT * FROM movies 
        WHERE genres_str LIKE ? 
        ORDER BY weighted_rating DESC, popularity DESC 
        LIMIT ?
    """, (genre_term, limit))
    rows = c.fetchall()
    conn.close()
    return [row_to_dict(r) for r in rows]

@app.get("/api/watchlist")
def get_watchlist():
    if not WATCHLIST_STORE:
        return []
    conn = get_db_connection()
    c = conn.cursor()
    placeholders = ",".join(["?"] * len(WATCHLIST_STORE))
    c.execute(f"SELECT * FROM movies WHERE id IN ({placeholders})", list(WATCHLIST_STORE))
    rows = c.fetchall()
    conn.close()
    return [row_to_dict(r) for r in rows]

@app.post("/api/watchlist/toggle")
def toggle_watchlist(req: WatchlistRequest):
    if req.movie_id in WATCHLIST_STORE:
        WATCHLIST_STORE.remove(req.movie_id)
        is_in = False
    else:
        WATCHLIST_STORE.add(req.movie_id)
        is_in = True
    return {"movie_id": req.movie_id, "in_watchlist": is_in}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
