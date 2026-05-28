---
title: Autoresearch (uditgoenka/autoresearch)
summary: "목표만 정해주면 AI가 한 번에 하나씩 고치고 직접 점검해서, 좋아지면 남기고 나빠지면 자동으로 되돌리는 작업을 알아서 반복합니다. 테스트 통과율 올리기, 속도 개선, 버그 잡기처럼 숫자로 잴 수 있는 일을 밤새 맡겨둘 수 있어요."
summary_en: "Give the AI a measurable goal and it iterates on its own — one change, one check, keep what helps, revert what doesn't."
tags: [plugin, autoresearch, autonomous-loop, iteration, multi-harness]
source: https://github.com/uditgoenka/autoresearch
author: Udit Goenka
license: MIT
order: 20
harnesses: [Claude Code, OpenCode, OpenAI Codex]
install: "npx skills add uditgoenka/autoresearch (Claude Code) — 다른 하네스는 본문 참조"
---

## 한 줄

"GOAL을 정하면 에이전트가 LOOP를 돌리고, 자고 일어나면 결과가 쌓여있다." Karpathy autoresearch(630줄 Python으로 하룻밤 100개 ML 실험)의 원칙 — 단일 metric(측정 지표) · 제한된 scope(작업 범위) · 빠른 검증 · 자동 rollback(되돌리기) · git as memory(커밋 이력을 기억 저장소로) — 을 임의 도메인으로 확장한 13-커맨드 코딩 에이전트 플러그인.

## 언제 쓰는가

- 측정 가능한 metric이 있고 점진적 개선이 의미 있는 작업 (성능 튜닝, 테스트 통과율, 토큰 절감, 보안 취약점 0)
- 자율 야간/장시간 루프로 N회 반복하며 좋아지면 keep, 나빠지면 git revert
- 단일 변경 → 즉시 검증 → 결과 로깅(TSV, 탭으로 구분된 결과 표) 흐름이 적합한 도메인

## 핵심 루프

```
LOOP (N iterations or until done):
  1. Review state + git history + results log
  2. Pick next change (worked / failed / untried)
  3. Make ONE focused change
  4. Git commit (before verification)
  5. Run mechanical verification (tests, benchmarks, scores)
  6. Improved → keep. Worse → git revert. Crashed → fix or skip.
  7. Log result (TSV)
  8. Repeat
```

모든 개선은 누적되고, 모든 실패는 자동 revert. 진행은 `autoresearch/{subcommand}-{YYMMDD}-{HHMM}/` 아래 TSV로.

## 12개 서브커맨드 상세

### `/autoresearch` — 코어 iterate 루프 (기본 25회)

핵심 엔진. metric을 정의하고 그걸 개선하는 무한 modify→verify→keep/discard 루프.

- **인자**: `Goal: / Scope: / Metric: / Direction: (higher|lower_is_better) / Verify: <shell cmd that outputs a number> / Guard: <safety cmd> / Iterations: N`
- **사전 체크**: git repo / clean working tree / Guard baseline / Verify 명령에 대한 안전 스크리닝 (`rm -rf`, fork bomb, `curl|sh`, 자격증명, outbound writes 차단)
- **Iteration 0**: Verify 실행해 baseline metric 기록 → `autoresearch/loop-{YYMMDD}-{HHMM}/` 생성
- **각 iteration**: ① 결과 TSV + `git log --oneline -20` 리뷰 → ② ONE focused change → ③ `experiment: {desc}` 커밋 → ④ Verify로 delta 측정 → ⑤ Guard 실행 → ⑥ keep / discard (git revert) / crash (revert) 판정
- **TSV 컬럼**: iteration · timestamp · commit · metric · delta · guard · guard-metric · status · description

### `/autoresearch:plan` — goal → 실행 가능한 config (one-shot)

자유 텍스트 goal을 위 코어 루프가 바로 받을 수 있는 `Goal/Scope/Metric/Direction/Verify/Guard/Iterations` 블록으로 변환.

- **7-phase 분석**: ① goal 측정 가능성 분석 → ② 프로젝트 구조 스캔으로 Scope glob 제안 → ③ Metric/Direction 도출 (subjective면 proxy metric 또는 `reason`으로 라우팅 권장) → ④ Verify 명령 작성 + 안전 스크리닝 + dry-run으로 숫자 출력 검증 → ⑤ Guard 제안 (test/typecheck/build) → ⑥ Iterations 추천 (단순 10-15, 보통 20-25, 복합 30+) → ⑦ ready-to-run config 출력
- **출력**: code block 형태의 config + "지금 실행할래 vs 조정할래?" 질문

