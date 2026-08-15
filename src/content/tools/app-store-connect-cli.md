---
title: asc (App Store Connect CLI)
summary: "App Store Connect를 터미널에서 다루는 CLI. 빌드 업로드·TestFlight 배포·메타데이터와 스크린샷 동기화·심사 제출까지 스크립트로 굴린다. 에이전트용 스킬 23종이 딸려 온다."
summary_en: "Drive App Store Connect from the terminal — upload builds, ship TestFlight, sync metadata and screenshots, submit for review. Ships 23 agent skills."
tags: [tool, ios, app-store-connect, testflight, release, ci-cd, agent-skills, go]
source: https://github.com/rorkai/App-Store-Connect-CLI
author: rorkai
license: MIT
languages: [Go]
platforms: [macOS, Linux, Windows]
order: 19
install: "brew install asc"
---

## 한 줄

App Store Connect 웹 화면에서 손으로 하던 릴리스 작업 — 빌드 올리기, TestFlight 그룹 배포, 설명·키워드 채우기, 스크린샷 교체, 심사 제출 — 을 **명령어로 바꿔 에이전트나 CI에 넘기는** 도구.

*EN: Turns the click-through App Store Connect release flow into commands your agent or CI can run.*

## 언제 쓰는가

- 릴리스마다 웹 콘솔을 클릭해 메타데이터·스크린샷을 채워 넣고 있을 때
- TestFlight 피드백과 크래시를 정기적으로 훑어야 할 때
- Xcode Cloud나 자체 CI에서 아카이브→업로드→제출을 자동화할 때
- 에이전트에게 "이번 버전 심사 막는 게 뭔지 봐 줘" 같은 걸 시키고 싶을 때 (`asc review doctor`)

## 무엇을 하는가

| 영역 | 명령 |
|---|---|
| 빌드·배포 | `asc builds upload`, `asc builds add-groups`, `asc publish appstore`, `asc publish testflight` |
| TestFlight | `asc testflight feedback list`, `asc testflight crashes list`, `asc testflight groups list` |
| 심사 | `asc validate`, `asc submit status`, `asc review status`, `asc review doctor`, `asc status --watch` |
| 메타데이터 | `asc metadata init/apply/sync`, `asc metadata keywords audit`, `asc localizations list` |
| 스크린샷·미디어 | `asc screenshots plan/apply/upload`, `asc video-previews list` |
| 서명 | `asc certificates list`, `asc profiles list`, `asc bundle-ids list` |
| Xcode 연동 | `asc xcode build/inject/archive/export`, `asc xcode-cloud run` |
| 워크플로 | `asc workflow validate`, `asc workflow run --dry-run` |
| Apple Ads | `asc ads auth login`, `asc ads campaigns find`, `asc ads reports ...` (자격증명이 별도다) |

에이전트 스킬 23종은 별도 저장소(`rorkai/app-store-connect-cli-skills`)에 있고, `asc install-skills`가 **검증된 특정 커밋을 체크아웃해** 전역 스킬 디렉터리에 복사한다. 설치 후 파일 전체를 검증하고, 실패하면 롤백하며, 락 항목을 그 커밋에 고정한다. `git`만 있으면 되고 npm 패키지나 저장소 스크립트를 실행하지 않는다.

## 설치와 사용

```bash
# 설치
brew install asc                              # macOS / Linux (권장)
curl -fsSL https://asccli.sh/install | bash   # 설치 스크립트
winget install --id Rorkai.ASC --exact        # Windows

# 인증 — App Store Connect API 키가 필요하다
# https://appstoreconnect.apple.com/access/integrations/api
asc auth login \
  --name "MyApp" \
  --key-id "ABC123" \
  --issuer-id "DEF456" \
  --private-key /path/to/AuthKey.p8

asc auth status --validate
asc auth doctor

# 에이전트 스킬 설치
asc install-skills

# TestFlight 피드백 / 크래시
asc testflight feedback list --app "123456789" --paginate
asc testflight crashes list --app "123456789" --sort -createdDate --limit 10

# 빌드 업로드 → 베타 그룹 배포
asc builds upload --app "123456789" --ipa "/path/to/MyApp.ipa"
asc builds add-groups --app "123456789" --build-number "42" --version "1.2.3" --group "Internal Testers"

# App Store 공개 (업로드 + 연결 + 제출)
asc publish appstore --app "123456789" --ipa "/path/to/MyApp.ipa" --version "1.2.3" --submit --confirm
asc status --app "123456789" --watch

# 심사 막히는 지점 점검
asc validate --app "123456789" --version "1.2.3"
asc review doctor --app "123456789"

# 메타데이터 — 항상 --dry-run 먼저
asc metadata init --dir "./metadata" --version "1.2.3" --locale "en-US"
asc metadata apply --app "123456789" --version "1.2.3" --dir "./metadata" --dry-run
```

## 함정

- **파괴적인 명령에는 `--confirm`이 붙는다.** 에이전트에게 맡길 때는 `--dry-run`으로 계획을 먼저 뽑아 보게 하고, `--confirm`이 들어간 명령은 사람이 승인하도록 나눠 두자.
- **출력 형식이 실행 환경에 따라 바뀐다.** 터미널이면 `table`, 파이프·파일·CI면 `json`. 스크립트에서는 `--output json`을 명시하거나 `ASC_DEFAULT_OUTPUT`을 고정하자.
- **키체인이 없는 환경**(CI, 헤드리스 셸)에서는 인증이 실패한다. `ASC_BYPASS_KEYCHAIN=1` 또는 `asc auth login --bypass-keychain`으로 설정 파일 기반 인증(`./.asc/config.json`)을 쓴다.
- **`VERSION_LOCALIZATION_ID`는 로케일 코드가 아니다.** `data[].id` 값이지 `attributes.locale`이 아니다 — 스크린샷 업로드에서 가장 흔한 실수.
- **명령별 텔레메트리를 보낸다.** 인자 값·자격증명·앱 ID 같은 건 빼고 명령/플래그 이름만 보낸다고 밝히고 있지만, 원치 않으면 `asc telemetry disable` 또는 `DO_NOT_TRACK=1`.
- `[experimental]` 라벨이 붙은 명령은 변경될 수 있다. CI에 넣기 전에 라벨을 확인하자.
