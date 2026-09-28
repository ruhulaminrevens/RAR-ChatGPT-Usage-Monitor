/* Passive native-Usage observer. Never changes ChatGPT history, menus or conversation. */
(() => {
  'use strict';
  if (window.__RAR_USAGE_MONITOR__) return;
  window.__RAR_USAGE_MONITOR__ = true;
  const C = RARCore, HOST = 'rar-chatgpt-usage-widget';
  let state = { usage: C.normalizeUsage(), ui: C.normalizeUI(), version: {} };
  let host, view, resizeObserver, observer, tick, scanTimer, stopped = false, busy = false;
  let lastText = '', lastRead = 0, statusOverride = '', statusError = false, dragging = null;
  const handlers = new AbortController();

  async function send(type, data = {}) {
    try {
      const result = await chrome.runtime.sendMessage({ type, ...data });
      if (!result?.ok) throw new Error(result?.error || 'Extension unavailable');
      return result.data;
    } catch (error) {
      if (/context invalidated|receiving end does not exist|extension unavailable/i.test(error.message)) stop();
      throw error;
    }
  }

  function visible(node) {
    return node instanceof HTMLElement && node.getClientRects().length > 0 && getComputedStyle(node).visibility !== 'hidden';
  }

  function nativeUsageText() {
    const scopes = C.isUsageRoute(location.href)
      ? [document.querySelector('main') || document.body]
      : [...document.querySelectorAll('[role="dialog"],[aria-modal="true"]')];
    for (const scope of scopes) {
      if (!visible(scope)) continue;
      const headings = scope.querySelectorAll('h1,h2,h3,h4,[role="heading"],p,div');
      for (const heading of headings) {
        // Only the native Plan limits section: never a conversation, code sample, or this widget.
        if (heading.closest('article,pre,code,[data-message-author-role],#' + HOST)) continue;
        if (!/^plan\s+limits?$/i.test(heading.textContent.trim()) || !visible(heading)) continue;
        let node = heading.parentElement;
        for (let depth = 0; node && depth < 7 && node !== document.body; depth++, node = node.parentElement) {
          const text = node.innerText || '';
          if (text.length > 16000) break;
          if (/\b5[\s\-–‑]*hour|\bweekly\s+limit/i.test(text)) return text;
          if (node === scope) break;
        }
      }
    }
    return '';
  }

  function render() {
    if (!view) return;
    host.style.setProperty('display', state.ui.hidden ? 'none' : 'block', 'important');
    view.render(state, { status: statusOverride, error: statusError, busy });
    if (!dragging) clampPosition();
  }

  function clampPosition() {
    if (!host || state.ui.hidden) return;
    const box = view.panel.getBoundingClientRect();
    state.ui.top = C.clamp(state.ui.top, 8, Math.max(8, innerHeight - box.height - 8));
    state.ui.right = C.clamp(state.ui.right, 8, Math.max(8, innerWidth - box.width - 8));
    host.style.setProperty('top', state.ui.top + 'px', 'important');
    host.style.setProperty('right', state.ui.right + 'px', 'important');
  }

  async function patch(patch) {
    const result = await send('patch-ui', { patch });
    state.ui = result.ui;
    render();
  }

  function sound(level) {
    if (!state.ui.sound || !navigator.userActivation?.hasBeenActive) return;
    try {
      const Context = window.AudioContext || window.webkitAudioContext;
      if (!Context) return;
      const context = new Context();
      context.resume().then(() => {
        const oscillator = context.createOscillator(), gain = context.createGain();
        oscillator.frequency.value = level === 'critical' ? 880 : 660;
        gain.gain.value = 0.025;
        oscillator.connect(gain); gain.connect(context.destination);
        oscillator.start(); oscillator.stop(context.currentTime + 0.16);
        oscillator.onended = () => context.close().catch(() => {});
      }).catch(() => context.close().catch(() => {}));
    } catch { /* Sound is optional and must never stop usage sync. */ }
  }

  async function readUsage({ manual = false } = {}) {
    if (stopped || busy || (!manual && document.hidden)) return;
    const text = nativeUsageText();
    if (!text) {
      statusOverride = '';
      render();
      if (manual) {
        try { await send('open-usage'); } catch (error) { view.toast(error.message); }
      }
      return;
    }
    if (text === lastText) {
      if (manual) view.toast('Visible values are unchanged. The saved reset countdown is retained.');
      return;
    }
    busy = true; statusOverride = 'Reading visible Usage…'; statusError = false; render();
    try {
      const result = await send('record-usage', { text });
      state.usage = result.usage;
      lastText = text; lastRead = Date.now();
      statusOverride = result.usage.five.observedAt === result.usage.week.observedAt ? 'Read from native Usage · just now' : 'Partial reading · one limit is cached';
      for (const notice of result.notices) {
        if (state.ui.visual) view.toast(`${notice.key === 'five' ? '5-hour' : 'Weekly'} limit: ${notice.percent}% remaining.`);
        sound(notice.level);
      }
    } catch (error) {
      statusOverride = stopped ? 'Extension updated · reload this ChatGPT tab' : 'Usage unreadable · previous snapshot kept';
      statusError = true;
    } finally { busy = false; render(); }
  }

  function scheduleScan() {
    if (stopped || scanTimer || document.hidden) return;
    scanTimer = setTimeout(() => { scanTimer = null; void readUsage(); }, 700);
  }

  async function action(name, value) {
    try {
      if (name === 'refresh') await readUsage({ manual: true });
      if (name === 'open') await send('open-usage');
      if (name === 'mode') { view.closeSettings(); await patch({ mode: state.ui.mode === 'mini' ? 'full' : 'mini' }); }
      if (name === 'hide') await patch({ hidden: true });
      if (name === 'position') await patch({ top: 105, right: 18, mode: 'full', hidden: false });
      if (name === 'layout') render();
      if (name === 'setting') {
        await patch({ [value.key]: value.value });
        if (value.key === 'sound' && value.value) sound('warning');
        if (value.key === 'updateChecks' && value.value) await send('check-version');
      }
      if (name === 'check') { view.toast('Checking GitHub…'); const result = await send('check-version', { manual: true }); view.toast(result.status); }
      if (name === 'clear') {
        const result = await send('clear-usage'); state.usage = result.usage; lastText = ''; statusOverride = '';
        render(); view.toast('Saved usage cleared. Open Usage to sync again.');
      }
    } catch (error) { view.toast(stopped ? 'Extension updated · reload this ChatGPT tab' : error.message); }
  }

  function mount() {
    if (stopped || !document.body || host?.isConnected) return;
    resizeObserver?.disconnect(); view?.destroy();
    document.getElementById(HOST)?.remove();
    host = document.createElement('div'); host.id = HOST;
    for (const [key, value] of Object.entries({ all: 'initial', position: 'fixed', 'z-index': '2147483647', 'color-scheme': 'dark' })) host.style.setProperty(key, value, 'important');
    const shadow = host.attachShadow({ mode: 'open' });
    const link = document.createElement('link'); link.rel = 'stylesheet'; link.href = chrome.runtime.getURL('styles.css');
    link.onload = clampPosition;
    shadow.append(link);
    view = RARView.create(shadow, { onAction: action });
    document.body.append(host);
    view.header.addEventListener('pointerdown', e => {
      if (e.button !== 0 || e.target.closest('button')) return;
      dragging = { id: e.pointerId, x: e.clientX, y: e.clientY, top: state.ui.top, right: state.ui.right };
      view.header.setPointerCapture(e.pointerId);
      e.preventDefault();
    });
    view.header.addEventListener('pointermove', e => {
      if (!dragging || e.pointerId !== dragging.id) return;
      state.ui.top = dragging.top + e.clientY - dragging.y;
      state.ui.right = dragging.right - e.clientX + dragging.x;
      clampPosition();
    });
    const endDrag = () => {
      if (!dragging) return;
      dragging = null;
      void patch({ top: state.ui.top, right: state.ui.right }).catch(() => {});
    };
    view.header.addEventListener('pointerup', endDrag);
    view.header.addEventListener('pointercancel', endDrag);
    view.header.addEventListener('lostpointercapture', endDrag);
    resizeObserver = new ResizeObserver(clampPosition); resizeObserver.observe(view.panel);
    render();
  }

  function onStorage(changes, area) {
    if (area !== 'local' || stopped) return;
    if (changes[C.KEYS.usage]) { state.usage = C.normalizeUsage(changes[C.KEYS.usage].newValue); statusOverride = ''; }
    if (changes[C.KEYS.ui]) state.ui = C.normalizeUI(changes[C.KEYS.ui].newValue);
    if (changes[C.KEYS.version]) state.version = changes[C.KEYS.version].newValue || {};
    render();
  }

  function stop() {
    stopped = true; clearInterval(tick); clearTimeout(scanTimer); observer?.disconnect(); resizeObserver?.disconnect(); handlers.abort();
    try { chrome.storage.onChanged.removeListener(onStorage); } catch { /* Old contexts may no longer have extension APIs. */ }
  }

  (async () => {
    try {
      state = await send('get-state'); mount();
      chrome.storage.onChanged.addListener(onStorage);
      observer = new MutationObserver(records => {
        if (!host?.isConnected) mount();
        if (records.some(r => r.target !== host && !host?.contains(r.target))) scheduleScan();
      });
      observer.observe(document.documentElement, { childList: true, subtree: true, characterData: true });
      addEventListener('resize', clampPosition, { passive: true, signal: handlers.signal });
      addEventListener('popstate', scheduleScan, { signal: handlers.signal });
      addEventListener('hashchange', scheduleScan, { signal: handlers.signal });
      document.addEventListener('visibilitychange', () => { if (!document.hidden) { statusOverride = ''; render(); scheduleScan(); } }, { signal: handlers.signal });
      tick = setInterval(() => {
        if (document.hidden || stopped) return;
        statusOverride = ''; render();
        if (Date.now() - lastRead >= state.ui.minutes * 60000) void readUsage();
        if (state.ui.updateChecks && Date.now() - (state.version.checked || 0) >= 12 * 3600000) void send('check-version').catch(() => {});
      }, 30000);
      scheduleScan();
      if (state.ui.updateChecks) void send('check-version').catch(() => {});
    } catch {
      // Mount a recoverable error instead of leaving an empty toolbar or an uncaught rejection.
      if (!host) mount();
      statusOverride = 'Extension unavailable · reload this ChatGPT tab'; statusError = true; render();
    }
  })();
})();
