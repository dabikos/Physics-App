import json
import re
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
PRACTICE_DIR = ROOT / "practice_sources"
CONTENT_DIR = ROOT / "backend" / "content"

TESTS_MARKER = "--- ТЕСТЫ ---"
TASKS_MARKER = "--- ЗАДАЧИ ---"
TOPIC_RE = re.compile(r"^=== ТЕМА: (?P<id>[^ ]+) \((?P<title>.+)\) ===$")
QUESTION_RE = re.compile(r"^\d+\.\s+(?P<text>.+)$")
OPTION_RE = re.compile(r"^(?P<label>[АВСDABCD])\)\s+(?P<text>.+)$")
ANSWER_RE = re.compile(r"^Правильный ответ:\s*(?P<label>[АВСDABCD])$")
TASK_RE = re.compile(r"^Задача\s+(?P<number>\d+)\.\s+(?P<title>.+)$")

ANSWER_LABELS = {
    "А": 0,
    "A": 0,
    "В": 1,
    "B": 1,
    "С": 2,
    "C": 2,
    "D": 3,
}


def slug_section_from_filename(path: Path) -> str:
    prefix = path.name.split("_Tasks_", 1)[0]
    return {
        "Thermodynamics": "thermodynamics",
        "Electromagnetism": "electromagnetism",
        "Optics": "optics",
        "Atomic": "atomic",
        "Relativity": "relativity",
        "Astronomy": "astronomy",
    }[prefix]


def load_topic_index() -> dict[str, dict]:
    index: dict[str, dict] = {}
    for path in CONTENT_DIR.glob("*_lessons.json"):
        payload = json.loads(path.read_text(encoding="utf-8"))
        section_id = payload["section"]["id"]
        subsection_order = {item["id"]: item["order_index"] for item in payload["subsections"]}
        for topic in payload["topics"]:
            index[topic["id"]] = {
                "section_id": section_id,
                "subsection_id": topic["subsection_id"],
                "title": topic["title"],
                "order_index": topic["order_index"],
                "subsection_order": subsection_order.get(topic["subsection_id"], 0),
            }
    return index


def parse_test_block(lines: list[str]) -> list[dict]:
    questions: list[dict] = []
    current: dict | None = None

    for raw in lines:
        line = raw.strip()
        if not line:
            continue

        question_match = QUESTION_RE.match(line)
        if question_match:
            if current:
                questions.append(current)
            current = {
                "question": question_match.group("text"),
                "options": [],
                "correct": None,
            }
            continue

        option_match = OPTION_RE.match(line)
        if option_match and current is not None:
            current["options"].append(option_match.group("text"))
            continue

        answer_match = ANSWER_RE.match(line)
        if answer_match and current is not None:
            current["correct"] = ANSWER_LABELS[answer_match.group("label")]

    if current:
        questions.append(current)

    for question in questions:
        if len(question["options"]) != 4:
            raise ValueError(f"Question has {len(question['options'])} options: {question['question']}")
        if question["correct"] is None:
            raise ValueError(f"Question has no answer: {question['question']}")

    return questions


def parse_task_block(raw_text: str) -> dict:
    lines = raw_text.strip().splitlines()
    if not lines:
        raise ValueError("Empty task block")

    task_match = TASK_RE.match(lines[0].strip())
    if not task_match:
        raise ValueError(f"Invalid task header: {lines[0]}")

    title = task_match.group("title").strip()
    given_data = ""
    find_text = ""
    solution = ""
    answer = ""

    text = "\n".join(lines)
    given_match = re.search(r"Дано:\n(?P<given>.*?)\n------------", text, re.S)
    find_match = re.search(r"Найти:\s*(?P<find>.*?)\n\nРешение:", text, re.S)
    solution_match = re.search(r"Решение:\n(?P<solution>.*?)\n\nОтвет:", text, re.S)
    answer_match = re.search(r"Ответ:\s*(?P<answer>.*)$", text, re.S)

    if given_match:
        given_data = given_match.group("given").strip()
    if find_match:
        find_text = find_match.group("find").strip()
    if solution_match:
        solution = solution_match.group("solution").strip()
    if answer_match:
        answer = answer_match.group("answer").strip()

    return {
        "title": title,
        "problem_text": title,
        "given_data": given_data,
        "find_text": find_text,
        "solution": solution,
        "answer": answer,
        "raw_text": raw_text.strip(),
    }


def parse_tasks_block(lines: list[str]) -> list[dict]:
    blocks: list[str] = []
    current: list[str] = []

    for raw in lines:
        if TASK_RE.match(raw.strip()) and current:
            blocks.append("\n".join(current).strip())
            current = [raw]
        else:
            current.append(raw)

    if current:
        blocks.append("\n".join(current).strip())

    return [parse_task_block(block) for block in blocks if block.strip()]


