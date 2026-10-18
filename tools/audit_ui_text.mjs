// Enumerate visible canvas text across the complete film. This is a QA tool,
// not a translation pass: executable code and proper names remain in English,
// but any sung English or untranslated UI can be found in the JSON.
// Usage: MV_CHROME_PATH=/tmp/chromium node tools/audit_ui_text.mjs [step=0.5]
import fs from 'node:fs';
import path from 'node:path';
import { chromium } from 'playwright-core';
import { ROOT, startServer } from '../export/server.mjs';

const step = Math.max(0.1, +process.argv[2] || 0.5);
const output = path.join(ROOT, 'out', 'chatgpt_v11_ui_audit.json');
const { server, url } = await startServer({ port: 5185 });
let browser;
try {
  browser = await chromium.launch({
    executablePath: process.env.MV_CHROME_PATH || undefined,
    channel: process.env.MV_CHROME_PATH ? undefined : 'chrome',
    headless: true,
    args: ['--no-sandbox', '--disable-dev-shm-usage', '--enable-webgl', '--use-gl=angle'],
  });
  const page = await browser.newPage();
  const errors = [];
  page.on('console', (msg) => { if (msg.type() === 'error' && !msg.text().startsWith('WebSocket connection to')) errors.push(msg.text()); });
  await page.goto(`${url}/?mode=export&w=480&h=270`);
  await page.waitForFunction(() => window.__mv?.ready, null, { timeout: 90000 });
  const records = await page.evaluate(async (step) => {
    const { Ctx } = await import('/src/engine/draw.js');
    const { localizeUI } = await import('/src/components/ui_zh.js');
    const rows = new Map();
    let time = 0;
    const original = Ctx.prototype.text;
    Ctx.prototype.text = function (value, x, y, opts = {}) {
      const text = String(value ?? '');
      if (text && (opts.alpha ?? 1) > 0.003) {
        const row = rows.get(text) || { source: text, visible: localizeUI(text), first: +time.toFixed(2), count: 0 };
        row.count++;
        rows.set(text, row);
      }
      return original.call(this, value, x, y, opts);
    };
    for (time = -3; time < window.__mv.duration; time += step) window.__mv.renderOnly(time);
    Ctx.prototype.text = original;
    return [...rows.values()].sort((a, b) => a.first - b.first || b.count - a.count);
  }, step);
  fs.mkdirSync(path.dirname(output), { recursive: true });
  fs.writeFileSync(output, JSON.stringify({ step, errors, entries: records }, null, 2) + '\n');
  console.log(`[ui-audit] ${records.length} distinct source strings, ${errors.length} browser text errors -> ${path.relative(ROOT, output)}`);
  for (const err of errors) console.error(`[ui-audit] ${err.slice(0, 320)}`);
  if (process.argv.includes('--preview')) {
    const screenshot = path.join(ROOT, 'out', 'chatgpt_v11_chinese_player.png');
    await page.setViewportSize({ width: 1220, height: 940 });
    await page.goto(`${url}/?t=46`);
    await page.waitForFunction(() => window.__preview?.engine && !document.getElementById('loading').offsetParent, null, { timeout: 90000 });
    await page.screenshot({ path: screenshot, fullPage: true });
    console.log(`[ui-audit] preview screenshot -> ${path.relative(ROOT, screenshot)}`);
  }
} finally {
  if (browser) await browser.close();
  server.close();
}
