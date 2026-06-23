# DONE — 놀이터 기능 개선, 서브도메인 교차 세션/CORS 핫픽스, 모바일 하단바 제거

본 문서에는 이번 개발 주기 동안 완료된 작업 내역을 요약 및 기록합니다.

## 완료된 작업 상세

### 1. 서브도메인 교차 도메인 로그인/로그아웃 및 세션 쿠키 말소 개선
- 로그아웃 동작 시 메인 도메인(`community`)으로의 교차 도메인 비동기 fetch 호출이 브라우저의 CORS 및 쿠키 정책으로 인해 sessionid 삭제(`Set-Cookie`)를 수행하지 못하던 현상을 해결하기 위해, 현재 활성화된 서브도메인의 `/accounts/logout/`으로 향하는 동일 출처(Same-Origin) HTML Form POST 전송 방식으로 변경했습니다. ([templates/base.html](file:///Users/yoohyunwoo/Projects/IPSE-LMS/templates/base.html))
- 로그아웃 직후 강제로 메인 도메인의 로그인 화면(`{% host_url 'login' host 'community' %}`)으로 브라우저를 이동시킵니다.
- 브라우저 뒤로가기 캐시로 인해 로그아웃 상태임에도 로그인된 이전 화면이 노출되는 현상을 완벽히 차단하기 위해 `pageshow` 이벤트 리스너를 활용한 자동 페이지 리로드(`window.location.reload()`) 로직을 탑재했습니다.
- 로그인 폼의 action을 기존 메인 도메인 하드코딩 주소에서 현재 도메인 상대 경로(`action=""`)로 변경하여, `game` 이나 `judge` 서브도메인에서도 크로스 오리진 403 Forbidden 오류 없이 안전하게 통합 로그인이 가능하도록 처리했습니다. ([templates/registration/login.html](file:///Users/yoohyunwoo/Projects/IPSE-LMS/templates/registration/login.html))
- `judge` 등 서브도메인 로그인 이후 대시보드 진입 시 학사공지 API(`sync_notices_api`) 주소를 해석하지 못해 발생하던 `NoReverseMatch` 500 에러를 해결하고자, URL 역인출 방식을 `host_url`로 수정하여 `community` 호스트를 타겟팅하도록 명확히 설정했습니다. ([templates/core/index.html](file:///Users/yoohyunwoo/Projects/IPSE-LMS/templates/core/index.html))

### 2. 놀이터 슬롯머신 로비 인라인 임베딩 및 타이틀 중복 제거
- 놀이터 로비에서 슬롯머신을 인라인 플레이할 때 `?embed=true` 매개변수가 전송되면 슬롯머신 본 페이지(`templates/game/slot_machine.html`)의 타이틀, 설명글, 좌측 아이콘 등의 불필요한 공통 헤더를 숨기도록 분기 처리했습니다.
- 이를 통해 로비의 정보창과 슬롯머신의 정보창이 중복되어 노출되던 미적 결함을 해결하고, 모바일 및 데스크톱에 최적화된 잔여 낙엽 및 오늘 참여 횟수 뱃지만을 상단에 깔끔히 배치했습니다.

### 3. 실시간 로비 채팅 내역 최신순 로딩
- 기존 로비 진입 시 DB의 최초 생성 데이터 50개(가장 오래된 기록)만 고정적으로 불러와 노출되던 쿼리 로직을 수정하여, 최근 작성된 최신 50개 메시지를 역순(`-created_at`)으로 먼저 슬라이싱해 가져온 후 시간 순으로 다시 정렬(Reverse)하여 보여주도록 변경했습니다. ([game/views.py](file:///Users/yoohyunwoo/Projects/IPSE-LMS/game/views.py))

### 4. 모바일 환경 최적화 (채팅 플로팅 버튼화 및 하단 네비게이션 탭 제거)
- 모바일 뷰(화면 너비 1024px 미만)에서 스크린 공간을 과도하게 차지하는 실시간 채팅창을 기본 비활성화(`display: none`)하고, 우측 하단에 고정된 보라색 플로팅 버튼(FAB)을 추가하여 채팅창을 오버레이로 켜고 끌 수 있게 구성했습니다. ([templates/game/lobby.html](file:///Users/yoohyunwoo/Projects/IPSE-LMS/templates/game/lobby.html))
- 모바일 환경의 놀이터 페이지에 불필요하게 영역을 차지하던 하단 3개 탭(커뮤니티, 놀이터, 채점/대회) 네비게이션 바를 제거하여 게임 및 로비 조작 화면의 세로 공간을 극대화했습니다. ([templates/base.html](file:///Users/yoohyunwoo/Projects/IPSE-LMS/templates/base.html))

---

## 이전 작업 내역 (이전 주기)

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
