# RAR ChatGPT Usage Monitor

![Version](https://img.shields.io/badge/version-v1.2.0-2563eb)
![Manifest](https://img.shields.io/badge/Chrome-Manifest%20V3-4285F4)
![License](https://img.shields.io/badge/license-MIT-22c55e)
![Status](https://img.shields.io/badge/status-stable-22c55e)

A lightweight Chrome/Chromium extension that keeps your ChatGPT **5-hour** and **weekly** usage limits visible while you chat.

## Screenshots

<table>
  <tr>
    <td align="center"><strong>Full widget</strong></td>
    <td align="center"><strong>Settings expanded</strong></td>
  </tr>
  <tr>
    <td align="center"><img src="docs/screenshots/full-widget.png" alt="RAR ChatGPT Usage Monitor full widget" width="355"></td>
    <td align="center"><img src="docs/screenshots/settings-widget.png" alt="RAR ChatGPT Usage Monitor settings expanded" width="345"></td>
  </tr>
</table>

### Mini mode

<img src="docs/screenshots/mini-mode.png" alt="RAR ChatGPT Usage Monitor mini mode" width="245">

## v1.2.0 highlights

- Native **Settings → Usage → Plan limits** sync.
- 5-hour and weekly remaining percentage + reset countdown.
- Full glass widget and compact mini pill mode.
- Warning under 35%; critical under 20%.
- On-screen alerts and optional sound alert.
- Draggable position memory.
- 5 / 10 / 15 / 30 minute refresh choices.
- Optional public GitHub version check — no automatic install and no background service worker.
- Sound is gated behind a browser user gesture to avoid AudioContext errors.
- Fully scoped CSS; it does not style ChatGPT outside the widget.
- Migrates compatible v1.1 local settings/data when possible.

## Installation

1. Download `RAR_ChatGPT_Usage_Monitor_v1.2.0.zip` from the [v1.2.0 release](https://github.com/ruhulaminrevens/RAR-ChatGPT-Usage-Monitor/releases/tag/v1.2.0).
2. Extract it.
3. Open `chrome://extensions/`.
4. Enable **Developer mode**.
5. Click **Load unpacked** and select the extracted folder.
6. Refresh ChatGPT.

Full guide: [docs/INSTALLATION.md](docs/INSTALLATION.md)

## Controls

- `↻` sync now
- `—` compact to mini mode
- `▣` expand from mini mode
- `⚙` alerts, refresh interval and version-check settings
- Drag the widget header to move it

## Update checker

v1.2.0 can optionally check the repository's public `version.json`. If a newer version exists, the widget shows an update badge and a link to the GitHub Releases page. It **does not auto-install** anything.

## Privacy

No password, OpenAI API key, session token, conversation text, or usage value is sent to the project author. See [docs/PRIVACY.md](docs/PRIVACY.md).

## Troubleshooting

See [docs/TROUBLESHOOTING.md](docs/TROUBLESHOOTING.md).

## Release notes

See [RELEASE_v1.2.0.md](RELEASE_v1.2.0.md) and [CHANGELOG.md](CHANGELOG.md).

## License

MIT License.
