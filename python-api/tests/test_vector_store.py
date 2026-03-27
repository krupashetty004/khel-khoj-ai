import numpy as np
from khelkhoj_ai.vector.store import TextEmbedder, LocalVectorStore


def test_vector_store_roundtrip(tmp_path):
    store = LocalVectorStore(tmp_path / "store.sqlite", dimension=64)
    embedder = TextEmbedder(dimension=64)
    v1 = embedder.embed("fast winger")
    store.upsert("athlete-1", v1)
    results = store.query(v1, top_k=1)
    assert results[0].athlete_id == "athlete-1"