### `/autoresearch:debug` — 가설-검증-반증 루프 (기본 15회)

과학적 방법으로 버그 헌팅. metric은 "누적 확정 발견 수" (higher_is_better).

- **6 기법**: Binary search(이분 탐색으로 원인 범위를 반씩 좁히기) · Differential · Minimal reproduction · Trace · Pattern search · Working backwards
- **각 iteration**: ① 미검증 vector 식별 → ② 하나의 falsifiable(반증 가능한) hypothesis 작성 ("I hypothesize {X} because {evidence}. Test by {Y}.") → ③ 기법 적용 → ④ confirmed / disproven / inconclusive 분류 → ⑤ file:line 증거 필수
- **TSV 컬럼**: iteration · hypothesis · status · technique · evidence · file_line
- **플래그**: `--fix` (확정 버그를 자동으로 `fix`로 체이닝), `--severity`, `--technique`

### `/autoresearch:fix` — 에러 0까지 단조 감소 (기본 20회)

metric = 에러 카운트, direction = lower_is_better. 한 번에 한 에러씩 죽이는 직선 루프.

- **자동 감지**: 명시 안 하면 test suite / typecheck / linter / build 돌려서 baseline 에러 리스트 수집
- **우선순위**: crash/fatal → test failures → type errors → lint → warnings, 카테고리 안에서는 single-file fix 먼저
- **각 iteration**: ① 최우선 에러 1개 선택 → ② atomic fix → ③ `experiment: fix {error_type} — {desc}` 커밋 → ④ Target 재실행해 delta 확인 → ⑤ Guard 통과? → ⑥ keep / discard (revert) / hook-blocked / metric-error
- **`--from-debug`**: debug 결과(`handoff.json`)를 직접 입력으로
- **종료 조건**: 에러 0 또는 max iterations

### `/autoresearch:security` — STRIDE + OWASP 적대적 감사 (기본 15회)

red-team(공격자 관점에서 취약점을 찾는 역할) 페르소나(Security Adversary · Supply Chain · Insider Threat · Infra Attacker)를 로테이션하며 적대적으로 코드를 공격.

- **Setup**: deps · `.env.example` · Dockerfile · API routes · auth/middleware · DB schema · CI configs 정찰 → 자산 식별 → trust boundary 매핑 → STRIDE 위협 모델 → attack surface map (`overview.md`, `threat-model.md`, `attack-surface-map.md` 생성)
- **각 iteration**: 미테스트 OWASP/STRIDE 카테고리 우선 → 페르소나 채택 → file:line 증거가 있는 finding만 인정 (이론적 fluff 금지) → Critical/High/Medium/Low/Info + OWASP A01-A10 + STRIDE S/T/R/I/D/E 매핑
- **Composite score**: `(owasp_tested/10)*50 + (stride_tested/6)*30 + min(findings, 20)`
- **CI 게이트**: `--fail-on <severity>` 임계치 초과시 exit non-zero, `--diff` (마지막 감사 이후 변경분만), `--fix` (Critical/High만 자동으로 `fix` 체이닝)

### `/autoresearch:ship` — 8-phase 배포 파이프라인 (one-shot)

도메인을 자동 감지(code-pr · code-release · deployment · content · docs · package · config)해 phase별 체크리스트 + 검증 + 배포 + 모니터링까지.

- **8 phases**: Identify → Inventory (git diff / deps / config / migration / breaking) → Checklist (도메인별) → Prepare (test/type/lint/secret 스캔, blocker vs warning 분류) → Dry-Run → Ship (**명시적 사용자 승인 필수**, `--auto`로만 우회) → Verify (smoke test / `--monitor N`분 관찰) → Log
- **체크리스트 예**:
  - *Code PR*: tests pass · types · lint · secrets 없음 · PR desc · reviewers
  - *Release*: version bump · changelog · migration test · rollback plan
  - *Deployment*: env vars · health check · rollback ready · monitoring
- **롤백**: `--rollback`로 마지막 ship action을 자동으로 역재생

### `/autoresearch:scenario` — 12차원 edge case 생성 (기본 20회)

seed 시나리오 하나에서 12 dimension을 round-robin으로 돌며 새 edge case를 생성. **최적화가 아니라 exploration** (metric direction 없음).

