(() => {
  const originalFetch = window.fetch.bind(window);

  // "Core" is the site's organizing layer, not a literal keyword that should
  // be sent to every outside image source. Sending "Tiger Woods core" to
  // Wikimedia caused it to match the butterfly species Euploea core.
  function providerQuery(value) {
    const clean = String(value || "").replace(/\s+/g, " ").trim();
    if (!clean) return clean;

    if (window.resolveCoreSearchQuery) {
      return window.resolveCoreSearchQuery(clean);
    }

    return clean.replace(/\s+core$/i, "").trim() || clean;
  }

  function wikimediaQuery(value) {
    const clean = providerQuery(value).replace(/["“”]/g, "").trim();
    if (!clean) return clean;

    // Multi-word subjects should be treated as a phrase. This prevents one
    // strong word such as "core" or "woods" from hijacking the results.
    return clean.includes(" ") ? `"${clean}"` : clean;
  }

  window.fetch = (resource, options) => {
    try {
      const rawUrl = typeof resource === "string" ? resource : resource.url;
      const url = new URL(rawUrl, window.location.href);

      if (url.hostname === "api.openverse.org" && url.searchParams.has("q")) {
        url.searchParams.set("q", providerQuery(url.searchParams.get("q")));
        resource = typeof resource === "string" ? url.toString() : new Request(url.toString(), resource);
      }

      if (url.hostname === "commons.wikimedia.org" && url.searchParams.has("gsrsearch")) {
        url.searchParams.set("gsrsearch", wikimediaQuery(url.searchParams.get("gsrsearch")));
        resource = typeof resource === "string" ? url.toString() : new Request(url.toString(), resource);
      }
    } catch (error) {
      console.warn("Core search normalization skipped", error);
    }

    return originalFetch(resource, options);
  };

  window.addEventListener("DOMContentLoaded", () => {
    const input = document.getElementById("searchInput");
    const form = document.getElementById("searchForm");
    if (!input || !form) return;

    input.placeholder = "Type anything — search within the Core graph";

    let timer;
    input.addEventListener("input", () => {
      clearTimeout(timer);
      const value = input.value.replace(/\s+/g, " ").trim();
      if (!value) return;

      timer = setTimeout(() => {
        if (input.value.replace(/\s+/g, " ").trim() === value) {
          form.dispatchEvent(new Event("submit", { bubbles: true, cancelable: true }));
        }
      }, 350);
    });
  });
})();