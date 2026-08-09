import sqlite3
import os

DB_PATH = os.path.abspath(os.path.join(os.path.dirname(__file__), "movies.db"))

def get_db_connection(readonly=False):
    if not os.path.exists(DB_PATH):
        conn = sqlite3.connect(":memory:", check_same_thread=False)
        conn.row_factory = sqlite3.Row
        return conn

    if readonly:
        try:
            conn = sqlite3.connect(f"file:{DB_PATH}?mode=ro", uri=True, check_same_thread=False)
        except Exception:
            conn = sqlite3.connect(DB_PATH, check_same_thread=False)
    else:
        conn = sqlite3.connect(DB_PATH, check_same_thread=False)
        
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    if not os.path.exists(DB_PATH):
        print("Creating fallback in-memory SQLite schema...")
        conn = sqlite3.connect(DB_PATH, check_same_thread=False)
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
        conn.commit()
        conn.close()

if __name__ == "__main__":
    init_db()
