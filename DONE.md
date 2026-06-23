# DONE — 번개 모임 개선, 설문 공지 핫픽스, 카카오 인앱 차단 및 로그인 화면 하단바 제거

본 문서에는 이번 개발 주기 동안 완료된 작업 내역을 요약 및 기록합니다.

## 완료된 작업 상세

### 1. 취소된 번개 모임에 대한 보안 통제
- 알림 링크를 통한 리다이렉트 시 대상 번개가 이미 취소된(폭파된) 상태라면 경고 알림(`messages.warning`) 발생 후 번개 목록 페이지로 리다이렉트됩니다. ([accounts/views.py](file:///Users/yoohyunwoo/Projects/IPSE-LMS/accounts/views.py))
- 번개 상세 페이지 직접 접근 시에도 취소된 모임일 경우 접근이 거부되고 모임 목록으로 되돌아갑니다. ([community/views.py](file:///Users/yoohyunwoo/Projects/IPSE-LMS/community/views.py))

### 2. 종료된 번개 모임 일정(스케줄) 클린업
- 달력 및 전체 일정 조회 API 로드 시, 이미 종료된(시간이 지난) 번개 일정(`gathering:`) 데이터를 DB에서 일괄 자동 삭제하여 사용자 일정 관리 오버헤드를 완화합니다. ([core/views.py](file:///Users/yoohyunwoo/Projects/IPSE-LMS/core/views.py))
- 번개 모임 생성 및 참가/취소 토글 시, 이미 시간이 지나 종료된 번개 모임인 경우 개인 일정 테이블(`Schedule`)에 동기화 등록되지 않도록 방어 로직을 추가했습니다. ([community/views.py](file:///Users/yoohyunwoo/Projects/IPSE-LMS/community/views.py))

### 3. 번개 목록 페이지 카드 UI 리뉴얼
- 가로 테이블 형태의 리스트 목록을 격자형(Grid) 반응형 카드 레이아웃으로 변경했습니다. ([gathering_list.html](file:///Users/yoohyunwoo/Projects/IPSE-LMS/templates/community/gathering_list.html))
- 스터디, 술, 일반 등 카테고리별 칼라 뱃지 및 인원 현황에 맞춤형 그라디언트 게이지 바를 추가했습니다.
- 본인이 참여 중인 모임은 직관적인 노란색 테두리와 뱃지로 표시되며, 종료된 모임의 경우 흑백 필터와 불투명도를 주어 확연히 구분되도록 미적으로 디자인을 고도화했습니다.

### 4. [HOTFIX] 설문 공지글 중복 노출 차단
- 공지사항 게시판(`board=notice`) 상단의 설문 영역(`active_surveys` 루프) 렌더링 시, 해당 설문 연관 글이 공지글(`is_notice=True`)인 경우 노출되지 않도록 조건을 수정하여 중복 노출을 차단했습니다. ([community_home.html](file:///Users/yoohyunwoo/Projects/IPSE-LMS/templates/community/community_home.html))
- 이로써 설문이 포함된 공지글은 하단 공지 목록에서 `[공지]` 머리말로만 1번 깔끔하게 표현됩니다.

### 5. [HOTFIX] 게시글 상세 페이지 비로그인 접근 허용 및 카카오톡 미리보기 대응
- 외부 카카오톡 스크랩 봇이 링크 수집 시 로그인 화면으로 302 리다이렉트되어 미리보기(Open Graph)가 기본 메인 정보로만 수집되던 문제를 해결하기 위해, `post_detail` 뷰의 `@login_required` 데코레이터를 제거했습니다. ([community/views.py](file:///Users/yoohyunwoo/Projects/IPSE-LMS/community/views.py))
- 비로그인 유저가 상세 페이지 열람 시 에러가 나지 않도록 추천 여부 조회, 설문 관리 권한 판단 분기 처리를 보완했습니다. (단, 댓글 등록/삭제 등 `POST` 쓰기 동작 시에는 로그인 페이지로 리다이렉트 처리)
- 상세 페이지 내 설물조사 영역의 경우 비로그인 사용자에게는 설문 응답 폼 대신 **"설문에 참여하려면 로그인이 필요합니다. [로그인하기]"** 배너가 노출되도록 처리했습니다. ([post_detail.html](file:///Users/yoohyunwoo/Projects/IPSE-LMS/templates/community/post_detail.html))

### 6. [HOTFIX] 로그인 페이지 모바일 탭 바 제거 및 카카오톡 외부 브라우저(앱) 이동 배너 추가
- 로그인 화면에 모바일 하단 네비게이션 탭 바가 그대로 떠 있는 현상을 해결하기 위해 렌더링 조건에 로그인 제외 로직을 적용했습니다. ([base.html](file:///Users/yoohyunwoo/Projects/IPSE-LMS/templates/base.html))
- 카카오톡 인앱 브라우저로 사이트 접속 시, 원활한 서비스 및 로그인 유지를 위해 화면 최상단에 노란색 카카오 연동 배너를 출력하고 **[앱(외부 브라우저)으로 열기]** 버튼 클릭 시 카카오 외부 실행 공식 스키마(`kakaotalk://web/openExternalApp?url=...`)가 작동하도록 로직을 통합했습니다.
