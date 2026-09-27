# Changelog

## v1.3.0 — upgrade candidate (2026-09-27)
- Continued from main commit `90293b3`, including the merged v1.2.0 stability fixes.
- Support the new native Usage page; preserve legacy dialogs without navigating chats.
- Isolate CSS with Shadow DOM; add a shared toolbar popup and hide/restore controls.
- Serialize local storage updates, preserve valid partial snapshots and deduplicate alerts across tabs.
- Add reset deadlines, expiration/staleness states, strict percentage parsing and safe legacy migration.
- Keep mini mode, pointer dragging, alerts and passive refresh; retire automatic Settings navigation.
- Harden version checks with a worker, timeout, opt-in defaults and fixed trusted navigation.
- Add unit/browser regression tests, reproducible named-folder ZIP and CI validation.
- Authenticated live-account smoke testing remains a release gate; see docs/VALIDATION.md.

## v1.2.0
- Promoted the stable v1.1.3 code line into a polished public release.
- Added optional GitHub `version.json` update checks with a manual **Check now** action.
- Added an update-available badge/link without adding a background service worker.
- Prevented automatic AudioContext startup before user interaction.
- Added compatible v1.1 local-state migration.
- Added version/status badges, release notes, screenshots, installation, privacy and troubleshooting docs.
- Preserved native Usage parsing and fully scoped CSS from the validated stable build.

## v1.1.3
- Removed MV3 background service worker to eliminate service-worker-related install noise.
- Removed `notifications` permission/background process.
- Replaced OS notifications with in-page on-screen warning toasts.
- Kept sound alert, warning/critical states, mini mode and native Usage sync.

## v1.1.2
- Fixed global CSS leakage that styled ChatGPT page elements outside the widget.
- Scoped all UI selectors under `#rar-chatgpt-usage-widget`.
- Replaced generic widget semantic tags with widget-specific classes.

## v1.1.1
- Prevented the extension from parsing its own widget as Usage data.
- Native Usage detection requires the ChatGPT `Plan limits` panel.
- Fixed Unknown/concatenated reset text and migration cleanup.

## v1.1.0
- Added mini mode, threshold alerts, sound, auto-refresh and position memory.

## v1.0.0
- Initial floating usage widget.
