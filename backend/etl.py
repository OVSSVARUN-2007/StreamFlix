import sqlite3
import pandas as pd
import json
import os
import re

DB_PATH = os.path.abspath(os.path.join(os.path.dirname(__file__), "movies.db"))
DATA_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "data"))
CACHE_FILE = os.path.join(DATA_DIR, "poster_cache.json")

def parse_json_field(val, key="name", limit=None):
    if not isinstance(val, str) or not val:
        return []
    try:
        data = json.loads(val)
        res = [item[key] for item in data if isinstance(item, dict) and key in item]
        if limit:
            return res[:limit]
        return res
    except Exception:
        return []

def extract_director(crew_str):
    if not isinstance(crew_str, str) or not crew_str:
        return ""
    try:
        crew = json.loads(crew_str)
        for member in crew:
            if member.get("job") == "Director":
                return member.get("name", "")
        return ""
    except Exception:
        return ""

def load_poster_cache():
    if os.path.exists(CACHE_FILE):
        try:
            with open(CACHE_FILE, "r") as f:
                return json.load(f)
        except Exception as e:
            print("Cache read error:", e)
            return {}
    return {}

def run_etl():
    movies_csv = os.path.join(DATA_DIR, "tmdb_5000_movies.csv")
    credits_csv = os.path.join(DATA_DIR, "tmdb_5000_credits.csv")
    
    if not os.path.exists(movies_csv) or not os.path.exists(credits_csv):
        raise FileNotFoundError("Missing CSV dataset files in backend/data/")

    print("Loading CSV files into pandas...")
    df_m = pd.read_csv(movies_csv)
    df_c = pd.read_csv(credits_csv)

    # Merge on ID
    df = df_m.merge(df_c, left_on="id", right_on="movie_id", suffixes=("", "_credit"))
    print(f"Merged dataset rows: {len(df)}")

    # Calculate IMDB Weighted Rating
    C = df['vote_average'].mean()
    m = df['vote_count'].quantile(0.70)

    def calc_weighted_rating(row):
        v = row['vote_count']
        R = row['vote_average']
        if pd.isna(v) or pd.isna(R) or (v + m) == 0:
            return 0.0
        return (v / (v + m)) * R + (m / (v + m)) * C

    df['weighted_rating'] = df.apply(calc_weighted_rating, axis=1)

    poster_cache = load_poster_cache()
    print(f"Loaded {len(poster_cache)} title-matched poster URLs from cache.")

    from database import init_db, get_db_connection
    init_db()
    conn = get_db_connection()
    cursor = conn.cursor()

    cursor.execute("DELETE FROM movies")

    records = []
    for _, row in df.iterrows():
        mid = int(row["id"])
        title = str(row["title"]) if pd.notna(row["title"]) else ""
        orig_title = str(row.get("original_title", title)) if pd.notna(row.get("original_title")) else title
        overview = str(row["overview"]) if pd.notna(row["overview"]) else ""
        rel_date = str(row["release_date"]) if pd.notna(row["release_date"]) else ""
        
        rel_year = 0
        if rel_date:
            match = re.search(r"(\d{4})", rel_date)
            if match:
                rel_year = int(match.group(1))

        runtime = int(row["runtime"]) if pd.notna(row["runtime"]) else 0
        vote_avg = float(row["vote_average"]) if pd.notna(row["vote_average"]) else 0.0
        vote_cnt = int(row["vote_count"]) if pd.notna(row["vote_count"]) else 0
        pop = float(row["popularity"]) if pd.notna(row["popularity"]) else 0.0
        w_rating = float(row["weighted_rating"])
        tagline = str(row["tagline"]) if pd.notna(row["tagline"]) else ""
        budget = int(row["budget"]) if pd.notna(row["budget"]) else 0
        revenue = int(row["revenue"]) if pd.notna(row["revenue"]) else 0

        # Parse JSON columns
        genres_list = parse_json_field(row.get("genres"))
        keywords_list = parse_json_field(row.get("keywords"))
        top_cast = parse_json_field(row.get("cast"), key="name", limit=5)
        director = extract_director(row.get("crew"))

        # Poster & Backdrop resolution
        cached_img = poster_cache.get(str(mid), {})
        cached_url = cached_img.get("poster_url")
        cached_backdrop = cached_img.get("backdrop_url")

        if cached_url:
            poster_url = cached_url
            backdrop_url = cached_backdrop or cached_url
            poster_path = "cached"
            backdrop_path = "cached"
        else:
            # Dynamic SVG poster route matching exact movie title
            poster_url = f"/api/poster/{mid}"
            backdrop_url = f"/api/poster/{mid}"
            poster_path = None
            backdrop_path = None

        genres_str = ", ".join(genres_list)
        keywords_str = ", ".join(keywords_list)
        top_cast_json = json.dumps(top_cast)
        search_content = f"{title} {director} {' '.join(top_cast)} {genres_str} {keywords_str}".lower()

        records.append((
            mid, title, orig_title, overview, rel_date, rel_year, runtime,
            vote_avg, vote_cnt, pop, w_rating, poster_path, poster_url,
            backdrop_path, backdrop_url, tagline, budget, revenue,
            director, top_cast_json, genres_str, keywords_str, search_content
        ))

    cursor.executemany("""
        INSERT INTO movies (
            id, title, original_title, overview, release_date, release_year,
            runtime, vote_average, vote_count, popularity, weighted_rating,
            poster_path, poster_url, backdrop_path, backdrop_url, tagline,
            budget, revenue, director, top_cast, genres_str, keywords_str, search_content
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, records)

    conn.commit()
    conn.close()
    print(f"ETL Complete! Successfully inserted {len(records)} movies into SQLite database.")

if __name__ == "__main__":
    run_etl()
