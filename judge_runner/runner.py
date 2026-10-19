"""
채점 실행기 (judge_runner 컨테이너) — 제출된 코드를 실행만 하는 작은 HTTP 서버. 표준 라이브러리만 쓴다.

이 프로세스는 신뢰할 수 없는 코드를 실행하므로 다음을 전제로 배포한다 (docker-compose.yml의 judge_runner 서비스):
  - 인터넷 차단 (internal 네트워크에만 연결, judge_worker만 접근 가능)
  - DB 접속 정보·비밀 키 같은 환경변수를 주지 않는다
  - 읽기 전용 루트 파일시스템 + /tmp만 크기 제한 tmpfs
  - root가 아닌 사용자, 모든 리눅스 권한(capability) 제거, no-new-privileges
  - 컨테이너 단위 메모리·CPU·프로세스 수 제한
그리고 실행할 때마다 프로세스 단위로 CPU 시간·메모리·파일 크기·열린 파일 수 제한을 걸고, 새 세션으로 띄워
시간이 넘으면 프로세스 그룹째 죽인다.

API: POST /run  {"language": "python", "source": "...", "input": "...", "time_limit_ms": 2000, "memory_mb": 256}
  → {"status": "OK" | "RE" | "TLE" | "MLE" | "OLE" | "CE" | "SE", "stdout": "...", "stderr": "...", "time_ms": 12}
     OK = 정상 종료, RE = 런타임 에러, TLE = 시간 초과, MLE = 메모리 초과, OLE = 출력 초과,
     CE = 지원하지 않는 언어/컴파일 에러, SE = 실행기 오류
GET /health → {"ok": true}
"""
import json
import os
import shutil
import signal
import subprocess
import sys
import tempfile
import threading
import time
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer

MAX_SOURCE_BYTES = 64 * 1024
MAX_INPUT_BYTES = 4 * 1024 * 1024
MAX_OUTPUT_BYTES = 256 * 1024
MAX_TIME_LIMIT_MS = 10_000
MAX_MEMORY_MB = 512
MAX_PARALLEL = int(os.environ.get("JUDGE_RUNNER_PARALLEL", "2"))
_slots = threading.BoundedSemaphore(MAX_PARALLEL)

LANGUAGES = {
    # -I: 사용자 site-packages·환경변수 무시, -S: site 모듈 미로드, -B: .pyc를 쓰지 않음
    "python": {"file": "main.py", "run": [sys.executable, "-I", "-S", "-B", "main.py"]},
}

MEMORY_ERROR_MARKERS = ("MemoryError", "Cannot allocate memory")


