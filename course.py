import json
from pathlib import Path

COURSES_PATH = Path("./src/data/courses.json")
JOBS_PATH = Path("./src/data/jobs.json")

OUT_COURSES_PATH = Path("./src/data/courses.updated.json")  # safe output (doesn't overwrite)


def load_json(path: Path):
    with path.open("r", encoding="utf-8") as f:
        return json.load(f)


def save_json(path: Path, data):
    with path.open("w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)


def iter_course_items(courses_data):
    """
    Yields mutable course dict objects from courses.json, supporting:
    1) Nested shape: { "data": [ { "major": "...", "course": [ {...}, ... ] }, ... ] }
    2) Flat array: [ {...}, ... ]
    3) Flat object: { "courses": [ {...}, ... ] }
    """
    if isinstance(courses_data, dict) and "data" in courses_data:
        for major_block in courses_data.get("data", []):
            for course in major_block.get("course", []):
                yield course
        return

    if isinstance(courses_data, dict) and "courses" in courses_data:
        for course in courses_data.get("courses", []):
            yield course
        return

    if isinstance(courses_data, list):
        for course in courses_data:
            yield course
        return

    raise ValueError("Unsupported courses.json schema")


def main():
    courses = load_json(COURSES_PATH)
    jobs = load_json(JOBS_PATH)

    # Build course lookup by course_code (fallback to id if needed)
    course_by_code = {}
    for c in iter_course_items(courses):
        code = c.get("course_code") or c.get("id")
        if not code:
            continue
        course_by_code[code] = c
        # Ensure relatedJobIds exists
        if "relatedJobIds" not in c or not isinstance(c["relatedJobIds"], list):
            c["relatedJobIds"] = []

    # Determine job postings list shape
    job_postings = None
    if isinstance(jobs, dict) and "job_postings" in jobs:
        job_postings = jobs["job_postings"]
    elif isinstance(jobs, list):
        job_postings = jobs
    else:
        raise ValueError("Unsupported jobs.json schema (expected {job_postings:[...]} or [...])")

    # Apply links: job_posting.posting_id -> course.relatedJobIds via job_posting.linked_courses[].course_code
    missing_courses = set()
    links_added = 0

    for jp in job_postings:
        posting_id = jp.get("posting_id") or jp.get("id")
        if not posting_id:
            continue

        linked_courses = jp.get("linked_courses") or []
        for lc in linked_courses:
            course_code = None
            if isinstance(lc, dict):
                course_code = lc.get("course_code") or lc.get("id")
            elif isinstance(lc, str):
                course_code = lc

            if not course_code:
                continue

            course = course_by_code.get(course_code)
            if not course:
                missing_courses.add(course_code)
                continue

            # Add posting_id to relatedJobIds (dedup)
            if posting_id not in course["relatedJobIds"]:
                course["relatedJobIds"].append(posting_id)
                links_added += 1

    save_json(OUT_COURSES_PATH, courses)

    print(f"✅ Done. Wrote: {OUT_COURSES_PATH}")
    print(f"🔗 Links added: {links_added}")
    if missing_courses:
        print(f"⚠️ linked_courses referenced {len(missing_courses)} unknown course_code(s). Examples:")
        for x in list(sorted(missing_courses))[:10]:
            print("  -", x)


if __name__ == "__main__":
    main()
