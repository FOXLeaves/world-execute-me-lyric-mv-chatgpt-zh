// Generate clearly labelled, non-lyrical text for silent visual QA.
// A real audio + LRC file is still required for the actual music video.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const cfg = JSON.parse(fs.readFileSync(path.join(root, 'config.json'), 'utf8'));
const table = JSON.parse(fs.readFileSync(path.join(root, 'data/lyric_timing.json'), 'utf8'));
const output = path.join(root, cfg.paths.lyrics);
const lines = table.lines.map((line, i) => ({
  start: line.start,
  end: line.end,
  section: line.section,
  emphasis: line.emphasis,
  index: i,
  text: line.emphasis ? 'PREVIEW' : `visual placeholder ${String(i + 1).padStart(3, '0')}`,
}));

fs.mkdirSync(path.dirname(output), { recursive: true });
fs.writeFileSync(output, JSON.stringify({
  source: 'DEMO — NOT SONG LYRICS',
  encoding: 'utf-8',
  hasWordTimestamps: false,
  credits: [],
  meta: { note: 'Replace with your own licensed lyrics before exporting.' },
  sections: table.sections,
  lines,
}, null, 1) + '\n');
console.log(`[demo] wrote ${cfg.paths.lyrics} with ${lines.length} non-lyric placeholders`);
