#!/usr/bin/env node
/**
 * Fails when INSTALL_PROMPT and its catalog copy disagree.
 *
 * The same prompt ships twice: `INSTALL_PROMPT` in src/data/onboarding.ts feeds the
 * homepage copy button, and the fenced payload in
 * src/content/prompts/agents-quick-onboarding.md is the catalog page. They drifted by
 * 25 lines once, so visitors copied a different prompt depending on where they clicked.
 *
 * The .ts side is a template literal, so it is evaluated rather than string-compared:
 * an unescaped backslash in a Windows path silently disappears at runtime and no
 * textual diff would show it.
 */
import { readFileSync } from 'node:fs';

const TS = 'src/data/onboarding.ts';
const MD = 'src/content/prompts/agents-quick-onboarding.md';

const ts = readFileSync(TS, 'utf8');
const md = readFileSync(MD, 'utf8');

const literal = ts.match(/export const INSTALL_PROMPT = `([\s\S]*?)`;/);
if (!literal) {
  console.error(`ERROR  ${TS}: could not find the INSTALL_PROMPT template literal.`);
  process.exit(1);
}
const fenced = md.match(/```\w*\n([\s\S]*)\n```/);
if (!fenced) {
  console.error(`ERROR  ${MD}: could not find the fenced payload.`);
  process.exit(1);
}

let evaluated;
try {
  // eslint-disable-next-line no-eval -- evaluating our own literal is the only faithful check
  evaluated = eval('`' + literal[1] + '`');
} catch (error) {
  console.error(`ERROR  ${TS}: INSTALL_PROMPT is not a valid template literal — ${error.message}`);
  process.exit(1);
}

const payload = fenced[1];
if (evaluated === payload) {
  console.log(`OK     INSTALL_PROMPT matches ${MD} (${payload.length} chars)`);
  process.exit(0);
}

const a = evaluated.split('\n');
const b = payload.split('\n');
const firstDiff = a.findIndex((line, i) => line !== b[i]);
console.error(
  `DRIFT  INSTALL_PROMPT and its catalog copy disagree.\n` +
    `       ${TS}: ${a.length} lines, ${evaluated.length} chars\n` +
    `       ${MD}: ${b.length} lines, ${payload.length} chars\n` +
    (firstDiff === -1
      ? '       one is a prefix of the other.\n'
      : `       first difference at line ${firstDiff + 1}:\n` +
        `         onboarding.ts: ${JSON.stringify(a[firstDiff] ?? null)}\n` +
        `         catalog.md   : ${JSON.stringify(b[firstDiff] ?? null)}\n`) +
    `       Update both, or regenerate the literal from the catalog payload\n` +
    `       (escape \\\\ then \` then \${ for the template literal).`,
);
process.exit(1);
