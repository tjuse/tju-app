// src/content/index.ts
window.addEventListener("message", (event) => {
  if (event.source !== window) return;
  const msg = event.data;
  if (!msg || msg.source !== "tju-extension" || msg.direction !== "request") return;
  const req = msg.payload;
  chrome.runtime.sendMessage(req, (response) => {
    if (chrome.runtime.lastError) {
      const errorResp = {
        requestId: req.requestId,
        ok: false,
        error: chrome.runtime.lastError.message ?? "Extension runtime error"
      };
      window.postMessage(
        { source: "tju-extension", direction: "response", payload: errorResp },
        "*"
      );
      return;
    }
    window.postMessage(
      { source: "tju-extension", direction: "response", payload: response },
      "*"
    );
  });
});
