"""PPT·PPTX·DOC·DOCX·RTF를 LibreOffice로 PDF로 바꿔 학습 화면의 원문 칸에 원본 모양 그대로 보여 준다.

- 올린 직후 백그라운드에서 변환한다 (AI를 부르지 않는다). 변환한 PDF는 자료 파일과 같은 저장소의 doc_pdf/<자료 id>.pdf에 둔다 (DB 필드 없음).
  PDF 자료와 똑같이 원문 칸에 PDF로 보이고, 요약 조각과 원문 쪽이 서로 따라간다 (static/js/source-sync.js).
- LibreOffice는 한 번에 하나만 돌린다 (CPU·메모리를 많이 써서 몰리면 서버가 느려진다). 실행 파일이 없는 환경(로컬 개발)에서는 조용히 건너뛰고,
  이 경우 원문 칸은 예전처럼 글자만 보여 준다.
- 한글(HWP·HWPX)은 LibreOffice가 열지 못해 변환하지 않는다.
"""
import io
import logging
import os
import shutil
import subprocess
import tempfile
import threading
import zipfile
from datetime import timedelta

from django.core.files.base import ContentFile
from django.utils import timezone

logger = logging.getLogger(__name__)

CONVERTIBLE_EXTENSIONS = (".pptx", ".ppt", ".docx", ".doc", ".rtf")
STORE_DIR = "doc_pdf"
TIMEOUT_SECONDS = 180             # 변환 한 번의 제한 시간 (큰 PPT도 이 안에 끝난다)
PENDING_FOR = timedelta(minutes=10)    # 올린 뒤 이 시간 안이면 '변환 중'으로 본다 (서버가 다시 켜져 멈춘 경우를 구별)

_one_at_a_time = threading.Semaphore(1)


def needs_conversion(name):
    return str(name or "").lower().endswith(CONVERTIBLE_EXTENSIONS)


def pdf_name(pk):
    return f"{STORE_DIR}/{pk}.pdf"


def failed_name(pk):
    return f"{STORE_DIR}/{pk}.failed"


def soffice_path():
    return shutil.which("soffice") or shutil.which("libreoffice")


def looks_like_office_file(data):
    """진짜 Office 문서인지 시그니처로 확인한다 (ZIP=pptx·docx, OLE=ppt·doc, {\\rtf=rtf).
    LibreOffice는 알아볼 수 없는 파일을 '텍스트'로 열어 쓰레기 글자가 찍힌 PDF를 만들어 주므로, 손상되거나 확장자만 바꾼 파일은 변환하지 않는다."""
    return zipfile.is_zipfile(io.BytesIO(data)) or data[:8] == b"\xd0\xcf\x11\xe0\xa1\xb1\x1a\xe1" or data[:5] == b"{\\rtf"


def convert_to_pdf(data, extension):
    """문서 바이트를 PDF 바이트로 바꾼다. 실행 파일이 없거나, Office 문서가 아니거나, 실패·시간 초과면 None."""
    binary = soffice_path()
    if not binary or not looks_like_office_file(data):
        return None
    ext = extension if extension.startswith(".") else "." + extension
    work = tempfile.mkdtemp(prefix="office2pdf_")
    try:
        source = os.path.join(work, "input" + ext)         # 파일 이름의 한글·공백이 변환기에 영향을 주지 않게 고정 이름을 쓴다
        with open(source, "wb") as fh:
            fh.write(data)
        out_dir = os.path.join(work, "out")
        os.mkdir(out_dir)
        command = [binary, "--headless", "--norestore", "--nologo", "--nodefault", "--nofirststartwizard",
                   f"-env:UserInstallation=file://{os.path.join(work, 'profile')}", "--convert-to", "pdf", "--outdir", out_dir, source]
        with _one_at_a_time:
            subprocess.run(command, cwd=work, env={**os.environ, "HOME": work}, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL,
                           timeout=TIMEOUT_SECONDS, check=True)
        result = os.path.join(out_dir, "input.pdf")
        if not os.path.exists(result):
            return None
        with open(result, "rb") as fh:
            pdf = fh.read()
        return pdf if pdf.startswith(b"%PDF") else None
    except subprocess.TimeoutExpired:
        logger.warning("PDF 변환 시간 초과 (%s초)", TIMEOUT_SECONDS)
        return None
    except (subprocess.CalledProcessError, OSError):
        logger.exception("PDF 변환 실패")
        return None
    finally:
        shutil.rmtree(work, ignore_errors=True)


def convert_document(document):
    """자료 파일을 PDF로 바꿔 저장한다. 성공하면 True. 실패하면 표시를 남겨 '변환 중'이 계속 보이지 않게 한다. 예외는 올리지 않는다."""
    name = document.file.name if document.file else ""
    if not needs_conversion(name):
        return False
    storage = document.file.storage
    try:
        with document.file.open("rb") as fh:
            pdf = convert_to_pdf(fh.read(), os.path.splitext(name)[1].lower())
        for old in (pdf_name(document.pk), failed_name(document.pk)):
            if storage.exists(old):
                storage.delete(old)
        if pdf is None:
            storage.save(failed_name(document.pk), ContentFile(b""))
            return False
        storage.save(pdf_name(document.pk), ContentFile(pdf))
        return True
    except Exception:
        logger.exception("자료 %s PDF 변환 실패", document.pk)
        return False


def delete_files(storage, pk):
    for name in (pdf_name(pk), failed_name(pk)):
        try:
            if storage.exists(name):
                storage.delete(name)
        except Exception:
            pass


def state(document):
    """원문 칸의 변환 상태: 'ready'(PDF 있음), 'pending'(변환 중), 'text'(변환하지 못했거나 아직 안 한 자료: 글자로 보여 준다), 'none'(변환 대상이 아님)."""
    name = document.file.name if document.file else ""
    if not needs_conversion(name):
        return "none"
    storage = document.file.storage
    if storage.exists(pdf_name(document.pk)):
        return "ready"
    if storage.exists(failed_name(document.pk)):
        return "text"
    if document.uploaded_at and timezone.now() - document.uploaded_at < PENDING_FOR and soffice_path():
        return "pending"
    return "text"              # 오래전에 올린 자료(아직 변환 전)나 변환기가 없는 환경: 글자로 보여 준다


def pdf_url(document):
    """변환한 PDF의 주소 (없으면 None)."""
    return document.file.storage.url(pdf_name(document.pk)) if state(document) == "ready" else None
