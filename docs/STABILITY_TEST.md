# Stability test checklist

This branch is a stabilization pass for the current v1.2.0 codebase. It does not create a new public release yet.

## What changed

- Automatic refresh is now **passive by default**. It will not force-open ChatGPT Settings while you are typing or simply reading a chat.
- Manual `↻` sync can still open **Settings → Usage** when needed.
- New **Auto-open Usage** setting restores forced background sync for users who explicitly want it.
- Usage parsing accepts more label variations instead of relying only on exact English strings.
- Dragging uses pointer capture instead of assigning global `document.onmousemove/onmouseup` handlers.
- The widget remounts through `MutationObserver` instead of a permanent 3-second polling loop.
- Auto-sync is deferred while the tab is hidden or an input/editor is active.
- Widget position is clamped after browser resize.

## Test cases

1. Open ChatGPT and keep **Auto-open Usage** OFF. The extension should not interrupt the current chat.
2. Press `↻`. Usage should sync and the original chat should remain selected afterward.
3. Start typing in the composer and wait for the refresh interval. Settings should not open.
4. Drag the widget several times; ChatGPT mouse/pointer behavior should remain normal.
5. Open ChatGPT **Settings → Usage** manually. The widget should passively read the values.
6. Turn **Auto-open Usage** ON and verify the old automatic sync behavior only if you want it.
7. Resize the browser window and confirm the widget remains reachable.
8. Check mini mode, alerts, sound setting, and version check.

## Release rule

After these tests pass in Chrome, this branch can be versioned and released as the next maintenance release.
