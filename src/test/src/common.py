import json
import os
import time
from typing import Any, List

import numpy as np


def load_json(path: str) -> Any:
    with open(path, "r", encoding="utf-8") as f:
        return json.load(f)


def save_json(path: str, obj: Any) -> None:
    os.makedirs(os.path.dirname(path), exist_ok=True)
    with open(path, "w", encoding="utf-8") as f:
        json.dump(obj, f, ensure_ascii=False, indent=2)


def normalize_skill(s: str) -> str:
    s = (s or "").strip()
    s = " ".join(s.split())
    s = s.strip(".,;:·-–—")
    return s


def dedupe_preserve_order(items: List[str]) -> List[str]:
    seen = set()
    out = []
    for x in items:
        if x not in seen:
            seen.add(x)
            out.append(x)
    return out


def cosine_sim(a: np.ndarray, b: np.ndarray) -> float:
    denom = float(np.linalg.norm(a) * np.linalg.norm(b))
    if denom == 0.0:
        return 0.0
    return float(np.dot(a, b) / denom)


def backoff_sleep(attempt: int, base: float = 0.8, cap: float = 8.0) -> None:
    t = min(cap, base * (2 ** attempt))
    time.sleep(t)

