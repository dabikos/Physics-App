"""OZP content lives on the server; only the first exam is freely accessible."""

import json
from functools import lru_cache
from pathlib import Path

FREE_OZP_SESSION_ID = "2026-03-11"


@lru_cache(maxsize=1)
def load_ozp_exams():
    exams = json.loads((Path(__file__).parent / "content" / "ozp_exams.json").read_text(encoding="utf-8"))
    return {exam["id"]: exam for exam in exams}


def ozp_access_allowed(session_id, tier):
    return session_id == FREE_OZP_SESSION_ID or tier == "pro"
