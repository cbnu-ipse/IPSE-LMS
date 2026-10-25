from django.core.management.base import BaseCommand

from mypage import exam, ontology
from mypage.models import ExamQuestion, PersonalDocument, ProcessingStatus


class Command(BaseCommand):
    help = ("이미 올라온 자료에 과목·교수 정리와 개념 태그(수업 자료)·문제 분석(족보)을 붙인다. "
            "이미 붙은 자료는 건너뛴다 (--force면 다시). 시스템 작업이라 크레딧을 받지 않는다.")

    def add_arguments(self, parser):
        parser.add_argument("--force", action="store_true", help="이미 태그·분석이 있는 자료도 다시 한다")
        parser.add_argument("--subject", help="이 과목 이름의 자료만")

    def handle(self, *args, force, subject, **options):
        docs = (PersonalDocument.objects.filter(summary_status=ProcessingStatus.DONE).exclude(summary="")
                .prefetch_related("topics").order_by("id"))
        professors, subjects = set(), set()
        done = skipped = failed = 0
        for doc in docs:
            topic = doc.topics.order_by("pk").first()
            if subject and (not topic or topic.name != subject):
                continue
            if not doc.course_name and topic:
                doc.course_name = topic.name
                doc.save(update_fields=["course_name"])
            if doc.professor:
                ontology.resolve_professor(doc.professor)
            is_exam = doc.document_type == PersonalDocument.DocumentType.EXAM
            already = ExamQuestion.objects.filter(document=doc).exists() if is_exam else bool(doc.concept_tags)
            if already and not force:
                skipped += 1
                continue
            try:
                count = ontology.analyze_exam(doc) if is_exam else ontology.tag_document(doc)
            except Exception as exc:
                failed += 1
                self.stdout.write(self.style.ERROR(f"{doc.pk} {doc.title}: 실패 ({exc})"))
                continue
            done += 1
            self.stdout.write(f"{doc.pk} {doc.title}: {'문제' if is_exam else '개념'} {count}개")
            if is_exam:
                professors.add(doc.professor)
                if topic and not doc.professor:
                    subjects.add(topic.name)
        exam.refresh_for(professors=professors, subjects=subjects)
        self.stdout.write(self.style.SUCCESS(f"완료 {done}개, 건너뜀 {skipped}개, 실패 {failed}개"))
