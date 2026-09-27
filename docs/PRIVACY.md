# Privacy

RAR ChatGPT Usage Monitor is an independent, local browser extension.

- Reads visible English text in ChatGPT's native **Plan limits** section, only on Usage pages or native settings dialogs. It excludes conversation articles and code blocks.
- Saves percentages, reset labels/deadlines, observation timestamps, alert state, widget preferences and version-check metadata in `chrome.storage.local`.
- Does not collect ChatGPT passwords, OpenAI API keys, cookies, session tokens, email addresses, payment details, conversation content or analytics.
- Does not send usage values to the author or any external server. There is no backend, telemetry or remote executable code.
- Optional version checks request only the project's fixed public `version.json` URL on `raw.githubusercontent.com`, without credentials. GitHub receives the normal network request, including your IP address. Automatic checks are off on new installs; an explicit old preference is preserved. Manual **Check update** makes one request even with automatic checks off.
- `storage` permission supports local data. ChatGPT host access supports the content script. The GitHub raw host permission supports the worker's version check; the code does not fetch arbitrary URLs.
- Opening Usage or GitHub occurs only after a control click. The extension never buys credits, uses a reset, upgrades a plan or changes account settings.
- **Clear cached data** clears usage and alert state. Other preferences remain. Uninstalling the extension removes its extension storage.
- Cache is shared across tabs and accounts/workspaces within one browser profile; no account identity is collected. Clear the cache after switching accounts, or use separate browser profiles. It is not synced between computers.
