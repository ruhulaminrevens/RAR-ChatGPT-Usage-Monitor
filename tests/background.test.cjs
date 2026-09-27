const { test } = require('node:test');
const assert = require('node:assert/strict');
const vm = require('node:vm');
const fs = require('node:fs');

function worker(seed = {}, fetcher = async () => { throw new Error('Offline'); }, existing = []) {
  const data = structuredClone(seed), tabs = [], queries = [];
  let listener;
  const context = vm.createContext({ URL, setTimeout, clearTimeout, AbortController, fetch: fetcher, console });
  context.chrome = {
    runtime: { id: 'test', getManifest: () => ({ version: '1.3.0' }), getURL: path => `chrome-extension://test/${path}`, onMessage: { addListener: cb => { listener = cb; } } },
    storage: { local: {
      get: async keys => { await new Promise(r => setImmediate(r)); return Object.fromEntries(keys.filter(k => k in data).map(k => [k, structuredClone(data[k])])); },
      set: async patch => { await new Promise(r => setImmediate(r)); Object.assign(data, structuredClone(patch)); }
    } },
    tabs: { query: async query => { queries.push(query); return existing; }, create: async tab => tabs.push(tab), update: async id => tabs.push({ activated: id }) }
  };
  context.importScripts = path => vm.runInContext(fs.readFileSync(require.resolve('../' + path), 'utf8'), context);
  vm.runInContext(fs.readFileSync(require.resolve('../background.js'), 'utf8'), context);
  const send = message => new Promise(resolve => listener(message, { id: 'test', url: 'https://chatgpt.com/settings/usage', tab: { windowId: 1 } }, resolve));
  return { send, data, tabs, queries, listener };
}

test('serialized settings patches preserve independent concurrent changes', async () => {
  const w = worker();
  const results = await Promise.all([w.send({ type: 'patch-ui', patch: { minutes: 30 } }), w.send({ type: 'patch-ui', patch: { mode: 'mini' } })]);
  assert.ok(results.every(r => r.ok));
  assert.equal(w.data.rar_ui_v12.minutes, 30); assert.equal(w.data.rar_ui_v12.mode, 'mini');
});
test('concurrent low readings produce one alert transition, not duplicate tab alerts', async () => {
  const w = worker();
  const results = await Promise.all([1,2].map(() => w.send({ type: 'record-usage', text: '5-hour limit\n19% left\nWeekly limit\n90% left' })));
  assert.equal(results.flatMap(r => r.data.notices).length, 1);
  assert.equal(w.data.rar_usage_v12.five.percent, 19);
});
test('parse failures preserve the saved snapshot and a failed operation does not poison the queue', async () => {
  const w = worker();
  await w.send({ type: 'record-usage', text: 'Weekly limit 50% left' });
  const failed = await w.send({ type: 'record-usage', text: 'Loading…' });
  assert.equal(failed.ok, false);
  const result = await w.send({ type: 'get-state' });
  assert.equal(result.data.usage.week.percent, 50);
});
test('legacy migration and clear cache do not revive old values', async () => {
  const w = worker({ rar_usage_v11: { five: { percent: 12 }, updated: 1000 }, rar_ui_v11: { mode: 'mini', sound: true } });
  assert.equal((await w.send({ type: 'get-state' })).data.usage.five.percent, 12);
  await w.send({ type: 'clear-usage' });
  const s = (await w.send({ type: 'get-state' })).data;
  assert.equal(s.usage.five.percent, null); assert.equal(s.ui.mode, 'mini');
});
test('automatic update checks require opt-in', async () => {
  let requests = 0;
  const w = worker({}, async () => { requests++; });
  await w.send({ type: 'check-version' });
  assert.equal(requests, 0);
});
test('update checks are deduplicated and remote links never become navigation targets', async () => {
  let requests = 0;
  const w = worker({}, async (url, options) => {
    requests++; assert.equal(options.credentials, 'omit');
    await new Promise(r => setImmediate(r));
    return { ok: true, text: async () => JSON.stringify({ version: '1.4.0', release_url: 'https://untrusted.invalid' }) };
  });
  const results = await Promise.all([1,2].map(() => w.send({ type: 'check-version', manual: true })));
  assert.equal(requests, 1); assert.equal(results[0].data.status, 'Update available');
  assert.equal(w.data.rar_version_v12.url, undefined);
});
test('offline and malformed version responses report failures without losing saved usage', async () => {
  for (const fetcher of [async () => { throw new Error('offline'); }, async () => ({ ok: true, text: async () => '{"version":"bad"}' })]) {
    const w = worker({}, fetcher);
    assert.match((await w.send({ type: 'check-version', manual: true })).data.status, /Check failed/);
  }
});
test('no tabs open during startup/read/settings, only an explicit open action', async () => {
  const w = worker();
  await w.send({ type: 'get-state' }); await w.send({ type: 'patch-ui', patch: { autoNavigate: true } });
  assert.equal(w.tabs.length, 0);
  await w.send({ type: 'open-usage' });
  assert.equal(w.tabs[0].url, 'https://chatgpt.com/settings/usage?tab=overview');
});
test('messages from other extensions and websites are rejected', () => {
  const w = worker();
  assert.equal(w.listener({ type: 'open-usage' }, { id: 'other', url: 'https://chatgpt.com/' }, () => {}), false);
  assert.equal(w.listener({ type: 'open-usage' }, { id: 'test', url: 'https://evil.invalid/' }, () => {}), false);
});
test('toolbar popup reuses the current window Usage tab instead of creating duplicates', async () => {
  const w = worker({}, undefined, [{ id: 42, url: 'https://chatgpt.com/settings/usage?tab=overview' }]);
  await new Promise(resolve => w.listener({ type: 'open-usage' }, { id: 'test', url: 'chrome-extension://test/popup.html' }, resolve));
  assert.equal(w.queries[0].currentWindow, true);
  assert.equal(w.tabs.length, 1); assert.equal(w.tabs[0].activated, 42);
});
