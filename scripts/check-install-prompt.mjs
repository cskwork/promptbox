#!/usr/bin/env node
/** Fail when the catalog's fenced onboarding prompt drifts from its raw source. */
import { readFileSync } from "node:fs";

const SOURCE = "src/data/pi-setup-prompt.txt";
const CATALOG = "src/content/prompts/agents-quick-onboarding.md";

const source = readFileSync(SOURCE, "utf8").trimEnd();
const catalog = readFileSync(CATALOG, "utf8");
const fenced = catalog.match(/```text\n([\s\S]*?)\n```/);

if (!fenced) {
  console.error(`ERROR  ${CATALOG}: could not find the fenced text payload.`);
  process.exit(1);
}

const payload = fenced[1];
if (source === payload) {
  console.log(
    `OK     setup prompt matches ${CATALOG} (${source.length} chars)`,
  );
  process.exit(0);
}

const a = source.split("\n");
const b = payload.split("\n");
const firstDiff = a.findIndex((line, i) => line !== b[i]);
console.error(
  `DRIFT  setup prompt and catalog copy disagree.\n` +
    `       ${SOURCE}: ${a.length} lines, ${source.length} chars\n` +
    `       ${CATALOG}: ${b.length} lines, ${payload.length} chars\n` +
    (firstDiff === -1
      ? "       one is a prefix of the other.\n"
      : `       first difference at line ${firstDiff + 1}:\n` +
        `         source : ${JSON.stringify(a[firstDiff] ?? null)}\n` +
        `         catalog: ${JSON.stringify(b[firstDiff] ?? null)}\n`),
);
process.exit(1);
