# Authenticated smoke test before a public release

Automated tests use synthetic native-page fixtures. They cannot establish compatibility with every live ChatGPT account, plan, language or future DOM change.

1. Update the existing unpacked folder, reload the extension and refresh ChatGPT. Confirm **v1.3.0** in the toolbar popup settings and only one widget.
2. Open your live **Settings → Usage** page. Compare both native percentages and reset text with the widget. If one limit is unavailable, its old reading must retain its own age.
3. Return to a conversation. Type an unsent draft, then click the widget sync arrow. Usage should open separately and the draft/conversation should stay unchanged.
4. In another ChatGPT tab, confirm the latest reading is shared. Verify mini/full mode, hide/restore, drag, Reset position and a narrow browser window.
5. Leave Usage closed: the widget must label data as cached. It must never open Settings automatically, refill expired percentages, or spend a reset/credit.
6. If you switch ChatGPT accounts/workspaces, clear cached data and sync the intended account before relying on it.
7. Confirm there are no repeated errors on the extension's `chrome://extensions/` card. Check version updates only if wanted.

Record the Chrome version, extension version and any failing screenshot/error. A GitHub release/tag and Chrome Web Store publication are separate actions; this upgrade does not claim either has happened.
