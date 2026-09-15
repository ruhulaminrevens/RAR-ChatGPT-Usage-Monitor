# RAR ChatGPT Usage Monitor v1.2.0

**Release type:** Stable

v1.2.0 turns the working v1.1.3 build into a cleaner public release without changing the core native Usage-panel sync that has been validated in Chrome.

## Highlights

- Polished stable UI with full and mini modes.
- Reliable native **Settings → Usage → Plan limits** parsing.
- 5-hour and weekly remaining percentages + reset countdowns.
- Draggable position memory and 5/10/15/30-minute refresh choices.
- Warning below 35% and critical state below 20%.
- On-screen alerts and optional sound alerts.
- Safer sound handling: no AudioContext startup attempt before a browser user gesture.
- Optional GitHub version checker with **Check now** and update badge.
- Automatic migration from v1.1 local state where possible.
- Fully scoped CSS so the extension does not alter ChatGPT's page layout.
- New installation, privacy and troubleshooting documentation.
- Public screenshots and install-ready release ZIP prepared for the GitHub Release asset.

## Install

Download `RAR_ChatGPT_Usage_Monitor_v1.2.0.zip`, extract it, then use Chrome **Extensions → Developer mode → Load unpacked** and select the extracted folder.

See `docs/INSTALLATION.md` for the complete guide.

## Notes

This extension relies on labels/markup in ChatGPT's web Usage panel. If the site changes significantly, a parser update may be required. The version checker only notifies; it never installs updates automatically.
