const { test } = require('node:test');
const assert = require('node:assert/strict');
const C = require('../core.js');
const now = 1790525000000;
const sample = 'Plan limits\nShared across Codex, Work, Workspace Agents, and ChatGPT for Excel.\nChat conversations are not included.\n5-hour limit\nResets in 5h 0m\n100% left\nWeekly limit\nResets in 6d 7h\n90% left\nCredits\n0 credits remaining\nUsage limit resets\nAvailable 1';

test('screenshot values are parsed without credits or reset-history contamination', () => {
  const data = C.parseUsageText(sample, now);
  assert.equal(data.five.percent, 100); assert.equal(data.week.percent, 90);
  assert.equal(data.five.resetAt, now + 5 * 3600000);
  assert.equal(data.week.resetAt, now + 151 * 3600000);
});
test('reset and percent on the same line stay separate', () => {
  const data = C.parseUsageText('5-hour limit Resets in 1h 20m 42% left\nWeekly limit Resets in 3d 8h 50% remaining', now);
  assert.equal(data.five.reset, '1h 20m'); assert.equal(data.week.reset, '3d 8h');
});
test('percent used is converted and decimals are preserved', () => {
  assert.equal(C.parseUsageText('5-hour limit 20% used\nWeekly limit 0.5% left', now).five.percent, 80);
  assert.equal(C.parseUsageText('5-hour limit 20% used\nWeekly limit 0.5% left', now).week.percent, 0.5);
});
test('zero is valid; missing, ambiguous and impossible percentages are rejected', () => {
  assert.equal(C.parseUsageText('5-hour limit 0% left', now).five.percent, 0);
  for (const value of ['101% left', '-1% left', '50%', '50% left and 20% left', 'NaN% left']) assert.equal(C.parseUsageText(`5-hour limit ${value}`, now).five, null);
});
test('partial reads retain the other metric with its original age', () => {
  const old = C.mergeUsage({}, C.parseUsageText(sample, now));
  const next = C.mergeUsage(old, C.parseUsageText('5-hour limit\n40% remaining', now + 1000));
  assert.equal(next.five.percent, 40); assert.equal(next.week.percent, 90);
  assert.equal(next.week.observedAt, now); assert.equal(next.updated, now + 1000);
});
test('out-of-order readings cannot overwrite newer metrics', () => {
  const old = C.mergeUsage({}, C.parseUsageText(sample, now));
  assert.equal(C.mergeUsage(old, C.parseUsageText('5-hour limit 1% left', now - 1000)).five.percent, 100);
});
test('reset expiry does not invent replenished allowance', () => {
  const data = C.parseUsageText('5-hour limit\nResets in 1m\n4% left', now).five;
  assert.equal(C.metricDisplay(data, now).percent, 4);
  assert.equal(C.metricDisplay(data, now + 60000).percent, null);
  assert.match(C.metricDisplay(data, now + 60000).reset, /Reset due/);
});
test('duration parsing is strict and deterministic', () => {
  assert.equal(C.durationMs('1 day, 2 hours and 3 minutes'), 93780000);
  assert.equal(C.durationMs('0m'), 0);
  for (const value of ['tomorrow at 2 PM', '25/10/2026', '20 days', '-1h', '2 hours garbage']) assert.equal(C.durationMs(value), null);
});
test('legacy data is sanitized without turning old reset text into a fresh deadline', () => {
  const old = C.normalizeUsage({ updated: now, five: { percent: 42, reset: '3h' }, week: { percent: 500, reset: 'Weekly limit Updated: bad' } });
  assert.equal(old.five.percent, 42); assert.equal(old.five.resetAt, null); assert.equal(old.five.observedAt, now);
  assert.equal(old.week.percent, null); assert.equal(old.week.reset, 'Unknown');
});
test('settings migration accepts only supported values and removes automatic navigation', () => {
  const ui = C.normalizeUI({ mode: 'mini', minutes: 'bad', top: NaN, right: -5, sound: true, autoNavigate: true, updateChecks: false });
  assert.equal(ui.mode, 'mini'); assert.equal(ui.minutes, 10); assert.equal(ui.right, 8);
  assert.equal(ui.sound, true); assert.equal(ui.autoNavigate, undefined);
});
test('unknown cache types cannot break initialization', () => {
  assert.equal(C.normalizeUsage(null).updated, null); assert.equal(C.normalizeUI(null).mode, 'full');
});
test('threshold boundaries remain backward compatible', () => {
  assert.equal(C.level(35), 'normal'); assert.equal(C.level(34.9), 'warning');
  assert.equal(C.level(20), 'warning'); assert.equal(C.level(19.9), 'critical'); assert.equal(C.level(null), 'unknown');
});
test('version checks compare numeric versions and reject untrusted labels', () => {
  assert.equal(C.compareVersions('1.10.0', '1.3.0'), 1);
  assert.equal(C.compareVersions('1.3.0', '1.3.0'), 0);
  assert.equal(C.compareVersions('<script>', '1.3.0'), 0);
});
test('modern and legacy Usage routes work; ordinary conversations do not qualify', () => {
  assert.equal(C.isUsageRoute('https://chatgpt.com/settings/usage?tab=overview'), true);
  assert.equal(C.isUsageRoute('https://chatgpt.com/c/123#settings/Usage'), true);
  assert.equal(C.isUsageRoute('https://chatgpt.com/c/usage'), false);
  assert.equal(C.isUsageRoute('https://chatgpt.com/settings/usage-fake'), false);
});
