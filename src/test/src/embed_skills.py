import os
import argparse
import time
import random
from typing import Dict, List, Any, Tuple

import numpy as np
from openai import OpenAI

from common import load_json, save_json, normalize_skill, backoff_sleep


def embed_texts(
    client: OpenAI,
    model: str,
    texts: List[str],
    batch_size: int = 64,
    max_retries: int = 5
) -> List[List[float]]:
    all_embeds: List[List[float]] = []
    for i in range(0, len(texts), batch_size):
        chunk = texts[i:i + batch_size]
        last_err = None
        for attempt in range(max_retries):
            try:
                r = client.embeddings.create(model=model, input=chunk, encoding_format="float")
                all_embeds.extend([item.embedding for item in r.data])
                break
            except Exception as e:
                last_err = e
                backoff_sleep(attempt)
        else:
            raise RuntimeError(f"Embedding failed after retries: {last_err}")
    return all_embeds


def cosine_sim(a: np.ndarray, b: np.ndarray) -> float:
    denom = float(np.linalg.norm(a) * np.linalg.norm(b))
    if denom == 0.0:
        return 0.0
    return float(np.dot(a, b) / denom)


def collect_unique_skills(jobs_skills: Dict[str, Any], courses_skills: Dict[str, Any]) -> List[str]:
    skills = []
    for v in jobs_skills.values():
        skills.extend(v.get("skills", []))
    for v in courses_skills.values():
        skills.extend(v.get("skills", []))

    cleaned = [normalize_skill(s) for s in skills if normalize_skill(s)]
    # Use set for uniqueness, then sort for stable output
    uniq = sorted(set(cleaned))
    return uniq


def load_or_init_cache(cache_path: str, embed_model: str) -> Dict[str, Any]:
    """
    Cache format:
      {
        "_meta": {"embedding_model": "...", "dim": 1536, "created_at": "..."},
        "vectors": {"skill": [..], ...}
      }
    """
    if not os.path.exists(cache_path):
        return {"_meta": {"embedding_model": embed_model, "dim": None, "created_at": time.strftime("%Y-%m-%d %H:%M:%S")},
                "vectors": {}}

    data = load_json(cache_path)
    if not isinstance(data, dict) or "vectors" not in data or "_meta" not in data:
        # Legacy cache (skill -> vector) or corrupted; reset safely
        return {"_meta": {"embedding_model": embed_model, "dim": None, "created_at": time.strftime("%Y-%m-%d %H:%M:%S")},
                "vectors": {}}

    # If model mismatch, invalidate cache
    if data["_meta"].get("embedding_model") != embed_model:
        return {"_meta": {"embedding_model": embed_model, "dim": None, "created_at": time.strftime("%Y-%m-%d %H:%M:%S")},
                "vectors": {}}

    return data


def sanity_check(emb_map: Dict[str, List[float]], sample_n: int = 30) -> Dict[str, Any]:
    """
    Basic diagnostics to catch broken/mixed embeddings:
    - self-sim should be ~1.0
    - random pair similarities should not all cluster near 0.0
    """
    keys = list(emb_map.keys())
    if len(keys) < 2:
        return {"status": "too_few_embeddings", "count": len(keys)}

    # Sample vectors
    sample_keys = random.sample(keys, k=min(sample_n, len(keys)))
    vecs = {k: np.array(emb_map[k], dtype=np.float32) for k in sample_keys}

    # Self similarity check
    self_sims = []
    for k in sample_keys[: min(10, len(sample_keys))]:
        v = vecs[k]
        self_sims.append(cosine_sim(v, v))

    # Random pair similarities
    pair_sims = []
    for _ in range(min(50, len(sample_keys) * 2)):
        a, b = random.sample(sample_keys, 2)
        pair_sims.append(cosine_sim(vecs[a], vecs[b]))

    return {
        "status": "ok",
        "self_sim_min": float(min(self_sims)) if self_sims else None,
        "self_sim_max": float(max(self_sims)) if self_sims else None,
        "pair_sim_min": float(min(pair_sims)) if pair_sims else None,
        "pair_sim_max": float(max(pair_sims)) if pair_sims else None,
        "pair_sim_avg": float(sum(pair_sims) / len(pair_sims)) if pair_sims else None,
        "sample_count": len(sample_keys),
        "total_count": len(keys),
    }


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--jobs_skills_in", default="outputs/jobs_skills.json")
    ap.add_argument("--courses_skills_in", default="outputs/courses_skills.json")
    ap.add_argument("--embeddings_out", default="outputs/skill_embeddings.json")

    ap.add_argument("--embed_model", default="text-embedding-3-small")
    ap.add_argument("--cache_dir", default="cache")
    ap.add_argument("--batch_size", type=int, default=64)

    ap.add_argument("--write_debug", action="store_true", help="Write embedding diagnostics to outputs/embedding_debug.json")
    args = ap.parse_args()

    os.makedirs(args.cache_dir, exist_ok=True)
    os.makedirs(os.path.dirname(args.embeddings_out), exist_ok=True)

    # Model-specific cache file to prevent mixing
    safe_model_name = args.embed_model.replace("/", "_")
    cache_path = os.path.join(args.cache_dir, f"embedding_cache.{safe_model_name}.json")

    client = OpenAI()

    job_skills = load_json(args.jobs_skills_in)
    course_skills = load_json(args.courses_skills_in)

    # Load/init cache with metadata and model guard
    cache_obj = load_or_init_cache(cache_path, args.embed_model)
    vec_cache: Dict[str, List[float]] = cache_obj["vectors"]

    # Collect unique skills
    all_skills = collect_unique_skills(job_skills, course_skills)

    # Determine which skills need embedding
    to_embed = [s for s in all_skills if s not in vec_cache]

    if to_embed:
        embeds = embed_texts(client, args.embed_model, to_embed, batch_size=args.batch_size)

        # Determine dimension and store meta
        dim = len(embeds[0]) if embeds and embeds[0] else None
        if cache_obj["_meta"].get("dim") is None and dim is not None:
            cache_obj["_meta"]["dim"] = dim

        for s, e in zip(to_embed, embeds):
            vec_cache[s] = e

        # Save updated cache (with metadata)
        cache_obj["vectors"] = vec_cache
        save_json(cache_path, cache_obj)

    # Write embeddings_out as plain map (skill -> vector) for easy loading downstream
    save_json(args.embeddings_out, vec_cache)
    print(f"✅ Saved skill embeddings -> {args.embeddings_out}")
    print(f"✅ Cache used -> {cache_path}")
    print(f"✅ Embedded total skills -> {len(vec_cache)} (new: {len(to_embed)})")

    # Optional diagnostics
    if args.write_debug:
        debug = {
            "embed_model": args.embed_model,
            "cache_path": cache_path,
            "diagnostics": sanity_check(vec_cache),
        }
        save_json("outputs/embedding_debug.json", debug)
        print("✅ Saved embedding diagnostics -> outputs/embedding_debug.json")


if __name__ == "__main__":
    main()
