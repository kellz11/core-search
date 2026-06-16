(() => {
  const originalFetch = window.fetch.bind(window);

  function coreQuery(value) {
    const clean = String(value || "").replace(/\s+/g, " ").trim();
    if (!clean) return clean;
    return window.resolveCoreSearchQuery
      ? window.resolveCoreSearchQuery(clean)
      : (/core$/i.test(clean) ? clean : `${clean} core`);
  }

  window.fetch = (resource, options) => {
    try {
      const rawUrl = typeof resource === "string" ? resource : resource.url;
      const url = new URL(rawUrl, window.location.href);

      if (url.hostname === "api.openverse.org" && url.searchParams.has("q")) {
        url.searchParams.set("q", coreQuery(url.searchParams.get("q")));
        resource = typeof resource === "string" ? url.toString() : new Request(url.toString(), resource);
      }

      if (url.hostname === "commons.wikimedia.org" && url.searchParams.has("gsrsearch")) {
        url.searchParams.set("gsrsearch", coreQuery(url.searchParams.get("gsrsearch")));
        resource = typeof resource === "string" ? url.toString() : new Request(url.toString(), resource);
      }
    } catch (error) {
      console.warn("Core graph search normalization skipped", error);
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
