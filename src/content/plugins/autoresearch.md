---
title: Autoresearch (uditgoenka/autoresearch)
summary: Karpathy의 autoresearch를 일반화한 자율 개선 루프 플러그인. 12개 커맨드(iterate · plan · debug · fix · security · ship · scenario · predict · learn · reason · probe · evals)로 modify → verify → keep/discard 사이클을 코드/콘텐츠/마케팅 등 측정 가능한 모든 도메인에 적용. Claude Code · OpenCode · OpenAI Codex 지원.
tags: [plugin, autoresearch, autonomous-loop, iteration, multi-harness]
source: https://github.com/uditgoenka/autoresearch
author: Udit Goenka
license: MIT
order: 20
harnesses: [Claude Code, OpenCode, OpenAI Codex]
install: "npx skills add uditgoenka/autoresearch (Claude Code) — 다른 하네스는 본문 참조"
---

## 한 줄

"GOAL을 정하면 에이전트가 LOOP를 돌리고, 자고 일어나면 결과가 쌓여있다." Karpathy autoresearch(630줄 Python으로 하룻밤 100개 ML 실험)의 원칙 — 단일 metric · 제한된 scope · 빠른 검증 · 자동 rollback · git as memory — 을 임의 도메인으로 확장한 13-커맨드 코딩 에이전트 플러그인.

## 언제 쓰는가

- 측정 가능한 metric이 있고 점진적 개선이 의미 있는 작업 (성능 튜닝, 테스트 통과율, 토큰 절감, 보안 취약점 0)
- 자율 야간/장시간 루프로 N회 반복하며 좋아지면 keep, 나빠지면 git revert
- 단일 변경 → 즉시 검증 → 결과 로깅(TSV) 흐름이 적합한 도메인

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

## 12개 서브커맨드

| Command | Does | Default Iterations |
|---|---|---|
| `/autoresearch` | metric 대비 iterate: modify → verify → keep/discard | 25 |
| `/autoresearch:plan` | goal → validated Scope/Metric/Verify config | N/A |
| `/autoresearch:debug` | 가설 → 검증 → 반증 반복으로 버그 사냥 | 15 |
| `/autoresearch:fix` | 에러를 하나씩 0이 될 때까지 처리 | 20 |
| `/autoresearch:security` | STRIDE + OWASP 감사 with red-team personas | 15 |
| `/autoresearch:ship` | 8-phase ship: checklist → dry-run → deploy → verify | N/A |
| `/autoresearch:scenario` | 12차원 edge case 생성 | 20 |
| `/autoresearch:predict` | 5명 전문가 페르소나가 구현 전 토론 | N/A |
| `/autoresearch:learn` | 코드베이스 scout → docs 생성 → validate → fix | 10 |
| `/autoresearch:reason` | blind judge가 수렴까지 adversarial debate | 8 |
| `/autoresearch:probe` | 8 페르소나가 요구사항을 saturation까지 심문 | 15 |
| `/autoresearch:evals` | iteration 결과 분석: trend · plateau · regression | N/A |

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
