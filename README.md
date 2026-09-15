# RAR ChatGPT Usage Monitor v1.1

A lightweight Chrome/Chromium extension that keeps your ChatGPT usage limits visible while you chat.

## What's new in v1.1

- **Mini pill mode** — compact `5H xx% | W xx%` display.
- **Low-limit warning** — warning state below 35%.
- **Critical warning** — red glow below 20%.
- **Desktop notification** when a limit crosses into warning/critical.
- **Optional sound alert**.
- **Configurable auto-refresh**: 5 / 10 / 15 / 30 minutes.
- **Draggable position memory**.
- Improved glass/blur UI and mobile sizing.
- Uses the current ChatGPT login session; no password or API key is stored.

## What it shows

- 5-hour limit remaining
- 5-hour reset countdown
- Weekly limit remaining
- Weekly reset countdown
- Last sync time/status

## Install

1. Download and extract `RAR_ChatGPT_Usage_Monitor_v1.1.zip`.
2. Open Chrome and go to `chrome://extensions/`.
3. Enable **Developer mode**.
4. Click **Load unpacked**.
5. Choose the extracted `RAR_ChatGPT_Usage_Monitor_v1.1` folder.
6. Open or refresh `https://chatgpt.com/`.

## Controls

- `↻` — sync now
- `—` — switch to mini mode
- `▣` — expand from mini mode
- `⚙` — alert and refresh settings
- Drag the header to move the widget.
- Double-click the widget header to switch between full and mini mode.

## Privacy

The extension does not ask for your ChatGPT password, session token, or OpenAI API key. It reads the usage values rendered in your own logged-in ChatGPT page and stores only the last displayed values/settings in Chrome local storage.

## Compatibility note

ChatGPT's web interface can change. If OpenAI changes the Usage page labels or route, the parser may need an update.

## Version

Current release: **v1.1.0**
