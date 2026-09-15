# RAR ChatGPT Usage Monitor v1.1.3

A lightweight Chrome/Chromium extension that keeps your ChatGPT usage limits visible while you chat.

## v1.1.3 stable hotfix

- Removes the MV3 background service worker that could show Chrome error **Status code: 15** on some builds.
- Removes the `notifications` permission and background process entirely.
- Replaces OS desktop notifications with lightweight **on-screen threshold alerts** inside ChatGPT.
- Keeps sound alerts, mini mode, warning/critical glow, native Usage sync, and fully scoped CSS.
- Core extension now runs only as a content script + local storage for a simpler, cleaner install.

## v1.1.2 hotfix

- Fixes global CSS bleed that was affecting the ChatGPT page layout.
- All widget styles are fully scoped under `#rar-chatgpt-usage-widget`.
- Replaced generic semantic selectors with prefixed widget classes.
- Keeps the usage data fix from v1.1.1.

## v1.1.1 hotfix

- Fixes the `Unknown` / long garbled reset text shown in v1.1.
- Prevents the extension from reading its **own widget** as ChatGPT usage data.
- Sync waits specifically for ChatGPT's native **Settings → Usage → Plan limits** panel.
- Cleans corrupted v1.1 cached reset values automatically.

## Features

- Mini pill mode — compact `5H xx% | W xx%` display
- 5-hour and weekly usage remaining
- Reset countdowns
- Warning below 35%
- Critical red glow below 20%
- On-screen warning alerts
- Optional sound alert
- Auto-refresh: 5 / 10 / 15 / 30 minutes
- Draggable position memory
- Glass/blur UI
- No password or OpenAI API key stored

## Install / update

1. Download and extract `RAR_ChatGPT_Usage_Monitor_v1.1.3.zip`.
2. Open Chrome and go to `chrome://extensions/`.
3. Remove the older RAR ChatGPT Usage Monitor version.
4. Enable **Developer mode**.
5. Click **Load unpacked**.
6. Choose the extracted `RAR_ChatGPT_Usage_Monitor_v1.1.3` folder.
7. Open or hard-refresh `https://chatgpt.com/`.

## Controls

- `↻` — sync now
- `—` — switch to mini mode
- `▣` — expand from mini mode
- `⚙` — alert and refresh settings
- Drag the header to move the widget

## If sync fails

Open **ChatGPT → Settings → Usage** once, keep the Usage panel visible for a moment, then click `↻` on the widget. The extension reads the native **Plan limits** panel and will not parse its own widget.

## Privacy

The extension does not ask for your ChatGPT password, session token, or OpenAI API key. It reads usage values rendered in your own logged-in ChatGPT page and stores only the last displayed values/settings in Chrome local storage.

## Compatibility note

ChatGPT's web interface can change. If OpenAI changes the Usage page labels or route, the parser may need an update.

## Version

Current release: **v1.1.3**
