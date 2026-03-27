import json
import sqlite3
from dataclasses import dataclass
from pathlib import Path
from typing import List, Tuple, Optional
import numpy as np
from sklearn.feature_extraction.text import HashingVectorizer
from sklearn.preprocessing import normalize

try:
    from supabase import create_client
except ImportError:  # pragma: no cover - optional
    create_client = None


@dataclass
class SimilarAthlete:
    athlete_id: str
    score: float


class TextEmbedder:
    def __init__(self, dimension: int = 256):
        self.vectorizer = HashingVectorizer(n_features=dimension, alternate_sign=False, norm=None)
        self.dimension = dimension

    def embed(self, text: str) -> np.ndarray:
        vec = self.vectorizer.transform([text]).toarray()[0]
        return normalize(vec.reshape(1, -1))[0]


class LocalVectorStore:
    def __init__(self, db_path: Path, dimension: int = 256):
        self.db_path = db_path
        self.dimension = dimension
        self._ensure_schema()

    def _ensure_schema(self):
        conn = sqlite3.connect(self.db_path)
        cur = conn.cursor()
        cur.execute(
            """
            CREATE TABLE IF NOT EXISTS embeddings (
                athlete_id TEXT PRIMARY KEY,
                embedding TEXT
            )
            """
        )
        conn.commit()
        conn.close()

    def upsert(self, athlete_id: str, embedding: np.ndarray):
        conn = sqlite3.connect(self.db_path)
        cur = conn.cursor()
        cur.execute(
            "REPLACE INTO embeddings (athlete_id, embedding) VALUES (?, ?)",
            (athlete_id, json.dumps(embedding.tolist())),
        )
        conn.commit()
        conn.close()

    def query(self, embedding: np.ndarray, top_k: int = 3) -> List[SimilarAthlete]:
        conn = sqlite3.connect(self.db_path)
        cur = conn.cursor()
        cur.execute("SELECT athlete_id, embedding FROM embeddings")
        rows = cur.fetchall()
        conn.close()

        scores: List[Tuple[str, float]] = []
        for athlete_id, emb_json in rows:
            arr = np.array(json.loads(emb_json))
            if arr.shape != embedding.shape:
                continue
            score = float(np.dot(arr, embedding))
            scores.append((athlete_id, score))

        scores.sort(key=lambda x: x[1], reverse=True)
        return [SimilarAthlete(athlete_id=a, score=s) for a, s in scores[:top_k]]


class SupabaseVectorStore:
    def __init__(self, url: str, key: str, table: str, dimension: int):
        if not create_client:
            raise ImportError("supabase-py not installed")
        self.client = create_client(url, key)
        self.table = table
        self.dimension = dimension
        self._ensure_table()

    def _ensure_table(self):  # best effort; ignore errors
        try:
            # relies on SQL RPC to create table if missing; harmless if exists
            self.client.postgrest.rpc(
                "exec_sql",
                {"query": f"CREATE TABLE IF NOT EXISTS {self.table} (athlete_id text primary key, embedding jsonb);"},
            ).execute()
        except Exception:
            pass

    def upsert(self, athlete_id: str, embedding: np.ndarray):
        payload = {"athlete_id": athlete_id, "embedding": embedding.tolist()}
        self.client.table(self.table).upsert(payload, on_conflict="athlete_id").execute()

    def query(self, embedding: np.ndarray, top_k: int = 3) -> List[SimilarAthlete]:
        rows = self.client.table(self.table).select("athlete_id, embedding").execute().data or []
        scores: List[Tuple[str, float]] = []
        for row in rows:
            arr = np.array(row.get("embedding", []))
            if arr.shape != embedding.shape:
                continue
            score = float(np.dot(arr, embedding))
            scores.append((row.get("athlete_id"), score))
        scores.sort(key=lambda x: x[1], reverse=True)
        return [SimilarAthlete(athlete_id=a, score=s) for a, s in scores[:top_k]]


def get_vector_store(url: Optional[str], key: Optional[str], table: str, local_path: Path, dimension: int):
    if url and key:
        try:
            return SupabaseVectorStore(url, key, table, dimension)
        except Exception:
            return LocalVectorStore(local_path, dimension)
    return LocalVectorStore(local_path, dimension)
