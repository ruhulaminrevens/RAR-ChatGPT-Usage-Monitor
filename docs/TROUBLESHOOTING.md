# Troubleshooting

| Symptom | Next action |
| --- | --- |
| No widget | Refresh the ChatGPT tab after loading/updating. Open the extension icon, Settings → Show floating widget, then Reset position. |
| Old or duplicated widget | Keep one installed copy, reload that extension, and refresh every ChatGPT tab. |
| Cached / no reading | Open `https://chatgpt.com/settings/usage?tab=overview`; wait for Plan limits. Return to your chat after values appear. |
| Usage unreadable | Confirm the page shows English `Plan limits`, `5-hour limit` and `Weekly limit` labels with `% left`, `% remaining` or `% used`. Send a screenshot of that section and the extension's version. The extension preserves previous data instead of guessing. |
| Reset due | Open Usage for a fresh native reading. The timer does not assume the limit has replenished. |
| Wrong account's reading | Clear cached data in settings, then open Usage for the intended account. Separate browser profiles keep separate caches. |
| Extension updated / unavailable | Reload the extension on `chrome://extensions/`, then reload ChatGPT. If repeated, send the exact error from the extension card. |
| No sound | Turn on Sound alerts after clicking the widget; sound requires browser user activation. Warnings trigger only when a threshold worsens, not on every read. |
| Update check failed | Retry Check update later, or open GitHub. ChatGPT monitoring works without version checks. |
| Limits differ from chat caps | This widget mirrors Work/Codex Plan limits; ordinary ChatGPT chat-message limits are excluded. |

Automatic background navigation is intentionally retired. Passive refresh cannot fetch new server usage when the native Usage page is closed. The extension never intercepts tokens or uses undocumented account APIs.
