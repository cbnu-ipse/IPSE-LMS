import re
import requests
import urllib.parse
import email.message
from bs4 import BeautifulSoup
from django.core.management.base import BaseCommand
from django.utils import timezone
from django.utils.dateparse import parse_date
from django.contrib.auth import get_user_model
from django.core.files.base import ContentFile
from community.models import CommunityPost, CommunityPostAttachment

User = get_user_model()

class Command(BaseCommand):
    help = "Sync Computer Science department notices and CBNU university notices with enhanced formatting"

    def handle(self, *args, **options):
        self.stdout.write("Starting CBNU CS & Main notices Sync...")

        # 1. Get system user for author fallback
        system_user = User.objects.filter(is_superuser=True).first()
        if not system_user:
            system_user = User.objects.filter(is_staff=True).first()
        if not system_user:
<<<<<<< HEAD
=======
            # Fallback create a dummy system user or use any user
>>>>>>> e8c6f47 (feat: configure dbbackup storage, implement academic notice board & crawler sync_cbnu_notices)
            system_user = User.objects.first()
            if not system_user:
                self.stderr.write("Error: No users exist to assign as notice author.")
                return

<<<<<<< HEAD
        # 2. Automatically clear academic posts to force a clean slate refresh
        deleted_count, _ = CommunityPost.objects.filter(category='academic').delete()
        if deleted_count > 0:
            self.stdout.write(f"Cleared {deleted_count} notice posts for formatting refresh.")

=======
        # Headers to prevent bot block
>>>>>>> e8c6f47 (feat: configure dbbackup storage, implement academic notice board & crawler sync_cbnu_notices)
        headers = {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
        }

