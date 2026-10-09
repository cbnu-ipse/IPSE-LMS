from unittest import mock

from django.contrib.auth import get_user_model
from django.test import TestCase

from core.templatetags.safe_output import sanitize_html, script_json


class SafeOutputFilterTests(TestCase):
    def test_sanitize_html_strips_scripts_and_handlers(self):
        cleaned = sanitize_html('<p onclick="x()">hi</p><script>alert(1)</script><img src=x onerror=alert(1)>')
        self.assertNotIn("<script", cleaned)
        self.assertNotIn("onclick", cleaned)
        self.assertNotIn("onerror", cleaned)
        self.assertIn("<p>hi</p>", cleaned)

    def test_sanitize_html_drops_javascript_links(self):
        self.assertNotIn("javascript:", sanitize_html('<a href="javascript:alert(1)">x</a>'))

    def test_script_json_cannot_close_script_tag(self):
        out = script_json('{"name": "</script><script>alert(1)</script>"}')
        self.assertNotIn("</script>", out)
        self.assertNotIn("<", out)


class OgPreviewTests(TestCase):
    def test_rejects_internal_addresses(self):
        for url in ("http://127.0.0.1/", "http://localhost:8000/", "http://10.0.0.5/", "http://169.254.169.254/latest/"):
            with mock.patch("urllib.request.OpenerDirector.open") as opener:
                response = self.client.get("/community/api/og-preview/", {"url": url})
            self.assertEqual(response.status_code, 400, url)
            opener.assert_not_called()

    def test_rejects_non_standard_port(self):
        response = self.client.get("/community/api/og-preview/", {"url": "http://example.com:6379/"})
        self.assertEqual(response.status_code, 400)


class LmsDownloadTests(TestCase):
    def setUp(self):
        user = get_user_model().objects.create_user(username="lmsuser", password="pw-for-tests-only")
        self.client.force_login(user)

    def test_rejects_non_lms_host(self):
        with mock.patch("urllib.request.urlopen") as urlopen:
            response = self.client.get("/accounts/lms/download/", {"url": "https://evil.example.com/file"})
        self.assertEqual(response.status_code, 400)
        urlopen.assert_not_called()