def parse_source_file(path: Path, topic_index: dict[str, dict]) -> tuple[list[dict], list[dict]]:
    section_id = slug_section_from_filename(path)
    lines = path.read_text(encoding="utf-8").splitlines()
    topics: list[dict] = []
    current: dict | None = None
    mode: str | None = None

    for line in lines:
        topic_match = TOPIC_RE.match(line.strip())
        if topic_match:
            if current:
                topics.append(current)
            topic_id = topic_match.group("id")
            if topic_id not in topic_index:
                raise ValueError(f"{path.name}: unknown topic id {topic_id}")
            meta = topic_index[topic_id]
            if meta["section_id"] != section_id:
                raise ValueError(f"{path.name}: topic {topic_id} belongs to {meta['section_id']}, not {section_id}")
            current = {
                "topic_id": topic_id,
                "topic_title": topic_match.group("title"),
                "test_lines": [],
                "task_lines": [],
                "meta": meta,
            }
            mode = None
            continue

        if current is None:
            continue

        stripped = line.strip()
        if stripped == TESTS_MARKER:
            mode = "tests"
            continue
        if stripped == TASKS_MARKER:
            mode = "tasks"
            continue

        if mode == "tests":
            current["test_lines"].append(line)
        elif mode == "tasks":
            current["task_lines"].append(line)

    if current:
        topics.append(current)

    tests: list[dict] = []
    tasks: list[dict] = []

    for topic in topics:
        meta = topic["meta"]
        questions = parse_test_block(topic["test_lines"])
        parsed_tasks = parse_tasks_block(topic["task_lines"])
        if len(questions) != 5:
            raise ValueError(f"{path.name}: {topic['topic_id']} has {len(questions)} questions, expected 5")
        if len(parsed_tasks) != 5:
            raise ValueError(f"{path.name}: {topic['topic_id']} has {len(parsed_tasks)} tasks, expected 5")

        base_order = meta["subsection_order"] * 1000 + meta["order_index"] * 10
        tests.append(
            {
                "id": f"{section_id}-{topic['topic_id']}-test",
                "section_id": section_id,
                "subsection_id": meta["subsection_id"],
                "topic_id": topic["topic_id"],
                "title": f"Тест: {topic['topic_title']}",
                "difficulty": "basic",
                "time_limit": 300,
                "questions": questions,
                "order_index": base_order,
            }
        )

        for index, task in enumerate(parsed_tasks, start=1):
            tasks.append(
                {
                    "id": f"{section_id}-{topic['topic_id']}-task-{index}",
                    "section_id": section_id,
                    "subsection_id": meta["subsection_id"],
                    "topic_id": topic["topic_id"],
                    "topic_title": topic["topic_title"],
                    "title": task["title"],
                    "problem_text": task["problem_text"],
                    "given_data": task["given_data"],
                    "find_text": task["find_text"],
                    "solution": task["solution"],
                    "answer": task["answer"],
                    "difficulty": "medium",
                    "order_index": base_order + index,
                    "raw_text": task["raw_text"],
                }
            )

    return tests, tasks


def main() -> None:
    topic_index = load_topic_index()
    tests_by_section: dict[str, list[dict]] = {}
    tasks_by_section: dict[str, list[dict]] = {}

    for path in sorted(PRACTICE_DIR.glob("*.txt")):
        section_id = slug_section_from_filename(path)
        tests, tasks = parse_source_file(path, topic_index)
        tests_by_section.setdefault(section_id, []).extend(tests)
        tasks_by_section.setdefault(section_id, []).extend(tasks)

    for section_id, tests in sorted(tests_by_section.items()):
        tests.sort(key=lambda item: item["order_index"])
        out_path = CONTENT_DIR / f"{section_id}_tests.json"
        out_path.write_text(
            json.dumps({"section_id": section_id, "tests": tests}, ensure_ascii=False, indent=2) + "\n",
            encoding="utf-8",
        )

    for section_id, tasks in sorted(tasks_by_section.items()):
        tasks.sort(key=lambda item: item["order_index"])
        out_path = CONTENT_DIR / f"{section_id}_tasks.json"
        out_path.write_text(
            json.dumps({"section_id": section_id, "tasks": tasks}, ensure_ascii=False, indent=2) + "\n",
            encoding="utf-8",
        )

    total_tests = sum(len(items) for items in tests_by_section.values())
    total_tasks = sum(len(items) for items in tasks_by_section.values())
    print(f"Generated {total_tests} tests and {total_tasks} tasks for {len(tests_by_section)} sections")


if __name__ == "__main__":
    main()
