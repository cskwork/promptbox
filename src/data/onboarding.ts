import type { CategoryKey } from '~/content/config';

/**
 * Developer-picked onboarding kit shown on the homepage ("Start here").
 *
 * ONBOARDING_PICKS lists the hand-picked starter items in reading order; each must
 * resolve to a real, non-hidden content entry (slug + category). DeveloperPicks.astro
 * looks them up and skips any that go missing, so a typo degrades to a smaller grid
 * rather than a build error — but keep these in sync with src/content/.
 */
export interface OnboardingPick {
  category: CategoryKey;
  slug: string;
}

export const ONBOARDING_PICKS: OnboardingPick[] = [
  // orient + plan
  { category: 'skills', slug: 'claude-code-workflow-cheatsheet' },
  { category: 'skills', slug: 'zoom-out' },
  { category: 'skills', slug: 'grill-with-docs' },
  { category: 'skills', slug: 'improve-codebase-architecture' },
  { category: 'skills', slug: 'triage' },
  // super* end-to-end suite
  { category: 'skills', slug: 'supergoal' },
  { category: 'skills', slug: 'superpm' },
  { category: 'skills', slug: 'superdesign' },
  { category: 'skills', slug: 'superoffice' },
  { category: 'skills', slug: 'superhacker' },
  // build your own + infra/CLIs
  { category: 'skills', slug: 'skill-creator' },
  { category: 'skills', slug: 'ssh-llm-connect' },
  { category: 'skills', slug: 'jk-jenkins-cli' },
  { category: 'skills', slug: 'figma-cli' },
  { category: 'tools', slug: 'supertonic-tts' },
  // autonomous loop
  { category: 'plugins', slug: 'autoresearch' },
];

/**
 * The single copy-paste prompt the visitor hands to their coding agent to install
 * (or update) the whole kit at once into a unified ~/.agents/ directory symlinked
 * into every CLI they have.
 *
 * Kept free of backtick characters so it survives this template literal verbatim.
 * KEEP IN SYNC with the fenced payload in
 * src/content/prompts/agents-quick-onboarding.md — that file is the catalog copy.
 */
export const INSTALL_PROMPT = `You are setting up my global AI coding-agent environment. Build ONE shared source of truth at ~/.agents/ and symlink it into every coding CLI I already have installed.

Rules:
- Be idempotent. If something already exists, UPDATE it to the latest version instead of duplicating.
- Never delete my data. Back up any real file you replace to <file>.bak-<timestamp> before symlinking over it.
- Resolve ~ to my home directory on the current OS, and use the matching link command:
    macOS/Linux: ln -s
    Windows (PowerShell): New-Item -ItemType SymbolicLink -- needs Developer Mode or an admin terminal. If neither is available, fall back by target type: a directory -> New-Item -ItemType Junction (no elevation needed); a file -> New-Item -ItemType HardLink (same drive, no elevation); copy only as a last resort and tell me it will not auto-update.
- Do not commit or push anything. Print a summary of created / updated / skipped / backed-up at the end.

1. Create the unified directory
   - ~/.agents/AGENTS.md      my global system prompt (coding rules), shared by every tool
   - ~/.agents/skills/        every skill lives here, one folder per skill containing a SKILL.md
   - ~/.agents/.cache/        clones of the source repos, used for updates
   If ~/.agents/AGENTS.md is missing, fetch the latest from
   https://raw.githubusercontent.com/cskwork/coding-agent-rules/main/AGENTS.md
   If it already exists, keep my edits and just tell me it can be refreshed from that URL.

2. Install or update these skills into ~/.agents/skills/<name>/
   For each: clone into ~/.agents/.cache/ (or git pull if already there), then copy the
   folder that holds SKILL.md to ~/.agents/skills/<name>/ (overwrite to update).
   mattpocock/skills holds four of them — clone it once and copy all four.
     grill-with-docs                github.com/mattpocock/skills  -> skills/engineering/grill-with-docs
     improve-codebase-architecture  github.com/mattpocock/skills  -> skills/engineering/improve-codebase-architecture
     triage                         github.com/mattpocock/skills  -> skills/engineering/triage
     zoom-out                       github.com/mattpocock/skills  -> skills/engineering/zoom-out
     skill-creator                  github.com/anthropics/skills  -> skills/skill-creator
     ssh-llm-connect                github.com/cskwork/ssh-llm-connect        (copy its SKILL.md; run install.sh per project when you need the SSH guard)
     claude-code-workflow-cheatsheet github.com/cskwork/claude-code-workflow-cheatsheet
     jk (Jenkins CLI)               github.com/avivsinai/jenkins-cli          (install the jk binary per its README, then add a SKILL.md so agents can drive it)
     autoresearch                   github.com/uditgoenka/autoresearch        (install per its README; it is a plugin/skill)
   These are whole-repo skills (SKILL.md plus agents/ reference/ templates/) -- copy the ENTIRE repo into ~/.agents/skills/<name>/, not just SKILL.md:
     supergoal                      github.com/cskwork/supergoal-skill
     superpm                        github.com/cskwork/superpm-skill
     superdesign                    github.com/cskwork/superdesign-skill
     superoffice                    github.com/cskwork/superoffice-skills
     superhacker                    github.com/cskwork/superhacker-skill      (authorized security testing / CTF / learning only)

   Command-line tools in the kit (install the binary; no skill folder needed):
     supertonic-tts   npm i -g supertonic-tts    (local text-to-speech CLI)
     figma-cli        npm i -g figma-ds-cli       (Figma design-system CLI; add a SKILL.md wrapper so agents can drive it -> skills/figma-cli)

3. Symlink ~/.agents into every coding CLI I have
   Detect which are installed (config dir present or binary on PATH; use each tool's OS-correct
   config path). For each present tool,
   replace its global rules file with a symlink to ~/.agents/AGENTS.md and, where the tool
   supports a global skills dir, replace it with a symlink to ~/.agents/skills. Back up first.
     Claude Code     ~/.claude/CLAUDE.md            and  ~/.claude/skills
     Codex CLI       ~/.codex/AGENTS.md             and  ~/.codex/skills (if supported)
     Gemini CLI      ~/.gemini/AGENTS.md
     OpenCode        ~/.config/opencode/AGENTS.md
     Antigravity     ~/.antigravity/AGENTS.md       (else drop AGENTS.md per repo)
     Cursor/Windsurf <repo>/AGENTS.md               (per project)
     any other agents.md-compatible CLI -> its global config dir + skills dir
   Skip tools that are not installed and list which you skipped.

4. Verify
   List ~/.agents/skills/, confirm every symlink resolves to ~/.agents, and print the summary.`;
