# Changelog

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
