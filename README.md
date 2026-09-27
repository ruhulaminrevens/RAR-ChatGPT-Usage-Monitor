# RAR ChatGPT Usage Monitor

![Version](https://img.shields.io/badge/version-1.3.0-2563eb)
![Manifest](https://img.shields.io/badge/Chrome-Manifest%20V3-4285F4)
![License](https://img.shields.io/badge/license-MIT-22c55e)

A lightweight local monitor for the **5-hour and weekly Work/Codex plan limits** shown in ChatGPT **Settings → Usage**. These limits **do not count ordinary ChatGPT conversations**. This is an independent browser extension, not an official OpenAI product.

## Download and install

[**Download the v1.3.0 extension ZIP**](dist/RAR_ChatGPT_Usage_Monitor_v1.3.0.zip?raw=1) · [SHA256](dist/SHA256SUMS.txt) · [Installation / update guide](docs/INSTALLATION.md)

1. Extract the ZIP. It contains one folder: `RAR_ChatGPT_Usage_Monitor_v1.3.0`.
2. Open `chrome://extensions/`, enable **Developer mode**, and choose **Load unpacked**.
3. Select that folder containing `manifest.json`, then refresh your ChatGPT tabs.
4. Open [ChatGPT Usage](https://chatgpt.com/settings/usage?tab=overview) once. The widget and toolbar popup will share the reading.

**Updating an existing installation?** Replace its files in the **same folder**, then click **Reload** on its extension card. This keeps its extension ID and saved preferences. Do not load a second copy alongside the old one. See the guide before updating.

## What changed in 1.3.0

- Supports the current `/settings/usage?tab=overview` page and native legacy Settings dialogs.
- A real toolbar popup shows cached limits, even outside ChatGPT, and can restore a hidden/off-screen widget.
- Shadow DOM isolates the widget from ChatGPT's CSS; solid, readable panels replace fragile glass styling.
- Cross-tab updates use one storage writer, with field-level settings patches and deduplicated alert transitions.
- Parsed reset durations count down. Expired limits show **refresh needed** instead of inventing a replenished allowance.
- Incomplete or unreadable pages preserve the last valid reading and the timestamp of each limit.
- Mini mode, drag position, alerts and compatible v1.1/v1.2 local preferences are retained.
- Position is clamped using the full panel size after dragging, resize or settings expansion.
- Optional version checks run in the extension worker, use a timeout, and open only the known repository URL.
- Reproducible install ZIP, Node regression tests and Chromium fixture tests are included.

## How sync works

The extension reads the **visible native Plan limits section**. It observes page changes and checks again at your passive refresh interval while the tab is visible. If Usage is not open, the widget shows a timestamped **cached** snapshot.

**Sync / Open Usage** opens a separate Usage tab when necessary. It does not change the current conversation, modify browser history, open settings automatically, or call private usage APIs. Old **Auto-open Usage** preferences are retired. A changed native reading propagates to the popup and every ChatGPT tab. Re-reading unchanged text does not push the reset deadline forward.

A countdown is calculated from the displayed relative reset text, which may be rounded. It is not a server-confirmed reset. Open Usage to obtain a fresh native reading. The monitor supports English native labels; other layouts/languages remain unreadable rather than guessed.

## Controls

| Control | Behavior |
| --- | --- |
| Circular arrow | Read visible native Usage, or open Usage in a separate tab |
| Minus | Switch between full and mini mode |
| Sliders | Open alert, passive refresh and version settings |
| Close | Hide the floating widget; restore it from the extension icon |
| Header drag | Move the widget, keeping it within the viewport |
| Reset position | Restore a visible full widget |
| Clear cached data | Remove saved usage and alert state; keep preferences |

Warning: below 35%. Critical: below 20%. Sound is optional and requires browser user interaction. Unpacked extensions cannot install updates automatically; **Check update** only checks version metadata.

## Privacy and permissions

`storage` keeps percentages, reset text/deadlines, timestamps and preferences in your browser. ChatGPT host access allows native-page reading; `raw.githubusercontent.com` host access supports the optional fixed-URL version check. New installations have automatic version checks and sound **off**; existing explicit preferences are retained. No credentials, conversation content or telemetry are collected. [Privacy details](docs/PRIVACY.md).

Cached readings are shared within one browser profile, including ChatGPT accounts/workspaces used in that profile. They are not account-verified. Clear the cache when switching accounts, or use separate browser profiles. The extension does not provide cloud sync.

## Validation and development

```bash
npm ci --ignore-scripts
npm run validate
npm test
npx playwright install chromium
npm run test:browser
npm run package
```

Node 22+ and Python 3 are development tools only. The installed extension has no npm/runtime framework dependencies. Browser tests load the actual unpacked extension against synthetic ChatGPT fixtures; they do not log in to your account or claim authenticated production coverage. See [validation evidence and limits](docs/VALIDATION.md) and [manual smoke checklist](docs/STABILITY_TEST.md).

[Changelog](CHANGELOG.md) · [Troubleshooting](docs/TROUBLESHOOTING.md) · [Historical v1.2.0 release](https://github.com/ruhulaminrevens/RAR-ChatGPT-Usage-Monitor/releases/tag/v1.2.0)

MIT License.
