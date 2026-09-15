# Changelog

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