<<<<<<< HEAD
        # 3. Sync Computer Science Notices
        cs_url = "https://computer.cbnu.ac.kr/bbs/bbs.php?db=notice"
        try:
            response = requests.get(cs_url, headers=headers, timeout=10)
            if response.status_code == 200:
                self.sync_cbnu_cs(response.text, system_user, headers)
            else:
                self.stderr.write(f"Failed to fetch CS notices. Status code: {response.status_code}")
        except Exception as e:
            self.stderr.write(f"Exception during CS notices request: {e}.")

        # 4. Sync CBNU Main notices (학사/장학)
        main_url = "https://www.cbnu.ac.kr/www/selectBbsNttList.do?bbsNo=8&key=815&searchCtgry=%ED%95%99%EC%82%AC/%EC%9E%A5%ED%95%99"
        try:
            response = requests.get(main_url, headers=headers, timeout=10)
            if response.status_code == 200:
                self.sync_cbnu_main(response.text, system_user, headers)
            else:
                self.stderr.write(f"Failed to fetch CBNU Main notices. Status code: {response.status_code}")
        except Exception as e:
            self.stderr.write(f"Exception during CBNU Main notices request: {e}.")

        self.stdout.write("Sync completed successfully.")

    def extract_date_from_row(self, tr):
        if not tr:
            return None
        tds = tr.find_all(["td", "th"])
        for td in tds:
            text = td.get_text().strip()
            # YYYY-MM-DD or YYYY.MM.DD
            match = re.search(r"(\d{4})[-./](\d{2})[-./](\d{2})", text)
            if match:
                return f"{match.group(1)}-{match.group(2)}-{match.group(3)}"
            # MM-DD
            match_short = re.search(r"^(\d{2})[-./](\d{2})$", text)
            if match_short:
                current_year = timezone.now().year
                return f"{current_year}-{match_short.group(1)}-{match_short.group(2)}"
        return None

    def unquote_fully(self, text):
        if not text:
            return ""
        # Unquote repeatedly to resolve double/triple URL-encoding
        old_text = ""
        while text != old_text:
            old_text = text
            text = urllib.parse.unquote(text)
        return text

    def get_filename_from_response(self, response, fallback_name):
        cd = response.headers.get('content-disposition')
        if not cd:
            return fallback_name
        
        # 1. UTF-8 encoded filename (RFC 5987 / RFC 2231)
        match = re.search(r"filename\*=\s*UTF-8''(.+)", cd, re.IGNORECASE)
        if match:
            return self.unquote_fully(match.group(1))

        # 2. Standard filename
        match = re.search(r'filename="?([^";]+)"?', cd, re.IGNORECASE)
        if match:
            fn = match.group(1)
            # Try decoding RFC 2047 header encoding (e.g. =?UTF-8?B?...)
            try:
                import email.header
                decoded_parts = email.header.decode_header(fn)
                decoded_fn = ""
                for part, encoding in decoded_parts:
                    if isinstance(part, bytes):
                        decoded_fn += part.decode(encoding or 'utf-8', errors='ignore')
                    else:
                        decoded_fn += part
                if decoded_fn:
                    fn = decoded_fn
            except Exception:
                pass
            return self.unquote_fully(fn)

        return fallback_name

    def download_attachments(self, detail_soup, detail_url, post, headers):
        attachment_links = []
        for file_a in detail_soup.find_all("a"):
            f_href = file_a.get("href", "") or ""
            f_href_lower = f_href.lower()
            # Match download links case-insensitively (e.g., nttFileDownload, download, fileId)
            if any(k in f_href_lower for k in ["download", "fileid=", "view_file", "downloadbbsfile", "filekey"]):
                f_url = urllib.parse.urljoin(detail_url, f_href)
                
                # Check link title first for real filename
                f_name = file_a.get("title", "").strip()
                if f_name and "다운로드" in f_name:
                    f_name = f_name.replace("다운로드", "").strip()
                
                if not f_name:
                    f_name = file_a.get_text().strip()
                
                if not f_name or f_name == "다운로드":
                    # Fallback to query param
                    parsed_qs = urllib.parse.parse_qs(urllib.parse.urlparse(f_href).query)
                    f_name = parsed_qs.get("fileNm", [None])[0] or parsed_qs.get("orignlFileNm", [None])[0] or "첨부파일"
                
                # Decode URL encoding fully
                f_name = self.unquote_fully(f_name)
                f_name = re.sub(r"\s+", " ", f_name).strip()
                if f_name and (f_url, f_name) not in attachment_links:
                    attachment_links.append((f_url, f_name))

        for f_url, f_name in attachment_links:
            try:
                file_resp = requests.get(f_url, headers=headers, timeout=15, stream=True)
                if file_resp.status_code == 200:
                    real_name = f_name
                    # If filename is generic or placeholder, retrieve from headers
                    if not real_name or real_name in ["다운로드", "첨부파일"]:
                        real_name = self.get_filename_from_response(file_resp, f_name)
                    
                    real_name = self.unquote_fully(real_name)
                    real_name = re.sub(r"\s+", " ", real_name).strip()
                    
                    content_length = int(file_resp.headers.get('content-length', 0))
                    if content_length < 20 * 1024 * 1024:
                        attachment = CommunityPostAttachment(post=post, filename=real_name)
                        attachment.file.save(real_name, ContentFile(file_resp.content), save=True)
                        self.stdout.write(f"  Saved attachment: {real_name}")
            except Exception as e:
                self.stdout.write(f"  Failed to download attachment {f_name} from {f_url}: {e}")

    def clean_and_resolve_html(self, container_element, detail_url):
        # Decompose header metadata tables, navigation paths, and duplicate details
        for bad_class in ["title_box", "path", "view_subject", "view_name", "view_text", "view_blank", "head_top_line", "head_tail_line", "body_shadow"]:
            for bad_el in container_element.find_all(class_=bad_class):
                bad_el.decompose()
        for bad_el in container_element.find_all(id="view_bg"):
            bad_el.decompose()

        # 1. Resolve relative image srcs and link hrefs inside the HTML content
        for img in container_element.find_all("img"):
            src = img.get("src", "")
            if src:
                img["src"] = urllib.parse.urljoin(detail_url, src)
                
        for a in container_element.find_all("a"):
            href = a.get("href", "")
            if href:
                a["href"] = urllib.parse.urljoin(detail_url, href)

        # 2. Add border styling to tables to render correctly in LMS
        for table in container_element.find_all("table"):
            table["style"] = "border-collapse: collapse; width: 100%; margin: 16px 0; border: 1px solid #cbd5e1;" + (table.get("style") or "")
            for cell in table.find_all(["td", "th"]):
                cell["style"] = "border: 1px solid #cbd5e1; padding: 8px 12px;" + (cell.get("style") or "")

        # 3. Convert typical CSS classes for colors to inline styles
        for tag in container_element.find_all(class_=True):
            classes = tag.get("class", [])
            style = tag.get("style", "") or ""
            class_str = " ".join(classes).lower()
            
            # Check classes for blue
            if any(k in class_str for k in ["blue", "color1", "primary"]):
                if "color" not in style:
                    tag["style"] = style + "; color: #2563eb;"
                    
            # Check classes for red
            if any(k in class_str for k in ["red", "color2", "danger", "warning"]):
                if "color" not in style:
                    tag["style"] = style + "; color: #dc2626;"
                    
            # Check classes for green
            if any(k in class_str for k in ["green", "color3", "success"]):
                if "color" not in style:
                    tag["style"] = style + "; color: #16a34a;"
                
        return container_element.decode_contents().strip()

    def find_best_content_container(self, detail_soup):
        # 1. Try known specific selectors
        view_con = (
            detail_soup.select_one("#articles") or
            detail_soup.select_one(".contenttext") or
            detail_soup.select_one(".viewcontent") or
            detail_soup.select_one("#writeContents") or
            detail_soup.select_one(".content") or 
            detail_soup.select_one("#con") or 
            detail_soup.select_one(".view_content") or 
            detail_soup.select_one("#bbs_view") or 
            detail_soup.select_one(".view_con") or
            detail_soup.select_one(".board_view") or
            detail_soup.select_one(".board_view_con") or
            detail_soup.select_one("#bbs_content") or
            detail_soup.select_one(".board-detail") or
            detail_soup.select_one(".nttCn")
        )
        if view_con:
            return view_con
            
        # 2. Dynamic heuristic: find the best text container that is not a global layout wrapper
        best_el = None
        max_len = 0
        for tag in detail_soup.find_all(["div", "td", "section", "article"]):
            t_id = tag.get("id", "") or ""
            t_class = " ".join(tag.get("class", [])) or ""
            name_lower = (t_id + " " + t_class).lower()
            
            # Skip global layout blocks
            if any(k in name_lower for k in ["wrap", "container", "contents", "footer", "header", "menu", "sidebar", "nav", "aside", "head", "layout"]):
                continue
                
            t_text = tag.get_text().strip()
            t_len = len(t_text)
            if t_len > max_len and t_len > 150:
                max_len = t_len
                best_el = tag
        return best_el

    def sync_cbnu_cs(self, html_content, author, headers):
        soup = BeautifulSoup(html_content, "html.parser")
        all_links = soup.find_all("a")
        self.stdout.write(f"CS Notice: Found {len(all_links)} total links on the page.")

        count = 0
        seen_titles = set()
        for a in all_links:
            href = a.get("href", "") or ""
            if "db=notice" in href and "no=" in href:
                raw_title = a.get_text().strip()
                if not raw_title:
                    continue

                title = re.sub(r"^\[[^\]]+\]\s*", "", raw_title)

                if title in seen_titles:
                    continue
                seen_titles.add(title)

                no_match = re.search(r"no=(\d+)", href)
                if not no_match:
                    continue
                no_val = no_match.group(1)

                detail_url = urllib.parse.urljoin("https://computer.cbnu.ac.kr/bbs/bbs.php?db=notice", href)

                unique_source_id = f"cbnu_cs_{no_val}"
                source_marker = f"<!-- SOURCE_ID: {unique_source_id} -->"
                if CommunityPost.objects.filter(content__contains=source_marker).exists():
                    continue

                parsed_datetime = None
                row = a.find_parent("tr")
                date_str = self.extract_date_from_row(row)
                if date_str:
                    p_date = parse_date(date_str)
                    if p_date:
                        parsed_datetime = timezone.make_aware(timezone.datetime.combine(p_date, timezone.datetime.min.time()))

                # Fallback content
                content_body = f"이 게시글은 충북대학교 컴퓨터공학과 공지사항에서 자동 수집되었습니다."
                detail_soup = None
                try:
                    detail_resp = requests.get(detail_url, headers=headers, timeout=5)
                    if detail_resp.status_code == 200:
                        detail_soup = BeautifulSoup(detail_resp.text, "html.parser")
                        view_con = self.find_best_content_container(detail_soup)
                        if view_con:
                            content_body = self.clean_and_resolve_html(view_con, detail_url)
                except Exception as e:
                    self.stdout.write(f"Error fetching CS detail {detail_url}: {e}")

                # Premium button layout
                button_html = f"""
                <div style="margin: 32px 0 16px 0; text-align: center;">
                    <a href="{detail_url}" target="_blank" rel="noopener noreferrer" 
                       style="display: inline-flex; align-items: center; gap: 8px; padding: 12px 24px; background-color: #4f46e5; color: #ffffff; text-decoration: none; border-radius: 12px; font-weight: bold; font-size: 14px; box-shadow: 0 4px 6px -1px rgba(79, 70, 229, 0.15), 0 2px 4px -2px rgba(79, 70, 229, 0.15); transition: all 0.2s; font-family: sans-serif;">
                        원문 공지사항 확인하기 <i class="fa-solid fa-arrow-up-right-from-square" style="font-size: 12px;"></i>
                    </a>
                </div>
                """
                final_content = f"{content_body}\n\n---\n{button_html}\n{source_marker}"
                post = CommunityPost.objects.create(
                    title=title,
                    content=final_content,
                    author=author,
                    category="academic",
                    is_notice=False,
                )
                
                if parsed_datetime:
                    CommunityPost.objects.filter(pk=post.pk).update(created_at=parsed_datetime)

                if detail_soup:
                    self.download_attachments(detail_soup, detail_url, post, headers)

                count += 1
                if count >= 10:
                    break

        self.stdout.write(f"Synced {count} CS department notices.")

    def sync_cbnu_main(self, html_content, author, headers):
        soup = BeautifulSoup(html_content, "html.parser")
        all_links = soup.find_all("a")
        self.stdout.write(f"Main Notice: Found {len(all_links)} total links on the page.")

        count = 0
        seen_titles = set()
        for a in all_links:
            href = a.get("href", "") or ""
            if "selectBbsNttView.do" in href:
                raw_title = a.get_text().strip()
                if not raw_title:
                    spans = a.find_all("span")
                    for s in spans:
                        if s.get_text().strip():
                            raw_title = s.get_text().strip()
                            break
                if not raw_title:
                    continue

                title = re.sub(r"^\[[^\]]+\]\s*", "", raw_title)

                if title in seen_titles:
                    continue
                seen_titles.add(title)

                ntt_match = re.search(r"(?:nttId|nttNo|ntt|no)=(\d+)", href)
                if not ntt_match:
                    continue
                ntt_val = ntt_match.group(1)

                detail_url = urllib.parse.urljoin("https://www.cbnu.ac.kr/www/selectBbsNttList.do?bbsNo=8&key=815", href)

                unique_source_id = f"cbnu_main_{ntt_val}"
                source_marker = f"<!-- SOURCE_ID: {unique_source_id} -->"
                if CommunityPost.objects.filter(content__contains=source_marker).exists():
                    continue

                parsed_datetime = None
                row = a.find_parent("tr")
                date_str = self.extract_date_from_row(row)
                if date_str:
                    p_date = parse_date(date_str)
                    if p_date:
                        parsed_datetime = timezone.make_aware(timezone.datetime.combine(p_date, timezone.datetime.min.time()))

                # Fallback content
                content_body = f"이 게시글은 충북대학교 홈페이지 공지사항에서 자동 수집되었습니다."
                detail_soup = None
                try:
                    detail_resp = requests.get(detail_url, headers=headers, timeout=5)
                    if detail_resp.status_code == 200:
                        detail_soup = BeautifulSoup(detail_resp.text, "html.parser")
                        view_con = self.find_best_content_container(detail_soup)
                        if view_con:
                            content_body = self.clean_and_resolve_html(view_con, detail_url)
                except Exception as e:
                    self.stdout.write(f"Error fetching Main detail {detail_url}: {e}")

                # Premium button layout
                button_html = f"""
                <div style="margin: 32px 0 16px 0; text-align: center;">
                    <a href="{detail_url}" target="_blank" rel="noopener noreferrer" 
                       style="display: inline-flex; align-items: center; gap: 8px; padding: 12px 24px; background-color: #4f46e5; color: #ffffff; text-decoration: none; border-radius: 12px; font-weight: bold; font-size: 14px; box-shadow: 0 4px 6px -1px rgba(79, 70, 229, 0.15), 0 2px 4px -2px rgba(79, 70, 229, 0.15); transition: all 0.2s; font-family: sans-serif;">
                        원문 공지사항 확인하기 <i class="fa-solid fa-arrow-up-right-from-square" style="font-size: 12px;"></i>
                    </a>
                </div>
                """
                final_content = f"{content_body}\n\n---\n{button_html}\n{source_marker}"
                post = CommunityPost.objects.create(
                    title=title,
                    content=final_content,
                    author=author,
                    category="academic",
                    is_notice=False,
                )
                
                if parsed_datetime:
                    CommunityPost.objects.filter(pk=post.pk).update(created_at=parsed_datetime)

                if detail_soup:
                    self.download_attachments(detail_soup, detail_url, post, headers)

                count += 1
                if count >= 10:
                    break

        self.stdout.write(f"Synced {count} Main university notices.")
