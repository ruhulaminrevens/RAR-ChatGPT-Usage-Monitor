const ICON = "icons/icon48.png";

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (!message || message.type !== "RAR_USAGE_NOTIFY") return;

  const title = message.title || "RAR ChatGPT Usage Monitor";
  const body = message.message || "ChatGPT usage limit is getting low.";

  chrome.notifications.create({
    type: "basic",
    iconUrl: ICON,
    title,
    message: body,
    priority: message.level === "critical" ? 2 : 1
  });

  sendResponse({ ok: true });
  return true;
});
