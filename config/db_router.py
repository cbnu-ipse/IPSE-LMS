JUDGE_APPS = {"contest", "problems"}


class JudgeRouter:
    """contest/problems 앱의 테이블만 beta_judge DB로 라우팅한다.
    나머지 앱은 default DB에 그대로 남는다."""

    # 나머지 앱은 None이 아니라 "default"를 명시한다. None을 돌려주면 Django는 관련 객체를 따라갈 때
    # (problem.author, prefetch_related 등) "그 객체가 온 DB"를 쓰기 때문에, judge DB의 문제에서 작성자를
    # 찾으려고 judge DB에 사용자 테이블을 조회하다 깨진다.
    def db_for_read(self, model, **hints):
        return "beta_judge" if model._meta.app_label in JUDGE_APPS else "default"

    def db_for_write(self, model, **hints):
        return "beta_judge" if model._meta.app_label in JUDGE_APPS else "default"

    def allow_relation(self, obj1, obj2, **hints):
        return True

    def allow_migrate(self, db, app_label, **hints):
        if app_label in JUDGE_APPS:
            return db == "beta_judge"
        return db == "default"
