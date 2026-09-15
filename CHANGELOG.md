# Changelog

## v1.1.3
- Removed MV3 background service worker to eliminate Chrome `Status code: 15` registration errors.
- Removed `notifications` permission/background process.
- Replaced OS notifications with in-page on-screen warning toasts.
- Kept sound alert, warning/critical states, mini mode and native Usage sync.

## v1.1.2
- Fixed global CSS leakage that styled ChatGPT page elements outside the widget.
- Scoped all UI selectors under `#rar-chatgpt-usage-widget`.
- Replaced generic widget semantic tags with widget-specific classes.
- Preserved the native Usage-panel sync fix from v1.1.1.

## v1.1.1
- Fixed false-positive sync where the extension parsed its own widget.
- Native Usage detection now requires the ChatGPT `Plan limits` panel.
- Fixed `Unknown` and concatenated reset text issue.
- Added migration cleanup for corrupted cached v1.1 reset strings.
- Added defensive reset-text truncation.
- Improved Settings/Usage open-wait-restore flow.

## v1.1.0
- Added always-visible mini pill mode.
- Added warning state below 35% remaining.
- Added critical state below 20% remaining.
- Added desktop notifications.
- Added optional sound alert.
- Added 5/10/15/30 minute auto-refresh choices.
- Added persistent widget mode and position.
- Improved Usage-page parsing and `#settings/Usage` navigation.
- Improved glass UI, progress states, responsiveness, and sync status.

## v1.0.0
- Initial floating usage widget.
- 5-hour and weekly usage meters.
- Reset countdown display.
- Manual refresh.
- Draggable placement.
