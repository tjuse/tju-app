/**
 * Content script — bridges the tju-app page and the extension background worker.
 *
 * The page posts a WindowMessage with direction:"request"; this script relays it
 * to chrome.runtime.sendMessage; the background responds; we post back with
 * direction:"response".
 *
 * Only messages from the same window origin and with source:"tju-extension" are
 * forwarded, preventing message-spoofing by third-party content on the page.
 */

import type { ExtensionRequest, ExtensionResponse, WindowMessage } from "../shared/messages.js";

/** Post a response envelope back to the page. */
function postResponse(payload: ExtensionResponse): void {
  window.postMessage(
    { source: "tju-extension", direction: "response", payload } satisfies WindowMessage,
    "*",
  );
}

/** True while this content script's extension context is still alive. */
function extensionAlive(): boolean {
  // chrome.runtime.id becomes undefined after the extension is reloaded/updated
  // while the page stays open ("Extension context invalidated").
  return Boolean(chrome.runtime?.id);
}

window.addEventListener("message", (event: MessageEvent<unknown>) => {
  // Ignore messages from other frames or non-extension sources
  if (event.source !== window) return;

  const msg = event.data as WindowMessage | undefined;
  if (msg?.source !== "tju-extension" || msg?.direction !== "request") return;

  const req = msg.payload as ExtensionRequest;

  // If the extension was reloaded, the old content script can't reach it.
  if (!extensionAlive()) {
    postResponse({
      requestId: req.requestId,
      ok: false,
      error: "扩展已更新，请刷新本页面后重试。",
    });
    return;
  }

  try {
    chrome.runtime.sendMessage(req, (response: ExtensionResponse) => {
      if (chrome.runtime.lastError) {
        postResponse({
          requestId: req.requestId,
          ok: false,
          error: chrome.runtime.lastError.message ?? "Extension runtime error",
        });
        return;
      }
      postResponse(response);
    });
  } catch (err) {
    // sendMessage throws synchronously when the context is invalidated.
    postResponse({
      requestId: req.requestId,
      ok: false,
      error: err instanceof Error ? err.message : "扩展已更新，请刷新本页面后重试。",
    });
  }
});

// Relay the popup's "refresh" trigger to the page. The page listens for the
// "tju-extension:refresh" window event and re-fetches via the bridge.
chrome.runtime.onMessage.addListener((message: unknown) => {
  const m = message as { type?: string } | undefined;
  if (m?.type === "tju:trigger-refresh") {
    window.dispatchEvent(new CustomEvent("tju-extension:refresh"));
  }
});
