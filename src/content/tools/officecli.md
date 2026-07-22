---
title: officecli
summary: "docx · xlsx · pptx를 CLI로 만들고 읽고 고친다. 스킬 11종이 따라와서, 에이전트가 재무모델(3표·DCF·LBO)·피치덱·논문·채우는 양식·엑셀 대시보드 같은 문서 종류별 규칙까지 지켜 만들어 낸다."
summary_en: "Create, inspect, and edit .docx/.xlsx/.pptx from the CLI. Ships 11 skills so agents follow per-document-type rules — financial models, pitch decks, academic papers, fillable forms, Excel dashboards."
tags: [tool, office, docx, xlsx, pptx, document, cli, report]
source: https://github.com/iOfficeAI/OfficeCLI
author: iOfficeAI
languages: [Go]
platforms: [macOS, Linux, Windows]
order: 16
install: "brew install officecli"
---

## 한 줄

에이전트가 Office 문서를 "설명"하는 데서 끝나지 않고 **실제 .docx / .xlsx / .pptx 파일로 내놓게** 하는 CLI. 문서 종류별 스킬이 함께 깔려 서식 규칙까지 따른다.

*EN: Agents stop describing the document and start producing the actual file.*

## 언제 쓰는가

- 보고서·기획서·회의록을 Word 파일로 받아야 할 때 (사내 제출물은 마크다운이 안 통한다)
- 수식이 살아 있는 엑셀 재무모델·대시보드가 필요할 때
- 발표 자료를 슬라이드 파일로 뽑아야 할 때
- 기존 문서를 읽어 내용을 추출하거나 서식 문제를 점검할 때

## 무엇을 하는가

기본 CLI로 생성·분석·교정·수정을 하고, 그 위에 문서 종류별 스킬이 얹힌다.

| 스킬 | 무엇에 쓰나 |
|---|---|
| `officecli` | 기본 — 생성·검사·서식 점검·차트 추가 |
| `officecli-docx` / `-xlsx` / `-pptx` | 각 확장자의 기본 규칙 레이어 |
| `officecli-financial-model` | 3표 모델·DCF·LBO·민감도 분석 (수식 기반 xlsx) |
| `officecli-data-dashboard` | KPI 카드·차트·스파크라인이 있는 엑셀 대시보드 |
| `officecli-pitch-deck` | 투자 유치용 덱 (시드~시리즈 C) |
| `officecli-academic-paper` | 논문·학위논문 (APA·IEEE·Chicago, 각주·수식 번호) |
| `officecli-word-form` | 실제 Content Control(SDT)이 들어간 채우는 양식 + 문서 보호 |
| `morph-ppt` / `morph-ppt-3d` | 슬라이드 간 Morph 전환 애니메이션 |

## 설치

```text
brew install officecli                      # macOS / Linux
scoop install officecli                     # Windows
npm install -g @officecli/officecli         # 모든 플랫폼 (플랫폼별 네이티브 바이너리 내려받음)
curl -fsSL https://raw.githubusercontent.com/iOfficeAI/OfficeCLI/main/install.sh | bash
```

## 함정

- **설치 방식을 섞지 말 것.** brew로 깔아 놓고 나중에 npm으로 다시 깔면 PATH에 바이너리가 둘 생기고 엉뚱한 쪽이 먹는다. 업데이트는 처음 깐 방식 그대로.
- 업그레이드 시 감지된 에이전트들의 스킬 파일을 자동으로 갱신한다(`refreshed N skill file(s)`). 스킬 디렉터리를 심링크로 관리 중이라면 업그레이드 후 링크가 멀쩡한지 한 번 확인하는 게 안전하다.
- 스킬이 11종이라 전부 깔면 에이전트 컨텍스트를 제법 차지한다. 실제로 안 쓰는 레이어는 빼거나 `context-diet`으로 정리하자.
