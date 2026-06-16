/**
 * Extension popup script.
 * Shows connection status and provides a manual data-refresh trigger.
 */

/** Escape a string for literal use inside a RegExp. */
function escapeRegExp(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/**
 * Convert a Chrome match pattern (e.g. "https://*.netlify.app/*") into a RegExp.
 * Supports the "*" scheme, "*."-prefixed host wildcards, and "*" path globs.
 */
function matchPatternToRegExp(pattern: string): RegExp {
  const m = /^(\*|https?|file|ftp):\/\/([^/]*)(\/.*)$/.exec(pattern);
  if (!m) return /^\b$/; // matches nothing
  const [, scheme, host, path] = m;
  const schemeRe = scheme === "*" ? "https?" : escapeRegExp(scheme ?? "");
  let hostRe: string;
  if (host === "*") {
    hostRe = "[^/]+";
  } else if (host?.startsWith("*.")) {
    hostRe = `(?:[^/]+\\.)?${escapeRegExp(host.slice(2))}`;
  } else {
    hostRe = escapeRegExp(host ?? "");
  }
  const pathRe = escapeRegExp(path ?? "").replace(/\\\*/g, ".*");
  return new RegExp(`^${schemeRe}://${hostRe}${pathRe}$`);
}

/** Whether the URL is one of the app origins this extension is allowed to bridge. */
function isAppUrl(url: string): boolean {
  const patterns = (chrome.runtime.getManifest().content_scripts ?? []).flatMap(
    (cs) => cs.matches ?? [],
  );
  return patterns.some((p) => matchPatternToRegExp(p).test(url));
}

document.addEventListener("DOMContentLoaded", () => {
  const statusEl = document.getElementById("status");
  const refreshBtn = document.getElementById("refresh") as HTMLButtonElement | null;

  function setStatus(text: string, ok: boolean): void {
    if (statusEl) {
      statusEl.textContent = text;
      statusEl.className = ok ? "ok" : "error";
    }
  }

  // Check whether the active tab is a TJU App page.
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    const url = tabs[0]?.url ?? "";

    if (isAppUrl(url)) {
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

      // Ask the content script (already injected on the app page) to trigger a
      // refresh; it relays this to the page as a CustomEvent.
      chrome.tabs.sendMessage(tabId, { type: "tju:trigger-refresh" });
      window.close();
    });
  });
});
