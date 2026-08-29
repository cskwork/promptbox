---
title: NAVER Cloud VPN
summary: "macOS NAVER Cloud SSL VPN을 화면 자동화 없이 점검하고, 사용자가 승인한 경우에만 인증과 연결을 실행하는 Python 스킬입니다."
summary_en: "Inspect, authenticate, and connect NAVER Cloud SSL VPN on macOS without GUI automation, while keeping credentials in a private local file."
tags: [skill, naver-cloud, vpn, macos, openvpn, security, python]
source: https://github.com/cskwork/naver-cloud-vpn-skill
mirror_of: https://raw.githubusercontent.com/cskwork/naver-cloud-vpn-skill/main/SKILL.md
author: cskwork
order: 70
trigger: "NAVER Cloud SSL VPN / 네이버 클라우드 VPN 연결 / VPN 자격증명 확인 / naver-cloud-vpn"
install: "git clone https://github.com/cskwork/naver-cloud-vpn-skill ~/.codex/skills/naver-cloud-vpn"
---

## 한 줄

설치된 NAVER Cloud SSL VPN 프로필을 읽고, GUI 자동화(화면을 대신 누르는 방식) 없이 Python으로 상태 점검·인증 확인·연결을 수행합니다. ID와 비밀번호는 채팅이나 명령 인자에 넣지 않고 권한 `0600`의 로컬 `.env`에만 둡니다.

## 언제 쓰는가

- `--check`: 자격증명을 읽지 않는 연결 준비 상태 점검
- `--auth-check`: 사용자가 명시적으로 요청한 경우에만 TLS(서버 인증서를 검증하는 암호화 통신) 엔드포인트로 자격증명 전송
- `--connect`: 사용자가 바로 전에 승인하고 `sudo` 인증을 준비한 경우에만 OpenVPN(암호화된 VPN 터널 프로그램) 실행

## 주의

`AUTH_OK`는 자격증명 확인만 뜻합니다. `CONNECTED`는 OpenVPN 프로세스가 터널 초기화를 마쳤다는 뜻입니다. 실제 경로와 내부 서비스 접근은 별도로 확인해야 합니다. 프로필 별칭(alias: 설치된 프로필의 표시 이름)은 사용자의 `alias.json`에 있는 정확한 값을 써야 합니다.

````markdown
---
name: naver-cloud-vpn
description: Use when a user asks to inspect, verify credentials for, connect, or troubleshoot the installed NAVER Cloud SSL VPN client on macOS without GUI automation.
---

# NAVER Cloud VPN

Use the bundled Python script. It mirrors the installed client's existing-profile flow without Computer Use, AppleScript, shell interpolation, disabled TLS, or leaving its temporary OpenVPN authentication file behind.

## Authorization

- `--check` is read-only. It does not read `.env` or authenticate.
- `--auth-check` sends the configured ID and password to the TLS-verified endpoint specified by the installed profile. Run it only when the user explicitly requests credential verification.
- Ask for confirmation immediately before `--connect`. It changes network access and invokes the bundled OpenVPN through cached `sudo` authorization.
- Never accept credentials in chat, command arguments, process environment variables, or logs.

## Local configuration

Store this file at `~/.config/naver-cloud-vpn/.env` with mode `0600`:

```dotenv
NAVER_VPN_PROFILE=Example VPN
NAVER_VPN_USERNAME=your-id
NAVER_VPN_PASSWORD=your-password
```

Use an exact alias from the installed client's `alias.json`. OTP is never stored. If the server requires OTP, `--connect` asks through `getpass` in the user's terminal and refuses non-interactive input.

## Commands

```bash
python3 ~/.codex/skills/naver-cloud-vpn/scripts/naver_vpn.py --check --profile "Example VPN"
python3 ~/.codex/skills/naver-cloud-vpn/scripts/naver_vpn.py --auth-check
sudo -v  # user runs this in a terminal immediately before an approved connection
python3 ~/.codex/skills/naver-cloud-vpn/scripts/naver_vpn.py --connect
```

The connection stays attached to the command. `Ctrl+C` stops it. The script refuses an occupied OpenVPN management port and removes temporary profile and authentication files on every handled exit.

Treat `AUTH_OK` as credential proof only. Treat `CONNECTED` as tunnel-process proof only. Route behavior remains unverified unless separately checked.

````
