import argparse
from typing import Dict, Any, List, Tuple

import numpy as np

from common import load_json, save_json, cosine_sim


def course_key(major: str, course_obj: Dict[str, Any]) -> str:
    return f"{major}::{course_obj.get('course_code','')}::{course_obj.get('course_name','')}"


def compute_coverage_score(job_vecs: List[np.ndarray], course_vecs: List[np.ndarray]) -> float:
    """
    Coverage-style score:
    For each job skill vector, take the best similarity against any course skill vector.
    Return the average of those best similarities.
    """
    if not job_vecs or not course_vecs:
        return 0.0

    bests = []
    for jv in job_vecs:
        best = -1.0
        for cv in course_vecs:
            best = max(best, cosine_sim(jv, cv))
        bests.append(best)

    return float(np.mean(bests)) if bests else 0.0


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--jobs_in", required=True)
    ap.add_argument("--courses_in", required=True)

    ap.add_argument("--jobs_skills_in", default="outputs/jobs_skills.json")
    ap.add_argument("--courses_skills_in", default="outputs/courses_skills.json")
    ap.add_argument("--embeddings_in", default="outputs/skill_embeddings.json")

    ap.add_argument("--out_jobs", default="outputs/jobs.updated.json")
    ap.add_argument("--out_courses", default="outputs/courses.updated.json")

    ap.add_argument("--top_k", type=int, default=5)
    ap.add_argument("--min_score", type=float, default=0.72)

    ap.add_argument("--force_top_k", action="store_true",
                    help="Always return top_k courses per job even if below min_score.")
    ap.add_argument("--preserve_if_empty", action="store_true",
                    help="If no matches are found for an item, preserve existing linked fields instead of overwriting with empty.")
    ap.add_argument("--debug_out", default="outputs/match_debug.json",
                    help="Write debug ranking info (top scores) to this file.")
    ap.add_argument("--debug_top_n", type=int, default=10, help="How many top candidates to record per job in debug output.")
    args = ap.parse_args()

    jobs_json = load_json(args.jobs_in)
    courses_json = load_json(args.courses_in)

    jobs = jobs_json.get("job_postings", [])
    majors = courses_json.get("data", [])

    job_skills_map = load_json(args.jobs_skills_in)           # { job_id: { skills: [...] } }
    course_skills_map = load_json(args.courses_skills_in)     # { course_key: { skills: [...] } }
    emb_map = load_json(args.embeddings_in)                   # { skill: embedding[] }

    # Convert embeddings to np arrays
    emb_vec = {k: np.array(v, dtype=np.float32) for k, v in emb_map.items()}

    # Precompute job vectors
    job_vecs_map: Dict[str, List[np.ndarray]] = {}
    for job in jobs:
        job_id = job.get("posting_id")
        if not job_id:
            continue
        skills = job_skills_map.get(job_id, {}).get("skills", [])
        vecs = [emb_vec[s] for s in skills if s in emb_vec]
        job_vecs_map[job_id] = vecs

    # Precompute course vectors + refs
    courses_flat: List[Tuple[str, Dict[str, Any]]] = []
    course_ref: Dict[str, Dict[str, str]] = {}
    course_vecs_map: Dict[str, List[np.ndarray]] = {}

    for block in majors:
        major = block.get("major", "")
        for c in block.get("course", []):
            courses_flat.append((major, c))
            ck = course_key(major, c)

            course_ref[ck] = {
                "course_name": c.get("course_name", ""),
                "course_code": c.get("course_code", ""),
            }

            skills = course_skills_map.get(ck, {}).get("skills", [])
            vecs = [emb_vec[s] for s in skills if s in emb_vec]
            course_vecs_map[ck] = vecs

    # Match: job -> courses
    job_to_courses: Dict[str, List[Tuple[str, float]]] = {}
    debug: Dict[str, Any] = {
        "min_score": args.min_score,
        "top_k": args.top_k,
        "force_top_k": args.force_top_k,
        "jobs": {}
    }

    course_keys = list(course_vecs_map.keys())

    for job in jobs:
        job_id = job.get("posting_id")
        if not job_id:
            continue

        j_vecs = job_vecs_map.get(job_id, [])
        scored_all: List[Tuple[str, float]] = []

        for ck in course_keys:
            c_vecs = course_vecs_map.get(ck, [])
            score = compute_coverage_score(j_vecs, c_vecs)
            scored_all.append((ck, score))

        scored_all.sort(key=lambda x: x[1], reverse=True)

        # Debug: keep top-N regardless of threshold
        debug["jobs"][job_id] = [
            {"course_key": ck, "course_code": course_ref[ck]["course_code"], "course_name": course_ref[ck]["course_name"], "score": float(sc)}
            for ck, sc in scored_all[: args.debug_top_n]
        ]

        # Apply threshold filter
        passed = [(ck, sc) for ck, sc in scored_all if sc >= args.min_score]

        if passed:
            job_to_courses[job_id] = passed[: args.top_k]
        else:
            if args.force_top_k:
                # Always take top-k even if below threshold
                job_to_courses[job_id] = scored_all[: args.top_k]
            else:
                job_to_courses[job_id] = []

    # Save debug file
    save_json(args.debug_out, debug)

    # Update jobs.json: linked_courses
    for job in jobs:
        job_id = job.get("posting_id")
        if not job_id:
            continue

        chosen = job_to_courses.get(job_id, [])
        if not chosen and args.preserve_if_empty:
            # Preserve whatever is currently there
            continue

        linked = []
        for ck, _score in chosen:
            linked.append(course_ref[ck])

        job["linked_courses"] = linked

    # Invert: course -> jobs
    course_to_jobs: Dict[str, List[Tuple[str, float]]] = {ck: [] for ck in course_keys}
    for job_id, items in job_to_courses.items():
        for ck, score in items:
            course_to_jobs[ck].append((job_id, score))

    for ck in course_to_jobs:
        course_to_jobs[ck].sort(key=lambda x: x[1], reverse=True)
        course_to_jobs[ck] = course_to_jobs[ck][: args.top_k]

    # Update courses.json: relatedJobIds
    for major, c in courses_flat:
        ck = course_key(major, c)
        best_jobs = [job_id for job_id, _ in course_to_jobs.get(ck, [])]

        if not best_jobs and args.preserve_if_empty:
            # Preserve existing list if present
            continue

        c["relatedJobIds"] = best_jobs

    save_json(args.out_jobs, jobs_json)
    save_json(args.out_courses, courses_json)

    print(f"✅ Updated jobs -> {args.out_jobs}")
    print(f"✅ Updated courses -> {args.out_courses}")
    print(f"✅ Match debug -> {args.debug_out}")


if __name__ == "__main__":
    main()
