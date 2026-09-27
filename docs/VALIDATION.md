# Validation — 1.3.0 upgrade candidate

Baseline: `90293b3187776d7fe3b1b50a601f8e0027b2e31f` on `main`.

## Completed locally

- JavaScript syntax, Manifest V3 asset references, consistent manifest/package/version metadata and Shadow DOM stylesheet placement: passed.
- 24 Node regression tests: passed. Coverage includes the supplied screenshot's values, percentage direction/range, partial readings, reset expiry, migration, concurrent storage patches, duplicate alerts, opt-in/offline version checks and trusted messages.

## Browser coverage

`tests/browser.cjs` loads the actual unpacked MV3 extension in Chromium with synthetic ChatGPT pages. Scenarios cover the worker/popup, current native route, conversation exclusion, CSS isolation, preserving unsent drafts, cross-tab updates, partial loading, unchanged countdowns, mini/settings/hide/restore, dragging/resizing and legacy dialogs.

**14 browser scenarios passed in GitHub Actions on Chromium 145.0.7632.6**, with no uncaught page errors. The initial passing run is [36333888850](https://github.com/ruhulaminrevens/RAR-ChatGPT-Usage-Monitor/actions/runs/36333888850); subsequent branch checks are attached to [PR #2](https://github.com/ruhulaminrevens/RAR-ChatGPT-Usage-Monitor/pull/2). This includes installing/loading the actual MV3 extension, not only mocking browser APIs.

The local environment could not download the full Playwright browser, so real-extension browser validation ran in GitHub Actions. CI screenshots were downloaded and visually checked at desktop and 375 × 480 viewport sizes. They are synthetic fixtures, not authenticated account evidence.

## Package and changed files

- `content.js`, `core.js`, `background.js`: passive native parsing, validated snapshots, serialized state and bounded update checks.
- `view.js`, `styles.css`, `popup.*`, `manifest.json`: isolated shared UI, toolbar popup, controls and extension wiring.
- `tests/`, `scripts/`, `.github/workflows/validate-extension.yml`: regression checks and repeatable packaging.
- `README.md`, `CHANGELOG.md`, `docs/`: scope, update instructions, privacy and live smoke gate.
- `dist/RAR_ChatGPT_Usage_Monitor_v1.3.0.zip`: one named root folder, 15 runtime/documentation assets, CRC checked; SHA256 recorded in `dist/SHA256SUMS.txt`. CI recreates the ZIP and verifies that it matches the committed package.

## Limits

The supplied screenshot establishes expected labels and sample values, not the live DOM. The user's authenticated Chrome profile is not accessible in this execution environment. The live English Usage-page smoke checklist in `docs/STABILITY_TEST.md` must pass before calling this a verified production release. Other languages/layouts are not claimed to work. Cached data is profile-wide, not account-verified.

## Design references

- [Chrome content scripts and isolated worlds](https://developer.chrome.com/docs/extensions/develop/concepts/content-scripts)
- [Chrome cross-origin extension requests](https://developer.chrome.com/docs/extensions/develop/concepts/network-requests)
- [Playwright Chrome extension testing](https://playwright.dev/docs/chrome-extensions)
