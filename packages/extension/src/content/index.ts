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

window.addEventListener("message", (event: MessageEvent<unknown>) => {
  // Ignore messages from other frames or non-extension sources
  if (event.source !== window) return;

  const msg = event.data as WindowMessage | undefined;
  if (msg?.source !== "tju-extension" || msg?.direction !== "request") return;

  const req = msg.payload as ExtensionRequest;

  chrome.runtime.sendMessage(req, (response: ExtensionResponse) => {
    if (chrome.runtime.lastError) {
      // Extension may be reloading; surface the error back to the page
      const errorResp: ExtensionResponse = {
        requestId: req.requestId,
        ok: false,
        error: chrome.runtime.lastError.message ?? "Extension runtime error",
      };
      window.postMessage(
        {
          source: "tju-extension",
          direction: "response",
          payload: errorResp,
        } satisfies WindowMessage,
        "*",
      );
      return;
    }

    window.postMessage(
      { source: "tju-extension", direction: "response", payload: response } satisfies WindowMessage,
      "*",
    );
  });
});
