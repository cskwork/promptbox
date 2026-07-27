import { defineCollection, z } from 'astro:content';

const baseFields = {
  title: z.string(),
  title_en: z.string().optional(),
  summary: z.string(),
  summary_en: z.string(),
  tags: z.array(z.string()).default([]),
  source: z.string().url().optional(),
  author: z.string().optional(),
  license: z.string().optional(),
  order: z.number().default(100),
  hidden: z.boolean().default(false),
};

const prompts = defineCollection({
  type: 'content',
  schema: z.object({
    ...baseFields,
    use_case: z.string().optional(),
    use_case_en: z.string().optional(),
  }),
});

const skills = defineCollection({
  type: 'content',
  schema: z.object({
    ...baseFields,
    trigger: z.string().optional(),
    install: z.string().optional(),
  }),
});

const configs = defineCollection({
  type: 'content',
  schema: z.object({
    ...baseFields,
    target_file: z.string().optional(),
    tools: z.array(z.string()).default([]),
  }),
});

const mcps = defineCollection({
  type: 'content',
  schema: z.object({
    ...baseFields,
    server_name: z.string().optional(),
    transport: z.enum(['stdio', 'sse', 'http']).optional(),
  }),
});

const plugins = defineCollection({
  type: 'content',
  schema: z.object({
    ...baseFields,
    harnesses: z.array(z.string()).default([]),
    install: z.string().optional(),
  }),
});

const hooks = defineCollection({
  type: 'content',
  schema: z.object({
    ...baseFields,
    event: z.string().optional(),
    matcher: z.string().optional(),
    scope: z.enum(['project', 'global', 'both']).optional(),
    deps: z.array(z.string()).default([]),
    install: z.string().optional(),
  }),
});

const harnesses = defineCollection({
  type: 'content',
  schema: z.object({
    ...baseFields,
    base_agent: z.string().optional(),
    base_agent_en: z.string().optional(),
    languages: z.array(z.string()).default([]),
    platforms: z.array(z.string()).default([]),
    install: z.string().optional(),
  }),
});

const tools = defineCollection({
  type: 'content',
  schema: z.object({
    ...baseFields,
    languages: z.array(z.string()).default([]),
    platforms: z.array(z.string()).default([]),
    install: z.string().optional(),
  }),
});

const apps = defineCollection({
  type: 'content',
  schema: z.object({
    ...baseFields,
    languages: z.array(z.string()).default([]),
    platforms: z.array(z.string()).default([]),
    install: z.string().optional(),
  }),
});

export const collections = { prompts, skills, configs, mcps, plugins, hooks, harnesses, tools, apps };

/**
 * Canonical display order (home + sidebar both follow this).
 * Keep in sync with COLLECTIONS arrays in pages/layouts.
 */
export const CATEGORY_ORDER = [
  'prompts',
  'skills',
  'plugins',
  'harnesses',
  'hooks',
  'configs',
  'mcps',
  'tools',
  'apps',
] as const;

export type CategoryKey = (typeof CATEGORY_ORDER)[number];

interface CategoryMeta {
  /** Korean label (primary) */
  label: string;
  /** English label (caption) */
  label_en: string;
  /** One-line, beginner-friendly Korean explainer — "what is this category" */
  blurb: string;
  /** English mirror of blurb */
  blurb_en: string;
  /** icon key resolved by CategoryIcon.astro */
  icon: string;
  /** hue key resolved to a `.cat-*` class (see global.css) for wayfinding tint */
  hue: CategoryKey;
}

export const CATEGORY_META: Record<CategoryKey, CategoryMeta> = {
  prompts: {
    label: '프롬프트',
    label_en: 'Prompts',
    blurb: 'LLM 채팅창에 그대로 붙여넣어 쓰는 프롬프트 템플릿.',
    blurb_en: 'Copy-paste prompt templates for any AI chat.',
    icon: 'prompt',
    hue: 'prompts',
  },
  skills: {
    label: '스킬',
    label_en: 'Skills',
    blurb: '에이전트에게 한 가지 작업을 가르치는 설명서(SKILL.md). 특정 문장에 자동 발동한다.',
    blurb_en: 'Single-purpose playbooks (SKILL.md) that teach an agent one task, auto-triggered by a phrase.',
    icon: 'skill',
    hue: 'skills',
  },
  plugins: {
    label: '플러그인',
    label_en: 'Plugins',
    blurb: '여러 스킬·명령을 하나로 묶어 한 번에 설치하는 패키지.',
    blurb_en: 'Bundles of skills and commands you install in one shot.',
    icon: 'plugin',
    hue: 'plugins',
  },
  harnesses: {
    label: '하네스',
    label_en: 'Harnesses',
    blurb: '코딩 에이전트 그 자체, 또는 그 위에 얹는 실행 워크플로우 레이어.',
    blurb_en: 'The coding agent itself, or a workflow layer that runs on top of one.',
    icon: 'harness',
    hue: 'harnesses',
  },
  hooks: {
    label: '훅',
    label_en: 'Hooks',
    blurb: '도구 실행 전후에 끼어들어 막거나 다듬는 자동 스크립트 (예: 위험한 git 명령 차단).',
    blurb_en: 'Scripts that fire before or after a tool runs to block or polish it (e.g. stop a dangerous git command).',
    icon: 'hook',
    hue: 'hooks',
  },
  configs: {
    label: '설정 파일',
    label_en: 'Configs',
    blurb: '에이전트가 시작할 때 통째로 읽는 시스템 프롬프트 파일 (CLAUDE.md · AGENTS.md).',
    blurb_en: 'Whole-file system prompts an agent loads at startup (CLAUDE.md, AGENTS.md).',
    icon: 'config',
    hue: 'configs',
  },
  mcps: {
    label: 'MCP',
    label_en: 'MCP',
    blurb: '에이전트에 외부 도구·데이터를 연결하는 MCP 서버 설정.',
    blurb_en: 'MCP server snippets that wire external tools and data into your agent.',
    icon: 'mcp',
    hue: 'mcps',
  },
  tools: {
    label: '도구',
    label_en: 'Tools',
    blurb: '에이전트 작업을 돕는 별도 CLI·앱 (인덱서, 토큰 절약기 등).',
    blurb_en: 'Standalone CLIs and apps that assist agent work (indexers, token savers, …).',
    icon: 'tool',
    hue: 'tools',
  },
  apps: {
    label: '오픈소스 앱',
    label_en: 'Apps',
    blurb: '1인 기업·스타트업에 유용한 오픈소스 앱·프로덕트 — 위키, 프로젝트 관리, 회의록, 디자인 도구, 채용 도구 등.',
    blurb_en: 'Open-source apps and products for startups and solo founders — wikis, project management, meeting tools, design editors, hiring tools.',
    icon: 'app',
    hue: 'apps',
  },
};
