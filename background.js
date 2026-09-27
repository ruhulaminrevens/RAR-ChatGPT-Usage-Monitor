/* A single storage writer prevents stale tabs from overwriting newer snapshots. */
'use strict';
importScripts('core.js');
const C = RARCore;
let queue = Promise.resolve();
let checking = null;

async function state() {
  const raw = await chrome.storage.local.get([ ...Object.values(C.KEYS), 'rar_usage_v11', 'rar_ui_v11', 'rar_alert_v11' ]);
  return {
    usage: C.normalizeUsage(raw[C.KEYS.usage] || raw.rar_usage_v11),
    ui: C.normalizeUI(raw[C.KEYS.ui] || raw.rar_ui_v11),
    alerts: raw[C.KEYS.alerts] || raw.rar_alert_v11 || {},
    version: raw[C.KEYS.version] || { latest: chrome.runtime.getManifest().version, checked: 0, status: 'Not checked' }
  };
}

function trusted(sender) {
  if (sender.id !== chrome.runtime.id) return false;
  try {
    const url = new URL(sender.url || sender.tab?.url || '');
    return url.origin === new URL(chrome.runtime.getURL('/')).origin || (url.protocol === 'https:' && (url.hostname === 'chatgpt.com' || url.hostname.endsWith('.chatgpt.com')));
  } catch { return false; }
}

async function checkVersion(manual) {
  if (checking) return checking;
  checking = (async () => {
    const s = await state();
    if (!manual && (!s.ui.updateChecks || Date.now() - (s.version.checked || 0) < 12 * 3600000)) return s.version;
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);
    let version;
    try {
      const r = await fetch(C.VERSION_URL, { cache: 'no-store', credentials: 'omit', redirect: 'error', signal: controller.signal });
      if (!r.ok) throw new Error('Version request failed');
      const text = await r.text();
      if (text.length > 8192) throw new Error('Version response too large');
      const info = JSON.parse(text);
      if (!/^\d+\.\d+\.\d+$/.test(info.version)) throw new Error('Invalid version');
      version = { latest: info.version, checked: Date.now(), status: C.compareVersions(info.version, chrome.runtime.getManifest().version) > 0 ? 'Update available' : 'Up to date' };
    } catch {
      version = { ...s.version, checked: Date.now(), status: 'Check failed · try again later' };
    } finally { clearTimeout(timeout); }
    await chrome.storage.local.set({ [C.KEYS.version]: version });
    return version;
  })();
  try { return await checking; } finally { checking = null; }
}

async function handle(message, sender) {
  if (message.type === 'get-state') return state();
  if (message.type === 'open-usage') {
    // Opening a new tab is only requested by an explicit control click. Never navigate a chat.
    const candidates = await chrome.tabs.query({ url: 'https://chatgpt.com/settings/usage*', ...(sender.tab ? { windowId: sender.tab.windowId } : { currentWindow: true }) });
    const existing = candidates.find(t => C.isUsageRoute(t.url));
    if (existing) { await chrome.tabs.update(existing.id, { active: true }); return {}; }
    await chrome.tabs.create({ url: C.USAGE_URL });
    return {};
  }
  if (message.type === 'check-version') return checkVersion(message.manual === true);
  if (message.type === 'patch-ui') {
    const s = await state();
    const ui = C.normalizeUI({ ...s.ui, ...message.patch });
    await chrome.storage.local.set({ [C.KEYS.ui]: ui });
    return { ui };
  }
  if (message.type === 'clear-usage') {
    const usage = C.normalizeUsage();
    await chrome.storage.local.set({ [C.KEYS.usage]: usage, [C.KEYS.alerts]: {} });
    return { usage };
  }
  if (message.type === 'record-usage') {
    if (typeof message.text !== 'string' || message.text.length > 16000) throw new Error('Invalid usage text');
    const s = await state(), now = Date.now();
    const incoming = C.parseUsageText(message.text, now);
    if (!incoming.five && !incoming.week) throw new Error('Usage values not readable');
    const usage = C.mergeUsage(s.usage, incoming);
    const alerts = { ...s.alerts }, notices = [];
    const rank = { unknown: -1, normal: 0, warning: 1, critical: 2 };
    for (const key of ['five', 'week']) {
      if (!incoming[key]) continue;
      const current = C.level(usage[key].percent), previous = alerts[key] || 'normal';
      if (rank[current] > (rank[previous] ?? 0) && rank[current] > 0) notices.push({ key, level: current, percent: usage[key].percent });
      alerts[key] = current;
    }
    await chrome.storage.local.set({ [C.KEYS.usage]: usage, [C.KEYS.alerts]: alerts });
    return { usage, notices };
  }
  throw new Error('Unsupported action');
}

chrome.runtime.onMessage.addListener((message, sender, reply) => {
  if (!trusted(sender) || !message || typeof message.type !== 'string') return false;
  // Version I/O has its own shared promise; it must not block incoming usage or UI changes.
  const work = message.type === 'check-version' ? handle(message, sender) : (queue = queue.catch(() => {}).then(() => handle(message, sender)));
  work.then(data => reply({ ok: true, data }), error => reply({ ok: false, error: error.message || 'Extension operation failed' }));
  return true;
});
