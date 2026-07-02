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

### Multi-host Routing (`django_hosts`)

The project uses `django_hosts` to serve different URL trees from different subdomains. **This is the most important architectural fact.**

| Host pattern | URL config | Purpose |
|---|---|---|
| `judge.*` | `config/urls_judge.py` | Competitive programming (contest, problems, compiler) |
| `game.*` | `config/urls_game.py` | Apple game |
| `(www)?` (root) | `config/urls_community.py` | Main community, LMS, accounts |

**Consequence:** A URL `name` only resolves on the host whose URLconf includes it. If a model's `get_absolute_url` uses `reverse("some_name")` and that name is not registered on the current host, you get `NoReverseMatch`. Always verify the target URLconf when adding `reverse()` calls or linking to cross-app resources. `course.urls` is included in both `urls_community.py` and `urls_judge.py`.

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
- **`contest/`** — Competitive programming contests (judge subdomain)
- **`problems/`** — Problem bank for contests
- **`compiler/`** — Online code execution
- **`community/`** — Posts, comments, gathering events, club recruitment
- **`ranking/`** — Leaderboard based on problem solving
- **`game/`** — Apple-stacking game with seasonal rewards
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
