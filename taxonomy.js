(() => {
  const parts = window.__CORE_GRAPH_PARTS__ || [];
  const nodes = parts.flatMap((part) => part.nodes || []);
  const edges = parts.flatMap((part) => part.edges || []);
  const byId = new Map(nodes.map((node) => [node.id, node]));
  const children = new Map();

  nodes.forEach((node) => {
    const parent = node.parent || "";
    if (!children.has(parent)) children.set(parent, []);
    children.get(parent).push(node);
  });

  const normalize = (value) => String(value || "")
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, " ")
    .replace(/\bcore\b/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  function scoreNode(node, query) {
    const target = normalize(query);
    if (!target) return 0;
    const name = normalize(node.name);
    const values = [node.id, node.name, ...(node.keywords || []), ...(node.related || [])].map(normalize).filter(Boolean);
    if (name === target || normalize(node.id) === target) return 1000;
    if (values.includes(target)) return 850;
    if (name.startsWith(target) || target.startsWith(name)) return 650;
    const words = target.split(" ");
    const haystack = values.join(" ");
    const matched = words.filter((word) => haystack.includes(word)).length;
    return matched ? 300 + matched * 70 - Math.abs(name.length - target.length) : 0;
  }

  function searchCoreGraph(query, limit = 8) {
    return nodes.map((node) => ({ node, score: scoreNode(node, query) }))
      .filter((result) => result.score > 0)
      .sort((a, b) => b.score - a.score || (a.node.curation_rank || 9999) - (b.node.curation_rank || 9999))
      .slice(0, limit);
  }

  function pathFor(node) {
    const path = [];
    const seen = new Set();
    let current = node;
    while (current && !seen.has(current.id)) {
      path.unshift(current);
      seen.add(current.id);
      current = current.parent ? byId.get(current.parent) : null;
    }
    return path;
  }

  function findCorePath(query) {
    const result = searchCoreGraph(query, 1)[0];
    return result ? { node: result.node, path: pathFor(result.node), exact: result.score >= 850, score: result.score } : null;
  }

  function siblingCores(match) {
    if (!match?.node) return [];
    return (children.get(match.node.parent || "") || []).filter((node) => node.id !== match.node.id).map((node) => node.name);
  }

  function relatedCores(query, limit = 7) {
    const match = findCorePath(query);
    if (!match) return searchCoreGraph(query, limit).map((result) => result.node.name);
    const ids = new Set();
    edges.forEach((edge) => {
      if (edge.source === match.node.id) ids.add(edge.target);
      if (edge.target === match.node.id) ids.add(edge.source);
    });
    siblingCores(match).forEach((name) => {
      const sibling = searchCoreGraph(name, 1)[0]?.node;
      if (sibling) ids.add(sibling.id);
    });
    return [...ids].map((id) => byId.get(id)).filter(Boolean).slice(0, limit).map((node) => node.name);
  }

  function resolveCoreSearchQuery(query) {
    const clean = String(query || "").replace(/\s+/g, " ").trim();
    if (!clean) return clean;
    const match = findCorePath(clean);
    if (match && match.score >= 650) return match.node.image_query || match.node.name;
    return /core$/i.test(clean) ? clean : `${clean} core`;
  }

  window.CORE_GRAPH = { version: "1.0.0", nodes, edges };
  window.searchCoreGraph = searchCoreGraph;
  window.findCorePath = findCorePath;
  window.siblingCores = siblingCores;
  window.relatedCores = relatedCores;
  window.resolveCoreSearchQuery = resolveCoreSearchQuery;
})();
