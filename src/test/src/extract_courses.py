import os
import argparse
from typing import Dict, Any, Tuple

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


def course_key(major: str, course_obj: Dict[str, Any]) -> str:
    return f"{major}::{course_obj.get('course_code','')}::{course_obj.get('course_name','')}"


def build_course_text(major: str, course: Dict[str, Any]) -> str:
    parts = []
    fields = [
        ("MAJOR", major),
        ("COURSE NAME", course.get("course_name", "")),
        ("COURSE CODE", course.get("course_code", "")),
        ("COURSE OVERVIEW", course.get("course_overview", "")),
        ("LEARNING OBJECTIVES", course.get("learning_objectives", "")),
        ("KEY TOPICS", course.get("key_topics", "")),
        ("TYPICAL OUTPUTS", course.get("typical_outputs", "")),
        ("TOOLS", course.get("tools", "")),
    ]
    for label, val in fields:
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
    raise RuntimeError(f"Course skill extraction failed: {last_err}")


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--courses_in", required=True, help="Path to courses.json")
    ap.add_argument("--courses_skills_out", default="outputs/courses_skills.json")
    ap.add_argument("--llm_model", default="gpt-4o-mini")
    ap.add_argument("--cache", default="cache/course_skills_cache.json")
    args = ap.parse_args()

    os.makedirs(os.path.dirname(args.cache), exist_ok=True)
    client = OpenAI()

    courses_json = load_json(args.courses_in)
    majors = courses_json["data"]  # list of { major, course: [...] }

    cache: dict[str, dict] = {}
    if os.path.exists(args.cache):
        cache = load_json(args.cache)

    system_prompt = (
        "You are an expert curriculum analyst. Extract the core skills a learner will gain from this course.\n"
        "- Output skills as short, normalized capability phrases.\n"
        "- Focus on outcomes (what the learner can do), not just topics.\n"
        "- Add brief evidence quotes when possible.\n"
        "Return only the structured result."
    )

    out: dict[str, dict] = {}
    for block in majors:
        major = block.get("major", "")
        for course in block.get("course", []):
            ck = course_key(major, course)
            if ck in cache:
                out[ck] = cache[ck]
                continue

            text = build_course_text(major, course)
            extracted = extract_with_llm(client, args.llm_model, system_prompt, text)
            out[ck] = extracted.model_dump()
            cache[ck] = out[ck]
            save_json(args.cache, cache)

    save_json(args.courses_skills_out, out)
    print(f"✅ Saved course skills -> {args.courses_skills_out}")


if __name__ == "__main__":
    main()

