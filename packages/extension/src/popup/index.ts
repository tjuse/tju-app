/**
 * Extension popup script.
 * Shows connection status and provides a manual data-refresh trigger.
 */

document.addEventListener("DOMContentLoaded", () => {
  const statusEl = document.getElementById("status");
  const refreshBtn = document.getElementById("refresh") as HTMLButtonElement | null;

  function setStatus(text: string, ok: boolean): void {
    if (statusEl) {
      statusEl.textContent = text;
      statusEl.className = ok ? "ok" : "error";
    }
  }

  // Check if a TJU app tab is present
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    const tab = tabs[0];
    const url = tab?.url ?? "";
    const isTjuApp = url.includes("tju.app") || url.includes("localhost");

    if (isTjuApp) {
      setStatus("已连接到 TJU App", true);
      if (refreshBtn) refreshBtn.disabled = false;
    } else {
      setStatus("请在 TJU App 页面使用", false);
      if (refreshBtn) refreshBtn.disabled = true;
    }
  });

  refreshBtn?.addEventListener("click", () => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      const tabId = tabs[0]?.id;
      if (tabId === undefined) return;

      // Tell the page to trigger a data refresh via custom event
      chrome.scripting.executeScript({
        target: { tabId },
        func: () => {
          window.dispatchEvent(new CustomEvent("tju-extension:refresh"));
        },
      });

      window.close();
    });
  });
});
