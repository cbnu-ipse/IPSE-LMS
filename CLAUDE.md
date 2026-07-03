# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Behavior Rules

- **Always respond in Korean (존칭).** Exception: commit messages, code, and inline comments must be in English.
- **Only change what is explicitly requested.** Do not refactor or improve adjacent code.
- **Always ask before proceeding** when: requirements are ambiguous, the task involves a DB schema change or migration, a new package, or an unclear branch target.
- Check `git status` before starting any task and report issues immediately.
- Do not put AI (Claude, Codex, etc.) as a co-author on git commits.
- Record a summary in `DONE.md` when creating a PR.

## Development Commands

```bash
# Run dev server
python manage.py runserver

# Tailwind CSS (watch mode during development)
tailwindcss -i static/src/input.css -o static/css/tailwind.css --watch

# Tailwind CSS (one-shot build)
tailwindcss -i static/src/input.css -o static/css/tailwind.css --minify

# Migrations
python manage.py makemigrations
python manage.py migrate

# Create superuser
python manage.py createsuperuser

# Run tests
python manage.py test
python manage.py test accounts          # single app
python manage.py test accounts.tests.test_views  # single module
```

## Architecture

### Routing

The project uses a **single `ROOT_URLCONF` (`config/urls.py`)** — there is no multi-host / subdomain split. Each app is mounted under its own path prefix (e.g. `game/`, `course/`, `contest/`, `community/`, `accounts/`). `reverse()`/`{% url %}` names are global across the whole site; there is no host-dependent `NoReverseMatch` concern.

> Note: an earlier version of this project used `django_hosts` to split `judge.*` / `game.*` / root subdomains into separate URLconfs. That has been removed — `django_hosts` is no longer in `INSTALLED_APPS`, `MIDDLEWARE`, or `requirements.txt`. If you see stale references to `urls_judge.py` / `urls_game.py` / `urls_community.py` anywhere (docs, comments), they describe the old architecture and should be corrected or ignored.

### WebSockets (`channels`)

Real-time features (e.g. the game lobby chat) run over Django Channels, not django_hosts. `config/asgi.py` wires `ProtocolTypeRouter` with plain Django handling `http` and `AuthMiddlewareStack(URLRouter(...))` handling `websocket`. Each app that needs sockets defines its own `routing.py` (see `game/routing.py`) with `websocket_urlpatterns`, imported into `config/asgi.py`. `daphne` must stay first in `INSTALLED_APPS` so `manage.py runserver` serves ASGI (required for WebSockets in local dev).

### User Roles

`accounts.User` (custom `AbstractUser`) carries boolean role flags that are **not mutually exclusive** — a user can hold multiple roles simultaneously:

- `is_student` — 동아리원
- `is_lecturer` — 강사/운영진 (can also be a student)
- `is_executive` — 임원진
- `is_vice_president`, `is_president`
- `is_superuser` / `is_staff` — Django admin access

Role-checking decorators live in `accounts/decorators.py`: `@admin_required`, `@lecturer_required`, `@student_required`. These decorators OR the role flag with `is_superuser`, so superusers always pass.

### App Structure

- **`accounts/`** — custom User model, login/signup, profile, lecturer management, attendance, notifications, verification docs
- **`course/`** — Course → Unit → Lesson hierarchy; `UserCourseProgress` tracks per-user lesson completion (ManyToMany); `Upload`/`UploadVideo` attach files/videos to a Course
- **`quiz/`** — Quiz and Sitting models; quiz attempts tied to courses
- **`contest/`** — Competitive programming contests
- **`problems/`** — Problem bank for contests
- **`compiler/`** — Online code execution
- **`community/`** — Posts, comments, gathering events, club recruitment
- **`ranking/`** — Leaderboard based on problem solving
- **`game/`** — Mini-game arcade (slot machine, apple-stacking, memory match, number speed, pattern recall) with monthly seasonal rewards
- **`schedules/`** — Club schedule/calendar
- **`core/`** — Shared utilities, activity logs, context processors, base templates

### Course Data Model

```
CourseCategory
  └── Course (slug, instructor FK→User, enrollment_deadline)
        ├── Unit (ordered)
        │     └── (Lesson references course directly, not unit)
        ├── Lesson (ordered, content HTML/Markdown)
        ├── Upload (file attachments)
        ├── UploadVideo (video attachments)
        └── UserCourseProgress (per-user, tracks completed Lessons via M2M)
```

`Course.instructor` is a FK to the User who owns/teaches the course. Permission checks in `course/views.py` currently use `is_staff`; lecturer-owned course operations should check `request.user == course.instructor or request.user.is_staff`.

### Game App (`game/`) Structure

Every mini-game (slot machine, apple game, memory match, number speed, pattern recall) repeats the same five-file pattern — when adding a new game, copy this shape rather than inventing a new one:

1. **`game/models.py`** — one `<Game>Score` model (`user` FK, `score`, plus game-specific fields like `level`/`moves`, `played_at`). `SeasonRewardClaim.board` has a `choices` entry per game; `GameSeason._distribute_rewards_and_notify` calls `_distribute_board_rewards(...)` once per board to pay out monthly top-3 rewards.
2. **`game/views.py`** — a `get_<game>_ranking(top_n, season=None)` helper (Max-aggregated score, ranked, season-filtered), a `<game>_view` (renders the template), a `save_<game>_score` POST endpoint, and a `<game>_ranking` JSON endpoint. `game_ranking_view` has a board whitelist + `BOARD_LABELS` dict that every game must be added to.
3. **`game/urls.py`** — three paths per game: `<game>/`, `<game>/score/`, `<game>/ranking/`.
4. **`game/admin.py`** — a `ModelAdmin` per score model.
5. **`templates/game/<game>.html`** — a full-page template that duplicates (not shares) common structure from sibling templates: the sound engine (`static/js/game-sound.js`, `window.GameSound.play(name, arg)`), the mobile-optimization block (JS-driven `body.<prefix>-landscape` class instead of CSS orientation media queries, a collapsible nav pill, a chat/ranking side panel that becomes a floating FAB panel below 1024px), and the lobby chat WebSocket script (`/ws/lobby/chat/`, verbatim across games). `templates/game/lobby.html` and `templates/game/ranking.html` also need a matching entry per game.

Score-trust convention: most games (apple game, memory match, pattern recall) trust the client-computed score and only validate it's non-negative server-side. `number_speed` is the one exception — it sends raw timing/mistake data and lets the server recompute the authoritative score. Follow whichever convention the game you're copying from uses; don't silently switch a game from one to the other.

### Templates & CSS

- All templates extend `templates/base.html`.
- Tailwind CSS v4 (via `pytailwindcss`) — source in `static/src/input.css`, output to `static/css/tailwind.css`. Run the watch command during development; changes to templates require a rebuild if new Tailwind classes are introduced.
- Static files served by WhiteNoise in production.

### Git Convention

Branch prefixes: `Feat/`, `Fix/`, `Refactor/`, `Chore/`, `Docs/`  
Commit prefixes: `feat:`, `fix:`, `docs:`, `style:`, `refactor:`, `test:`, `chore:`. **keep it short and compact. do not exceed one line.**
Direct pushes to `main` are forbidden. Sub-branches merge into their parent feature branch first.
- **PR**:
  - Title must start with a tag: `[FEAT]`, `[FIX]`, `[CHORE]`, `[DOCS]`, `[REFACTOR]`. e.g. `[FEAT] 학생 인증 서류 업로드 기능 추가`
  - **Title and body must be written in Korean, clearly and concisely.**