def _limits(time_limit_ms, memory_mb):
    """자식 프로세스에서 exec 직전에 실행된다 (preexec_fn)."""
    import resource

    cpu = max(1, -(-time_limit_ms // 1000)) + 1
    for name, value in (
        ("RLIMIT_CPU", (cpu, cpu + 1)),
        ("RLIMIT_AS", (memory_mb * 1024 * 1024,) * 2),
        ("RLIMIT_FSIZE", (MAX_OUTPUT_BYTES,) * 2),
        ("RLIMIT_NOFILE", (32, 32)),
        ("RLIMIT_CORE", (0, 0)),
    ):
        limit = getattr(resource, name, None)
        if limit is None:
            continue
        try:
            resource.setrlimit(limit, value)
        except (ValueError, OSError):
            pass  # macOS 등 일부 제한을 지원하지 않는 환경 (운영 컨테이너는 리눅스)


def run(language, source, stdin="", time_limit_ms=2000, memory_mb=256):
    spec = LANGUAGES.get(language)
    if spec is None:
        return {"status": "CE", "stdout": "", "stderr": f"지원하지 않는 언어입니다: {language}", "time_ms": 0}
    if len(source.encode()) > MAX_SOURCE_BYTES or len(stdin.encode()) > MAX_INPUT_BYTES:
        return {"status": "SE", "stdout": "", "stderr": "코드나 입력이 너무 깁니다.", "time_ms": 0}
    time_limit_ms = max(100, min(int(time_limit_ms), MAX_TIME_LIMIT_MS))
    memory_mb = max(32, min(int(memory_mb), MAX_MEMORY_MB))

    work = tempfile.mkdtemp(prefix="run-")
    try:
        with open(os.path.join(work, spec["file"]), "w", encoding="utf-8") as f:
            f.write(source)
        env = {"PATH": "/usr/local/bin:/usr/bin:/bin", "HOME": work, "LANG": "C.UTF-8", "PYTHONIOENCODING": "utf-8"}
        # 입출력은 파이프 대신 파일로 주고받는다: 프로그램이 띄운 자식이 파이프를 붙잡고 있어도
        # 메인 프로세스가 끝나는 순간을 기준으로 판정할 수 있고, 출력 크기는 RLIMIT_FSIZE로 막힌다
        in_path, out_path, err_path = (os.path.join(work, n) for n in (".stdin", ".stdout", ".stderr"))
        with open(in_path, "wb") as f:
            f.write(stdin.encode())
        with open(in_path, "rb") as fin, open(out_path, "wb") as fout, open(err_path, "wb") as ferr:
            start = time.monotonic()
            proc = subprocess.Popen(
                spec["run"], cwd=work, env=env, stdin=fin, stdout=fout, stderr=ferr,
                start_new_session=True,  # 프로세스 그룹째 죽이기 위해
                preexec_fn=lambda: _limits(time_limit_ms, memory_mb),
            )
            timed_out = False
            try:
                proc.wait(timeout=time_limit_ms / 1000 + 0.5)
            except subprocess.TimeoutExpired:
                timed_out = True
            elapsed = int((time.monotonic() - start) * 1000)
            _kill_group(proc)  # 시간 초과든 정상 종료든 남은 (백그라운드) 프로세스까지 정리
            proc.wait()

        with open(out_path, "rb") as f:
            out = f.read(MAX_OUTPUT_BYTES + 1)
        with open(err_path, "rb") as f:
            err = f.read()[-4096:]
        stdout = out[:MAX_OUTPUT_BYTES].decode("utf-8", "replace")
        stderr = err.decode("utf-8", "replace")
        if timed_out or proc.returncode == -signal.SIGXCPU:
            status = "TLE"
        elif len(out) > MAX_OUTPUT_BYTES or proc.returncode == -signal.SIGXFSZ or "File too large" in stderr:
            status = "OLE"
        elif proc.returncode != 0:
            status = "MLE" if any(m in stderr for m in MEMORY_ERROR_MARKERS) else "RE"
        elif elapsed > time_limit_ms:
            status = "TLE"
        else:
            status = "OK"
        return {"status": status, "stdout": stdout, "stderr": stderr, "time_ms": elapsed}
    except Exception as exc:  # 실행기 자체 문제
        return {"status": "SE", "stdout": "", "stderr": f"실행기 오류: {exc}", "time_ms": 0}
    finally:
        shutil.rmtree(work, ignore_errors=True)


def _kill_group(proc):
    try:
        os.killpg(proc.pid, signal.SIGKILL)
    except (ProcessLookupError, PermissionError):
        pass


class Handler(BaseHTTPRequestHandler):
    def _reply(self, code, payload):
        body = json.dumps(payload, ensure_ascii=False).encode()
        self.send_response(code)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        self.wfile.write(body)

    def do_GET(self):
        if self.path == "/health":
            return self._reply(200, {"ok": True})
        return self._reply(404, {"error": "not found"})

    def do_POST(self):
        if self.path != "/run":
            return self._reply(404, {"error": "not found"})
        length = int(self.headers.get("Content-Length") or 0)
        if length > MAX_SOURCE_BYTES + MAX_INPUT_BYTES + 4096:
            return self._reply(413, {"error": "too large"})
        try:
            req = json.loads(self.rfile.read(length) or b"{}")
        except ValueError:
            return self._reply(400, {"error": "bad json"})
        with _slots:  # 동시에 실행하는 수를 제한
            result = run(req.get("language", ""), req.get("source", ""), req.get("input", ""),
                         req.get("time_limit_ms", 2000), req.get("memory_mb", 256))
        return self._reply(200, result)

    def log_message(self, fmt, *args):  # 접근 로그는 남기지 않는다 (코드·입력 노출 방지)
        pass


def main():
    port = int(os.environ.get("JUDGE_RUNNER_PORT", "8080"))
    ThreadingHTTPServer(("0.0.0.0", port), Handler).serve_forever()


if __name__ == "__main__":
    main()
