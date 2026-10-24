"""AI 모델 비교 평가 — 같은 사례를 후보 모델들에 똑같이 돌려 정확도·형식 성공률·속도·토큰·비용을 비교한다.

서비스에서 실제로 쓰는 함수(generate_summary, grade_answer, generate_one_question, generate_outline,
generate_chapter, 주제 분류 프롬프트)를 후보 (공급자:모델)로 잠깐 바꿔 그대로 호출하므로 프롬프트·파서까지 함께 평가된다.
사용량(AIUsage)은 DB에 남기지 않고, 일일 한도에도 걸리지 않는다. 실제 API가 호출되어 비용이 든다.

사용 예 (.env에 각 공급자 키가 있어야 한다):
  python manage.py eval_ai_models --dry-run
  python manage.py eval_ai_models \\
      --candidates gemini:gemini-3.1-flash-lite,openai:gpt-5.5,anthropic:claude-haiku-5-5 \\
      --tasks classify,grading --prices core/eval/prices.json --out /tmp/eval.json

  --cases   자기 사례 파일 (core/eval/cases.json과 같은 형식, 실제 업로드 자료·채점 사례를 넣을수록 믿을 만하다)
  --prices  {"gemini:gemini-3.1-flash-lite": {"in": 0.0, "out": 0.0}} 처럼 100만 토큰당 가격(달러). 공식 가격표를 보고 직접 적는다
  --repeat  같은 사례를 여러 번 돌려 흔들림까지 본다 (기본 1)
챗봇(도구 호출)은 자동 평가 대상이 아니다 — 후보 모델로 직접 대화해 보는 것을 권한다.
"""
import json
import re
import statistics
from pathlib import Path

from django.core.management.base import BaseCommand, CommandError

from core import ai as core_ai

DEFAULT_CASES = Path(__file__).resolve().parents[2] / "eval" / "cases.json"
ALL_TASKS = ["classify", "question", "grading", "summary", "course_outline", "course_chapter"]
# 작업 이름 → 비용·한도 기준 AI 작업(core.ai의 task)
TASK_KEYS = {"classify": ["classify"], "question": ["question"], "grading": ["grading"], "summary": ["summary"],
             "course_outline": ["course_outline"], "course_chapter": ["course_chapter"]}


# ── 사례별 실행 + 채점: (통과 여부, 형식 성공 여부, 메모) ─────────────────────────

def run_classify(case):
    from course import topics

    listing = "\n".join(f"- {e}" for e in case.get("existing", [])) or "(없음)"
    data = core_ai.complete_json("classify", [
        {"role": "system", "content": topics.CLASSIFY_SYSTEM},
        {"role": "user", "content": "기존 주제:\n" + listing + "\n\n"
                                    + core_ai.untrusted("자료", f"제목: {case['title']}\n{case['summary']}")},
    ], user=None, counts_as_request=False)
    entries = data.get("topics")
    names = [str((e or {}).get("name", e) if isinstance(e, dict) else e) for e in (entries or [])]
    fmt = bool(names) and len(names) <= 3
    ok = fmt and any(k.lower() in n.lower() for n in names for k in case["accept"])
    return ok, fmt, f"주제={names}"


def run_question(case):
    from mypage.ai import generate_one_question

    out = generate_one_question(case["text"], case["type"], existing_questions=[], user=None)
    q, a = str(out.get("question", "")), str(out.get("answer", "")).strip()
    fmt = bool(q and a)
    problems = []
    if re.search(r"(OX|O/X|참/거짓)\s*(로|으로)?\s*답", q):
        problems.append("답 방식 문구가 문제에 섞임")
    if case["type"] == "ox" and a.upper() not in ("O", "X"):
        problems.append("OX 정답 형식 아님")
    if case["type"] == "short" and (" / " in a or len(a) > 40 or re.search(r"(여러|[2-9두세네다여]\s*개).{0,6}(쓰|고르)", q)):
        problems.append("단답이 여러 항목을 요구/나열")
    return fmt and not problems, fmt, "; ".join(problems) or "ok"


