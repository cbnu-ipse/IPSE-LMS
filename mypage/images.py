"""PPTX·DOCX 안의 그림(도면·사진·표 캡처)을 뽑아 저장한다. 학습 화면에서 요약 조각 옆에 보여 주고, 그림 모아보기·ZIP으로 내려받을 수 있다.

- 저장 위치: 자료 파일과 같은 저장소의 doc_images/<자료 id>/ 아래에 이미지와 index.json(목차)을 둔다 (DB 필드 없음).
- AI를 부르지 않는다. 어느 요약 조각에 어느 그림을 붙일지는 그림이 있던 슬라이드·문단의 글(ctx)과 요약 글의 겹침으로 화면(static/js/summary-images.js)이 맞춘다.
- 용량을 지킨다: 아주 작은 아이콘·가는 선·여러 슬라이드에 반복되는 로고는 버리고, 긴 변을 줄이고, 자료당 개수·총용량에 상한을 둔다.
- 벡터 그림(EMF·WMF·SVG)은 서버에서 그릴 수 없어 건너뛴다 (건너뛴 수는 index.json의 skipped에 남는다).
"""
import hashlib
import io
import json
import logging
import re
import zipfile
from xml.etree import ElementTree

from django.core.files.base import ContentFile

logger = logging.getLogger(__name__)

OFFICE_EXTENSIONS = (".pptx", ".docx")
STORE_DIR = "doc_images"
MAX_IMAGES = 60                 # 자료 하나에서 보관하는 그림 수
MAX_TOTAL_BYTES = 8 * 1024 * 1024    # 자료 하나의 그림 총용량 (압축한 뒤)
MAX_EDGE = 1280                 # 긴 변이 이보다 길면 줄인다
MIN_EDGE = 48                   # 짧은 변이 이보다 작으면 아이콘으로 보고 버린다
MIN_AREA = 6000                 # 넓이(px²)가 이보다 작아도 버린다
MAX_ASPECT = 15                 # 가로세로 비가 이보다 크면 선·구분선으로 보고 버린다
REPEAT_SLIDES = 3               # 같은 그림이 이만큼의 슬라이드(문단)에 나오면 로고·장식으로 보고 버린다
CTX_CHARS = 300                 # 그림이 있던 곳의 글 (요약과 맞추는 데 쓴다)
PNG_TO_JPEG_BYTES = 600 * 1024  # 큰 PNG 사진은 JPEG가 더 작으면 그것을 쓴다
VECTOR_EXTENSIONS = ("emf", "wmf", "svg", "wdp", "tif", "tiff")


def is_office_name(name):
    return str(name or "").lower().endswith(OFFICE_EXTENSIONS)


def index_name(pk):
    return f"{STORE_DIR}/{pk}/index.json"


def _clean(text):
    return " ".join(str(text or "").split())


# ── 원본에서 그림 꺼내기 ────────────────────────────────────────────────────────

def _pptx_pictures(shapes):
    from pptx.enum.shapes import MSO_SHAPE_TYPE

    for shape in shapes:
        if shape.shape_type == MSO_SHAPE_TYPE.GROUP:
            yield from _pptx_pictures(shape.shapes)
            continue
        try:
            image = shape.image          # 그림 도형과 그림 자리표시자만 가진다
        except (AttributeError, ValueError, KeyError):
            continue
        yield shape, image


def _pptx_text(shapes):
    from pptx.enum.shapes import MSO_SHAPE_TYPE

    parts = []
    for shape in shapes:
        if shape.shape_type == MSO_SHAPE_TYPE.GROUP:
            parts.append(_pptx_text(shape.shapes))
        elif getattr(shape, "has_text_frame", False) and shape.has_text_frame:
            parts.append(shape.text_frame.text)
    return _clean(" ".join(parts))


def raw_from_pptx(fileobj):
    """[(슬라이드 번호, 확장자, 바이트, 슬라이드 글)] — 슬라이드 순서, 슬라이드 안에서는 위→아래, 왼→오른쪽 순서."""
    from pptx import Presentation

    out = []
    for number, slide in enumerate(Presentation(fileobj).slides, 1):
        text = _pptx_text(slide.shapes)[:CTX_CHARS]
        found = sorted(_pptx_pictures(slide.shapes), key=lambda pair: (pair[0].top or 0, pair[0].left or 0))
        for _, image in found:
            out.append((number, image.ext.lower(), image.blob, text))
    return out


_W = "{http://schemas.openxmlformats.org/wordprocessingml/2006/main}"
_A = "{http://schemas.openxmlformats.org/drawingml/2006/main}"
_R = "{http://schemas.openxmlformats.org/officeDocument/2006/relationships}"
_V = "{urn:schemas-microsoft-com:vml}"


