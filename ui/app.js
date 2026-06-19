import { clean, getStats, loadManifest, normalize } from './core-data.js';
import { loadCore } from './article.js';
import { homeView, coreView } from './views.js';
import { aboutView, archiveView, articlesView, coresView, graphicsView } from './sections.js';
import { graphView, mountCoreGraph } from './graph.js';

const app = document.getElementById('app');
const RECENT_KEY = 'coreWikiRecent';
const VALID_VIEWS = new Set(['home', 'cores', 'articles', 'graphics', 'graph', 'archive', 'about']);
let graphicsLimit = 60;
let graphicsQuery = '';
let graphicsTimer;
let graphCleanup = null;

function getRecentNames() {
  try { return JSON.parse(localStorage.getItem(RECENT_KEY) || '[]'); }
  catch { return []; }
}

function remember(title) {
  const next = [title, ...getRecentNames().filter((item) => normalize(item) !== normalize(title))].slice(0, 5);
  localStorage.setItem(RECENT_KEY, JSON.stringify(next));
}

async function recentRecords() {
  const manifest = await loadManifest();
  return getRecentNames().map((name) => {
    const record = manifest.get(normalize(name));
    return record ? { name: record.name, count: record.paths.length, path: record.paths[0] || '' } : null;
  }).filter(Boolean);
}

function currentView() {
  const params = new URL(location.href).searchParams;
  if (params.get('core')) return 'core';
  const view = params.get('view') || 'home';
  return VALID_VIEWS.has(view) ? view : 'home';
}

function stopGraph() {
  if (typeof graphCleanup === 'function') graphCleanup();
  graphCleanup = null;
}

function goView(view) {
  const target = VALID_VIEWS.has(view) ? view : 'home';
  const url = new URL(location.href);
  url.search = '';
  if (target !== 'home') url.searchParams.set('view', target);
  history.pushState({ view: target }, '', url);
  renderRoute().catch(renderError);
}

function navigateCore(title) {
  const value = clean(title);
  if (!value) return;
  const url = new URL(location.href);
  url.search = '';
  url.searchParams.set('core', value);
  history.pushState({ core: value }, '', url);
  renderCore(value).catch(renderError);
}

function wireCommon() {
  document.querySelectorAll('[data-view]').forEach((button) => {
    button.addEventListener('click', () => goView(button.dataset.view));
  });

  const form = document.getElementById('searchForm');
  const input = document.getElementById('searchInput');
  const clear = document.getElementById('clearButton');
  const refreshClear = () => clear?.classList.toggle('hidden', !input?.value);
  refreshClear();

  input?.addEventListener('input', refreshClear);
  clear?.addEventListener('click', () => {
    input.value = '';
    refreshClear();
    input.focus();
  });
  form?.addEventListener('submit', (event) => {
    event.preventDefault();
    navigateCore(input?.value);
  });

  document.querySelectorAll('img').forEach((image) => {
    image.addEventListener('error', () => image.remove(), { once: true });
  });
}

function wireSimpleFilter() {
  const input = document.getElementById('sectionSearch');
  const empty = document.getElementById('noResults');
  if (!input) return;

  input.addEventListener('input', () => {
    const needle = input.value.toLowerCase().trim();
    let visible = 0;
    document.querySelectorAll('.filterable').forEach((item) => {
      const haystack = (item.dataset.search || '').toLowerCase();
      const show = !needle || haystack.includes(needle);
      item.classList.toggle('hidden', !show);
      if (show) visible += 1;
    });
    empty?.classList.toggle('hidden', visible > 0);
  });
}

function flattenGraphics(records) {
  return records.flatMap((record) => record.paths.map((path) => ({ core: record.name, path })));
}

async function renderGraphics(preserveFocus = false) {
  const [stats, recent] = await Promise.all([getStats(), recentRecords()]);
  const all = flattenGraphics(stats.records);
  const needle = graphicsQuery.toLowerCase().trim();
  const filtered = needle ? all.filter((item) => item.core.toLowerCase().includes(needle) || item.path.toLowerCase().includes(needle)) : all;
  app.innerHTML = graphicsView(stats, recent, filtered, graphicsLimit);
  wireCommon();

  const sectionInput = document.getElementById('sectionSearch');
  if (sectionInput) {
    sectionInput.value = graphicsQuery;
    sectionInput.addEventListener('input', () => {
      graphicsQuery = sectionInput.value;
      graphicsLimit = 60;
      clearTimeout(graphicsTimer);
      graphicsTimer = setTimeout(() => renderGraphics(true).catch(renderError), 120);
    });
    if (preserveFocus) {
      sectionInput.focus();
      sectionInput.setSelectionRange(sectionInput.value.length, sectionInput.value.length);
    }
  }

  document.getElementById('loadMoreGraphics')?.addEventListener('click', () => {
    graphicsLimit += 60;
    renderGraphics().catch(renderError);
  });
}

function wireArticle() {
  const card = document.getElementById('articleCard');
  const body = document.getElementById('articleBody');
  const button = document.getElementById('articleToggle');
  if (!card || !body || !button) return;

  requestAnimationFrame(() => {
    if (body.scrollHeight <= body.clientHeight + 8) button.classList.add('hidden');
  });
  button.addEventListener('click', () => {
    const expanded = body.classList.toggle('is-expanded');
    card.classList.toggle('is-expanded', expanded);
    button.textContent = expanded ? 'Show less' : 'Read full article';
  });
}

async function renderHome() {
  document.title = 'Core Wiki';
  const [stats, recent] = await Promise.all([getStats(), recentRecords()]);
  app.innerHTML = homeView(stats, recent);
  wireCommon();
  document.getElementById('browseAll')?.addEventListener('click', (event) => {
    document.querySelectorAll('[data-core-card]').forEach((card) => card.classList.remove('hidden'));
    event.currentTarget.classList.add('hidden');
  });
}

async function renderGraph() {
  const [stats, recent] = await Promise.all([getStats(), recentRecords()]);
  document.title = 'Core Graph - Core Wiki';
  app.innerHTML = graphView(stats, recent);
  wireCommon();
  graphCleanup = mountCoreGraph(stats.records);
}

async function renderSection(view) {
  if (view === 'graphics') return renderGraphics();
  if (view === 'graph') return renderGraph();
  const [stats, recent] = await Promise.all([getStats(), recentRecords()]);
  const builders = { cores: coresView, articles: articlesView, archive: archiveView, about: aboutView };
  const builder = builders[view] || coresView;
  document.title = `${view.charAt(0).toUpperCase() + view.slice(1)} - Core Wiki`;
  app.innerHTML = builder(stats, recent);
  wireCommon();
  wireSimpleFilter();
}

async function renderCore(title) {
  const core = await loadCore(title);
  remember(core.title);
  document.title = `${core.title} - Core Wiki`;
  const recent = await recentRecords();
  app.innerHTML = coreView(core, recent);
  wireCommon();
  wireArticle();
}

async function renderRoute() {
  stopGraph();
  app.innerHTML = '<div class="loading-wrap">Loading Core Wiki...</div>';
  const params = new URL(location.href).searchParams;
  const core = params.get('core');
  if (core) return renderCore(core);
  const view = currentView();
  return view === 'home' ? renderHome() : renderSection(view);
}

function renderError(error) {
  stopGraph();
  app.innerHTML = `<div class="error-wrap"><div><h2>Page unavailable</h2><p>${String(error?.message || 'The page could not be loaded.')}</p><p><a href="./">Return home</a></p></div></div>`;
}

window.addEventListener('popstate', () => renderRoute().catch(renderError));
renderRoute().catch(renderError);
