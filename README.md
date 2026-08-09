# 🎬 Netflix-Style Movie Recommendation System

A full-scale, production-ready Movie Recommendation System featuring a premium Netflix-style UI, TF-IDF + Cosine Similarity recommendation engine, SQLite database layer, and FastAPI REST API backend.

![Tech Stack](https://img.shields.io/badge/Tech%20Stack-FastAPI%20%7C%20React%20%7C%20TailwindCSS%20%7C%20SQLite%20%7C%20scikit--learn-red)

---

## 🌟 Key Features

- **Netflix Premium UI**: Dark cinematic aesthetic (`#141414`), deep crimson accents (`#E50914`), glassmorphic panels, and smooth hover zoom poster animations.
- **Hero Featured Banner**: High-resolution backdrop image, metadata badges (IMDB rating, release year, runtime), tagline, trailer button, and quick watchlist toggle.
- **Horizontal Carousels**: Scrollable rows for *Trending Now (IMDB Weighted)*, *Popular Blockbusters*, *Action*, *Sci-Fi*, and *Animated Adventures*.
- **Machine Learning Recommendation Engine**:
  - Content-based filtering using `TfidfVectorizer` + `cosine_similarity` across plot summaries, genres, director, keywords, and top actors.
  - **"Because You Liked X" Explanations**: Provides human-readable reasons (e.g. *"Shares genre Action & Sci-Fi • Directed by Christopher Nolan • Stars Leonardo DiCaprio"*).
- **IMDB Weighted Rating Formula**: Sorts trending & top-rated movies using IMDB's formula:
  $$WR = \left(\frac{v}{v+m}\right) \times R + \left(\frac{m}{v+m}\right) \times C$$
- **Live Search Autocomplete**: Instant search dropdown with poster previews and rating pills as you type.
- **Movie Detail Modal**: Comprehensive popover with backdrop, story overview, director, cast list, genre pills, trailer playback modal, and recommendations carousel.
- **Personal Watchlist**: One-click watchlist toggle persisted in `localStorage`.

---

## 🛠️ Tech Stack

### **Backend**
- **Framework**: FastAPI (Python 3.13)
- **Database**: SQLite (`movies.db`) with normalized schema & indexes
- **ML / Scikit-Learn**: `TfidfVectorizer`, `cosine_similarity`
- **Data Pipeline**: Pandas & JSON parser ETL script (`etl.py`)
- **Server**: Uvicorn ASGI server

### **Frontend**
- **Framework**: React 19 (Vite)
- **Styling**: Tailwind CSS v4 + Custom glassmorphism design system
- **Icons**: Lucide React (`lucide-react`)
- **Persistence**: `localStorage` watchlist sync

---

## 📂 Project Folder Structure

```
movie-recommendation-system/
├── backend/
│   ├── data/
│   │   ├── tmdb_5000_movies.csv
│   │   ├── tmdb_5000_credits.csv
│   │   └── poster_cache.json
│   ├── database.py         # SQLite connection & table setup
│   ├── etl.py              # Data ETL pipeline & weighted rating calculation
│   ├── recommender.py      # TF-IDF & Cosine Similarity ML model
│   ├── main.py             # FastAPI REST endpoints
│   ├── requirements.txt
│   └── Dockerfile
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Navbar.jsx
│   │   │   ├── HeroBanner.jsx
│   │   │   ├── MovieRow.jsx
│   │   │   ├── MovieCard.jsx
│   │   │   ├── MovieModal.jsx
│   │   │   ├── TrailerModal.jsx
│   │   │   ├── WatchlistView.jsx
│   │   │   ├── GenreView.jsx
│   │   │   └── SkeletonLoader.jsx
│   │   ├── services/
│   │   │   └── api.js
│   │   ├── App.jsx
│   │   └── index.css
│   ├── package.json
│   ├── vite.config.js
│   └── Dockerfile
├── docker-compose.yml
└── README.md
```

---

## 🚀 How to Run the Project

### Method 1: Local Development Setup

#### 1. Backend Setup (FastAPI + SQLite + ML)

```bash
# Navigate to backend directory
cd backend

# Create virtual environment & activate
python3 -m venv venv
source venv/bin/activate   # On Windows: venv\Scripts\activate

# Install Python dependencies
pip install -r requirements.txt

# Run ETL script to populate SQLite database (4,803 movies)
python etl.py

# Start FastAPI server on port 8000
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```
Backend API will be running at: `http://localhost:8000` (API Docs at `http://localhost:8000/docs`).

#### 2. Frontend Setup (React + Vite + Tailwind)

```bash
# Open a new terminal and navigate to frontend directory
cd frontend

# Install Node dependencies
npm install

# Start Vite React dev server
npm run dev
```
Frontend web application will be running at: `http://localhost:3000`.

---

### Method 2: Docker Compose (One-Command Startup)

```bash
docker-compose up --build
```
This single command will build and launch both the FastAPI backend and React frontend containers! Access the app at `http://localhost:3000`.

---

## 🌐 API Endpoints Reference

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/health` | Server health check & dataset movie count |
| `GET` | `/api/hero` | Returns top featured movie for Netflix hero banner |
| `GET` | `/api/trending` | Top rated & trending movies (IMDB weighted rating formula) |
| `GET` | `/api/popular` | Movies sorted by box office popularity score |
| `GET` | `/api/search?q={query}` | Live autocomplete search |
| `GET` | `/api/movie/{id}` | Complete metadata for a specific movie |
| `GET` | `/api/recommend/{id}` | Top 12 similar movies + "Because You Watched" explanations |
| `GET` | `/api/genres` | List all unique genres with movie counts |
| `GET` | `/api/genres/{genre}` | Browse movies filtered by genre |
| `POST`| `/api/watchlist/toggle`| Toggle movie in session watchlist |

---

## 📊 Dataset Information

- **Dataset Source**: Kaggle TMDB 5000 Movie Dataset (`tmdb_5000_movies.csv` & `tmdb_5000_credits.csv`).
- **Total Movies**: 4,803 movies.
- **Fields Processed**: Title, Overview, Release Date, Release Year, Runtime, Vote Average, Vote Count, Popularity, Genres, Keywords, Director, Top 5 Cast Members, Poster Path, Backdrop Path.
