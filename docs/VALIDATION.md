# Validation — 1.3.0 upgrade candidate

Baseline: `90293b3187776d7fe3b1b50a601f8e0027b2e31f` on `main`.

## Completed locally

- JavaScript syntax, Manifest V3 asset references, consistent manifest/package/version metadata and Shadow DOM stylesheet placement: passed.
- 23 Node regression tests: passed. Coverage includes the supplied screenshot's values, percentage direction/range, partial readings, reset expiry, migration, concurrent storage patches, duplicate alerts, opt-in/offline version checks and trusted messages.

## Browser coverage

`tests/browser.cjs` loads the actual unpacked MV3 extension in Chromium with synthetic ChatGPT pages. Scenarios cover the worker/popup, current native route, conversation exclusion, CSS isolation, preserving unsent drafts, cross-tab updates, partial loading, unchanged countdowns, mini/settings/hide/restore, dragging/resizing and legacy dialogs.

Local browser installation and CI execution status will be recorded after verification. Test screenshots are synthetic fixtures, not authenticated account evidence.

## Limits

The supplied screenshot establishes expected labels and sample values, not the live DOM. The user's authenticated Chrome profile is not accessible in this execution environment. The live English Usage-page smoke checklist in `docs/STABILITY_TEST.md` must pass before calling this a verified production release. Other languages/layouts are not claimed to work. Cached data is profile-wide, not account-verified.

## Design references

- [Chrome content scripts and isolated worlds](https://developer.chrome.com/docs/extensions/develop/concepts/content-scripts)
- [Chrome cross-origin extension requests](https://developer.chrome.com/docs/extensions/develop/concepts/network-requests)
- [Playwright Chrome extension testing](https://playwright.dev/docs/chrome-extensions)
