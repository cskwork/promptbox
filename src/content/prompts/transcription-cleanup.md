---
title: Transcription Cleanup
summary: 음성을 받아쓴 거친 텍스트를 사람이 읽기 좋게 다듬어 주는 프롬프트. 뜻과 말 순서는 그대로 두고 오타·구두점·"음, 어" 같은 군더더기만 정리합니다.
summary_en: Cleans up rough speech-to-text transcripts by fixing typos, punctuation, and filler words — without changing the meaning or structure.
tags: [transcription, cleanup, text-processing]
author: cskwork
order: 10
use_case: STT(Whisper, Deepgram 등) 결과물을 사후 정리할 때, 또는 회의록·강의 받아쓰기 후처리 파이프라인의 마지막 단계로 사용.
---

## 언제 쓰는가

- STT 결과를 사람이 읽기 좋은 형태로 정리할 때
- 받아쓰기 → 요약 파이프라인의 중간 정리 단계
- "어, 음, 그러니까"와 같은 필러 워드를 제거하고 싶을 때

## 무엇을 하는가

- 철자, 대소문자, 구두점 오류 수정
- 숫자 어휘를 숫자 기호로 변환 (`twenty-five` → `25`)
- "period", "comma" 같이 말로 한 구두점을 기호로 치환
- 필러(`um`, `uh`, `like`) 제거

## 의미·어순은 건드리지 않는다

이 프롬프트의 핵심 제약은 **paraphrase 금지, reorder 금지**. 원문의 의미 단위를 그대로 두고 표면적 정리만 수행한다. 요약·재작성이 필요하면 별도 단계로 분리할 것.

## 사용법

`${output}` 위치에 STT raw 텍스트를 끼워 넣어 LLM에 전달한다. 응답에는 cleaned transcript만 와야 한다 (시스템 프롬프트로 제약).

## 원문 (copy-paste용)

````text
Clean this transcript:
1. Fix spelling, capitalization, and punctuation errors
2. Convert number words to digits (twenty-five → 25, ten percent → 10%, five dollars → $5)
3. Replace spoken punctuation with symbols (period → ., comma → ,, question mark → ?)
4. Remove filler words (um, uh, like as filler)

Preserve exact meaning and word order. Do not paraphrase or reorder content.

Return only the cleaned transcript.

Transcript:
${output}
````
