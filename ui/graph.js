import { assetUrl, escapeHtml, pageUrl } from './core-data.js';
import { footer, sidebar, topbar } from './shell.js';
import { buildCoreGraph, RELATIONSHIPS } from './graph-data.js';

const CLUSTER_COLORS = {
  'dream-surreal': '#6677cc',
  'nature-rustic': '#5f8f68',
  'cute-playful': '#d77ca6',
  'digital-internet': '#4f91ad',
  'fantasy-mythic': '#8b6fc1',
  'dark-horror': '#776b6b',
  'fashion-identity': '#c07b63',
  'cosmic-futurist': '#50658f',
  'lifestyle-sport': '#8e8a54',
  'hope-emotion': '#d19b3f'
};

const fmt = (value) => new Intl.NumberFormat().format(value || 0);

export function graphView(stats, recent) {
  return `<div class="app-shell">
    ${sidebar('graph', recent)}
    <main class="content-shell">
      ${topbar()}
      <section class="main-card graph-page">
        <header class="graph-header">
          <div><p class="kicker">Core Wiki</p><h1 class="section-page-title">Core Graph</h1><p class="section-description">Search a core and see its world: visual overlap, emotional overlap, historical influence, category relationships, and shared user interest.</p></div>
          <div class="graph-summary"><strong id="graphNodeCount">0</strong><span>nodes</span><strong id="graphEdgeCount">0</strong><span>edges</span></div>
        </header>
        <div class="graph-controls">
          <label class="graph-search"><span>⌕</span><input id="graphSearch" type="search" placeholder="Search the graph..."></label>
          <select id="graphRelationship"><option value="all">All relationships</option>${Object.entries(RELATIONSHIPS).map(([key, value]) => `<option value="${key}">${escapeHtml(value.label)}</option>`).join('')}</select>
          <button id="graphFit" type="button">Fit graph</button>
          <button id="graphExport" type="button">Export JSON</button>
        </div>
        <div class="graph-layout">
          <div class="graph-stage" id="graphStage">
            <canvas id="graphCanvas" aria-label="Interactive map of Core relationships"></canvas>
            <div class="graph-help">Drag to pan · Scroll to zoom · Double-click a node to open its page</div>
            <div class="graph-legend">${Object.entries(RELATIONSHIPS).map(([key, value]) => `<span><i style="background:${value.color}"></i>${escapeHtml(value.label)}</span>`).join('')}</div>
          </div>
          <aside class="graph-detail" id="graphDetail"><div class="graph-detail-empty"><span>✦</span><h3>Select a core</h3><p>Click any node to inspect its metadata and connections.</p></div></aside>
        </div>
      </section>
      ${footer()}
    </main>
  </div>`;
}

function nodeDetail(node, graph, edgeMap) {
  const connections = edgeMap.get(node.id) || [];
  const rows = connections.slice(0, 14).map(({ edge, other }) => {
    const relation = graph.relationships[edge.relationship] || { label: edge.relationship, color: '#999' };
    return `<button class="connection-row" data-graph-node="${other.id}" type="button"><i style="background:${relation.color}"></i><span><b>${escapeHtml(other.name)}</b><small>${escapeHtml(relation.label)}</small></span><em>→</em></button>`;
  }).join('');
  return `<div class="graph-detail-content">
    ${node.thumbnail ? `<img class="graph-detail-image" src="${assetUrl(node.thumbnail)}" alt="${escapeHtml(node.name)}">` : ''}
    <p class="graph-detail-cluster">${escapeHtml(node.clusterLabel)}</p><h2>${escapeHtml(node.name)}</h2><p class="graph-detail-description">${escapeHtml(node.description)}</p>
    <dl class="graph-meta"><div><dt>Parent</dt><dd>${escapeHtml(node.parent)}</dd></div><div><dt>Era</dt><dd>${escapeHtml(node.era)}</dd></div><div><dt>Graphics</dt><dd>${fmt(node.graphicCount)}</dd></div><div><dt>Connections</dt><dd>${fmt(connections.length)}</dd></div></dl>
    <div class="graph-tags"><h4>Keywords</h4><p>${node.keywords.map((item) => `<span>${escapeHtml(item)}</span>`).join('')}</p><h4>Visuals</h4><p>${node.visuals.map((item) => `<span>${escapeHtml(item)}</span>`).join('')}</p><h4>Emotions</h4><p>${node.emotions.map((item) => `<span>${escapeHtml(item)}</span>`).join('')}</p></div>
    <a class="graph-open-core" href="${pageUrl(node.name)}">Open ${escapeHtml(node.name)} →</a>
    <h4 class="connections-title">Connected cores</h4><div class="connection-list">${rows || '<p class="graph-detail-description">No curated connections yet.</p>'}</div>
  </div>`;
}