- **12 차원**: Happy path · Validation · Permissions · Concurrency · State · Scale · Failure · Security · Integration · Data · UX · Recovery
- **각 iteration**: 다음 dimension 선택 → 3-5개 시나리오 생성 → new / extension / duplicate 분류 → severity 부여
- **Saturation**: 3 연속 iteration이 duplicate만 → 해당 dimension saturated, 다음으로. 모든 dimension saturated → 조기 종료
- **출력**: dimension별 묶은 `scenarios.md` + severity flat list `edge-cases.md`

### `/autoresearch:predict` — 5명 전문가 페르소나 사전 토론 (one-shot)

코드를 짜기 *전에* 여러 시각으로 디자인을 깨보는 단계. depth = shallow(3 persona, 1 round) / standard(5, 2) / deep(8, 3).

- **기본 5 페르소나**: Architect · Security Analyst · Performance Engineer · Reliability Engineer · Devil's Advocate
- **Adversarial 5** (`--adversarial`): Breaker · Cheater · Scaler · Newbie · Malicious Insider
- **6-phase**: 정찰 (파일 inventory · dep graph · API surface · data flow · test coverage) → 페르소나 생성 (각자 격리, shared context 없음) → 독립 분석 (per finding: title · severity · confidence 0-100% · file:line · 권고) → debate (round당 challenge + cross-examination, 반박 증거 없으면 dismiss 금지) → consensus (dedup + 충돌 해소 + **anti-herd: 전원 동의면 synthesizer가 최소 1개 반론 강제**) → severity × confidence × agreement로 랭킹
- **CI 게이트**: `--fail-on <severity>`로 임계 이상 finding 있으면 exit non-zero

### `/autoresearch:learn` — 코드베이스 scout → 문서 생성 → 검증 루프 (기본 10회)

documentation gap을 단조 감소. metric = 유효 문서가 있는 파일 수 (higher_is_better).

- **Mode**: `init` (처음부터 생성) · `update` (기존 갱신) · `check` (검증만, 루프 없음) · `summarize` (1회성 개요만)
- **각 iteration**: ① 미문서 / 노후 / 불완전 우선순위로 gap 식별 → ② 한 파일/모듈 문서화 → ③ 코드 대비 검증 (정확성 · 예제 valid · 링크 작동, doc linter 있으면 실행) → ④ `--no-fix` 아니면 issue 자동 수정 + `docs: document {x}` 커밋
- **출력**: `summary.md` (overview) + `validation-report.md` (issue/수정 내역)

### `/autoresearch:reason` — blind judge 적대적 토론 수렴 (기본 8 round)

측정 불가능한 질문/디자인/주장에 대해 후보안을 토론으로 다듬는 모드.

- **각 round**: ① Author-A 후보 생성 (round 1만 cold start) → ② Critic이 cold start로 최소 3개 약점 + 반론안 제시, **칭찬 금지** → ③ Author-B가 critique 수용한 candidate-B (A의 강점은 유지) → ④ Synthesizer가 A+B 하이브리드 candidate-AB → ⑤ blind judge 패널 (라벨 randomize, 도메인별 criteria, majority vote, tie면 synthesized 승) → ⑥ 수렴 카운트
- **Mode**: `convergent` (incumbent가 N round 연속 우승하면 STOP, 기본 3) · `creative` (자동 종료 없음) · `debate` (synthesis 없음)
- **Oscillation guard**: 최근 8 round에서 incumbent가 5번 이상 바뀌면 조기 종료 권고
- **출력**: 전체 토론 lineage (`lineage.md`) + 최종 winner + 수렴 trajectory

### `/autoresearch:probe` — 8 페르소나 요구사항 심문 (기본 15 round)

코딩 들어가기 전에 spec/요구사항을 saturation까지 캐는 단계. autoresearch 코어 루프의 `Goal/Scope/Metric/Verify` config을 결과물로 뱉음.

- **8 페르소나**: Domain Expert · End User · Skeptic · Edge-Case Hunter · Ops Engineer · Security Reviewer · Contradiction Finder · Scope Guardian (`--adversarial`: Skeptic + Contradiction Finder + Edge-Case Hunter 우선)
- **Mode**: `interactive` (질문을 AskUserQuestion으로 사용자에게) · `autonomous` (코드베이스에서 추론, confidence high/medium/low 라벨링)
- **각 round**: 2-3 페르소나 활성화 → 각 3-5 probing question → 코드 grounding (file:line + 기존 동작 + gap) → 답변에서 atomic constraint 추출 (id · source persona · description · confidence · evidence) → 기존 constraint와 충돌 cross-check
- **Saturation**: 순증 constraint가 threshold (기본 2) 미만 3 round 연속 → SATURATED 조기 종료
- **최종 산출물**: `constraints.md` + 미해결 충돌 `conflicts.md` + **autoresearch 코어 루프용 derived config 블록**

