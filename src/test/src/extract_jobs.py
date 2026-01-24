import os
import argparse
from typing import Dict, Any

from openai import OpenAI
from pydantic import BaseModel, Field

from common import load_json, save_json, normalize_skill, dedupe_preserve_order, backoff_sleep


class EvidenceItem(BaseModel):
    skill: str = Field(...)
    quote: str = Field(...)


class SkillExtraction(BaseModel):
    skills: list[str] = Field(...)
    evidence: list[EvidenceItem] = Field(default_factory=list)
    notes: str | None = Field(default=None)


def build_job_text(job: Dict[str, Any]) -> str:
    parts = []
    for label, key in [
        ("JOB OVERVIEW", "job_overview"),
        ("MAIN TASKS", "main_tasks"),
        ("REQUIRED SKILLS", "required_skills"),
        ("PREFERRED", "preferred"),
    ]:
        val = job.get(key, "")
        if val and str(val).strip():
            parts.append(f"[{label}]\n{val}")
    return "\n\n".join(parts).strip()


def extract_with_llm(client: OpenAI, model: str, system_prompt: str, user_text: str, max_retries: int = 5) -> SkillExtraction:
    last_err = None
    for attempt in range(max_retries):
        try:
            resp = client.responses.parse(
                model=model,
                input=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": user_text},
                ],
                text_format=SkillExtraction,
            )
            parsed: SkillExtraction = resp.output_parsed
            cleaned = [normalize_skill(s) for s in parsed.skills if normalize_skill(s)]
            parsed.skills = dedupe_preserve_order(cleaned)
            return parsed
        except Exception as e:
            last_err = e
            backoff_sleep(attempt)
    raise RuntimeError(f"Job skill extraction failed: {last_err}")


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--jobs_in", required=True, help="Path to jobs.json")
    ap.add_argument("--jobs_skills_out", default="outputs/jobs_skills.json")
    ap.add_argument("--llm_model", default="gpt-4o-mini")
    ap.add_argument("--cache", default="cache/job_skills_cache.json")
    args = ap.parse_args()

    os.makedirs(os.path.dirname(args.cache), exist_ok=True)
    client = OpenAI()

    jobs_json = load_json(args.jobs_in)
    jobs = jobs_json["job_postings"]

    cache: dict[str, dict] = {}
    if os.path.exists(args.cache):
        cache = load_json(args.cache)

    system_prompt = (
        "You are an expert HR analyst. Extract the core skills required for this job posting.\n"
        "- Output skills as short, normalized capability phrases.\n"
        "- Prefer concrete abilities over vague traits.\n"
        "- Add brief evidence quotes when possible.\n"
        "Return only the structured result."
    )

    out: dict[str, dict] = {}
    for job in jobs:
        job_id = job.get("posting_id")
        if not job_id:
            continue

        if job_id in cache:
            out[job_id] = cache[job_id]
            continue

        text = build_job_text(job)
        extracted = extract_with_llm(client, args.llm_model, system_prompt, text)
        out[job_id] = extracted.model_dump()
        cache[job_id] = out[job_id]
        save_json(args.cache, cache)

    save_json(args.jobs_skills_out, out)
    print(f"✅ Saved job skills -> {args.jobs_skills_out}")


if __name__ == "__main__":
    main()