def run_grading(case):
    from mypage.ai import grade_answer

    out = grade_answer(case["question"], case["answer"], case["user_answer"], user=None, question_type=case["type"])
    got = bool(out["is_correct"])
    return got == case["expected"], True, f"판정={got} 기대={case['expected']}"


def run_summary(case):
    from mypage.ai import generate_summary

    text = generate_summary(case["text"], user=None)
    parts = re.split(r"(?m)^#{2,3}\s+", text)
    sections = [p for p in parts[1:] if p.strip()]
    longest = max((len(s) for s in sections), default=0)
    fmt = len(sections) >= 2
    structured = bool(re.search(r"(?m)^\s*[-*]\s|^\s*\d+\.\s|^\s*\|", text))
    ok = fmt and structured and longest <= 700
    return ok, fmt, f"조각 {len(sections)}개, 가장 긴 조각 {longest}자, 목록/표 {'있음' if structured else '없음'}"


def run_outline(case):
    from course.ai import generate_outline

    out = generate_outline(case["subject"], case["docs"])
    chapters = out["chapters"]
    ok = len(chapters) >= 2 and all(c["title"] and c["doc_ids"] for c in chapters)
    return ok, bool(chapters), f"챕터 {len(chapters)}개"


def run_chapter(case):
    from course.ai import generate_chapter

    sets = generate_chapter(case["subject"], case["chapter"], case["docs"])
    cards = [c for s in sets for c in s["cards"]]
    longest = max((len(c["body"]) for c in cards), default=0)
    ok = len(sets) >= 3 and longest <= 450 and all(s["questions"] for s in sets)
    return ok, bool(sets), f"세트 {len(sets)}개, 카드 {len(cards)}장, 가장 긴 카드 {longest}자"


RUNNERS = {"classify": run_classify, "question": run_question, "grading": run_grading, "summary": run_summary,
           "course_outline": run_outline, "course_chapter": run_chapter}


