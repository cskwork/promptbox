---
title: ssh-llm-connect
summary: 코딩 에이전트(Claude Code 등)가 원격 서버에 SSH할 때 read-only 명령만 허용하고 위험한 명령(`rm`, `sudo`, `>`, `systemctl restart`, 패키지 설치)을 차단하는 헬퍼 + PreToolUse 훅 + 자격증명 파일 격리. 원본은 SKILL 포맷이 아니라 일반 레포이므로 여기서 SKILL 포맷으로 재구성.
tags: [skill, ssh, security, claude-code, pre-tool-hook, read-only, guard]
source: https://github.com/cskwork/ssh-llm-connect
author: cskwork
license: MIT
order: 60
trigger: "SSH to prod / 에이전트 원격 접속 / read-only ssh / claude-code ssh guard / ssh-llm-connect"
install: "git clone https://github.com/cskwork/ssh-llm-connect && cd ssh-llm-connect && ./install.sh /path/to/your/project"
---

## 한 줄

LLM 에이전트가 평문 `ssh user@host "rm -rf ..."`를 칠 수 있는 환경에서, **에이전트가 우회할 수 없는** PreToolUse 훅 + 헬퍼의 read-only 가드 + 자격증명 격리로 *정직한 실수*를 막는다.

## 이것은 무엇이 *아닌가*

- **샌드박스 아님.** 클라이언트에 root가 있는 악의적 행위자는 못 막는다.
- **서버 사이드 하드닝 대체 아님.** 진짜 격리는 `ForceCommand` + `authorized_keys` + `rbash` + 전용 read-only SSH 유저.

"AI 에이전트의 정직한 실수에 대한 가드레일" — 그것만으로도 가치 있다.

## 4겹 방어

| Layer | 강제 주체 | 막는 것 |
|---|---|---|
| 1 PreToolUse 훅 | Claude Code 하네스 (에이전트 우회 불가) | 직접 `ssh`/`scp`/`sftp` 호출, bypass 플래그 |
| 2 `permissions.deny` in `settings.json` | Claude Code 하네스 | bypass 플래그 (belt + suspenders) |
| 3 `connect.sh` read-only 가드 | 헬퍼 스크립트 | `rm`/`sudo`/redirect/systemctl write/`curl -X POST`/패키지 설치/`-c` |
| 4 서버 사이드 (사용자가 제공) | `sshd_config`/`authorized_keys` | 그 외 모든 것 |

## 설치

```bash
git clone https://github.com/cskwork/ssh-llm-connect.git
cd ssh-llm-connect
./install.sh /path/to/your/project
```

설치 스크립트가 하는 것:

- `bin/connect.sh` → `<project>/ssh/connect.sh`
- `hosts/_template.env` → `<project>/ssh/hosts/_template.env`
- `hooks/ssh-guard.sh` → `<project>/.claude/hooks/ssh-guard.sh`
- `/ssh/hosts/*.env`를 `<project>/.gitignore`에 추가 (자격증명 commit 방지)
- `<project>/.claude/settings.json`에 붙일 스니펫 출력 (직접 paste; 설치기는 agent config를 자동 편집하지 않음)

## 호스트 추가

```bash
cp ssh/hosts/_template.env ssh/hosts/prod-app.env
$EDITOR ssh/hosts/prod-app.env
```

최소 필드:

```env
SSH_HOST=10.0.0.10
SSH_PORT=22
SSH_USER=deploy
SSH_KEY_PATH=~/.ssh/id_ed25519        # 또는 SSH_PASSWORD=... (sshpass 필요)
```

선택: `SSH_PROXY_JUMP`, `SSH_LOCAL_FORWARD`, `SSH_REMOTE_FORWARD`, `SSH_EXTRA_OPTS`.

## 사용

```bash
# 기본 — read-only 강제
./ssh/connect.sh prod-app "tail -100 /var/log/app.log"
./ssh/connect.sh prod-app "ps aux | grep java"

# 거부됨
./ssh/connect.sh prod-app "rm /tmp/x"
./ssh/connect.sh prod-app "echo hi > /tmp/x"
./ssh/connect.sh prod-app "systemctl restart app"

# 우회 (사람만 — 에이전트는 훅이 차단)
./ssh/connect.sh --shell prod-app
./ssh/connect.sh --allow-write prod-app "systemctl restart app"
```

