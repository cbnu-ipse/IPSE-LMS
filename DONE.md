# DONE — PWA 서브도메인을 경로(Route) 형식으로 변환

본 문서에는 이번 개발 주기 동안 완료된 작업 내역을 요약 및 기록합니다.

## 완료된 작업 상세

### 1. PWA 서브도메인의 경로(Route) 기반 단일 도메인 변환
- PWA 환경에서 서브도메인 전환 시 상단 주소표시줄이 사라지지 않는 문제를 해결하기 위해, 기존 `django-hosts` 의존성을 제거하고 서브도메인들을 단일 도메인의 하위 경로(Path) 형식으로 통합했습니다.
- `config/settings.py`에서 `django-hosts` 앱 등록, 관련 미들웨어, 호스트 관련 설정(ROOT_HOSTCONF 등)을 완전히 제거했습니다.
- `config/urls.py`에 기존 서브도메인 전용 앱들을 경로 접두사 하위로 라우팅 처리했습니다:
  - 대회/문제풀이 관련 앱 (`course`, `quiz`, `contest`, `problems`, `compiler`) -> `/judge/` 경로 하위
  - 게임 앱 (`game`) -> `/game/` 경로 하위
- 기존 템플릿의 대규모 링크 수정을 방지하기 위해 `core/templatetags/hosts.py`에 커스텀 `host_url` 템플릿 태그를 구현하여, 템플릿 변경 없이 일반 장고 `reverse`를 호출하도록 역호환성을 구축했습니다.
- 더 이상 사용하지 않는 `config/hosts.py`, `config/urls_community.py`, `config/urls_judge.py`, `config/urls_game.py` 파일들을 삭제했습니다.

---

## 이전 작업 내역 (이전 주기)

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
