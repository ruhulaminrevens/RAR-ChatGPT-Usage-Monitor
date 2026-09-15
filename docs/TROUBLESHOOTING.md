# Troubleshooting

## Widget shows Unknown
Open ChatGPT **Settings → Usage** once, wait until **Plan limits** is visible, close the settings panel, then press `↻`.

## Page layout changes unexpectedly
v1.2.0 uses fully scoped CSS under `#rar-chatgpt-usage-widget`. If you upgraded from v1.1.1 or earlier, remove the old extension completely and reload ChatGPT before loading v1.2.0.

## Sound does not play on the first automatic alert
Browsers block audio before a user gesture. v1.2.0 intentionally skips automatic sound until you click or press a key on the page. This avoids AudioContext console errors. On-screen alerts still work.

## Version check fails
The widget will continue working normally. Version checking is optional and does not affect usage sync. Check that GitHub/raw GitHub is reachable on your network and try **Check now** later.

## Duplicate widget
Only one unpacked version should be enabled. Open `chrome://extensions/` and remove/disable older RAR ChatGPT Usage Monitor copies.