class Command(BaseCommand):
    help = "후보 AI 모델들을 같은 사례로 비교 평가한다 (실제 API 호출, 비용 발생)"

    def add_arguments(self, parser):
        parser.add_argument("--candidates", default="", help="공급자:모델 쉼표 목록 (예: gemini:gemini-3.1-flash-lite,openai:gpt-5.5)")
        parser.add_argument("--tasks", default=",".join(ALL_TASKS))
        parser.add_argument("--cases", default=str(DEFAULT_CASES))
        parser.add_argument("--prices", default="")
        parser.add_argument("--repeat", type=int, default=1)
        parser.add_argument("--out", default="")
        parser.add_argument("--dry-run", action="store_true", help="호출 없이 계획만 보여 준다")

    def handle(self, *args, **opts):
        tasks = [t for t in opts["tasks"].split(",") if t]
        unknown = [t for t in tasks if t not in RUNNERS]
        if unknown:
            raise CommandError(f"알 수 없는 작업: {unknown} (가능: {ALL_TASKS})")
        cases = json.loads(Path(opts["cases"]).read_text(encoding="utf-8"))
        prices = json.loads(Path(opts["prices"]).read_text(encoding="utf-8")) if opts["prices"] else {}
        candidates = [c.strip() for c in opts["candidates"].split(",") if c.strip()]
        if not candidates:  # 지정이 없으면 지금 설정된 작업별 모델을 그대로 평가한다
            candidates = sorted({f"{core_ai.route(t)[0]}:{core_ai.route(t)[1]}" for t in tasks})
        for c in candidates:
            if ":" not in c:
                raise CommandError(f"후보는 공급자:모델 형식이어야 합니다: {c}")
            provider = c.split(":", 1)[0]
            if provider not in core_ai.settings.AI_PROVIDERS:
                raise CommandError(f"알 수 없는 공급자: {provider}")

        plan = {t: len(cases.get(t, [])) * opts["repeat"] for t in tasks}
        total = sum(plan.values()) * len(candidates)
        self.stdout.write(f"후보 {len(candidates)}개 × 작업 {plan} → API 호출 약 {total}회 (강의 챕터·요약은 호출 하나가 큼)")
        if opts["dry_run"]:
            for c in candidates:
                self.stdout.write(f"  - {c}")
            return

        report = []
        for cand in candidates:
            provider, model = cand.split(":", 1)
            if not (core_ai.settings.AI_PROVIDERS[provider] or {}).get("key"):
                self.stderr.write(f"{cand}: {provider} API 키가 없어 건너뜁니다.")
                continue
            for task in tasks:
                rows = self._run_task(provider, model, task, cases.get(task, []), opts["repeat"])
                report.append(self._summarize(cand, task, rows, prices.get(cand)))
        self._print(report, bool(prices))
        if opts["out"]:
            Path(opts["out"]).write_text(json.dumps(report, ensure_ascii=False, indent=2), encoding="utf-8")
            self.stdout.write(f"상세 결과 저장: {opts['out']}")

    def _run_task(self, provider, model, task, cases, repeat):
        rows = []
        for case in cases:
            for _ in range(repeat):
                with core_ai.override_route(provider, model, TASK_KEYS[task]) as usage:
                    try:
                        ok, fmt, note = RUNNERS[task](case)
                        err = ""
                    except Exception as exc:   # 형식이 깨졌거나 API 오류 — 실패로 센다
                        ok, fmt, note, err = False, False, "", f"{type(exc).__name__}: {str(exc)[:120]}"
                    calls = list(usage)
                rows.append({"ok": ok, "format_ok": fmt, "note": note or err, "tag": case.get("tag", ""),
                             "latency": sum(c["latency"] for c in calls), "prompt": sum(c["prompt"] for c in calls),
                             "completion": sum(c["completion"] for c in calls)})
        return rows

    @staticmethod
    def _summarize(cand, task, rows, price):
        n = len(rows) or 1
        avg = lambda k: sum(r[k] for r in rows) / n
        cost = None
        if price:
            cost = (avg("prompt") * price["in"] + avg("completion") * price["out"]) / 1_000_000
        injection = [r for r in rows if r["tag"] == "injection"]
        return {"candidate": cand, "task": task, "cases": len(rows),
                "pass_rate": sum(r["ok"] for r in rows) / n, "format_rate": sum(r["format_ok"] for r in rows) / n,
                "injection_pass_rate": (sum(r["ok"] for r in injection) / len(injection)) if injection else None,
                "latency_avg": avg("latency"),
                "latency_p95": sorted(r["latency"] for r in rows)[max(0, int(len(rows) * .95) - 1)] if rows else 0,
                "prompt_tokens_avg": avg("prompt"), "completion_tokens_avg": avg("completion"),
                "cost_per_call_usd": cost, "failures": [r["note"] for r in rows if not r["ok"]][:5]}

    def _print(self, report, has_prices):
        head = f"{'작업':<15}{'후보':<34}{'통과':>6}{'형식':>6}{'인젝션':>7}{'지연(s)':>9}{'입력tok':>9}{'출력tok':>9}"
        head += f"{'1천회 비용$':>12}" if has_prices else ""
        self.stdout.write("\n" + head)
        for r in sorted(report, key=lambda r: (r["task"], -r["pass_rate"], r["latency_avg"])):
            inj = "-" if r["injection_pass_rate"] is None else f"{r['injection_pass_rate']*100:.0f}%"
            line = (f"{r['task']:<15}{r['candidate']:<34}{r['pass_rate']*100:>5.0f}%{r['format_rate']*100:>5.0f}%{inj:>7}"
                    f"{r['latency_avg']:>9.1f}{r['prompt_tokens_avg']:>9.0f}{r['completion_tokens_avg']:>9.0f}")
            if has_prices:
                line += f"{(r['cost_per_call_usd'] or 0) * 1000:>12.2f}"
            self.stdout.write(line)
        fails = [r for r in report if r["failures"]]
        if fails:
            self.stdout.write("\n실패 사례 (작업·후보별 최대 5개):")
            for r in fails:
                self.stdout.write(f"  [{r['task']}] {r['candidate']}: " + " | ".join(r["failures"]))
