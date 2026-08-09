import sqlite3
import os

DB_PATH = os.path.abspath(os.path.join(os.path.dirname(__file__), "movies.db"))

def get_db_connection():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    conn = get_db_connection()
    cursor = conn.cursor()
    
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS movies (
        id INTEGER PRIMARY KEY,
        title TEXT NOT NULL,
        original_title TEXT,
        overview TEXT,
        release_date TEXT,
        release_year INTEGER,
        runtime INTEGER,
        vote_average REAL,
        vote_count INTEGER,
        popularity REAL,
        weighted_rating REAL,
        poster_path TEXT,
        poster_url TEXT,
        backdrop_path TEXT,
        backdrop_url TEXT,
        tagline TEXT,
        budget INTEGER,
        revenue INTEGER,
        director TEXT,
        top_cast TEXT,
        genres_str TEXT,
        keywords_str TEXT,
        search_content TEXT
    )
    """)
    
    cursor.execute("CREATE INDEX IF NOT EXISTS idx_movies_title ON movies(title)")
    cursor.execute("CREATE INDEX IF NOT EXISTS idx_movies_vote_avg ON movies(vote_average)")
    cursor.execute("CREATE INDEX IF NOT EXISTS idx_movies_weighted_rating ON movies(weighted_rating)")
    cursor.execute("CREATE INDEX IF NOT EXISTS idx_movies_popularity ON movies(popularity)")
    
    conn.commit()
    conn.close()

if __name__ == "__main__":
    init_db()
    print("Database initialized successfully at:", DB_PATH)
