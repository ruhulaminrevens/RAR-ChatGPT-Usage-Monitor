# Installation Guide — RAR ChatGPT Usage Monitor v1.2.0

## Chrome / Chromium browsers

1. Download `RAR_ChatGPT_Usage_Monitor_v1.2.0.zip` from the GitHub Release page.
2. Extract the ZIP to a permanent folder. Do not delete that folder while the extension is installed.
3. Open `chrome://extensions/`.
4. Enable **Developer mode**.
5. Remove any older RAR ChatGPT Usage Monitor build to avoid duplicate widgets.
6. Click **Load unpacked**.
7. Select the extracted `RAR_ChatGPT_Usage_Monitor_v1.2.0` folder.
8. Open or refresh `https://chatgpt.com/`.

## First sync

The extension briefly opens ChatGPT's native **Settings → Usage → Plan limits** view, reads the values rendered for your account, then returns to the current chat. The widget may briefly disappear during this sync; that is intentional so it cannot read its own labels.

If automatic sync fails, open **Settings → Usage** manually once, keep it visible for a moment, then press `↻` on the widget.

## Updating from an older version

Remove the old unpacked extension, extract the new ZIP into a new folder, then load the new folder. Your old v1.1 usage/widget settings are migrated automatically when available.

## Version checks

Version checking is optional and can be disabled from the widget settings. It only requests the public `version.json` file from this GitHub repository; updates are never installed automatically.
