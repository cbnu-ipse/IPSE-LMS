import nh3
from django import template
from django.utils.safestring import mark_safe

register = template.Library()

# Characters that could end a <script> block or start an HTML comment inside it
_SCRIPT_JSON_ESCAPES = {
    ord("<"): "\\u003C",
    ord(">"): "\\u003E",
    ord("&"): "\\u0026",
    ord(" "): "\\u2028",
    ord(" "): "\\u2029",
}


@register.filter
def sanitize_html(value):
    """Strip scripts, event handlers and unsafe URLs from untrusted HTML."""
    if not value:
        return ""
    return mark_safe(nh3.clean(str(value), link_rel="noopener noreferrer"))


@register.filter
def script_json(value):
    """Make a JSON string safe to embed inside a <script> element."""
    if value is None:
        return ""
    return mark_safe(str(value).translate(_SCRIPT_JSON_ESCAPES))
