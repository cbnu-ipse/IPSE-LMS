import io
import json
import os
import re
import shutil
import subprocess
import unittest
from unittest.mock import patch

from django.conf import settings
from django.contrib.auth import get_user_model
from django.core.cache import cache
from django.core.files.base import ContentFile
from django.test import TestCase

from .ai import pdf_page_texts
from .models import PersonalDocument, ProcessingStatus

User = get_user_model()

SUMMARY = "## 프로세스\n프로세스는 실행 중인 프로그램\n\n## 스케줄링\nCPU 스케줄링과 큐\n"


def blank_pdf(pages=3):
    from pypdf import PdfWriter

    writer = PdfWriter()
    for _ in range(pages):
        writer.add_blank_page(width=200, height=200)
    buf = io.BytesIO()
    writer.write(buf)
    return buf.getvalue()


class SourceSyncPageTests(TestCase):
    def setUp(self):
        cache.clear()
        self.user = User.objects.create_user(username="reader", password="pw")
        self.client.force_login(self.user)

    def make(self, name, content):
        doc = PersonalDocument.objects.create(user=self.user, title="d", extracted_text="원문 본문", summary=SUMMARY,
                                              summary_status=ProcessingStatus.DONE)
        doc.file.save(name, ContentFile(content))
        return doc

    def test_study_page_loads_sync_script_and_exposes_summary_hooks(self):
        doc = self.make("a.txt", b"hello")
        html = self.client.get(f"/mypage/{doc.pk}/").content.decode()
        self.assertIn("js/source-sync.js", html)
        self.assertIn("window.msSummary", html)                 # 요약 조각 이동을 원문 쪽에 알리는 훅
        self.assertIn("ms:summary-page", html)
        self.assertNotIn('id="ms-pdf-pages"', html)             # 텍스트 원문은 페이지 글이 필요 없다

    def test_pdf_page_texts_are_sent_for_page_matching(self):
        doc = self.make("a.pdf", blank_pdf(3))
        with patch("pypdf.PageObject.extract_text", side_effect=["프로세스 상태", "스케줄링 큐", "메모리"]):
            html = self.client.get(f"/mypage/{doc.pk}/").content.decode()
        match = re.search(r'<script id="ms-pdf-pages" type="application/json">(.*?)</script>', html, re.S)
        self.assertIsNotNone(match)
        self.assertEqual(json.loads(match.group(1)), ["프로세스 상태", "스케줄링 큐", "메모리"])

    def test_pdf_page_texts_are_cached_and_unreadable_pdf_gives_empty_list(self):
        doc = self.make("a.pdf", blank_pdf(2))
        with patch("pypdf.PageObject.extract_text", return_value="글") as extract:
            first = pdf_page_texts(doc)
            second = pdf_page_texts(doc)
        self.assertEqual(first, ["글", "글"])
        self.assertEqual(second, first)
        self.assertEqual(extract.call_count, 2)                 # 두 번째는 캐시
        broken = self.make("b.pdf", b"not a pdf")
        self.assertEqual(pdf_page_texts(broken), [])

    def test_no_page_data_without_summary(self):
        doc = self.make("a.pdf", blank_pdf(2))
        PersonalDocument.objects.filter(pk=doc.pk).update(summary="")
        html = self.client.get(f"/mypage/{doc.pk}/").content.decode()
        self.assertNotIn('id="ms-pdf-pages"', html)


@unittest.skipUnless(shutil.which("node"), "node가 없으면 건너뜁니다")
class MappingAlgorithmTests(TestCase):
    """요약 조각 ↔ 원문 위치 맞추기(static/js/source-sync.js)를 node로 시험한다."""

    SCRIPT = r"""
global.window = {}; global.document = { getElementById: () => null };
const { buildMapping, pieceForUnit } = require(process.argv[1]);
const units = [
  '프로세스는 실행 중인 프로그램이다. PCB에 프로세스 상태, 프로그램 카운터 정보를 저장한다.',
  'CPU 스케줄링은 준비 큐에서 다음 프로세스를 고른다. FCFS, SJF, 라운드 로빈 방식이 있다.',
  '페이징은 메모리를 프레임으로 나누고 페이지 테이블과 TLB로 주소를 변환한다.',
];
const pieces = ['프로세스\n프로세스가 실행 중인 프로그램, PCB', 'CPU 스케줄링\n준비 큐, FCFS 라운드 로빈', '페이징\n프레임, 페이지 테이블, TLB',
  '아무 관련 없는 내용 zzz'];
const m = buildMapping(pieces, units);
console.log(JSON.stringify({ units: m.map((x) => x && x.unit), back: [0, 1, 2].map((u) => pieceForUnit(m, u)),
  blank: buildMapping(pieces, ['', '', '', '']).map((x) => x.unit) }));
"""

    def test_pieces_map_to_their_source_in_order(self):
        out = subprocess.run(["node", "-e", self.SCRIPT, os.path.join(str(settings.BASE_DIR), "static/js/source-sync.js")],
                             capture_output=True, text=True, timeout=30)
        self.assertEqual(out.returncode, 0, out.stderr)
        result = json.loads(out.stdout)
        self.assertEqual(result["units"][:3], [0, 1, 2])                 # 각 조각이 해당 원문을 가리킨다
        self.assertEqual(result["units"][3], 2)                          # 못 찾은 조각은 앞 조각 위치를 따른다
        self.assertEqual(result["back"], [0, 1, 2])                      # 원문 위치 → 요약 조각
        self.assertEqual(result["blank"], [0, 1, 2, 3])                  # 글자가 없는 원문은 비례 짐작
