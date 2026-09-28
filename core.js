/* Shared, dependency-free data rules. Also used by the Node regression tests. */
(function (root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.RARCore = api;
})(globalThis, function () {
  'use strict';
  const KEYS = { usage: 'rar_usage_v12', ui: 'rar_ui_v12', alerts: 'rar_alert_v12', version: 'rar_version_v12' };
  const USAGE_URL = 'https://chatgpt.com/settings/usage?tab=overview';
  const REPO_URL = 'https://github.com/ruhulaminrevens/RAR-ChatGPT-Usage-Monitor';
  const VERSION_URL = 'https://raw.githubusercontent.com/ruhulaminrevens/RAR-ChatGPT-Usage-Monitor/main/version.json';
  const DEFAULT_UI = { mode: 'full', top: 105, right: 18, minutes: 10, visual: true, sound: false, updateChecks: false, hidden: false };
  const clamp = (n, min, max) => Math.max(min, Math.min(max, n));
  const isPercent = n => typeof n === 'number' && Number.isFinite(n) && n >= 0 && n <= 100;
  const time = n => typeof n === 'number' && Number.isFinite(n) && n > 0 ? n : null;
  const level = p => !isPercent(p) ? 'unknown' : p < 20 ? 'critical' : p < 35 ? 'warning' : 'normal';
  const cleanReset = s => typeof s === 'string' && s.length <= 100 && !/[<>]|weekly limit|updated:|auto:|credits|usage limit resets/i.test(s) ? s.trim() || 'Unknown' : 'Unknown';

  function normalizeUI(raw = {}) {
    const x = raw && typeof raw === 'object' ? raw : {};
    const out = { ...DEFAULT_UI };
    if (x.mode === 'mini') out.mode = 'mini';
    for (const key of ['top', 'right']) if (Number.isFinite(x[key])) out[key] = clamp(x[key], 8, 100000);
    if ([5, 10, 15, 30].includes(x.minutes)) out.minutes = x.minutes;
    for (const key of ['visual', 'sound', 'updateChecks', 'hidden']) if (typeof x[key] === 'boolean') out[key] = x[key];
    return out;
  }

  function normalizeUsage(raw = {}) {
    const x = raw && typeof raw === 'object' ? raw : {};
    const out = { schema: 2, updated: time(x.updated), five: null, week: null };
    for (const key of ['five', 'week']) {
      const m = x[key] || {};
      out[key] = { percent: isPercent(m.percent) ? m.percent : null, reset: cleanReset(m.reset), resetAt: time(m.resetAt), observedAt: time(m.observedAt) || time(x.updated) };
    }
    return out;
  }

  function durationMs(value) {
    const s = String(value || '').toLowerCase().trim().replace(/,/g, ' ').replace(/\band\b/g, ' ');
    const re = /(\d+(?:\.\d+)?)\s*(weeks?|w|days?|d|hours?|hrs?|h|minutes?|mins?|m|seconds?|secs?|s)(?![a-z])/g;
    let total = 0, found = false;
    const residue = s.replace(re, (_, amount, unit) => {
      found = true;
      total += Number(amount) * ({ w: 604800000, d: 86400000, h: 3600000, m: 60000, s: 1000 }[unit[0]]);
      return '';
    });
    return found && !residue.trim() && total <= 8 * 86400000 ? total : null;
  }

  function parseMetric(text, now) {
    const matches = [...text.matchAll(/(-?\d+(?:\.\d+)?)\s*%\s*(left|remaining|used)\b/gi)];
    if (matches.length !== 1 || !isPercent(Number(matches[0][1]))) return null;
    const [, amount, direction] = matches[0];
    const percent = Math.round((direction.toLowerCase() === 'used' ? 100 - Number(amount) : Number(amount)) * 10) / 10;
    const resetMatch = text.match(/\bresets?\s+(?:in\s+)?([^\n]{1,100})/i);
    const reset = cleanReset(resetMatch?.[1]?.replace(/-?\d+(?:\.\d+)?\s*%.*$/, '').replace(/[·|].*$/, '').trim());
    const duration = durationMs(reset);
    return { percent, reset, resetAt: duration === null ? null : now + duration, observedAt: now };
  }

  function parseUsageText(value, now = Date.now()) {
    const text = String(value || '').replace(/\r/g, '').replace(/\u00a0/g, ' ');
    const labels = [...text.matchAll(/\b(5[\s\-–‑]*hours?(?:\s+limit)?|weekly(?:\s+limit)?)\b/gi)];
    const out = { five: null, week: null };
    for (let i = 0; i < labels.length; i++) {
      const label = labels[i];
      const key = /^5/.test(label[0]) ? 'five' : 'week';
      if (out[key]) continue;
      const section = text.slice(label.index + label[0].length, labels[i + 1]?.index ?? text.length)
        .split(/\b(?:credits|daily usage|usage limit resets?|reset history|available resets?)\b/i)[0];
      out[key] = parseMetric(section, now);
    }
    return out;
  }

  function mergeUsage(previous, incoming) {
    const out = normalizeUsage(previous);
    for (const key of ['five', 'week']) {
      const m = incoming?.[key];
      if (m && isPercent(m.percent) && time(m.observedAt) && (!out[key].observedAt || m.observedAt >= out[key].observedAt)) {
        out[key] = { percent: m.percent, reset: cleanReset(m.reset), resetAt: time(m.resetAt), observedAt: m.observedAt };
      }
    }
    out.updated = Math.max(out.five.observedAt || 0, out.week.observedAt || 0) || null;
    return out;
  }

  function formatDuration(ms) {
    let minutes = Math.ceil(Math.max(0, ms) / 60000);
    const days = Math.floor(minutes / 1440); minutes %= 1440;
    const hours = Math.floor(minutes / 60); minutes %= 60;
    return [days ? `${days}d` : '', hours ? `${hours}h` : '', `${minutes}m`].filter(Boolean).join(' ');
  }

  function metricDisplay(m, now = Date.now()) {
    if (m.resetAt && m.resetAt <= now) return { percent: null, reset: 'Reset due · open Usage to refresh', level: 'unknown' };
    return { percent: m.percent, reset: m.resetAt ? `Resets in ${formatDuration(m.resetAt - now)}` : m.reset !== 'Unknown' ? `Reset (last read): ${m.reset}` : 'Reset time unavailable', level: level(m.percent) };
  }

  function ageText(updated, now = Date.now()) {
    if (!updated) return 'Never synced';
    const minutes = Math.max(0, Math.floor((now - updated) / 60000));
    return minutes === 0 ? 'just now' : minutes < 60 ? `${minutes}m ago` : minutes < 1440 ? `${Math.floor(minutes / 60)}h ago` : `${Math.floor(minutes / 1440)}d ago`;
  }

  function compareVersions(a, b) {
    const valid = /^\d+\.\d+\.\d+$/;
    if (!valid.test(a) || !valid.test(b)) return 0;
    const x = a.split('.').map(Number), y = b.split('.').map(Number);
    for (let i = 0; i < 3; i++) if (x[i] !== y[i]) return x[i] > y[i] ? 1 : -1;
    return 0;
  }

  function isUsageRoute(url) {
    try { const u = new URL(url); return /^\/settings\/usage\/?$/i.test(u.pathname) || /^#settings\/usage(?:[/?]|$)/i.test(u.hash); } catch { return false; }
  }

  return { KEYS, USAGE_URL, REPO_URL, VERSION_URL, DEFAULT_UI, clamp, isPercent, level, normalizeUI, normalizeUsage, durationMs, parseUsageText, mergeUsage, formatDuration, metricDisplay, ageText, compareVersions, isUsageRoute };
});
