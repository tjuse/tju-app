// src/popup/index.ts
document.addEventListener("DOMContentLoaded", () => {
  const statusEl = document.getElementById("status");
  const refreshBtn = document.getElementById("refresh");
  function setStatus(text, ok) {
    if (statusEl) {
      statusEl.textContent = text;
      statusEl.className = ok ? "ok" : "error";
    }
  }
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    const tab = tabs[0];
    const url = tab?.url ?? "";
    const isTjuApp = url.includes("tju.app") || url.includes("localhost");
    if (isTjuApp) {
      setStatus("\u5DF2\u8FDE\u63A5\u5230 TJU App", true);
      if (refreshBtn) refreshBtn.disabled = false;
    } else {
      setStatus("\u8BF7\u5728 TJU App \u9875\u9762\u4F7F\u7528", false);
      if (refreshBtn) refreshBtn.disabled = true;
    }
  });
  refreshBtn?.addEventListener("click", () => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      const tabId = tabs[0]?.id;
      if (tabId === void 0) return;
      chrome.scripting.executeScript({
        target: { tabId },
        func: () => {
          window.dispatchEvent(new CustomEvent("tju-extension:refresh"));
        }
      });
      window.close();
    });
  });
});
