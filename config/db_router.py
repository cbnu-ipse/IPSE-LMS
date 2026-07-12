JUDGE_APPS = {"contest", "problems"}


class JudgeRouter:
    """contest/problems 앱의 테이블만 beta_judge DB로 라우팅한다.
    나머지 앱은 default DB에 그대로 남는다."""

    def db_for_read(self, model, **hints):
        return "beta_judge" if model._meta.app_label in JUDGE_APPS else None

    def db_for_write(self, model, **hints):
        return "beta_judge" if model._meta.app_label in JUDGE_APPS else None

    def allow_relation(self, obj1, obj2, **hints):
        return True

    def allow_migrate(self, db, app_label, **hints):
        if app_label in JUDGE_APPS:
            return db == "beta_judge"
        return db == "default"