def raw_from_docx(fileobj):
    """[(None, 확장자, 바이트, 앞뒤 문단 글)] — 문서에 나온 순서."""
    with zipfile.ZipFile(fileobj) as zf:
        document = ElementTree.fromstring(zf.read("word/document.xml"))
        rels = {}
        if "word/_rels/document.xml.rels" in zf.namelist():
            for rel in ElementTree.fromstring(zf.read("word/_rels/document.xml.rels")):
                rels[rel.get("Id")] = rel.get("Target")
        paragraphs = list(document.iter(_W + "p"))
        texts = [_clean("".join(t.text or "" for t in p.iter(_W + "t"))) for p in paragraphs]
        out = []
        for i, p in enumerate(paragraphs):
            ids = [b.get(_R + "embed") for b in p.iter(_A + "blip")] + [v.get(_R + "id") for v in p.iter(_V + "imagedata")]
            for rid in filter(None, ids):
                target = rels.get(rid)
                if not target or target.startswith(("http://", "https://")):
                    continue
                path = target.lstrip("/") if target.startswith("/") else "word/" + target
                path = re.sub(r"[^/]+/\.\./", "", path)
                if path not in zf.namelist():
                    continue
                around = " ".join(t for t in (texts[i - 1] if i else "", texts[i], texts[i + 1] if i + 1 < len(texts) else "") if t)
                out.append((None, path.rsplit(".", 1)[-1].lower(), zf.read(path), around[:CTX_CHARS]))
        return out


# ── 거르고 줄이기 ───────────────────────────────────────────────────────────────

def _shrink(blob, ext):
    """(바이트, 확장자, 가로, 세로) 또는 None(버릴 그림). 작은 아이콘·가는 선은 버리고 큰 그림은 줄인다."""
    from PIL import Image

    try:
        image = Image.open(io.BytesIO(blob))
        image.load()
    except Exception:
        return None
    width, height = image.size
    if min(width, height) < MIN_EDGE or width * height < MIN_AREA or max(width, height) / max(min(width, height), 1) > MAX_ASPECT:
        return None
    if max(width, height) > MAX_EDGE:
        scale = MAX_EDGE / max(width, height)
        image = image.resize((max(1, round(width * scale)), max(1, round(height * scale))), Image.LANCZOS)
        width, height = image.size
    has_alpha = image.mode in ("RGBA", "LA") or (image.mode == "P" and "transparency" in image.info)
    out = io.BytesIO()
    if ext in ("jpg", "jpeg") and not has_alpha:
        image.convert("RGB").save(out, "JPEG", quality=85, optimize=True)
        return out.getvalue(), "jpg", width, height
    image.convert("RGBA" if has_alpha else "RGB").save(out, "PNG", optimize=True)
    data = out.getvalue()
    if not has_alpha and len(data) > PNG_TO_JPEG_BYTES:       # 사진을 PNG로 넣은 경우: JPEG가 훨씬 작다
        alt = io.BytesIO()
        image.convert("RGB").save(alt, "JPEG", quality=85, optimize=True)
        if len(alt.getvalue()) < len(data):
            return alt.getvalue(), "jpg", width, height
    return data, "png", width, height


def prepare(raw):
    """원본 그림 목록을 거르고 줄여 보관할 그림 목록과 건너뛴 수를 돌려준다."""
    skipped = {"vector": 0, "small": 0, "repeated": 0, "over_limit": 0}
    # 같은 그림이 나온 곳(PPTX는 슬라이드, DOCX는 등장 순서)의 수: 여러 곳에 나오면 로고·장식이다
    places = {}
    for n, (slide, _, blob, _) in enumerate(raw):
        places.setdefault(hashlib.sha1(blob).hexdigest(), set()).add(slide if slide is not None else ("at", n))
    kept, seen_in_slide = [], set()
    for slide, ext, blob, ctx in raw:
        digest = hashlib.sha1(blob).hexdigest()
        if ext in VECTOR_EXTENSIONS:
            skipped["vector"] += 1
            continue
        if len(places[digest]) >= REPEAT_SLIDES:
            skipped["repeated"] += 1
            continue
        if (slide, digest) in seen_in_slide:        # 같은 슬라이드에 같은 그림이 두 번
            continue
        seen_in_slide.add((slide, digest))
        shrunk = _shrink(blob, ext)
        if shrunk is None:
            skipped["small"] += 1
            continue
        data, new_ext, width, height = shrunk
        kept.append({"slide": slide, "ext": new_ext, "data": data, "w": width, "h": height, "ctx": ctx})
    if len(kept) > MAX_IMAGES or sum(len(k["data"]) for k in kept) > MAX_TOTAL_BYTES:
        # 상한을 넘으면 넓이가 작은 그림부터 버린다 (원래 순서는 유지)
        order = sorted(range(len(kept)), key=lambda i: kept[i]["w"] * kept[i]["h"], reverse=True)
        keep_ids, total = set(), 0
        for i in order:
            if len(keep_ids) >= MAX_IMAGES or total + len(kept[i]["data"]) > MAX_TOTAL_BYTES:
                continue
            keep_ids.add(i)
            total += len(kept[i]["data"])
        skipped["over_limit"] = len(kept) - len(keep_ids)
        kept = [k for i, k in enumerate(kept) if i in keep_ids]
    return kept, skipped


