/* Loads the actual MV3 extension; all ChatGPT pages below are local synthetic fixtures. */
const { chromium } = require('playwright');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const assert = require('node:assert/strict');
const extension = path.resolve(__dirname, '..');
const profile = fs.mkdtempSync(path.join(os.tmpdir(), 'rar-usage-test-'));
const output = path.join(extension, 'test-results');
fs.mkdirSync(output, { recursive: true });
const usage = `<h1>Usage</h1><section id="limits"><h2>Plan limits</h2><p>Shared across Codex, Work, Workspace Agents, and ChatGPT for Excel.<br>Chat conversations are not included.</p><section><h3>5-hour limit</h3><p>Resets in 5h 0m</p><span id="five-value">100% left</span></section><section><h3>Weekly limit</h3><p>Resets in 6d 7h</p><span id="week-value">90% left</span></section></section><section><h2>Credits</h2><p>0 credits remaining</p></section>`;
const pageHTML = (body) => `<!doctype html><html><head><title>RAR synthetic fixture</title><style>body{background:#0b1018;color:#e5edf8;font:16px system-ui;margin:40px} main{max-width:600px} section{margin-bottom:28px}h1{font-size:32px}h3{font-size:16px}textarea{width:500px;height:80px}button{font:90px serif!important;background:red!important}small{font-size:64px!important}section{border:0}#native-button{font:16px system-ui!important}</style></head><body><main>${body}</main></body></html>`;
const chat = pageHTML(`<h1>Chat fixture</h1><textarea id="composer" aria-label="Message"></textarea><button id="native-button">Native button</button><article data-message-author-role="assistant">${usage}</article>`);
const delay = ms => new Promise(r => setTimeout(r, ms));
async function until(fn, label) {
  for (let i=0; i<60; i++) { if (await fn()) return; await delay(100); }
  throw new Error(`Timed out: ${label}`);
}
(async () => {
  const context = await chromium.launchPersistentContext(profile, {
    channel: 'chromium', headless: true,
    ...(process.env.RAR_CHROMIUM_PATH ? { executablePath: process.env.RAR_CHROMIUM_PATH } : {}),
    args: ['--no-sandbox', `--disable-extensions-except=${extension}`, `--load-extension=${extension}`],
    viewport: { width: 1280, height: 900 }
  });
  let passed = 0;
  const errors = [];
  const mark = label => { passed++; console.log(`PASS ${label}`); };
  context.on('page', p => p.on('pageerror', e => errors.push(e.message)));
  await context.route('https://chatgpt.com/**', route => {
    const url = new URL(route.request().url());
    return route.fulfill({ status: 200, contentType: 'text/html', body: url.pathname === '/settings/usage' ? pageHTML(usage) : chat });
  });
  // Extension-created tabs can bypass the first Playwright route interception.
  // Keep the browser offline so tests can never hit a real account/site, then
  // navigate the now-observed Page through the fixture route explicitly.
  await context.setOffline(true);
  try {
    let worker = context.serviceWorkers()[0];
    if (!worker) worker = await context.waitForEvent('serviceworker');
    const id = new URL(worker.url()).host;
    const popup = await context.newPage();
    await popup.goto(`chrome-extension://${id}/popup.html`);
    await popup.locator('.rar-status').waitFor();
    assert.match(await popup.locator('.rar-status').innerText(), /Open Usage/);
    mark('real MV3 service worker + toolbar popup initialize');
    const send = (type, extra = {}) => popup.evaluate(async ({ type, extra }) => {
      const r = await chrome.runtime.sendMessage({ type, ...extra });
      if (!r.ok) throw new Error(r.error); return r.data;
    }, { type, extra });
    await send('patch-ui', { patch: { updateChecks: false, sound: false } });
    const first = await context.newPage();
    await first.goto('https://chatgpt.com/c/test');
    await first.locator('#rar-chatgpt-usage-widget .rar-card').waitFor();
    await first.locator('#composer').fill('Keep this unsent draft');
    await delay(1100);
    assert.equal((await send('get-state')).usage.updated, null);
    assert.match(await first.locator('.rar-status').innerText(), /Open Usage/);
    mark('conversation headings and pasted usage cannot contaminate saved values');
    assert.equal(await first.locator('#native-button').evaluate(el => getComputedStyle(el).fontSize), '16px');
    assert.equal(await first.locator('[data-action="refresh"]').evaluate(el => getComputedStyle(el).fontSize), '13px');
    mark('Shadow DOM blocks host CSS and extension styles do not leak');
    const opened = context.waitForEvent('page');
    await first.locator('[data-action="refresh"]').click();
    const native = await opened;
    assert.equal(native.url(), 'https://chatgpt.com/settings/usage?tab=overview');
    await native.goto('https://chatgpt.com/settings/usage?tab=overview');
    await native.bringToFront();
    await until(async () => (await send('get-state')).usage.week.percent === 90, 'native usage sync');
    assert.equal(first.url(), 'https://chatgpt.com/c/test');
    assert.equal(await first.locator('#composer').inputValue(), 'Keep this unsent draft');
    assert.equal(await first.locator('[data-metric="five"] [data-percent]').innerText(), '100% left');
    assert.equal(await popup.locator('[data-metric="week"] [data-percent]').innerText(), '90% left');
    mark('modern Usage opens in a separate tab, preserves draft and syncs all views');
    await native.locator('#week-value').evaluate(el => { el.textContent = '18% left'; });
    await until(async () => (await send('get-state')).usage.week.percent === 18, 'changed native value');
    assert.equal(await first.locator('[data-metric="week"] [data-percent]').innerText(), '18% left');
    mark('live native DOM changes update other tabs and low-limit styles');
    const before = (await send('get-state')).usage;
    await native.locator('[data-action="refresh"]').click();
    const after = (await send('get-state')).usage;
    assert.equal(before.five.resetAt, after.five.resetAt);
    assert.equal(before.updated, after.updated);
    mark('unchanged readings do not extend reset deadlines or rewrite storage');
    await native.locator('#week-value').evaluate(el => { el.textContent = 'Loading…'; });
    await native.locator('#five-value').evaluate(el => { el.textContent = '35% left'; });
    await until(async () => (await send('get-state')).usage.five.percent === 35, 'partial update');
    const partial = (await send('get-state')).usage;
    assert.equal(partial.week.percent, 18); assert.equal(partial.week.observedAt, before.week.observedAt);
    mark('partial native loading preserves the cached peer and its timestamp');
    await first.bringToFront();
    await first.locator('[data-action="mode"]').click();
    await until(async () => await first.locator('.rar-card').getAttribute('data-mode') === 'mini', 'mini view');
    assert.equal(await first.locator('.rar-content').isVisible(), false);
    await first.locator('[data-action="settings"]').click();
    assert.equal(await first.locator('.rar-settings').isVisible(), true);
    mark('mini mode and keyboard-labelled settings remain usable');
    await first.screenshot({ path: path.join(output, 'settings.png') });
    await first.locator('[data-action="settings"]').click();
    await first.screenshot({ path: path.join(output, 'mini.png') });
    await first.locator('[data-action="mode"]').click();
    const header = first.locator('.rar-header');
    const rect = await header.boundingBox();
    await first.mouse.move(rect.x + 50, rect.y + 20); await first.mouse.down();
    await first.mouse.move(20, 850, { steps: 8 }); await first.mouse.up();
    await first.setViewportSize({ width: 375, height: 480 });
    await first.locator('[data-action="settings"]').click();
    await delay(200);
    const box = await first.locator('.rar-card').boundingBox();
    assert.ok(box.x >= 7 && box.y >= 7 && box.x + box.width <= 368 && box.y + box.height <= 473, JSON.stringify(box));
    mark('dragging, viewport shrink and expanded settings stay within the viewport');
    await first.screenshot({ path: path.join(output, 'mobile.png') });
    await first.locator('[data-action="hide"]').click();
    await until(async () => !(await first.locator('#rar-chatgpt-usage-widget').isVisible()), 'hidden widget');
    await popup.locator('[data-action="settings"]').click();
    await popup.locator('[data-setting="visible"]').check();
    await until(async () => await first.locator('#rar-chatgpt-usage-widget').isVisible(), 'restored widget');
    mark('toolbar popup restores a hidden widget');
    await Promise.all([send('patch-ui', { patch: { minutes: 30 } }), send('patch-ui', { patch: { mode: 'full' } })]);
    const ui = (await send('get-state')).ui;
    assert.equal(ui.minutes, 30); assert.equal(ui.mode, 'full');
    mark('actual service worker serializes concurrent settings changes');
    await first.evaluate(() => document.getElementById('rar-chatgpt-usage-widget').remove());
    await first.locator('#rar-chatgpt-usage-widget .rar-card').waitFor();
    assert.equal(await first.locator('#rar-chatgpt-usage-widget').count(), 1);
    mark('SPA host removal remounts exactly one widget');
    await first.setViewportSize({ width: 1280, height: 900 });
    await send('patch-ui', { patch: { top: 105, right: 18, mode: 'full' } });
    await first.screenshot({ path: path.join(output, 'full.png') });
    await send('clear-usage');
    await first.evaluate(() => {
      const dialog = document.createElement('div'); dialog.setAttribute('role', 'dialog');
      dialog.innerHTML = '<h2>Settings</h2><section><h3>Plan limits</h3><p>5-hour limit</p><p>Resets in 2h</p><p>22% left</p><p>Weekly limit</p><p>Resets in 3d</p><p>44% left</p></section>';
      document.body.append(dialog);
    });
    await first.bringToFront();
    await until(async () => (await send('get-state')).usage.week.percent === 44, 'legacy dialog');
    mark('legacy native Settings dialog still syncs');
    assert.deepEqual(errors, []);
    mark('no uncaught browser page errors');
    fs.writeFileSync(path.join(output, 'browser-summary.json'), JSON.stringify({ passed, browser: context.browser()?.version(), syntheticFixtures: true, authenticatedChatGPTTested: false, errors }, null, 2));
    console.log(`${passed} browser scenarios passed.`);
  } catch (error) {
    for (const [index,p] of context.pages().entries()) await p.screenshot({ path: path.join(output, `failure-${index}.png`) }).catch(() => {});
    throw error;
  } finally { await context.close(); fs.rmSync(profile, { recursive: true, force: true }); }
})().catch(error => { console.error(error); process.exitCode = 1; });
