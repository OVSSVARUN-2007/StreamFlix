import sqlite3
import numpy as np
import json
import os
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
from database import get_db_connection

class RecommendationEngine:
    def __init__(self):
        self.movie_ids = []
        self.id_to_index = {}
        self.index_to_id = {}
        self.movies_dict = {}
        self.tfidf_matrix = None
        self.cosine_sim = None
        self.is_ready = False

    def load_and_fit(self):
        if self.is_ready:
            return

        try:
            conn = get_db_connection()
            cursor = conn.cursor()
            
            cursor.execute("""
                SELECT id, title, overview, genres_str, keywords_str, director, top_cast, 
                       vote_average, vote_count, weighted_rating, popularity, poster_url, backdrop_url, release_year, runtime, tagline
                FROM movies
            """)
            
            rows = cursor.fetchall()
            conn.close()

            if not rows:
                print("Warning: No movies found in database!")
                return

            documents = []
            self.movie_ids = []
            self.id_to_index = {}
            self.index_to_id = {}
            self.movies_dict = {}

            for idx, r in enumerate(rows):
                m_id = r['id']
                self.movie_ids.append(m_id)
                self.id_to_index[m_id] = idx
                self.index_to_id[idx] = m_id
                
                top_cast = json.loads(r['top_cast']) if r['top_cast'] else []
                cast_str = " ".join([c.replace(" ", "") for c in top_cast])
                director_str = r['director'].replace(" ", "") if r['director'] else ""
                genres_clean = r['genres_str'].replace(" ", "").replace(",", " ") if r['genres_str'] else ""
                keywords_clean = r['keywords_str'].replace(",", " ") if r['keywords_str'] else ""
                overview = r['overview'] if r['overview'] else ""

                soup = f"{genres_clean} {cast_str} {director_str} {keywords_clean} {overview}"
                documents.append(soup)

                self.movies_dict[m_id] = {
                    "id": m_id,
                    "title": r['title'],
                    "overview": r['overview'],
                    "genres": r['genres_str'].split(", ") if r['genres_str'] else [],
                    "keywords": r['keywords_str'].split(", ") if r['keywords_str'] else [],
                    "director": r['director'],
                    "top_cast": top_cast,
                    "vote_average": r['vote_average'],
                    "vote_count": r['vote_count'],
                    "weighted_rating": r['weighted_rating'],
                    "popularity": r['popularity'],
                    "poster_url": r['poster_url'],
                    "backdrop_url": r['backdrop_url'],
                    "release_year": r['release_year'],
                    "runtime": r['runtime'],
                    "tagline": r['tagline']
                }

            tfidf = TfidfVectorizer(stop_words='english', max_features=5000)
            self.tfidf_matrix = tfidf.fit_transform(documents)
            self.cosine_sim = cosine_similarity(self.tfidf_matrix, self.tfidf_matrix)
            self.is_ready = True
        except Exception as e:
            print("Error training recommendation model:", e)

    def generate_explanation(self, source_movie: dict, rec_movie: dict) -> str:
        reasons = []
        if source_movie.get("director") and source_movie.get("director") == rec_movie.get("director"):
            reasons.append(f"Directed by {source_movie['director']}")
            
        source_cast = set(source_movie.get("top_cast", []))
        rec_cast = set(rec_movie.get("top_cast", []))
        common_cast = source_cast.intersection(rec_cast)
        if common_cast:
            actor = list(common_cast)[0]
            reasons.append(f"Stars {actor}")
            
        source_genres = set(source_movie.get("genres", []))
        rec_genres = set(rec_movie.get("genres", []))
        common_genres = source_genres.intersection(rec_genres)
        if common_genres:
            genres_fmt = " & ".join(list(common_genres)[:2])
            reasons.append(f"Shares genre ({genres_fmt})")
            
        if not reasons:
            reasons.append("Similar thematic plot elements & tone")
            
        return f"Because you liked {source_movie['title']}: " + " • ".join(reasons)

    def get_similar_movies(self, movie_id: int, top_n: int = 12):
        if not self.is_ready:
            self.load_and_fit()

        if movie_id not in self.id_to_index:
            return []

        idx = self.id_to_index[movie_id]
        source_movie = self.movies_dict[movie_id]
        
        sim_scores = list(enumerate(self.cosine_sim[idx]))
        sim_scores = sorted(sim_scores, key=lambda x: x[1], reverse=True)
        sim_scores = [item for item in sim_scores if self.index_to_id[item[0]] != movie_id][:top_n]
        
        recommendations = []
        for i, score in sim_scores:
            rec_id = self.index_to_id[i]
            rec_movie = dict(self.movies_dict[rec_id])
            rec_movie["similarity_score"] = float(round(score, 4))
            rec_movie["explanation"] = self.generate_explanation(source_movie, rec_movie)
            recommendations.append(rec_movie)

        return recommendations

engine = RecommendationEngine()
