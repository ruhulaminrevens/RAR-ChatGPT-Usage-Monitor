/* Shared popup/widget UI. Page and remote text is never injected as HTML. */
(function () {
  'use strict';
  const C = RARCore;
  const icons = {
    refresh: '<path d="M20 7v5h-5M4 17v-5h5M6.1 7a7 7 0 0 1 11.6-2L20 8M4 16l2.3 3A7 7 0 0 0 18 17"/>',
    mode: '<path d="M5 12h14"/>', settings: '<path d="M4 7h16M4 17h16M8 4v6M16 14v6"/>',
    close: '<path d="m6 6 12 12M18 6 6 18"/>'
  };
  const icon = name => `<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round">${icons[name]}</svg>`;
  const metric = (key, name) => `<section class="rar-metric" data-metric="${key}"><div class="rar-head"><b>${name}</b><strong data-percent></strong></div><div class="rar-bar" role="progressbar" aria-label="${name} remaining" aria-valuemin="0" aria-valuemax="100"><span></span></div><small data-reset></small><small data-age></small></section>`;

  function create(container, { popup = false, onAction }) {
    const panel = document.createElement('div');
    panel.className = 'rar-card';
    panel.setAttribute('role', 'region');
    panel.setAttribute('aria-label', 'RAR Usage Monitor');
    panel.innerHTML = `<header class="rar-header">
      <div class="rar-title"><span class="rar-brand">RAR</span><b>Usage Monitor</b></div>
      <div class="rar-mini"><b>RAR</b><span data-mini-five></span><span data-mini-week></span></div>
      <div class="rar-nav">
        <button type="button" data-action="refresh" title="Read visible Usage or open Usage in a new tab" aria-label="Sync usage">${icon('refresh')}</button>
        ${popup ? '' : `<button type="button" data-action="mode" title="Compact / full view" aria-label="Compact view">${icon('mode')}</button>`}
        <button type="button" data-action="settings" title="Settings" aria-label="Settings" aria-expanded="false">${icon('settings')}</button>
        ${popup ? '' : `<button type="button" data-action="hide" title="Hide widget; restore from the extension icon" aria-label="Hide widget">${icon('close')}</button>`}
      </div>
    </header>
    <div class="rar-content">
      <p class="rar-status" role="status" aria-live="polite"></p>
      ${metric('five', '5-hour limit')}${metric('week', 'Weekly limit')}
      <p class="rar-scope">Work / Codex plan limits · excludes chat messages</p>
      <div class="rar-footer"><span data-updated></span><button type="button" class="rar-link" data-action="open">Open Usage ↗</button></div>
      <a class="rar-update" hidden href="${C.REPO_URL}" target="_blank" rel="noopener noreferrer"></a>
    </div>
    <section class="rar-settings" hidden aria-label="Monitor settings">
      <label>On-screen alerts<input type="checkbox" data-setting="visual"></label>
      <label>Sound alerts<input type="checkbox" data-setting="sound"></label>
      <label>Passive refresh<select data-setting="minutes" aria-label="Passive refresh interval">${[5,10,15,30].map(n => `<option value="${n}">${n} minutes</option>`).join('')}</select></label>
      <label>Automatic version checks<input type="checkbox" data-setting="updateChecks"></label>
      ${popup ? '<label>Show floating widget<input type="checkbox" data-setting="visible"></label>' : ''}
      <div class="rar-tools"><button type="button" data-action="position">Reset position</button><button type="button" data-action="clear">Clear cached data</button></div>
      <div class="rar-tools"><button type="button" data-action="check">Check update</button><a href="${C.REPO_URL}" target="_blank" rel="noopener noreferrer">GitHub ↗</a></div>
      <p class="rar-version"></p>
      <p class="rar-help">Refresh reads an open Usage page. Open Usage to get new values. Cached data is shared across tabs in this browser profile; clear it when switching accounts. Warning &lt;35% · critical &lt;20%.</p>
    </section>
    <p class="rar-toast" role="status" hidden></p>`;
    container.append(panel);
    const find = selector => panel.querySelector(selector);
    panel.addEventListener('click', e => {
      const action = e.target.closest('[data-action]')?.dataset.action;
      if (!action) return;
      if (action === 'settings') {
        const settings = find('.rar-settings');
        settings.hidden = !settings.hidden;
        find('[data-action="settings"]').setAttribute('aria-expanded', String(!settings.hidden));
        if (!settings.hidden) panel.dataset.mode = 'full';
        onAction('layout');
      } else onAction(action);
    });
    panel.addEventListener('change', e => {
      const key = e.target.dataset.setting;
      if (key) onAction('setting', { key, value: e.target.type === 'checkbox' ? e.target.checked : Number(e.target.value) });
    });
    let toastTimer;
    return {
      panel, header: find('.rar-header'),
      render({ usage, ui, version }, { status, error = false, busy = false } = {}) {
        const now = Date.now();
        panel.dataset.mode = popup || !find('.rar-settings').hidden ? 'full' : ui.mode;
        panel.dataset.error = String(error);
        for (const key of ['five', 'week']) {
          const data = usage[key], display = C.metricDisplay(data, now), row = find(`[data-metric="${key}"]`);
          row.dataset.level = display.level;
          row.querySelector('[data-percent]').textContent = display.percent === null ? '—' : `${display.percent}% left`;
          row.querySelector('[data-reset]').textContent = display.reset;
          row.querySelector('[data-age]').textContent = data.observedAt && now - data.observedAt > ui.minutes * 60000 ? `Last read ${C.ageText(data.observedAt, now)} · refresh needed` : '';
          const bar = row.querySelector('.rar-bar');
          bar.firstElementChild.style.width = `${display.percent ?? 0}%`;
          if (display.percent === null) bar.removeAttribute('aria-valuenow'); else bar.setAttribute('aria-valuenow', String(display.percent));
          bar.setAttribute('aria-valuetext', display.percent === null ? 'Not available' : `${display.percent}% remaining`);
          find(`[data-mini-${key}]`).textContent = `${key === 'five' ? '5H' : 'W'} ${display.percent === null ? '—' : `${display.percent}%`}`;
        }
        find('.rar-status').textContent = status || (usage.updated ? `Cached · ${C.ageText(usage.updated, now)}` : 'Open Usage once to sync your limits');
        find('[data-updated]').textContent = usage.updated ? `Read ${C.ageText(usage.updated, now)}` : 'No saved snapshot';
        find('[data-updated]').title = usage.updated ? new Date(usage.updated).toLocaleString() : '';
        find('[data-action="refresh"]').disabled = busy;
        const mode = find('[data-action="mode"]');
        if (mode) mode.setAttribute('aria-label', ui.mode === 'mini' ? 'Expand view' : 'Compact view');
        for (const el of panel.querySelectorAll('[data-setting]')) {
          const key = el.dataset.setting;
          if (el.type === 'checkbox') el.checked = key === 'visible' ? !ui.hidden : ui[key];
          else el.value = ui[key];
        }
        const current = chrome.runtime.getManifest().version;
        find('.rar-version').textContent = `v${current} · ${version.status || 'Not checked'}`;
        const update = find('.rar-update');
        update.hidden = C.compareVersions(version.latest, current) <= 0;
        update.textContent = `v${version.latest} available · view download ↗`;
      },
      toast(message) {
        clearTimeout(toastTimer);
        const toast = find('.rar-toast'); toast.textContent = message; toast.hidden = false;
        toastTimer = setTimeout(() => { toast.hidden = true; }, 5000);
      },
      closeSettings() { find('.rar-settings').hidden = true; find('[data-action="settings"]').setAttribute('aria-expanded', 'false'); },
      destroy() { clearTimeout(toastTimer); panel.remove(); }
    };
  }
  globalThis.RARView = { create };
})();
