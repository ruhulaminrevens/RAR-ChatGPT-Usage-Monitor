# Install or update RAR Usage Monitor 1.3.0

Chrome / Chromium 120 or later. The ZIP contains a single named folder with `manifest.json` directly inside it. No build tools are needed to install it.

## New installation

1. Download and extract `RAR_ChatGPT_Usage_Monitor_v1.3.0.zip`.
2. Keep the extracted folder in a permanent location on your PC.
3. Open `chrome://extensions/` and enable **Developer mode**.
4. Click **Load unpacked** and select `RAR_ChatGPT_Usage_Monitor_v1.3.0`, the folder containing `manifest.json`.
5. Refresh all existing ChatGPT tabs. Pin the extension icon from Chrome's extensions menu.
6. Open `https://chatgpt.com/settings/usage?tab=overview` and wait for the native Plan limits values to load. The widget should show the same percentages.

Use **Load unpacked** after extraction. Dragging a ZIP is not the supported installation method.

## Update while preserving your data

1. On `chrome://extensions/`, find the existing **RAR ChatGPT Usage Monitor** card and note its unpacked source folder. Keep a copy of the old folder as a rollback backup.
2. Extract the new ZIP elsewhere, then copy the **contents** of its named folder into the existing source folder, replacing matching files. The existing folder must still have `manifest.json` at its root.
3. Click **Reload** on the existing extension card; accept the additional GitHub raw-file host permission if Chrome requests it.
4. Refresh every open ChatGPT tab. Verify the popup shows **v1.3.0**, then open Usage once.

পুরোনো extension remove করে নতুন folder থেকে load করলে extension ID বদলে saved settings হারাতে পারে। একই source folder-এ files replace করে Reload দিন। একসঙ্গে দুইটি copy চালাবেন না।

The update keeps valid v1.1/v1.2 cached readings, mini mode, alert settings and refresh preferences. Old automatic Settings navigation is removed. Countdown deadlines start with the first valid new native reading; old text is not treated as a fresh timer.

## First-run check

Compare the native 5-hour and weekly percentages with the widget and popup. Return to your conversation: it should remain unchanged. The displayed snapshot is cached until Usage is read again. These Work/Codex plan limits exclude ordinary chat messages.

## Rollback

Restore the backup files into the same source folder, reload the extension and refresh ChatGPT tabs. Cached data keys remain compatible with v1.2.0. The older code does not support the new native route, so rollback is for recovery only.
