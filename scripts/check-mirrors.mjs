#!/usr/bin/env node
/**
 * Fails when an entry's fenced payload has drifted from the upstream file it copies.
 *
 * A catalog entry embeds the original verbatim so the "원문 복사" button yields a
 * drop-in file. That copy does not follow upstream on its own, so an entry opts in
 * by declaring `mirror_of: <raw URL>` in its frontmatter and this check compares them.
 *
 * Exit 0 = every mirror matches (or was skipped for a transient network failure).
 * Exit 1 = at least one payload drifted, or an upstream URL returned an HTTP error.
 */
import { readdir, readFile } from 'node:fs/promises';
import { join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

// fileURLToPath strips the leading slash .pathname leaves on Windows
// (/D:/… would resolve as D:\D:\… and crash readdir).
const CONTENT_ROOT = fileURLToPath(new URL('../src/content/', import.meta.url));
const FETCH_TIMEOUT_MS = 15000;

async function markdownFiles(dir) {
  const found = [];
  for (const item of await readdir(dir, { withFileTypes: true })) {
    const full = join(dir, item.name);
    if (item.isDirectory()) found.push(...(await markdownFiles(full)));
    else if (item.name.endsWith('.md')) found.push(full);
  }
  return found;
}

function frontmatterValue(text, key) {
  // \r? tolerates CRLF checkouts (git autocrlf on Windows) — an LF-only
  // pattern silently matches nothing there and the whole check false-passes.
  const block = text.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  if (!block) return null;
  const line = block[1].match(new RegExp(`^${key}:\\s*(.+)$`, 'm'));
  return line ? line[1].trim().replace(/^["']|["']$/g, '') : null;
}

/** The payload is the outermost fenced block; entries use 4 backticks when the
 *  original itself contains triple-backtick blocks. */
function fencedPayload(text) {
  const body = text.replace(/^---\r?\n[\s\S]*?\r?\n---\r?\n/, '');
  const open = body.match(/^(`{3,})[^\n]*\n/m);
  if (!open) return null;
  const fence = open[1];
  const start = body.indexOf(open[0]) + open[0].length;
  const end = body.indexOf(`\n${fence}`, start);
  return end === -1 ? null : body.slice(start, end);
}

async function fetchUpstream(url) {
  const response = await fetch(url, { signal: AbortSignal.timeout(FETCH_TIMEOUT_MS) });
  if (!response.ok) {
    const error = new Error(`HTTP ${response.status}`);
    error.httpStatus = response.status;
    throw error;
  }
  return response.text();
}

const files = await markdownFiles(CONTENT_ROOT);
const mirrors = [];
for (const file of files) {
  const text = await readFile(file, 'utf8');
  const url = frontmatterValue(text, 'mirror_of');
  if (url) mirrors.push({ file, url, payload: fencedPayload(text) });
}

if (mirrors.length === 0) {
  console.log('check-mirrors: no entries declare mirror_of; nothing to verify.');
  process.exit(0);
}

let failed = 0;
for (const { file, url, payload } of mirrors) {
  const label = relative(process.cwd(), file);
  if (payload === null) {
    console.error(`DRIFT  ${label}\n       declares mirror_of but has no fenced payload`);
    failed++;
    continue;
  }
  let upstream;
  try {
    upstream = await fetchUpstream(url);
  } catch (error) {
    if (error.httpStatus) {
      console.error(`ERROR  ${label}\n       ${url} returned ${error.httpStatus}`);
      failed++;
    } else {
      // A transient network problem must not break an unrelated deploy.
      console.warn(`SKIP   ${label}\n       could not reach ${url} (${error.message})`);
    }
    continue;
  }
  // Normalize CRLF→LF on both sides: a Windows checkout embeds \r\n while
  // upstream raw files use \n; trim() alone does not remove interior \r.
  const norm = (s) => s.replace(/\r\n/g, '\n').trim();
  if (norm(payload) === norm(upstream)) {
    console.log(`OK     ${label}`);
  } else {
    console.error(
      `DRIFT  ${label}\n` +
        `       embedded payload no longer matches ${url}\n` +
        `       embedded ${payload.trim().length} chars, upstream ${upstream.trim().length} chars\n` +
        `       refresh the fenced block from upstream, then rebuild.`,
    );
    failed++;
  }
}

if (failed > 0) {
  console.error(`\ncheck-mirrors: ${failed} of ${mirrors.length} mirrored entr${mirrors.length === 1 ? 'y' : 'ies'} out of date.`);
  process.exit(1);
}
console.log(`check-mirrors: ${mirrors.length} mirrored entr${mirrors.length === 1 ? 'y is' : 'ies are'} current.`);