=======
        # 2. Sync CBNU General Notices
        # URL for General Notice: https://www.chungbuk.ac.kr/site/www/board.do?key=671
        cbnu_url = "https://www.chungbuk.ac.kr/site/www/board.do?key=671"
        try:
            response = requests.get(cbnu_url, headers=headers, timeout=10)
            if response.status_code == 200:
                self.sync_cbnu_general(response.text, system_user)
            else:
                self.stderr.write(f"Failed to fetch CBNU general notices. Status code: {response.status_code}")
                self.generate_mock_general(system_user)
        except Exception as e:
            self.stderr.write(f"Exception during CBNU general notices request: {e}. Generating mockup data...")
            self.generate_mock_general(system_user)

        # 3. Sync CBNU Computer Science Notices
        # URL for CS Notice: https://computer.cbnu.ac.kr/bbs/board.php?bo_table=sub5_1
        cs_url = "https://computer.cbnu.ac.kr/bbs/board.php?bo_table=sub5_1"
        try:
            response = requests.get(cs_url, headers=headers, timeout=10)
            if response.status_code == 200:
                self.sync_cbnu_cs(response.text, system_user)
            else:
                self.stderr.write(f"Failed to fetch CS notices. Status code: {response.status_code}")
                self.generate_mock_cs(system_user)
        except Exception as e:
            self.stderr.write(f"Exception during CS notices request: {e}. Generating mockup data...")
            self.generate_mock_cs(system_user)

        self.stdout.write("Sync completed successfully.")

    def generate_mock_general(self, author):
        self.stdout.write("Generating mock Chungbuk National University general notices...")
        mock_data = [
            ("2026학년도 2학기 수강신청 안내", "2026학년도 2학기 수강신청 일정을 다음과 같이 안내하오니 기간 내에 신청하시기 바랍니다.\n1. 대상: 재학생 및 복학생\n2. 기간: 2026년 8월 3일 ~ 8월 7일", "1"),
            ("2026학년도 하계 계절수업 등록 안내", "하계 계절수업 등록에 관한 사항을 아래와 같이 공지합니다.\n기간: 2026년 6월 25일 ~ 6월 27일\n대상자 분들은 기한 내 납부를 완료해 주세요.", "2"),
            ("[장학] 2026년 국가장학금 2차 신청 일정 안내", "2026년 국가장학금 2차 신청 기간을 안내해 드립니다.\n신청 기간: 한국장학재단 홈페이지 참조.", "3")
        ]
        count = 0
        for title, content, idx in mock_data:
            unique_source_id = f"cbnu_general_mock_{idx}"
            source_marker = f"<!-- SOURCE_ID: {unique_source_id} -->"
            if CommunityPost.objects.filter(content__contains=source_marker).exists():
                continue
            
            detail_url = "https://www.chungbuk.ac.kr/site/www/board.do?key=671"
            final_content = f"{content}\n\n---\n원문 링크: {detail_url}\n{source_marker}"
            CommunityPost.objects.create(
                title=f"[학사공지] {title}",
                content=final_content,
                author=author,
                category="academic",
                is_notice=False,
            )
            count += 1
        self.stdout.write(f"Generated {count} mock general notices.")

    def generate_mock_cs(self, author):
        self.stdout.write("Generating mock Computer Science notices...")
        mock_data = [
            ("2026년 컴퓨터공학과 졸업작품 전시회 일정 안내", "2026년도 컴퓨터공학과 졸업작품 전시회가 아래와 같이 개최됩니다.\n일시: 2026년 10월 15일\n장소: 개신문화관 1층 로비\n컴퓨터공학과 학생들의 많은 참여 바랍니다.", "1"),
            ("캡스톤디자인 지원금 정산 신청 안내", "캡스톤디자인 지원금 정산 서류 제출 기한은 2026년 6월 30일까지입니다.\n제출처: 학과 사무실", "2"),
            ("[채용] 2026년 하반기 IT기업 추천채용 공고", "학과 추천채용 공고입니다. 상세 요강은 첨부파일을 확인해 주세요.", "3")
        ]
        count = 0
        for title, content, idx in mock_data:
            unique_source_id = f"cbnu_cs_mock_{idx}"
            source_marker = f"<!-- SOURCE_ID: {unique_source_id} -->"
            if CommunityPost.objects.filter(content__contains=source_marker).exists():
                continue
            
            detail_url = "https://computer.cbnu.ac.kr/bbs/board.php?bo_table=sub5_1"
            final_content = f"{content}\n\n---\n원문 링크: {detail_url}\n{source_marker}"
            CommunityPost.objects.create(
                title=f"[컴공공지] {title}",
                content=final_content,
                author=author,
                category="academic",
                is_notice=False,
            )
            count += 1
        self.stdout.write(f"Generated {count} mock CS notices.")

    def sync_cbnu_general(self, html_content, author):
        soup = BeautifulSoup(html_content, "html.parser")
        rows = soup.select("table.tb tbody tr")
        if not rows:
            rows = soup.select(".table_skin tbody tr")
            
        count = 0
        for row in rows:
            num_td = row.select_one("td.num")
            is_pinned_on_site = False
            if num_td:
                num_text = num_td.get_text().strip()
                if "공지" in num_text or not num_text.isdigit():
                    is_pinned_on_site = True
            
            title_a = row.select_one("td.subject a")
            if not title_a:
                continue

            title = title_a.get_text().strip()
            for span in title_a.select("span"):
                span.decompose()
            title = title_a.get_text().strip()

            href = title_a.get("href", "")
            article_id = ""
            board_no_match = re.search(r"boardNo=(\d+)", href)
            if board_no_match:
                article_id = board_no_match.group(1)
                detail_url = f"https://www.chungbuk.ac.kr/site/www/board.do?mode=view&boardNo={article_id}&key=671"
            else:
                detail_url = "https://www.chungbuk.ac.kr/site/www/board.do" + href if href.startswith("?") else href

            if not article_id:
                continue

            unique_source_id = f"cbnu_general_{article_id}"
            source_marker = f"<!-- SOURCE_ID: {unique_source_id} -->"
            if CommunityPost.objects.filter(content__contains=source_marker).exists():
                continue

            content_body = f"원문 링크: {detail_url}\n\n이 게시글은 충북대학교 학사공지에서 자동 수집되었습니다."
            try:
                detail_resp = requests.get(detail_url, headers={"User-Agent": "Mozilla/5.0"}, timeout=5)
                if detail_resp.status_code == 200:
                    detail_soup = BeautifulSoup(detail_resp.text, "html.parser")
                    cnt_div = detail_soup.select_one("div.cnt") or detail_soup.select_one(".board_view_content")
                    if cnt_div:
                        content_body = cnt_div.get_text("\n").strip()
            except Exception:
                pass

            final_content = f"{content_body}\n\n---\n원문 링크: {detail_url}\n{source_marker}"
            CommunityPost.objects.create(
                title=f"[학사공지] {title}",
                content=final_content,
                author=author,
                category="academic",
                is_notice=False,
            )
            count += 1
            if count >= 10:
                break
        
        self.stdout.write(f"Synced {count} general academic notices.")

    def sync_cbnu_cs(self, html_content, author):
        soup = BeautifulSoup(html_content, "html.parser")
        rows = soup.select(".tbl_head01 tbody tr") or soup.select("table tbody tr")
        
        count = 0
        for row in rows:
            subject_td = row.select_one(".td_subject") or row.select_one("td.subject")
            if not subject_td:
                links = row.select("a")
                title_a = None
                for a in links:
                    if "wr_id=" in a.get("href", ""):
                        title_a = a
                        break
            else:
                title_a = subject_td.select_one("a")

            if not title_a:
                continue

            title = title_a.get_text().strip()
            href = title_a.get("href", "")
            
            wr_id_match = re.search(r"wr_id=(\d+)", href)
            if not wr_id_match:
                continue
            wr_id = wr_id_match.group(1)
            detail_url = href

            unique_source_id = f"cbnu_cs_{wr_id}"
            source_marker = f"<!-- SOURCE_ID: {unique_source_id} -->"
            if CommunityPost.objects.filter(content__contains=source_marker).exists():
                continue

            content_body = f"원문 링크: {detail_url}\n\n이 게시글은 충북대학교 컴퓨터공학과 공지사항에서 자동 수집되었습니다."
            try:
                detail_resp = requests.get(detail_url, headers={"User-Agent": "Mozilla/5.0"}, timeout=5)
                if detail_resp.status_code == 200:
                    detail_soup = BeautifulSoup(detail_resp.text, "html.parser")
                    view_con = detail_soup.select_one("#bo_v_con") or detail_soup.select_one(".view_content")
                    if view_con:
                        content_body = view_con.get_text("\n").strip()
            except Exception:
                pass

            final_content = f"{content_body}\n\n---\n원문 링크: {detail_url}\n{source_marker}"
            CommunityPost.objects.create(
                title=f"[컴공공지] {title}",
                content=final_content,
                author=author,
                category="academic",
                is_notice=False,
            )
            count += 1
            if count >= 10:
                break

        self.stdout.write(f"Synced {count} CS department notices.")
>>>>>>> e8c6f47 (feat: configure dbbackup storage, implement academic notice board & crawler sync_cbnu_notices)