def _names(kept, kind):
    """파일 이름: PPTX는 slide04_1.png(슬라이드 번호_순번), DOCX는 fig01.png."""
    per_slide, names = {}, []
    for number, item in enumerate(kept, 1):
        if kind == "pptx":
            per_slide[item["slide"]] = per_slide.get(item["slide"], 0) + 1
            names.append(f"slide{item['slide']:02d}_{per_slide[item['slide']]}.{item['ext']}")
        else:
            names.append(f"fig{number:02d}.{item['ext']}")
    return names


# ── 저장·읽기 ──────────────────────────────────────────────────────────────────

def delete_images(storage, pk):
    """이 자료의 그림 파일과 목차를 지운다 (목차에 있는 파일만)."""
    index = _read_index(storage, pk)
    for item in (index or {}).get("images", []):
        storage.delete(f"{STORE_DIR}/{pk}/{item['name']}")
    if storage.exists(index_name(pk)):
        storage.delete(index_name(pk))


def _read_index(storage, pk):
    name = index_name(pk)
    try:
        if not storage.exists(name):
            return None
        with storage.open(name, "rb") as fh:
            return json.loads(fh.read().decode("utf-8"))
    except Exception:
        return None


def extract_for_document(document):
    """자료의 그림을 (다시) 뽑아 저장하고 목차를 돌려준다. PPTX·DOCX가 아니면 None. 실패해도 예외를 올리지 않는다 (요약에 영향이 없게)."""
    name = document.file.name if document.file else ""
    if not is_office_name(name):
        return None
    kind = "pptx" if name.lower().endswith(".pptx") else "docx"
    storage = document.file.storage
    try:
        with document.file.open("rb") as fh:
            raw = raw_from_pptx(fh) if kind == "pptx" else raw_from_docx(fh)
        kept, skipped = prepare(raw)
        delete_images(storage, document.pk)
        names = _names(kept, kind)
        images = []
        for item, filename in zip(kept, names):
            storage.save(f"{STORE_DIR}/{document.pk}/{filename}", ContentFile(item["data"]))
            images.append({"name": filename, "slide": item["slide"], "w": item["w"], "h": item["h"],
                           "bytes": len(item["data"]), "ctx": item["ctx"]})
        index = {"version": 1, "kind": kind, "images": images, "skipped": skipped}
        storage.save(index_name(document.pk), ContentFile(json.dumps(index, ensure_ascii=False).encode("utf-8")))
        return index
    except Exception:
        logger.exception("자료 %s 그림 뽑기 실패", document.pk)
        return None


def load_index(document):
    """저장된 목차. 아직 뽑지 않았으면 None."""
    if not document.file or not is_office_name(document.file.name):
        return None
    return _read_index(document.file.storage, document.pk)


def image_list(document):
    """화면에 보낼 그림 목록 [{name, url, slide, w, h, ctx}]. 없으면 빈 목록."""
    index = load_index(document)
    if not index:
        return []
    storage = document.file.storage
    return [{**item, "url": storage.url(f"{STORE_DIR}/{document.pk}/{item['name']}")} for item in index.get("images", [])]


def zip_bytes(document):
    """모든 그림을 ZIP 하나로 (파일 이름은 목차의 이름 그대로)."""
    index = load_index(document) or {"images": []}
    storage = document.file.storage
    buf = io.BytesIO()
    with zipfile.ZipFile(buf, "w", zipfile.ZIP_STORED) as zf:        # 이미 압축된 그림이라 다시 압축하지 않는다
        for item in index["images"]:
            with storage.open(f"{STORE_DIR}/{document.pk}/{item['name']}", "rb") as fh:
                zf.writestr(item["name"], fh.read())
    return buf.getvalue()
