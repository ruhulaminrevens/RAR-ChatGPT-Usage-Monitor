(async function () {
  'use strict';
  const C = RARCore;
  let state = { usage: C.normalizeUsage(), ui: C.normalizeUI(), version: {} };
  async function send(type, data = {}) {
    const response = await chrome.runtime.sendMessage({ type, ...data });
    if (!response?.ok) throw new Error(response?.error || 'Reload the extension and try again');
    return response.data;
  }
  const view = RARView.create(document.getElementById('popup'), { popup: true, onAction: async (action, value) => {
    try {
      if (action === 'open' || action === 'refresh') await send('open-usage');
      if (action === 'position') await send('patch-ui', { patch: { top: 105, right: 18, mode: 'full', hidden: false } });
      if (action === 'setting') await send('patch-ui', { patch: value.key === 'visible' ? { hidden: !value.value } : { [value.key]: value.value } });
      if (action === 'clear') { await send('clear-usage'); view.toast('Saved usage cleared. Open Usage to sync again.'); }
      if (action === 'check') {
        view.toast('Checking GitHub…');
        const result = await send('check-version', { manual: true }); view.toast(result.status);
      }
    } catch (error) { view.toast(error.message); }
  } });
  try { state = await send('get-state'); view.render(state); } catch (error) { view.render(state, { status: error.message, error: true }); }
  chrome.storage.onChanged.addListener((changes, area) => {
    if (area !== 'local') return;
    if (changes[C.KEYS.usage]) state.usage = C.normalizeUsage(changes[C.KEYS.usage].newValue);
    if (changes[C.KEYS.ui]) state.ui = C.normalizeUI(changes[C.KEYS.ui].newValue);
    if (changes[C.KEYS.version]) state.version = changes[C.KEYS.version].newValue || {};
    view.render(state);
  });
  setInterval(() => view.render(state), 30000);
})();