## 한계

- **패턴 기반**: 결정적 공격자는 base64·eval로 우회 가능. 훅은 표면을 좁힐 뿐
- **클라이언트 사이드만**: Bash 채널 한정. 에이전트 하네스가 Python `paramiko` 같은 비-Bash 네트워크 프리미티브를 허용하면 훅이 못 봄. agent settings에서 따로 deny
- **훅 등록은 수동**: 설치기는 `settings.json`을 자동 편집하지 않음 (그 파일은 agent 권한을 통제하므로 silent 수정 거부)

## SKILL 포맷 (이 항목 자체를 SKILL.md로 쓸 사람용)

````markdown
---
name: ssh-llm-connect
description: Use when an LLM coding agent needs to SSH into remote servers safely. Loads per-host .env files (no credentials inline), refuses dangerous commands via a read-only guard, and registers a Claude Code PreToolUse hook that blocks the agent from bypassing the helper (direct ssh/scp/sftp or --shell / --allow-write flags). Use when the user says "ssh to prod", "read logs on remote", "에이전트가 서버 봐야 함", or has installed this repo.
argument-hint: "<host-slug> \"<read-only shell command>\""
---

# ssh-llm-connect

Safe SSH for LLM coding agents.

## When to use
- Agent needs to read logs / ps / metrics / config on a remote host
- Agent must NOT be able to mutate the remote (production guardrails)
- User has run ./install.sh inside the project, so .claude/hooks/ssh-guard.sh
  and ssh/connect.sh exist

## What this skill does
Always invoke via `./ssh/connect.sh <host-slug> "<command>"`. Never `ssh`/`scp`/
`sftp` directly — the PreToolUse hook will reject and surface why.

If the command is refused by the read-only guard (Layer 3), do NOT add --allow-write
or --shell. Those are bypass flags reserved for humans and the hook will reject
them anyway. Instead, tell the user what was refused and ask them to run it
manually if it really must mutate.

## Defense layers
| Layer | Enforced by                  | Blocks |
| 1     | PreToolUse hook (harness)    | direct ssh/scp/sftp, bypass flags |
| 2     | permissions.deny in settings | bypass flags (belt + suspenders) |
| 3     | connect.sh read-only guard   | rm/sudo/redirect/systemctl write/curl POST/pkg install/-c |
| 4     | server-side (user provides)  | everything else |

## Read-only command rules (Layer 3, summary)
Refused: sudo, su, rm, mv, cp, dd, mkfs, chmod, chown, kill, reboot, passwd,
useradd, mount, iptables, crontab, tee, wget, scp, rsync, eval, exec, source,
`>`, `>>`, `sed -i`, systemctl write subcommands, git push|commit|reset|clean|
checkout|switch|rebase|merge, package managers install|upgrade|update|remove,
curl -X POST|PUT|PATCH|DELETE | -o | -O | --data, language interpreters with -c.

Allowed (by being not refused): cat, ls, grep, awk, sed (no -i), head, tail, wc,
sort, uniq, cut, tr, find, which, env, echo, date, uptime, free, df, du, ps,
top, netstat, ss, ip, hostname, uname, id, whoami, journalctl (read), systemctl
status, git log|status|diff|show, docker ps|logs, kubectl get|describe|logs.

## Host config
ssh/hosts/<slug>.env:
  SSH_HOST=10.0.0.10
  SSH_PORT=22
  SSH_USER=deploy
  SSH_KEY_PATH=~/.ssh/id_ed25519           # or SSH_PASSWORD=...
  SSH_PROXY_JUMP=jumpbox                   # optional
  SSH_LOCAL_FORWARD=8080:127.0.0.1:8080    # optional

## Failure modes
- Hook absent → bash command goes through unguarded. Refuse to ssh and ask the
  user to run ./install.sh first.
- Host slug typo → connect.sh errors with "no such .env". List ssh/hosts/*.env
  to the user.
- Read-only refusal → surface the rule that fired; do NOT retry with --allow-write.
````
