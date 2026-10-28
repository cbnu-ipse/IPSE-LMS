"""
문제에 붙는 그림: 모델이 SVG를 직접 써서 주면 허용 목록으로 검열한 뒤 문제 JSON의 figure({"svg", "alt"})에 담는다.

- 허용한 태그·속성만 남기고 나머지(script, foreignObject, 이벤트, style, 외부 주소 등)는 지운다. 검열을 통과하지 못하면 그림만 뺀다.
- 화면에는 <img src="data:image/svg+xml;base64,...">로 보여 준다 (img 안의 SVG는 스크립트가 실행되지 않아 한 번 더 안전하다).
"""
import base64
import re
import xml.etree.ElementTree as ET

SVG_NS = "http://www.w3.org/2000/svg"
MAX_SVG_CHARS = 14000
MAX_ELEMENTS = 400
ALLOWED_TAGS = {"svg", "g", "defs", "marker", "rect", "circle", "ellipse", "line", "polyline", "polygon", "path", "text", "tspan"}
ALLOWED_ATTRS = {
    "viewBox", "id", "x", "y", "x1", "y1", "x2", "y2", "cx", "cy", "r", "rx", "ry", "width", "height", "d", "points", "transform",
    "fill", "stroke", "stroke-width", "stroke-dasharray", "stroke-linecap", "stroke-linejoin", "opacity", "fill-opacity",
    "stroke-opacity", "font-size", "font-family", "font-weight", "font-style", "text-anchor", "dominant-baseline", "dx", "dy",
    "marker-start", "marker-end", "markerWidth", "markerHeight", "markerUnits", "refX", "refY", "orient", "preserveAspectRatio",
}
_SAFE_VALUE = re.compile(r"^[\w\s.,\-+%#()'\"/]*$")
_URL_REF = re.compile(r"^url\(#[\w\-]+\)$")


def _local(name):
    return name.rsplit("}", 1)[-1] if "}" in name else name


def _clean(el, counter):
    counter[0] += 1
    if counter[0] > MAX_ELEMENTS:
        raise ValueError("too many elements")
    tag = _local(el.tag)
    if tag not in ALLOWED_TAGS:
        raise ValueError(f"tag {tag}")
    for name in list(el.attrib):
        value = el.attrib.pop(name)
        local = _local(name)
        if local not in ALLOWED_ATTRS or "}" in name:
            continue
        if local in ("marker-start", "marker-end", "fill", "stroke") and value.startswith("url("):
            if not _URL_REF.match(value):
                continue
        elif not _SAFE_VALUE.match(value) or re.search(r"(?i)javascript|data:|url\(|expression", value):
            continue
        el.attrib[local] = value
    if tag not in ("text", "tspan"):
        el.text = None
    for child in list(el):
        _clean(child, counter)
        child.tail = None
    el.tag = tag


def sanitize_svg(svg):
    """검열된 SVG 문자열을 돌려준다. 안전하지 않거나 깨졌으면 None."""
    svg = str(svg or "").strip()
    if not svg or len(svg) > MAX_SVG_CHARS or re.search(r"<!\s*(DOCTYPE|ENTITY)", svg, re.I):
        return None
    try:
        root = ET.fromstring(svg)
        if _local(root.tag) != "svg":
            return None
        _clean(root, [0])
    except (ET.ParseError, ValueError):
        return None
    if "viewBox" not in root.attrib:
        try:
            root.attrib["viewBox"] = f"0 0 {float(root.attrib['width'].rstrip('px'))} {float(root.attrib['height'].rstrip('px'))}"
        except (KeyError, ValueError):
            return None
    root.attrib.pop("width", None)
    root.attrib.pop("height", None)
    root.attrib["xmlns"] = SVG_NS
    return ET.tostring(root, encoding="unicode")


def normalize_figure(raw):
    """모델이 준 figure({"svg", "alt"})를 검열해 저장 모양으로. 쓸 수 없으면 None."""
    if not isinstance(raw, dict):
        return None
    svg = sanitize_svg(raw.get("svg"))
    if not svg:
        return None
    return {"svg": svg, "alt": " ".join(str(raw.get("alt") or "").split())[:300]}


def data_uri(figure):
    """저장된 figure를 <img src>에 쓸 data URI로 (다시 한 번 검열한다). 없으면 빈 문자열."""
    svg = sanitize_svg((figure or {}).get("svg")) if isinstance(figure, dict) else None
    if not svg:
        return ""
    return "data:image/svg+xml;base64," + base64.b64encode(svg.encode("utf-8")).decode("ascii")
