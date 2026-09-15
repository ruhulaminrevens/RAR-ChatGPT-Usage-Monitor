# RAR ChatGPT Usage Monitor v1.1.1

A lightweight Chrome/Chromium extension that keeps your ChatGPT usage limits visible while you chat.

## v1.1.1 hotfix

- Fixes the `Unknown` / long garbled reset text shown in v1.1.
- Prevents the extension from reading its **own widget** as ChatGPT usage data.
- Sync now waits specifically for ChatGPT's native **Settings → Usage → Plan limits** panel.
- Cleans corrupted v1.1 cached reset values automatically.
- Adds defensive text containment so a malformed value cannot stretch the widget.

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

## Install / update

1. Download and extract `RAR_ChatGPT_Usage_Monitor_v1.1.1.zip`.
2. Open Chrome and go to `chrome://extensions/`.
3. If v1.1 is already installed, remove it or use **Load unpacked** with the new v1.1.1 folder.
4. Enable **Developer mode**.
5. Click **Load unpacked**.
6. Choose the extracted `RAR_ChatGPT_Usage_Monitor_v1.1.1` folder.
7. Open or refresh `https://chatgpt.com/`.

## Controls

- `↻` — sync now
- `—` — switch to mini mode
- `▣` — expand from mini mode
- `⚙` — alert and refresh settings
- Drag the header to move the widget.

## If sync still fails

Open **ChatGPT → Settings → Usage** once, keep the Usage panel visible for a moment, then click `↻` on the widget. v1.1.1 specifically reads the native **Plan limits** panel so it will not parse its own widget anymore.

## Privacy

The extension does not ask for your ChatGPT password, session token, or OpenAI API key. It reads the usage values rendered in your own logged-in ChatGPT page and stores only the last displayed values/settings in Chrome local storage.

## Compatibility note

ChatGPT's web interface can change. If OpenAI changes the Usage page labels or route, the parser may need an update.

## Version

Current release: **v1.1.1**