export function mountCoreGraph(records) {
  const graph = buildCoreGraph(records);
  const canvas = document.getElementById('graphCanvas');
  const stage = document.getElementById('graphStage');
  const detail = document.getElementById('graphDetail');
  const search = document.getElementById('graphSearch');
  const relationSelect = document.getElementById('graphRelationship');
  if (!canvas || !stage || !detail) return;

  document.getElementById('graphNodeCount').textContent = fmt(graph.nodes.length);
  document.getElementById('graphEdgeCount').textContent = fmt(graph.edges.length);

  const nodeById = new Map(graph.nodes.map((node) => [node.id, node]));
  const edgeMap = new Map(graph.nodes.map((node) => [node.id, []]));
  graph.edges.forEach((edge) => {
    const from = nodeById.get(edge.from);
    const to = nodeById.get(edge.to);
    if (!from || !to) return;
    edgeMap.get(from.id).push({ edge, other: to });
    edgeMap.get(to.id).push({ edge, other: from });
  });

  const clusters = [...new Set(graph.nodes.map((node) => node.cluster))];
  graph.nodes.forEach((node, index) => {
    const clusterIndex = clusters.indexOf(node.cluster);
    const angle = (clusterIndex / Math.max(1, clusters.length)) * Math.PI * 2;
    const local = index * 2.399;
    node.x = Math.cos(angle) * 330 + Math.cos(local) * 90;
    node.y = Math.sin(angle) * 260 + Math.sin(local) * 90;
    node.vx = 0;
    node.vy = 0;
    node.radius = 7 + Math.min(5, (edgeMap.get(node.id)?.length || 0) * .35);
  });

  const context = canvas.getContext('2d');
  let width = 1;
  let height = 1;
  let ratio = 1;
  let zoom = 1;
  let panX = 0;
  let panY = 0;
  let selected = null;
  let hovered = null;
  let relationship = 'all';
  let searchTerm = '';
  let dragNode = null;
  let panning = false;
  let lastPointer = null;
  let animationFrame;
  let temperature = 1;

  const visibleEdges = () => relationship === 'all' ? graph.edges : graph.edges.filter((edge) => edge.relationship === relationship);
  const worldToScreen = (x, y) => ({ x: x * zoom + panX + width / 2, y: y * zoom + panY + height / 2 });
  const screenToWorld = (x, y) => ({ x: (x - panX - width / 2) / zoom, y: (y - panY - height / 2) / zoom });

  function resize() {
    const rect = stage.getBoundingClientRect();
    width = Math.max(320, rect.width);
    height = Math.max(520, rect.height);
    ratio = Math.min(2, window.devicePixelRatio || 1);
    canvas.width = Math.round(width * ratio);
    canvas.height = Math.round(height * ratio);
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    context.setTransform(ratio, 0, 0, ratio, 0, 0);
    draw();
  }

  function simulate() {
    const nodes = graph.nodes;
    const repulsion = 1900 * temperature;
    for (let i = 0; i < nodes.length; i += 1) {
      for (let j = i + 1; j < nodes.length; j += 1) {
        const a = nodes[i];
        const b = nodes[j];
        let dx = b.x - a.x;
        let dy = b.y - a.y;
        let distanceSq = dx * dx + dy * dy + 35;
        const force = repulsion / distanceSq;
        const distance = Math.sqrt(distanceSq);
        dx /= distance;
        dy /= distance;
        a.vx -= dx * force;
        a.vy -= dy * force;
        b.vx += dx * force;
        b.vy += dy * force;
      }
    }

    graph.edges.forEach((edge) => {
      const a = nodeById.get(edge.from);
      const b = nodeById.get(edge.to);
      if (!a || !b) return;
      const dx = b.x - a.x;
      const dy = b.y - a.y;
      const distance = Math.max(1, Math.sqrt(dx * dx + dy * dy));
      const desired = edge.relationship === 'category_parent' ? 100 : 135;
      const force = (distance - desired) * .0022 * temperature;
      const nx = dx / distance;
      const ny = dy / distance;
      a.vx += nx * force;
      a.vy += ny * force;
      b.vx -= nx * force;
      b.vy -= ny * force;
    });

    const clusterCenters = new Map();
    clusters.forEach((cluster, index) => {
      const angle = index / clusters.length * Math.PI * 2;
      clusterCenters.set(cluster, { x: Math.cos(angle) * 300, y: Math.sin(angle) * 230 });
    });

    nodes.forEach((node) => {
      const center = clusterCenters.get(node.cluster) || { x: 0, y: 0 };
      node.vx += (center.x - node.x) * .0007 * temperature;
      node.vy += (center.y - node.y) * .0007 * temperature;
      node.vx += -node.x * .00015;
      node.vy += -node.y * .00015;
      node.vx *= .88;
      node.vy *= .88;
      if (node !== dragNode) {
        node.x += node.vx;
        node.y += node.vy;
      }
    });
    temperature = Math.max(.12, temperature * .994);
  }

  function draw() {
    context.clearRect(0, 0, width, height);
    context.save();
    context.lineCap = 'round';

    const selectedConnections = selected ? new Set((edgeMap.get(selected.id) || []).map(({ other }) => other.id)) : null;
    visibleEdges().forEach((edge) => {
      const from = nodeById.get(edge.from);
      const to = nodeById.get(edge.to);
      if (!from || !to) return;
      const a = worldToScreen(from.x, from.y);
      const b = worldToScreen(to.x, to.y);
      const config = graph.relationships[edge.relationship] || { color: '#aaa' };
      const active = selected && (selected.id === from.id || selected.id === to.id);
      context.globalAlpha = selected ? (active ? .72 : .07) : .19;
      context.strokeStyle = config.color;
      context.lineWidth = active ? 1.8 : .8;
      context.beginPath();
      context.moveTo(a.x, a.y);
      context.lineTo(b.x, b.y);
      context.stroke();
    });

    graph.nodes.forEach((node) => {
      const point = worldToScreen(node.x, node.y);
      const matchesSearch = !searchTerm || node.name.toLowerCase().includes(searchTerm);
      const connected = !selected || selected.id === node.id || selectedConnections?.has(node.id);
      context.globalAlpha = matchesSearch && connected ? 1 : .12;
      context.fillStyle = CLUSTER_COLORS[node.cluster] || '#888';
      context.beginPath();
      context.arc(point.x, point.y, node.radius * Math.max(.75, zoom), 0, Math.PI * 2);
      context.fill();
      if (selected?.id === node.id || hovered?.id === node.id) {
        context.strokeStyle = '#111';
        context.lineWidth = 2;
        context.stroke();
      }
      const showLabel = zoom > .68 || selected?.id === node.id || hovered?.id === node.id || (searchTerm && matchesSearch);
      if (showLabel) {
        context.globalAlpha = matchesSearch && connected ? .94 : .14;
        context.fillStyle = '#171717';
        context.font = `${selected?.id === node.id ? 700 : 600} ${Math.max(10, Math.min(13, 11 * zoom))}px Inter, sans-serif`;
        context.fillText(node.name, point.x + node.radius * zoom + 5, point.y + 4);
      }
    });
    context.restore();
  }

  function animate() {
    simulate();
    draw();
    animationFrame = requestAnimationFrame(animate);
  }

  function nodeAt(clientX, clientY) {
    const rect = canvas.getBoundingClientRect();
    const x = clientX - rect.left;
    const y = clientY - rect.top;
    let best = null;
    let bestDistance = Infinity;
    graph.nodes.forEach((node) => {
      const point = worldToScreen(node.x, node.y);
      const distance = Math.hypot(point.x - x, point.y - y);
      const hit = Math.max(12, node.radius * zoom + 5);
      if (distance <= hit && distance < bestDistance) {
        best = node;
        bestDistance = distance;
      }
    });
    return best;
  }

  function selectNode(node, center = false) {
    selected = node;
    detail.innerHTML = node ? nodeDetail(node, graph, edgeMap) : '<div class="graph-detail-empty"><span>✦</span><h3>Select a core</h3><p>Click any node to inspect its metadata and connections.</p></div>';
    detail.querySelectorAll('[data-graph-node]').forEach((button) => {
      button.addEventListener('click', () => selectNode(nodeById.get(button.dataset.graphNode), true));
    });
    if (node && center) {
      panX = -node.x * zoom;
      panY = -node.y * zoom;
    }
    draw();
  }

  function fitGraph() {
    const xs = graph.nodes.map((node) => node.x);
    const ys = graph.nodes.map((node) => node.y);
    const spanX = Math.max(...xs) - Math.min(...xs) || 1;
    const spanY = Math.max(...ys) - Math.min(...ys) || 1;
    zoom = Math.min(1.2, Math.max(.35, Math.min((width - 100) / spanX, (height - 100) / spanY)));
    panX = 0;
    panY = 0;
    draw();
  }

  canvas.addEventListener('pointerdown', (event) => {
    canvas.setPointerCapture(event.pointerId);
    dragNode = nodeAt(event.clientX, event.clientY);
    panning = !dragNode;
    lastPointer = { x: event.clientX, y: event.clientY };
    if (dragNode) selectNode(dragNode);
  });
  canvas.addEventListener('pointermove', (event) => {
    hovered = nodeAt(event.clientX, event.clientY);
    canvas.style.cursor = hovered ? 'pointer' : (panning ? 'grabbing' : 'grab');
    if (!lastPointer) return draw();
    const dx = event.clientX - lastPointer.x;
    const dy = event.clientY - lastPointer.y;
    if (dragNode) {
      const world = screenToWorld(event.clientX - canvas.getBoundingClientRect().left, event.clientY - canvas.getBoundingClientRect().top);
      dragNode.x = world.x;
      dragNode.y = world.y;
      dragNode.vx = 0;
      dragNode.vy = 0;
      temperature = Math.max(temperature, .35);
    } else if (panning) {
      panX += dx;
      panY += dy;
    }
    lastPointer = { x: event.clientX, y: event.clientY };
    draw();
  });
  canvas.addEventListener('pointerup', () => { dragNode = null; panning = false; lastPointer = null; });
  canvas.addEventListener('pointercancel', () => { dragNode = null; panning = false; lastPointer = null; });
  canvas.addEventListener('dblclick', (event) => {
    const node = nodeAt(event.clientX, event.clientY);
    if (node) location.href = pageUrl(node.name);
  });
  canvas.addEventListener('wheel', (event) => {
    event.preventDefault();
    const rect = canvas.getBoundingClientRect();
    const mouseX = event.clientX - rect.left;
    const mouseY = event.clientY - rect.top;
    const before = screenToWorld(mouseX, mouseY);
    zoom = Math.max(.28, Math.min(2.4, zoom * (event.deltaY > 0 ? .9 : 1.1)));
    panX = mouseX - width / 2 - before.x * zoom;
    panY = mouseY - height / 2 - before.y * zoom;
    draw();
  }, { passive: false });

  search?.addEventListener('input', () => {
    searchTerm = search.value.toLowerCase().trim();
    const match = searchTerm ? graph.nodes.find((node) => node.name.toLowerCase() === searchTerm) || graph.nodes.find((node) => node.name.toLowerCase().startsWith(searchTerm)) : null;
    if (match) selectNode(match, true);
    draw();
  });
  relationSelect?.addEventListener('change', () => { relationship = relationSelect.value; draw(); });
  document.getElementById('graphFit')?.addEventListener('click', fitGraph);
  document.getElementById('graphExport')?.addEventListener('click', () => {
    const payload = JSON.stringify({ nodes: graph.nodes.map(({ x, y, vx, vy, radius, ...node }) => node), edges: graph.edges }, null, 2);
    const url = URL.createObjectURL(new Blob([payload], { type: 'application/json' }));
    const link = document.createElement('a');
    link.href = url;
    link.download = 'core-graph.json';
    link.click();
    URL.revokeObjectURL(url);
  });

  const observer = new ResizeObserver(resize);
  observer.observe(stage);
  resize();
  animate();
  setTimeout(fitGraph, 700);
  return () => { observer.disconnect(); cancelAnimationFrame(animationFrame); };
}