### `/autoresearch:evals` — 결과 TSV 분석 (one-shot)

다른 모든 커맨드가 남긴 `*-results.tsv`를 읽어 trend / plateau / regression / recommendation을 산출하는 메타 분석기. mid-loop `--evals` 체크포인트도 같은 엔진.

- **자동 발견**: 인자 없으면 cwd + `autoresearch/*/`에서 `*-results.tsv` 스캔 (v2.0.03 legacy 위치도 호환)
- **컬럼별 활성 분석**:
  - `metric` → trend direction, 3+ 연속 평탄 = plateau, diminishing returns, biggest jumps
  - `delta` → per-iteration 효율, effort-to-gain
  - `status` → keep/discard rate, crash 빈도, winning streak
  - `severity` → critical 발견율, 분포
  - `hypothesis + status` → confirmation rate, 가장 productive한 technique
  - `commit` → `git diff`와 교차해서 파일 hotspot
  - `dimension` → 12 차원 coverage (X/12)
  - `candidate_label + judge_verdict` → 수렴 속도, oscillation
- **Adaptive interval (mid-loop 체크포인트)**: bounded면 `floor(max/3)` (최소 1), unbounded면 fixed 10, `--evals-interval N`로 override. plateau 3+ 체크포인트 연속이면 조기 종료 권고
- **출력 포맷**: text (콘솔, 기본 30-50줄) · `--format md` (`evals-summary.md`) · `--format json`

## Universal Flags

| Flag | Purpose |
|---|---|
| `Iterations: N` / `Iterations: unlimited` | 루프 횟수 (기본 bounded, 명시적 opt-in으로만 unlimited) |
| `--evals` / `--evals-interval N` | 중간 체크포인트 + 최종 요약 |
| `--chain <targets>` / `--<subcommand>` | 완료 후 순차 핸드오프 (`handoff.json`) |

## 안전 불변식

- 명시적 승인 없이 push / publish / deploy 금지
- 기본은 bounded — `Iterations: unlimited` 명시해야 무한 루프
- 9개 safety hook (dangerous-cmd-block · privacy-block · simplify-gate · scout-block · session-init 등) 동봉
- 모든 결과는 dated 디렉터리에 격리 로깅, `*-results.tsv`를 evals가 읽음

## 함정

- metric이 모호하거나 검증이 느리면 LOOP가 무의미해진다 → `plan` 먼저 돌려 Scope/Metric/Verify를 고정하라
- `Iterations: unlimited`은 코스트/시간 폭주 가능 — 처음엔 작은 N으로 baseline부터
- v2.1.0은 monolithic SKILL.md(813줄)에서 thin router(41줄) + 12개 자급자족 커맨드(94–120줄)로 재설계. **invocation당 토큰 95% 절감** 효과. 이전 버전의 거대 SKILL을 쓰던 워크플로우는 호환 안 됨.
- Claude Code는 설치 후 새 세션 시작 필요 (reference 파일은 같은 세션에서 resolve 안 됨)

## 하네스별 설치

### Claude Code

```bash
# 추천: npx
npx skills add uditgoenka/autoresearch

# 또는 plugin marketplace
/plugin marketplace add uditgoenka/autoresearch
/plugin install autoresearch@autoresearch

# 업데이트
/plugin update autoresearch
# 활성화
/reload-plugins
```

### OpenCode

```bash
git clone https://github.com/uditgoenka/autoresearch.git
cd autoresearch
./scripts/install.sh --opencode --global

# 또는 수동 복사
cp -r autoresearch/.opencode/skills/autoresearch .opencode/skills/autoresearch
cp autoresearch/.opencode/commands/autoresearch*.md .opencode/commands/
```

### OpenAI Codex

`AGENTS.md` + `.agents/` 디렉터리 기반. repo clone 후 Codex CLI가 읽는 위치로 심볼릭 링크/복사. 상세는 [원본 README의 Codex 섹션](https://github.com/uditgoenka/autoresearch#quick-start) 참조.

## 참고

- 원본 영감: [karpathy/autoresearch](https://github.com/karpathy/autoresearch)
- 버전: 2.1.2 (marketplace 정의는 2.1.0)
- License: MIT
